import { createSign } from 'node:crypto';
import { Buffer } from 'node:buffer';

export function githubClient(token, fetcher = globalThis.fetch) {
  return async (method, path, body) => {
    if (!path.startsWith('/') || path.startsWith('//'))
      throw new Error('Expected GitHub API path');
    const response = await fetcher(`https://api.github.com${path}`, {
      method,
      headers: {
        authorization: `Bearer ${token}`,
        accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2026-03-10',
        'content-type': 'application/json',
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    if (!response.ok) {
      // Never echo request headers, response bodies or tokens.
      const error = new Error(
        `GitHub ${method} ${path}: HTTP ${response.status}`,
      );
      error.status = response.status;
      throw error;
    }
    return response.status === 204 ? null : response.json();
  };
}

export async function installationToken({
  clientId,
  privateKey,
  repository,
  fetcher,
}) {
  if (!clientId || !privateKey || !/^[\w.-]+\/[\w.-]+$/.test(repository)) {
    throw new Error('Missing automation App configuration');
  }
  const now = Math.floor(Date.now() / 1000);
  const encode = (value) =>
    Buffer.from(JSON.stringify(value)).toString('base64url');
  const input = `${encode({ alg: 'RS256', typ: 'JWT' })}.${encode({ iat: now - 60, exp: now + 540, iss: clientId })}`;
  const signature = createSign('RSA-SHA256')
    .update(input)
    .sign(privateKey, 'base64url');
  const app = githubClient(`${input}.${signature}`, fetcher);
  const identity = await app('GET', '/app');
  const installation = await app('GET', `/repos/${repository}/installation`);
  const permissions = {
    contents: 'write',
    pull_requests: 'write',
    checks: 'read',
    actions: 'read',
    workflows: 'write',
  };
  for (const [key, value] of Object.entries(permissions)) {
    if (installation.permissions[key] !== value)
      throw new Error(`Automation App permission missing: ${key} ${value}`);
  }
  const result = await app(
    'POST',
    `/app/installations/${installation.id}/access_tokens`,
    {
      repositories: [repository.split('/')[1]],
      permissions,
    },
  );
  return { token: result.token, bot: `${identity.slug}[bot]` };
}

export function verifySyncCommit(api, repository, bot) {
  return async (sha) => {
    if (!bot || !/^[\w-]+\[bot\]$/.test(bot)) return false;
    const commit = await api('GET', `/repos/${repository}/commits/${sha}`);
    if (
      commit.author?.login !== bot ||
      commit.author?.type !== 'Bot' ||
      ![bot, 'web-flow'].includes(commit.committer?.login) ||
      commit.commit.verification?.verified !== true ||
      commit.commit.verification.reason !== 'valid'
    )
      return false;
    // GitHub signs App-authored API merges as web-flow. Bot signatures are
    // issued only for App-authenticated requests without custom identity or
    // signature fields. A user-signed commit with a forged author is not enough.
    const [owner, name] = repository.split('/');
    const result = await api('POST', '/graphql', {
      query: `query SyncSignature($owner: String!, $name: String!, $sha: GitObjectID!) {
        repository(owner: $owner, name: $name) {
          object(oid: $sha) { ... on Commit {
            signature { isValid wasSignedByGitHub }
          } }
        }
      }`,
      variables: { owner, name, sha },
    });
    if (result.errors?.length)
      throw new Error('GitHub signature verification query failed');
    const signature = result.data?.repository?.object?.signature;
    return signature?.isValid === true && signature.wasSignedByGitHub === true;
  };
}
