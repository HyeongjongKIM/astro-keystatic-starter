import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { beforeEach, afterEach, describe, it, expect } from 'vitest';
import { gitGraph, guardEditorial, assertEditorialDiff } from './git.mjs';

let cwd, graph, main;
const git = (...args) => graph.git(...args);
const commit = (path, text = 'change', message = 'chore: fixture') => {
  mkdirSync(join(cwd, path, '..'), { recursive: true });
  writeFileSync(join(cwd, path), text);
  git('add', '--all');
  git('commit', '-m', message);
  return git('rev-parse', 'HEAD');
};
const guard = (options = {}) =>
  guardEditorial({
    graph,
    main,
    head: git('rev-parse', 'HEAD'),
    verifySync: async () => false,
    ...options,
  });
beforeEach(() => {
  cwd = mkdtempSync(join(tmpdir(), 'publishing-git-'));
  graph = gitGraph(cwd);
  git('init', '-b', 'main');
  git('config', 'user.name', 'Fixture');
  git('config', 'user.email', 'fixture@example.invalid');
  git('config', 'core.hooksPath', '/dev/null');
  main = commit('README.md', 'baseline');
  git('checkout', '-b', 'content');
});
afterEach(() => rmSync(cwd, { recursive: true, force: true }));
describe('editorial history guard with real Git objects', () => {
  it('accepts baseline initialization and ordinary nested editorial writes', async () => {
    expect(await guard()).toBe(0);
    commit('content/pages/projects/a/index.yaml');
    commit('content/pages/projects/a/content/0/value/body.mdx');
    expect(await guard()).toBe(2);
    expect(() =>
      assertEditorialDiff(graph, main, git('rev-parse', 'HEAD')),
    ).not.toThrow();
  });
  it('rejects code even when the final content diff reverts it', async () => {
    commit('package.json', '{}');
    git('revert', '--no-edit', 'HEAD');
    commit('content/settings/site.yaml');
    await expect(guard()).rejects.toThrow('Forbidden editorial');
  });
  it('checks both endpoints of renames and deletion paths', async () => {
    commit('content/pages/a/index.yaml');
    mkdirSync(join(cwd, 'apps/admin'), { recursive: true });
    git('mv', 'content/pages/a/index.yaml', 'apps/admin/executable.js');
    git('commit', '-m', 'chore: move');
    await expect(guard()).rejects.toThrow('Forbidden editorial');
  });
  it('does not trust an unavailable or rewritten direct-push base', async () => {
    const first = commit('content/settings/site.yaml');
    git('reset', '--hard', main);
    await expect(guard({ base: first })).rejects.toThrow('rewritten');
    await expect(guard({ base: 'f'.repeat(40) })).rejects.toThrow('ancestry');
  });
  it('accepts published fast-forward history without exempting pending edits', async () => {
    git('checkout', 'main');
    main = commit('apps/site/new.js');
    git('checkout', 'content');
    git('merge', '--ff-only', main);
    expect(await guard()).toBe(0);
    commit('apps/admin/hidden.js');
    await expect(guard()).rejects.toThrow('Forbidden editorial');
  });
  it('requires trusted identity AND an exact clean synchronization tree', async () => {
    const content = commit('content/settings/site.yaml');
    git('checkout', 'main');
    main = commit('apps/site/new.js');
    git('checkout', 'content');
    git('merge', '--no-ff', main, '-m', 'chore: sync main into content');
    await expect(guard()).rejects.toThrow('Forbidden editorial');
    expect(await guard({ verifySync: async () => true })).toBe(2);
    expect(() =>
      assertEditorialDiff(graph, main, git('rev-parse', 'HEAD')),
    ).not.toThrow();
    // Create a forged merge with the same parents and extra executable content.
    commit('apps/admin/hidden.js');
    const badTree = git('rev-parse', 'HEAD^{tree}');
    const bad = execFileSync(
      'git',
      ['commit-tree', badTree, '-p', content, '-p', main],
      { cwd, input: 'chore: fake sync\n', encoding: 'utf8' },
    ).trim();
    await expect(
      guard({ head: bad, verifySync: async () => true }),
    ).rejects.toThrow('tree differs');
  });
  it('rejects stale schema-dependent promotion until main is synchronized', () => {
    commit('content/settings/site.yaml');
    const head = git('rev-parse', 'HEAD');
    git('checkout', 'main');
    main = commit('packages/content/schema.ts');
    expect(() => assertEditorialDiff(graph, main, head)).toThrow('Synchronize');
  });
});
