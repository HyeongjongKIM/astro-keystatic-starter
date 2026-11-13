export function isEditorialPath(path) {
  return (
    /^(?:content\/(?:pages|posts)\/.+\/(?:index\.yaml|content\/\d+\/value\/body\.mdx)|content\/settings\/site\.yaml)$/.test(
      path,
    ) ||
    /^apps\/site\/src\/assets\/images\/(?:pages|posts|settings)\/.+\.(?:png|jpe?g|gif|webp|avif|svg)$/i.test(
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

// Recovery validates the entire selected app at the dispatch SHA, irrespective of
// the latest push diff. Content has no Admin deployment environment.
export function recoveryPlan(targets = 'both', branch) {
  if (!['dev', 'content', 'main'].includes(branch))
    throw new Error('Recovery requires dev, content or main');
  if (!['site', 'admin', 'both'].includes(targets))
    throw new Error('Recovery targets must be site, admin or both');
  if (branch === 'content' && targets === 'admin')
    throw new Error('Content has no Admin deployment; select site or both');
  return {
    site: targets !== 'admin',
    admin: branch !== 'content' && targets !== 'site',
    lint: true,
    test: true,
  };
}

export function deploymentSettings(env) {
  const app = env.DEPLOY_APP;
  if (!['site', 'admin'].includes(app))
    throw new Error('Invalid deployment app');
  if (
    app === 'admin' &&
    (env.GITHUB_REF_NAME === 'content' ||
      env.DEPLOY_TARGET !==
        (env.GITHUB_REF_NAME === 'main' ? 'production' : 'preview'))
  )
    throw new Error('Admin deployment mode does not match branch');
  const keys = [
    'CLOUDFLARE_ACCOUNT_ID',
    ...(app === 'site'
      ? ['CLOUDFLARE_PAGES_PROJECT', 'PUBLIC_SITE_URL']
      : ['KEYSTATIC_GITHUB_REPO', 'PUBLIC_KEYSTATIC_GITHUB_APP_SLUG']),
  ];
  for (const key of keys)
    if (!env[key]?.trim())
      throw new Error(`Missing public deployment setting: ${key}`);
  if (app === 'site') {
    let url;
    try {
      url = new URL(env.PUBLIC_SITE_URL);
    } catch {
      throw new Error('Site URL must be a valid HTTPS origin');
    }
    if (url.protocol !== 'https:' || url.origin !== env.PUBLIC_SITE_URL)
      throw new Error(
        'Site URL must be an HTTPS origin without a trailing slash',
      );
  } else if (
    !/^[a-z0-9_.-]+\/[a-z0-9_.-]+$/i.test(env.KEYSTATIC_GITHUB_REPO) ||
    !/^[a-z0-9-]+$/i.test(env.PUBLIC_KEYSTATIC_GITHUB_APP_SLUG)
  )
    throw new Error('Invalid Admin repository or App identity');
}
