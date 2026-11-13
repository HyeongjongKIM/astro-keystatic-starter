import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { PromotionController } from './controller.mjs';
import { githubClient } from './github.mjs';
import { gitGraph } from './git.mjs';

// This manual acceptance probe receives only a read-only Actions token. It
// exercises the real merge endpoint without changing the publishing App/key.
assert.equal(process.env.GITHUB_REF, 'refs/heads/main');
assert.equal(process.env.GITHUB_ACTIONS, 'true');
assert.equal(process.env.PROMOTION_ENABLED, 'false');
const repository = process.env.GITHUB_REPOSITORY;
assert.match(repository ?? '', /^[\w.-]+\/[\w.-]+$/);
const branch = process.env.VERIFY_BRANCH;
assert.ok(['dev', 'content'].includes(branch));
const client = githubClient(process.env.GH_TOKEN);
let attempts = 0;
const api = async (method, path, body) => {
  const signatureQuery =
    method === 'POST' &&
    path === '/graphql' &&
    body?.query?.startsWith('query SyncSignature(');
  if (method !== 'GET' && !signatureQuery) {
    assert.equal(method, 'PUT', 'Probe refuses non-merge writes');
    assert.match(path, new RegExp(`^/repos/${repository}/pulls/[0-9]+/merge$`));
    attempts++;
  }
  return client(method, path, body);
};
const controller = new PromotionController({
  api,
  repository,
  graph: gitGraph(),
  refresh: async (...shas) => {
    for (const sha of shas) {
      assert.match(sha, /^[a-f0-9]{40}$/);
      const credential =
        'credential.helper=!f() { echo username=x-access-token; echo password="$GH_TOKEN"; }; f';
      execFileSync(
        'git',
        ['-c', credential, 'fetch', '--no-tags', 'origin', sha],
        { stdio: ['ignore', 'pipe', 'pipe'] },
      );
    }
  },
  bot: process.env.PROMOTION_APP_BOT,
});
const before = await controller.tips(branch);
let failure;
try {
  await controller.branch(branch);
} catch (error) {
  failure = error;
}
assert.equal(attempts, 1, 'A ready PR must reach exactly one merge request');
assert.equal(failure?.status, 403, 'GitHub must deny the read-only token');
assert.deepEqual(await controller.tips(branch), before, 'Tips must not move');
console.log(
  JSON.stringify({ branch, ...before, mergeRequests: attempts, denied: 403 }),
);
