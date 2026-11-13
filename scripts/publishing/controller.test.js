import { beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { generateKeyPairSync, verify } from 'node:crypto';
import { Buffer } from 'node:buffer';
import { parse } from 'yaml';
import { PromotionController } from './controller.mjs';
import {
  githubClient,
  verifySyncCommit,
  installationToken,
} from './github.mjs';

let controller, api, state, calls, refresh, validateTitle;
const main = 'a'.repeat(40),
  source = 'b'.repeat(40),
  merge = 'c'.repeat(40);
const repo = 'owner/repo';
const pr = () => ({
  number: 7,
  state: 'open',
  draft: false,
  head: { ref: 'dev', sha: source, repo: { full_name: repo } },
  base: { ref: 'main', sha: main },
  mergeable: true,
  mergeable_state: 'clean',
});
beforeEach(() => {
  state = {
    open: [pr()],
    diff: true,
    current: pr(),
    ancestor: true,
    merged: true,
    run: {
      id: 20,
      run_attempt: 2,
      event: 'pull_request',
      head_sha: source,
      status: 'completed',
      conclusion: 'success',
      pull_requests: [
        { number: 7, head: { sha: source }, base: { sha: main } },
      ],
    },
    gate: [{ name: 'Required checks', conclusion: 'success' }],
    parents: `${main} ${source}`,
  };
  calls = [];
  api = vi.fn(async (method, path, body) => {
    calls.push({ method, path, body });
    if (path.includes('/git/ref/pull/7/merge'))
      return { object: { sha: merge } };
    if (path.includes('/git/ref/heads/'))
      return { object: { sha: path.endsWith('/main') ? main : source } };
    if (path.includes('/pulls?')) return state.open;
    if (path.endsWith('/pulls/7')) return state.current;
    if (path.includes('/actions/workflows/'))
      return { workflow_runs: [state.run] };
    if (path.includes('/jobs?')) return { jobs: state.gate };
    if (path.endsWith('/merge')) return { merged: state.merged };
    if (path.endsWith('/pulls') || path.endsWith('/merges')) return {};
    throw new Error(`Unexpected fixture request ${path}`);
  });
  const graph = {
    ancestor: () => state.ancestor,
    paths: () => (state.diff ? ['README.md'] : []),
    git: () => state.parents,
  };
  refresh = vi.fn();
  validateTitle = vi.fn();
  controller = new PromotionController({
    api,
    repository: repo,
    graph,
    refresh,
    bot: 'publishing[bot]',
    validateTitle,
    log: vi.fn(),
  });
});
const writes = () => calls.filter((call) => call.method !== 'GET');
describe('promotion reconciliation', () => {
  it('merges only current validated PR head/base with controlled title and no bypass', async () => {
    await controller.branch('dev');
    expect(writes()).toEqual([
      {
        method: 'PUT',
        path: '/repos/owner/repo/pulls/7/merge',
        body: {
          sha: source,
          merge_method: 'merge',
          commit_title: 'chore: publish dev changes',
          commit_message: `Validated PR #7; source ${source}; base ${main}.`,
        },
      },
    ]);
    expect(validateTitle).toHaveBeenCalledWith('chore: publish dev changes');
    expect(refresh).toHaveBeenCalledWith(merge);
    expect(state.current).not.toHaveProperty('merge_commit_sha');
    expect(
      calls.findIndex((call) => call.path.endsWith('/pulls/7')),
    ).toBeLessThan(
      calls.findIndex((call) => call.path.endsWith('/git/ref/pull/7/merge')),
    );
  });
  it('creates one PR and reuses it on later events', async () => {
    state.open = [];
    await controller.branch('dev');
    expect(writes()[0].body).toMatchObject({ head: 'dev', base: 'main' });
    calls.length = 0;
    state.open = [pr()];
    await controller.branch('dev');
    expect(
      writes().filter((call) => call.path.endsWith('/pulls')),
    ).toHaveLength(0);
  });
  it('creates a content PR with a controlled site title and rejects non-editorial final paths', async () => {
    state.open = [];
    controller.graph.git = () => '';
    controller.graph.paths = () => ['content/settings/site.yaml'];
    await controller.branch('content');
    expect(writes()[0].body).toMatchObject({
      head: 'content',
      title: 'chore(site): publish content changes',
    });
    calls.length = 0;
    controller.graph.paths = () => ['.github/workflows/ci.yml'];
    await expect(controller.branch('content')).rejects.toThrow('Non-editorial');
    expect(writes()).toEqual([]);
  });
  it('avoids empty and ancestry-only promotion PRs', async () => {
    state.diff = false;
    state.open = [];
    await controller.branch('dev');
    expect(writes()).toEqual([]);
  });
  it('synchronizes first and waits for fresh checks', async () => {
    state.ancestor = false;
    await controller.branch('dev');
    expect(writes()).toEqual([
      {
        method: 'POST',
        path: '/repos/owner/repo/merges',
        body: {
          base: 'dev',
          head: main,
          commit_message: 'chore: sync main into dev',
        },
      },
    ]);
  });
  it.each(['draft', 'closed', 'duplicate'])(
    'pauses %s PRs without implicit resume',
    async (type) => {
      if (type === 'draft') state.open[0].draft = true;
      if (type === 'closed') state.open[0].state = 'closed';
      if (type === 'duplicate') state.open.push(pr());
      await expect(controller.branch('dev')).rejects.toThrow();
      expect(writes()).toEqual([]);
    },
  );
  it('resumes closed PR only through an explicit operator input', async () => {
    state.open[0].state = 'closed';
    controller.resume = 'dev';
    await controller.branch('dev');
    expect(writes()[0].path).toBe('/repos/owner/repo/pulls');
  });
  it.each(['failure', 'cancelled', null])(
    'rejects latest PR CI conclusion %s',
    async (conclusion) => {
      state.run.conclusion = conclusion;
      await expect(controller.branch('dev')).rejects.toThrow('latest PR CI');
      expect(writes()).toEqual([]);
    },
  );
  it.each([
    'source',
    'base',
    'gate',
    'merge-parent',
    'draft-after-read',
    'mergeability',
  ])('rejects stale/missing evidence: %s', async (kind) => {
    if (kind === 'source') state.current.head.sha = 'd'.repeat(40);
    if (kind === 'base') state.run.pull_requests[0].base.sha = 'd'.repeat(40);
    if (kind === 'gate') state.gate = [];
    if (kind === 'merge-parent') state.parents = `${main} ${'d'.repeat(40)}`;
    if (kind === 'draft-after-read') state.current.draft = true;
    if (kind === 'mergeability') state.current.mergeable_state = 'blocked';
    await expect(controller.branch('dev')).rejects.toThrow();
    expect(writes()).toEqual([]);
  });
  it('rejects source movement immediately before merging', async () => {
    const original = controller.tips.bind(controller);
    let reads = 0;
    controller.tips = async (branch) => ({
      ...(await original(branch)),
      ...(reads++ ? { source: 'd'.repeat(40) } : {}),
    });
    await expect(controller.branch('dev')).rejects.toThrow('advanced');
    expect(writes()).toEqual([]);
  });
  it('does not report success when GitHub refuses merge or permissions', async () => {
    state.merged = false;
    await expect(controller.branch('dev')).rejects.toThrow('did not confirm');
    api.mockRejectedValue(new Error('HTTP 403'));
    await expect(controller.branch('dev')).rejects.toThrow('HTTP 403');
  });
  it('continues inspecting the other branch after a conflict, then fails visibly', async () => {
    controller.branch = vi.fn(async (branch) => {
      if (branch === 'dev') throw new Error('conflict');
    });
    await expect(controller.run()).rejects.toThrow('conflict');
    expect(controller.branch.mock.calls).toEqual([['dev'], ['content']]);
  });
});
describe('token and workflow boundaries', () => {
  it('mints a short-lived signed App token scoped to this repository and required permissions', async () => {
    const { privateKey, publicKey } = generateKeyPairSync('rsa', {
      modulusLength: 2048,
    });
    const requests = [];
    const permissions = {
      contents: 'write',
      pull_requests: 'write',
      checks: 'read',
      actions: 'read',
      workflows: 'write',
    };
    const fetcher = async (url, options) => {
      requests.push({ url, options });
      const jwt = options.headers.authorization.slice('Bearer '.length);
      const parts = jwt.split('.');
      expect(
        verify(
          'RSA-SHA256',
          Buffer.from(parts.slice(0, 2).join('.')),
          publicKey,
          Buffer.from(parts[2], 'base64url'),
        ),
      ).toBe(true);
      const claims = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
      expect(claims.iss).toBe('client');
      expect(claims.exp - claims.iat).toBe(600);
      return {
        ok: true,
        status: 200,
        json: async () =>
          url.endsWith('/app')
            ? { slug: 'publishing' }
            : url.endsWith('/installation')
              ? { id: 123, permissions }
              : { token: 'fixture-token' },
      };
    };
    expect(
      await installationToken({
        clientId: 'client',
        privateKey,
        repository: repo,
        fetcher,
      }),
    ).toEqual({ token: 'fixture-token', bot: 'publishing[bot]' });
    expect(JSON.parse(requests[2].options.body)).toEqual({
      repositories: ['repo'],
      permissions,
    });
  });

  it('does not expose API response bodies or credentials on errors', async () => {
    const client = githubClient('secret', async () => ({
      ok: false,
      status: 403,
      json: () => ({ message: 'secret' }),
    }));
    await expect(client('GET', '/repos/owner/repo')).rejects.toThrow(
      'HTTP 403',
    );
    await expect(client('GET', '//attacker.invalid')).rejects.toThrow(
      'API path',
    );
  });
  it('requires a verified bot commit for sync identity', async () => {
    const commit = {
      committer: { login: 'publishing[bot]', type: 'Bot' },
      commit: { verification: { verified: true, reason: 'valid' } },
    };
    const verify = verifySyncCommit(
      async () => commit,
      repo,
      'publishing[bot]',
    );
    expect(await verify(source)).toBe(true);
    commit.commit.verification.verified = false;
    expect(await verify(source)).toBe(false);
    commit.commit.verification.verified = true;
    commit.committer.login = 'editor';
    expect(await verify(source)).toBe(false);
  });
  it('runs privileged controller from main without PR checkout, artifacts or dependency cache', () => {
    const workflow = parse(
      readFileSync(
        new URL('../../.github/workflows/promotion.yml', import.meta.url),
        'utf8',
      ),
    );
    expect(workflow.on.workflow_run.workflows).toEqual(['CI']);
    expect(workflow.concurrency['cancel-in-progress']).toBe(false);
    expect(workflow.jobs.reconcile.environment).toBe('automation');
    expect(workflow.jobs.reconcile.if).toContain(
      "github.ref == 'refs/heads/main'",
    );
    const text = JSON.stringify(workflow);
    expect(text).not.toContain('pull_request_target');
    expect(text).not.toContain('download-artifact');
    expect(text).not.toContain('cache');
    expect(text).not.toContain('workflow_run.head_sha');
    expect(workflow.jobs.reconcile.steps[0].with.ref).toBe('${{ github.sha }}');
  });
});
