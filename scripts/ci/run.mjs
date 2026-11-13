import { execFileSync } from 'node:child_process';
import { appendFileSync, readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  classify,
  isEditorialCommit,
  checkResults,
  recoveryPlan,
  deploymentSettings,
} from './policy.mjs';

const git = (...args) =>
  execFileSync('git', args, { encoding: 'utf8' }).trimEnd();
const splitNull = (value) => value.split('\0').filter(Boolean);
const event = process.env.GITHUB_EVENT_PATH
  ? JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8'))
  : {};
const command = process.argv[2];

function comparison() {
  const head = event.pull_request?.head.sha ?? process.env.GITHUB_SHA ?? 'HEAD';
  const before = event.pull_request?.base.sha ?? event.before;
  if (
    process.env.GITHUB_EVENT_NAME === 'workflow_dispatch' ||
    !before ||
    /^0+$/.test(before)
  ) {
    return { head, base: null };
  }
  try {
    git('cat-file', '-e', `${before}^{commit}`);
    return {
      head,
      base: event.pull_request ? git('merge-base', before, head) : before,
    };
  } catch {
    return { head, base: null };
  }
}

if (command === 'plan') {
  const { head, base } = comparison();
  const paths = base
    ? splitNull(git('diff', '--name-only', '--no-renames', '-z', base, head))
    : [];
  const plan =
    process.env.GITHUB_EVENT_NAME === 'workflow_dispatch'
      ? recoveryPlan(
          event.inputs?.targets ?? 'both',
          process.env.GITHUB_REF_NAME,
        )
      : classify(paths, !base);
  console.log(
    JSON.stringify({ ...plan, comparisonBase: base ?? 'full validation' }),
  );
  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(
      process.env.GITHUB_OUTPUT,
      Object.entries(plan)
        .map(([k, v]) => `${k}=${v}\n`)
        .join(''),
    );
  }
} else if (command === 'commits') {
  const { head, base } = comparison();
  const commits = base
    ? git('rev-list', '--reverse', `${base}..${head}`)
        .split('\n')
        .filter(Boolean)
    : [head];
  for (const sha of commits) {
    const message = git('show', '-s', '--format=%B', sha);
    const paths = splitNull(
      git(
        'diff-tree',
        '--root',
        '--no-commit-id',
        '--name-only',
        '--no-renames',
        '-r',
        '-z',
        sha,
      ),
    );
    if (isEditorialCommit(message, paths)) {
      console.log(`Editorial commit accepted: ${sha}`);
    } else {
      execFileSync('pnpm', ['exec', 'commitlint', '--verbose'], {
        input: message,
        stdio: ['pipe', 'inherit', 'inherit'],
      });
    }
  }
} else if (command === 'gate') {
  const needs = JSON.parse(process.env.NEEDS_JSON);
  const plan = {
    site: needs.prepare?.outputs.site === 'true',
    admin: needs.prepare?.outputs.admin === 'true',
  };
  if (
    !['true', 'false'].includes(needs.prepare?.outputs.site) ||
    !['true', 'false'].includes(needs.prepare?.outputs.admin) ||
    !checkResults(plan, needs)
  ) {
    throw new Error('Applicable checks did not all succeed');
  }
  console.log('Required checks passed');
} else if (command === 'docs') {
  let count = 0;
  for (const path of splitNull(git('ls-files', '-z', '*.md'))) {
    if (path.includes('/compatibility-probe/')) continue;
    const text = readFileSync(path, 'utf8');
    for (const match of text.matchAll(/\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) {
      const link = match[1];
      if (/^(?:[a-z]+:|#|\/)/i.test(link)) continue;
      const target = decodeURIComponent(link.split('#')[0]);
      if (!existsSync(resolve(dirname(path), target)))
        throw new Error(`Broken link: ${path} → ${link}`);
      count++;
    }
  }
  console.log(`Local Markdown links passed: ${count}`);
} else if (command === 'deploy-guard') {
  if (!['dev', 'content', 'main'].includes(process.env.GITHUB_REF_NAME))
    throw new Error('Deployment requires dev, content or main');
  if (process.env.DEPLOY_ENABLED !== 'true')
    throw new Error(
      'Configure deployment environment before enabling deployment',
    );
  deploymentSettings(process.env);
  const latest = process.env.GITHUB_REPOSITORY
    ? execFileSync(
        'gh',
        [
          'api',
          `repos/${process.env.GITHUB_REPOSITORY}/git/ref/heads/${process.env.GITHUB_REF_NAME}`,
          '--jq',
          '.object.sha',
        ],
        { encoding: 'utf8' },
      ).trim()
    : git(
        'ls-remote',
        'origin',
        `refs/heads/${process.env.GITHUB_REF_NAME}`,
      ).split(/\s/)[0];
  if (latest !== process.env.GITHUB_SHA)
    throw new Error(
      'Stale deployment: run full recovery on the current branch head',
    );
} else if (command === 'deployment-summary') {
  const needs = JSON.parse(process.env.NEEDS_JSON);
  if (
    !['dev', 'content', 'main'].includes(process.env.GITHUB_REF_NAME) ||
    !['push', 'workflow_dispatch'].includes(process.env.GITHUB_EVENT_NAME)
  )
    process.exit(0);
  const lines = [
    `Deployment results for ${process.env.GITHUB_REF_NAME} at ${process.env.GITHUB_SHA}.`,
    'A successful promotion merge does not establish successful deployment.',
  ];
  const pending = [];
  for (const app of ['site', 'admin']) {
    if (app === 'admin' && process.env.GITHUB_REF_NAME === 'content') continue;
    const selected = needs.prepare?.outputs?.[app] === 'true';
    const result = needs[`deploy-${app}`]?.result ?? 'missing';
    lines.push(
      `${app}: ${result}${selected ? ' (requested)' : ' (not selected by this run)'}`,
    );
    if (selected && result !== 'success') pending.push(app);
  }
  if (needs.prepare?.result !== 'success') {
    lines.push(
      'Planning/validation failed; deployment selection is untrusted. Inspect the failed job.',
    );
    pending.splice(
      0,
      pending.length,
      'site',
      ...(process.env.GITHUB_REF_NAME === 'content' ? [] : ['admin']),
    );
  }
  if (pending.length) {
    const targets = pending.length === 2 ? 'both' : pending[0];
    lines.push(
      `Operator action required: recover ${targets} at the CURRENT branch head after fixing validation/configuration.`,
      `gh workflow run ci.yml --ref ${process.env.GITHUB_REF_NAME} -f targets=${targets}`,
    );
  }
  lines.push(
    'Recovery is manual. A later docs-only or other-target run does not repair earlier failures. Inspect prior failed/cancelled deployment runs; use targets=both when uncertain.',
  );
  const summary = lines.join('\n\n') + '\n';
  console.log(summary);
  if (process.env.GITHUB_STEP_SUMMARY)
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);
} else if (command === 'upload-site') {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
  execFileSync(
    'wrangler',
    [
      'pages',
      'deploy',
      'output/site-artifact/dist',
      '--project-name',
      process.env.CLOUDFLARE_PAGES_PROJECT,
      '--branch',
      process.env.GITHUB_REF_NAME,
      '--commit-hash',
      process.env.GITHUB_SHA,
      '--commit-dirty=false',
    ],
    { cwd: root, stdio: 'inherit' },
  );
} else {
  throw new Error(
    `Unknown CI command in ${fileURLToPath(import.meta.url)}: ${command}`,
  );
}
