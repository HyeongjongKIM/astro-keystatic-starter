import { describe, expect, it } from 'vitest';
import { classify, isEditorialCommit, checkResults } from './policy.mjs';

const none = { site: false, admin: false, lint: false, test: false };
describe('deployment and validation impact', () => {
  it.each([
    'docs/operations.md',
    'tasks/02-repository-workflow/README.md',
    'README.md',
    '.vscode/settings.json',
  ])('skips both apps for %s', (path) => {
    expect(classify([path])).toEqual(none);
  });
  it.each([
    'content/posts/example/index.yaml',
    'content/pages/a/content/0/value/body.mdx',
    'apps/site/src/assets/images/pages/photo.png',
  ])('validates editorial content without deploying Admin: %s', (path) => {
    expect(classify([path])).toEqual({ ...none, site: true, test: true });
  });
  it('separates app code and combines mixed changes', () => {
    expect(classify(['apps/site/src/pages/index.astro'])).toEqual({
      ...none,
      site: true,
      lint: true,
      test: true,
    });
    expect(classify(['apps/admin/astro.production.config.mjs'])).toEqual({
      ...none,
      admin: true,
      lint: true,
      test: true,
    });
    expect(
      classify([
        'content/settings/site.yaml',
        'apps/admin/keystatic.config.ts',
      ]),
    ).toEqual({ site: true, admin: true, lint: true, test: true });
  });
  it.each([
    'packages/content/index.ts',
    'packages/config/tsconfig.json',
    'apps/site/package.json',
    'apps/admin/package.json',
    'pnpm-lock.yaml',
    'package.json',
    '.nvmrc',
    '.github/workflows/ci.yml',
    'scripts/verify-site.mjs',
    'unknown.file',
  ])('conservatively checks both for %s', (path) => {
    expect(classify([path])).toEqual({
      site: true,
      admin: true,
      lint: true,
      test: true,
    });
  });
  it('uses both rename endpoints and treats missing/new-branch bases conservatively', () => {
    expect(classify(['apps/site/src/old.ts', 'apps/admin/src/new.ts'])).toEqual(
      { site: true, admin: true, lint: true, test: true },
    );
    expect(classify([], true)).toEqual({
      site: true,
      admin: true,
      lint: true,
      test: true,
    });
    expect(classify([])).toEqual(none);
  });
});
describe('editorial message compatibility', () => {
  it('accepts observed GitHub user-authored editorial messages', () => {
    expect(
      isEditorialCommit('Update content/pages/projects/publication-proof', [
        'content/pages/projects/publication-proof/index.yaml',
        'apps/site/src/assets/images/pages/projects/publication-proof/sample.png',
      ]),
    ).toBe(true);
    expect(
      isEditorialCommit('Delete content/posts/first-post', [
        'content/posts/first-post/index.yaml',
      ]),
    ).toBe(true);
    expect(
      isEditorialCommit('Update content/settings/site', [
        'content/settings/site.yaml',
      ]),
    ).toBe(true);
  });
  it.each([
    [
      'Update content/pages/about',
      ['content/pages/about/index.yaml', '.github/workflows/ci.yml'],
    ],
    ['Update content/pages/about', ['packages/content/index.ts']],
    ['Update content/pages/about', ['content/pages/about/execute.js']],
    ['Update content/pages/about', ['apps/site/src/assets/images/execute.ts']],
    ['Update content/pages/about\n\nextra', ['content/pages/about/index.yaml']],
    ['arbitrary bot commit', ['content/posts/a/index.yaml']],
    ['Update content/settings/other', ['content/settings/site.yaml']],
    ['Update content/pages/about', []],
  ])('rejects broad bot/message exemptions: %s', (message, paths) =>
    expect(isEditorialCommit(message, paths)).toBe(false),
  );
});
describe('stable required check', () => {
  const needs = {
    prepare: { result: 'success' },
    site: { result: 'skipped' },
    admin: { result: 'skipped' },
  };
  it('completes docs-only PRs and requires both apps for mixed changes', () => {
    expect(checkResults(none, needs)).toBe(true);
    expect(checkResults({ site: true, admin: true }, needs)).toBe(false);
    expect(
      checkResults(
        { site: true, admin: true },
        { ...needs, site: { result: 'success' }, admin: { result: 'success' } },
      ),
    ).toBe(true);
  });
  it.each(['failure', 'cancelled', 'skipped', undefined])(
    'rejects required dependency %s',
    (result) => {
      expect(checkResults(none, { ...needs, prepare: { result } })).toBe(false);
      expect(
        checkResults(
          { site: true, admin: false },
          { ...needs, site: { result } },
        ),
      ).toBe(false);
    },
  );
  it('rejects missing jobs and unexpected skips/successes', () => {
    expect(checkResults(none, { prepare: { result: 'success' } })).toBe(false);
    expect(checkResults(none, { ...needs, admin: { result: 'success' } })).toBe(
      false,
    );
  });
});
