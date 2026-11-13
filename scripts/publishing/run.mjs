import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { PromotionController } from './controller.mjs';
import { gitGraph, guardEditorial, assertEditorialDiff } from './git.mjs';
import {
  githubClient,
  installationToken,
  verifySyncCommit,
} from './github.mjs';

const event = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8'));
const repository = process.env.GITHUB_REPOSITORY;
if (!/^[\w.-]+\/[\w.-]+$/.test(repository))
  throw new Error('Invalid repository');
const graph = gitGraph();
const command = process.argv[2];
const credential =
  'credential.helper=!f() { echo username=x-access-token; echo password="$GH_TOKEN"; }; f';
const refresh = async (...shas) => {
  for (const sha of shas) {
    if (!/^[a-f0-9]{40}$/.test(sha)) throw new Error('Invalid commit SHA');
    // No checkout of fetched source; never run its scripts or dependencies.
    execFileSync(
      'git',
      ['-c', credential, 'fetch', '--no-tags', 'origin', sha],
      {
        stdio: ['ignore', 'pipe', 'pipe'],
      },
    );
  }
};
if (command === 'guard') {
  const pr = event.pull_request;
  if (
    process.env.GITHUB_EVENT_NAME !== 'pull_request' &&
    process.env.GITHUB_REF_NAME !== 'content'
  ) {
    console.log('Not an editorial write');
  } else if (pr && pr.head.ref !== 'content') {
    console.log('Not a content promotion PR');
  } else {
    const api = githubClient(process.env.GH_TOKEN);
    const main = (await api('GET', `/repos/${repository}/git/ref/heads/main`))
      .object.sha;
    const head = pr?.head.sha ?? process.env.GITHUB_SHA;
    const before = event.before;
    const base = before && !/^0+$/.test(before) ? before : undefined;
    await refresh(main, head, ...(base ? [base] : []));
    await guardEditorial({
      graph,
      main,
      head,
      base: pr ? undefined : base,
      verifySync: verifySyncCommit(
        api,
        repository,
        process.env.PROMOTION_APP_BOT,
      ),
    });
    if (pr) {
      if (pr.head.repo.full_name !== repository || pr.base.ref !== 'main')
        throw new Error('Unexpected content PR repository/base');
      assertEditorialDiff(graph, main, head);
    }
    console.log('Editorial paths and synchronization history passed');
  }
} else if (command === 'reconcile') {
  if (process.env.GITHUB_REF !== 'refs/heads/main')
    throw new Error('Controller requires trusted main');
  if (process.env.PROMOTION_ENABLED !== 'true') {
    console.log('Promotion disabled; no mutations');
  } else {
    if (process.env.GITHUB_EVENT_NAME === 'workflow_run') {
      const run = event.workflow_run;
      if (
        run?.repository?.full_name !== repository ||
        run.head_repository?.full_name !== repository ||
        !['push', 'pull_request', 'workflow_dispatch'].includes(run.event) ||
        !['dev', 'content', 'main'].includes(run.head_branch)
      ) {
        throw new Error('Unexpected triggering CI repository/event/branch');
      }
    } else if (process.env.GITHUB_EVENT_NAME !== 'workflow_dispatch')
      throw new Error('Unexpected controller event');
    const { token, bot } = await installationToken({
      clientId: process.env.PROMOTION_APP_CLIENT_ID,
      privateKey: process.env.PROMOTION_APP_PRIVATE_KEY,
      repository,
    });
    console.log(`::add-mask::${token}`);
    process.env.GH_TOKEN = token;
    const api = githubClient(token);
    try {
      if (bot !== process.env.PROMOTION_APP_BOT)
        throw new Error(
          'Automation bot configuration differs from authenticated App',
        );
      await new PromotionController({
        api,
        repository,
        graph,
        refresh,
        bot,
        resume:
          event.inputs?.resume === 'none' ? undefined : event.inputs?.resume,
      }).run();
    } finally {
      await api('DELETE', '/installation/token');
      delete process.env.GH_TOKEN;
    }
  }
} else throw new Error('Unknown publishing command');
