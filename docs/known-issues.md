# Known issues and accepted limitations

## CACHE-01 — delayed visibility of deleted Pages content

**Status:** TODO  
**Disposition:** deferred; non-blocking for initial implementation by maintainer decision on 2026-11-07 KST. This issue is unresolved, not fixed.

After a successful deletion deployment, a previously visited public URL sometimes returned old HTML with HTTP 200. Other network paths and the current deployment-specific URL returned 404. Exact-URL purge, zone Purge Everything and temporary DNS Only comparisons did not establish a general fix. Current build output does not contain the deleted Page. The precise cause and deletion propagation time remain unverified; documented asset retention is not a confirmed public deletion SLA.

The maintainer explicitly chose to defer this issue and continue completion of the initial implementation. Historical BLOCKED checkpoints in Task 05 describe the investigation at that time and are superseded by this acceptance decision. Immediate global deletion visibility is excluded from this phase's completion gate.

For ordinary content operations, confirm the intended Git commit and successful production deployment, then check the unchanged URL after allowing propagation. Record the time, HTTP status, CF-Ray, CF-Cache-Status and Age if an old response persists. A query variant or a different network route can help diagnosis but does not prove global cache invalidation. Cloudflare's documented cache-purge procedure remains an available diagnostic action; it was not a verified fix in these tests. Do not rely on immediate global removal for sensitive material.

Reopen when immediate deletion becomes a customer requirement, normal publishing/deletion remains affected after observation, or Cloudflare supplies a supported explanation or remediation. Future verification should compare previously visited unchanged URLs across observed routes after successful deployments and any supported remediation. No new support post, paid upgrade, DNS experiment or cache purge is planned during phase closeout.

Investigation: [Task 05 evidence](../tasks/01-initial-implementation/05-deployment.md), [reproduction and routing comparisons](../tasks/01-initial-implementation/pages-cache-support.md), [Cloudflare Serving Pages](https://developers.cloudflare.com/pages/configuration/serving-pages/).

## Other recorded limitations

- Local Workers authentication development has a recorded `exports is not defined` error. Deployed OAuth and writes were validated; the Node configuration is only for GitHub App provisioning. See [Task 00](../tasks/01-initial-implementation/00-compatibility.md).
- Admin builds emit a client chunk-size warning. Builds and type checks pass; bundle optimization is deferred.
