import { execFileSync, spawnSync } from 'node:child_process';
import {
  mkdtempSync,
  writeFileSync,
  mkdirSync,
  rmSync,
  readFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { parse } from 'yaml';

const runner = fileURLToPath(new URL('./run.mjs', import.meta.url));
let cwd;
let sequence;
const git = (...args) =>
  execFileSync('git', args, {
    cwd,
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
  }).trim();
function commit(path, message = 'feat: update fixture') {
  mkdirSync(join(cwd, path, '..'), { recursive: true });
  writeFileSync(join(cwd, path), `${sequence++}\n`);
  git('add', '--all');
  git('commit', '-m', message);
  return git('rev-parse', 'HEAD');
}
function run(command, event, env = {}) {
  const eventPath = join(cwd, 'event.json');
  writeFileSync(eventPath, JSON.stringify(event));
  return spawnSync(process.execPath, [runner, command], {
    cwd,
    encoding: 'utf8',
    env: {
      ...process.env,
      GITHUB_EVENT_PATH: eventPath,
      GITHUB_EVENT_NAME: 'push',
      GITHUB_REPOSITORY: '',
      GITHUB_SHA: git('rev-parse', 'HEAD'),
      ...env,
    },
  });
}
beforeEach(() => {
  sequence = 0;
  cwd = mkdtempSync(join(tmpdir(), 'starter-ci-'));
  git('init', '-b', 'dev');
  git('config', 'user.name', 'CI fixture');
  git('config', 'user.email', 'ci@example.invalid');
  git('config', 'core.hooksPath', '/dev/null');
  commit('README.md', 'docs: initial fixture');
});
afterEach(() => rmSync(cwd, { recursive: true, force: true }));

describe('real Git comparisons', () => {
  it('includes removed paths and both rename endpoints', () => {
    commit('apps/site/old.txt');
    const before = git('rev-parse', 'HEAD');
    mkdirSync(join(cwd, 'apps/admin'), { recursive: true });
    git('mv', 'apps/site/old.txt', 'apps/admin/new.txt');
    git('commit', '-m', 'refactor: move fixture');
    const result = run('plan', { before });
    expect(result.status).toBe(0);
    expect(JSON.parse(result.stdout)).toMatchObject({
      site: true,
      admin: true,
    });
    const next = git('rev-parse', 'HEAD');
    git('rm', 'apps/admin/new.txt');
    git('commit', '-m', 'refactor: remove fixture');
    expect(JSON.parse(run('plan', { before: next }).stdout)).toMatchObject({
      site: false,
      admin: true,
    });
  });
  it('uses a PR merge base instead of counting target-only changes', () => {
    const initial = git('rev-parse', 'HEAD');
    const head = commit('apps/site/src/new.astro');
    git('checkout', '-b', 'main', initial);
    const base = commit('apps/admin/new.ts');
    const result = run(
      'plan',
      { pull_request: { base: { sha: base }, head: { sha: head } } },
      { GITHUB_EVENT_NAME: 'pull_request' },
    );
    expect(result.status).toBe(0);
    expect(JSON.parse(result.stdout)).toMatchObject({
      site: true,
      admin: false,
      comparisonBase: initial,
    });
  });
  it.each(['0'.repeat(40), 'a'.repeat(40)])(
    'fully validates new or unavailable base %s',
    (before) => {
      const result = run('plan', { before });
      expect(result.status).toBe(0);
      expect(JSON.parse(result.stdout)).toMatchObject({
        site: true,
        admin: true,
        lint: true,
        test: true,
      });
    },
  );
  it('forces full validation for manual recovery after docs-only changes', () => {
    const before = git('rev-parse', 'HEAD');
    commit('README.md', 'docs: update fixture');
    expect(JSON.parse(run('plan', { before }).stdout)).toMatchObject({
      site: false,
      admin: false,
    });
    expect(
      JSON.parse(
        run('plan', { before }, { GITHUB_EVENT_NAME: 'workflow_dispatch' })
          .stdout,
      ),
    ).toMatchObject({ site: true, admin: true });
  });
});
describe('deployment guard', () => {
  it('blocks stale commits, disabled environments, missing settings and other branches', () => {
    git('remote', 'add', 'origin', cwd);
    const env = {
      GITHUB_REF_NAME: 'dev',
      DEPLOY_ENABLED: 'true',
      CLOUDFLARE_ACCOUNT_ID: 'account',
      CLOUDFLARE_PAGES_PROJECT: 'project',
      PUBLIC_SITE_URL: 'https://example.com',
      KEYSTATIC_GITHUB_REPO: 'owner/repo',
      PUBLIC_KEYSTATIC_GITHUB_APP_SLUG: 'app',
    };
    expect(run('deploy-guard', {}, env).status).toBe(0);
    expect(
      run('deploy-guard', {}, { ...env, GITHUB_SHA: '0'.repeat(40) }).status,
    ).not.toBe(0);
    expect(
      run('deploy-guard', {}, { ...env, DEPLOY_ENABLED: '' }).status,
    ).not.toBe(0);
    expect(
      run('deploy-guard', {}, { ...env, PUBLIC_SITE_URL: '' }).status,
    ).not.toBe(0);
    expect(
      run('deploy-guard', {}, { ...env, GITHUB_REF_NAME: 'preview' }).status,
    ).not.toBe(0);
  });
});
describe('workflow deployment boundaries', () => {
  it('always reports required checks, never path-filters the workflow, and isolates deployment secrets', () => {
    const workflow = parse(
      readFileSync(
        new URL('../../.github/workflows/ci.yml', import.meta.url),
        'utf8',
      ),
    );
    expect(workflow.on.push.branches).toEqual(['dev', 'main']);
    expect(workflow.on.pull_request.branches).toEqual(['main']);
    expect(workflow.on.push.paths).toBeUndefined();
    expect(workflow.jobs.required.if).toBe('always()');
    expect(workflow.jobs.required.needs).toEqual(['prepare', 'site', 'admin']);
    for (const [name, job] of Object.entries(workflow.jobs)) {
      const text = JSON.stringify(job);
      if (name.startsWith('deploy-')) {
        expect(job.needs).toContain('required');
        expect(job.if).toContain("needs.required.result == 'success'");
        expect(job.if).toContain("github.event_name == 'push'");
        expect(job.if).toContain("github.event_name == 'workflow_dispatch'");
        expect(job.concurrency['cancel-in-progress']).toBe(false);
        expect(text).toContain('secrets.CLOUDFLARE_API_TOKEN');
      } else {
        expect(job.environment).toBeUndefined();
        expect(text).not.toContain('secrets.');
      }
    }
  });
});
