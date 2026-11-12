import { execFileSync, spawnSync } from 'node:child_process';
import { isEditorialPath } from '../ci/policy.mjs';

export function gitGraph(cwd = process.cwd()) {
  const git = (...args) =>
    execFileSync('git', args, {
      cwd,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      maxBuffer: 32 * 1024 * 1024,
    }).trimEnd();
  const ancestor = (a, b) => {
    const result = spawnSync('git', ['merge-base', '--is-ancestor', a, b], {
      cwd,
    });
    if (![0, 1].includes(result.status))
      throw new Error('Cannot inspect ancestry');
    return result.status === 0;
  };
  const paths = (a, b) =>
    git('diff', '--name-only', '--no-renames', '-z', a, b)
      .split('\0')
      .filter(Boolean);
  return { git, ancestor, paths };
}

// Inspect every introduced commit, including code that is reverted later.
// Main-reachable commits are trusted publication history, not editorial writes.
export async function guardEditorial({ graph, main, head, base, verifySync }) {
  if (base && !graph.ancestor(base, head))
    throw new Error('Editorial history was rewritten');
  const commits = graph
    .git('rev-list', '--reverse', head, '--not', main, ...(base ? [base] : []))
    .split('\n')
    .filter(Boolean);
  for (const sha of commits) {
    const parents = graph
      .git('show', '-s', '--format=%P', sha)
      .split(' ')
      .filter(Boolean);
    if (!parents.length) throw new Error(`Unrelated editorial root: ${sha}`);
    const paths = graph.paths(parents[0], sha);
    if (paths.every(isEditorialPath)) continue;
    if (
      parents.length !== 2 ||
      !graph.ancestor(parents[1], main) ||
      !(await verifySync(sha))
    ) {
      throw new Error(`Forbidden editorial code/config change: ${sha}`);
    }
    // Git's documented merge-tree computes a clean merge without checking out
    // or executing branch files. A conflict or a customized tree fails closed.
    const expected = graph
      .git('merge-tree', '--write-tree', parents[0], parents[1])
      .split('\n')[0];
    if (expected !== graph.git('rev-parse', `${sha}^{tree}`)) {
      throw new Error(`Synchronization tree differs from clean merge: ${sha}`);
    }
  }
  return commits.length;
}

export function assertEditorialDiff(graph, main, head) {
  if (!graph.ancestor(main, head))
    throw new Error('Synchronize latest main before content promotion');
  const forbidden = graph
    .paths(main, head)
    .filter((path) => !isEditorialPath(path));
  if (forbidden.length)
    throw new Error(`Non-editorial promotion paths: ${forbidden.join(', ')}`);
}
