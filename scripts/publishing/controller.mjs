import { execFileSync } from 'node:child_process';
import { assertEditorialDiff, guardEditorial } from './git.mjs';
import { verifySyncCommit } from './github.mjs';

export const title = (branch) =>
  branch === 'content'
    ? 'chore(site): publish content changes'
    : 'chore: publish dev changes';
const branches = ['dev', 'content'];

export class PromotionController {
  constructor({
    api,
    repository,
    graph,
    refresh,
    bot,
    resume,
    log = console.log,
    validateMessage,
  }) {
    Object.assign(this, { api, repository, graph, refresh, bot, resume, log });
    this.validateMessage =
      validateMessage ??
      ((message) =>
        execFileSync('pnpm', ['exec', 'commitlint'], {
          input: message,
          stdio: ['pipe', 'inherit', 'inherit'],
        }));
    this.root = `/repos/${repository}`;
  }
  async list(path) {
    const values = [];
    for (let page = 1; ; page++) {
      const data = await this.api(
        'GET',
        `${this.root}${path}${path.includes('?') ? '&' : '?'}per_page=100&page=${page}`,
      );
      values.push(...data);
      if (data.length < 100) return values;
    }
  }
  async tips(branch) {
    const [main, source] = await Promise.all(
      ['main', branch].map(
        async (name) =>
          (await this.api('GET', `${this.root}/git/ref/heads/${name}`)).object
            .sha,
      ),
    );
    await this.refresh(main, source);
    return { main, source };
  }
  async branch(branch) {
    const tips = await this.tips(branch);
    // Validate pending content BEFORE syncing: synchronization cannot launder a
    // code commit and its later revert, or a forged merge into editorial history.
    if (branch === 'content')
      await guardEditorial({
        graph: this.graph,
        main: tips.main,
        head: tips.source,
        verifySync: verifySyncCommit(this.api, this.repository, this.bot),
      });
    if (!this.graph.ancestor(tips.main, tips.source)) {
      const message = `chore: sync main into ${branch}`;
      this.validateMessage(message);
      await this.api('POST', `${this.root}/merges`, {
        base: branch,
        head: tips.main,
        commit_message: message,
      });
      this.log(`${branch}: synchronized main; await fresh branch/PR checks`);
      return;
    }
    const pulls = await this.list(
      `/pulls?state=all&base=main&head=${encodeURIComponent(this.repository.split('/')[0] + ':' + branch)}&sort=created&direction=desc`,
    );
    const exact = pulls.filter(
      (pr) =>
        pr.head.repo?.full_name === this.repository &&
        pr.head.ref === branch &&
        pr.base.ref === 'main',
    );
    const open = exact.filter((pr) => pr.state === 'open');
    if (open.length > 1)
      throw new Error(`${branch}: multiple open promotion PRs`);
    const pr = open[0];
    if (pr?.draft)
      throw new Error(
        `${branch}: draft PR pauses promotion; mark ready and reconcile`,
      );
    if (
      !pr &&
      exact[0]?.state === 'closed' &&
      !exact[0]?.merged_at &&
      this.resume !== branch
    ) {
      throw new Error(
        `${branch}: closed unmerged PR pauses promotion; explicitly resume`,
      );
    }
    if (!this.graph.paths(tips.main, tips.source).length) {
      this.log(`${branch}: no publication diff`);
      return;
    }
    if (branch === 'content')
      assertEditorialDiff(this.graph, tips.main, tips.source);
    if (!pr) {
      this.validateMessage(title(branch));
      await this.api('POST', `${this.root}/pulls`, {
        base: 'main',
        head: branch,
        title: title(branch),
        body: `Automatic ${branch} publication. Required checks and repository protections apply. Make this PR draft or close it to pause.`,
      });
      this.log(`${branch}: promotion PR created; await PR checks`);
      return;
    }
    const current = await this.api('GET', `${this.root}/pulls/${pr.number}`);
    if (
      current.state !== 'open' ||
      current.draft ||
      current.head.sha !== tips.source ||
      current.base.sha !== tips.main
    ) {
      throw new Error(
        `${branch}: PR state/head/base changed; reconcile current state`,
      );
    }
    if (current.mergeable !== true || current.mergeable_state !== 'clean') {
      throw new Error(
        `${branch}: PR is not mergeable with current protections`,
      );
    }
    // Require actual PR CI on the synthetic merge for this exact head/base.
    // A branch-push check with the same name cannot substitute for it.
    const runs = await this.api(
      'GET',
      `${this.root}/actions/workflows/ci.yml/runs?event=pull_request&head_sha=${current.head.sha}&per_page=100`,
    );
    const matching = runs.workflow_runs.filter(
      (run) =>
        run.event === 'pull_request' &&
        run.head_sha === tips.source &&
        run.pull_requests.some(
          (item) =>
            item.number === current.number &&
            item.head.sha === tips.source &&
            item.base.sha === tips.main,
        ),
    );
    const latest = matching.sort((a, b) => b.id - a.id)[0];
    if (
      !latest ||
      latest.status !== 'completed' ||
      latest.conclusion !== 'success'
    ) {
      throw new Error(
        `${branch}: latest PR CI for current head/base has not succeeded`,
      );
    }
    const jobs = await this.api(
      'GET',
      `${this.root}/actions/runs/${latest.id}/attempts/${latest.run_attempt}/jobs?per_page=100`,
    );
    const gate = jobs.jobs.filter((job) => job.name === 'Required checks');
    if (gate.length !== 1 || gate[0].conclusion !== 'success')
      throw new Error(`${branch}: missing successful required gate`);
    // Requesting PR details above refreshes GitHub's merge candidate. The
    // 2026-03-10 API removed merge_commit_sha; read the documented merge ref
    // only AFTER mergeability is computed, then verify its actual parents.
    const mergeRef = await this.api(
      'GET',
      `${this.root}/git/ref/pull/${pr.number}/merge`,
    );
    const mergeSha = mergeRef.object.sha;
    await this.refresh(mergeSha);
    const parents = this.graph
      .git('show', '-s', '--format=%P', mergeSha)
      .split(' ');
    if (
      parents.length !== 2 ||
      parents[0] !== tips.main ||
      parents[1] !== tips.source
    ) {
      throw new Error(
        `${branch}: merge-result parents do not match validated head/base`,
      );
    }
    const finalTips = await this.tips(branch);
    if (finalTips.main !== tips.main || finalTips.source !== tips.source)
      throw new Error(`${branch}: head/base advanced before merge`);
    const message = `Validated PR #${pr.number}\nSource: ${tips.source}\nBase: ${tips.main}`;
    this.validateMessage(`${title(branch)}\n\n${message}`);
    const result = await this.api(
      'PUT',
      `${this.root}/pulls/${pr.number}/merge`,
      {
        sha: tips.source,
        merge_method: 'merge',
        commit_title: title(branch),
        commit_message: message,
      },
    );
    if (!result.merged)
      throw new Error(`${branch}: GitHub did not confirm merge`);
    this.log(
      `${branch}: merged PR #${pr.number}; main CI will deploy affected targets`,
    );
    // The next iteration/event reads new main and synchronizes both branches.
    await this.tips(branch);
  }
  async run() {
    const failures = [];
    for (const branch of branches) {
      try {
        await this.branch(branch);
      } catch (error) {
        failures.push(`${branch}: ${error.message}`);
      }
    }
    if (failures.length) throw new Error(failures.join('\n'));
  }
}
