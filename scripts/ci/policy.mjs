export function isEditorialPath(path) {
  return (
    /^(?:content\/(?:pages|posts)\/.+\/(?:index\.yaml|content\/\d+\/value\/body\.mdx)|content\/settings\/site\.yaml)$/.test(
      path,
    ) ||
    /^apps\/site\/src\/assets\/images\/.+\.(?:png|jpe?g|gif|webp|avif|svg)$/i.test(
      path,
    )
  );
}

export function classify(paths, full = false) {
  const result = { site: full, admin: full, lint: full, test: full };
  for (const path of paths) {
    if (/^(docs\/|tasks\/|\.vscode\/)/.test(path) || /^[^/]+\.md$/.test(path))
      continue;
    result.test = true;
    if (/(^|\/)(package\.json|pnpm-lock\.yaml)$/.test(path)) {
      result.site = result.admin = result.lint = true;
    } else if (isEditorialPath(path)) {
      result.site = true;
    } else if (path.startsWith('apps/site/')) {
      result.site = result.lint = true;
    } else if (path.startsWith('apps/admin/')) {
      result.admin = result.lint = true;
    } else {
      result.site = result.admin = result.lint = true;
    }
  }
  return result;
}

// This is a message/path compatibility exception, not proof of App identity.
export function isEditorialCommit(message, paths) {
  return (
    /^(?:(?:Create|Update|Delete) content\/(?:pages|posts)\/[a-z0-9-]+(?:\/[a-z0-9-]+)*|Update content\/settings\/site)$/.test(
      message,
    ) &&
    paths.length > 0 &&
    paths.every(isEditorialPath)
  );
}

export function checkResults(plan, needs) {
  const expected = { prepare: true, site: plan.site, admin: plan.admin };
  return Object.entries(expected).every(
    ([job, required]) =>
      needs[job]?.result === (required ? 'success' : 'skipped'),
  );
}
