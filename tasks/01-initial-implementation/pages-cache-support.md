# Pages deleted-path cache investigation

Prepared 2026-11-07 KST. This is a support-request draft, not a submitted case or confirmed Cloudflare defect. No credentials are included.

## Summary

Git-connected Pages production serves cached HTTP 200 HTML for a deleted path, while a diagnostic query for the same path returns the expected 404. Need the supported invalidation procedure for the shared pages.dev hostname and guidance on reliable deletion propagation.

## Reproduction

Project: `astro-keystatic-starter-site`. Production branch: `main`.

1. Commit a hidden static Page at `/projects/cache-policy-check/`: d3d531d399e6627129af93e59c1b1ae6e527db9f; deployment d9685334-d7c5-4102-aa16-119b93a87589.
2. Visit the plain URL and observe HTTP 200, revision one.
3. Update it: c011292843be8f6bb5f81f313c0434056598be0b; deployment ba06a4f4-7126-477b-b536-cf594d4fd04d. Same URL reflects revision two. Rollback and restore also reflect the selected revision.
4. Delete the Page: c12eb88e6a091c6d7082d1a119b07bbf14673dd5; successful deployment fc252f32-a277-43a0-81e4-4935279111b0. Source and built output omit the Page and include a top-level 404.html.
5. Request the same plain URL again; it still returns cached HTML with HTTP 200.

The Page was initially created under a documented `_headers` experiment with `Cache-Control: public, max-age=0, must-revalidate` and `CDN-Cache-Control: no-store`. Deletion remained stale despite those displayed headers. The ineffective policy was reverted in 4e99b1b. Temporary Page source and obsolete containing deployments were removed.

## Latest response evidence

Observed 2026-11-07 KST using ordinary curl GET:

```text
https://astro-keystatic-starter-site.pages.dev/projects/cache-policy-check/
HTTP 200
CF-Cache-Status: HIT
Age: 1223
Cache-Control: public, s-maxage=604800
CF-Ray: a56717668fa445ac-ICN

https://astro-keystatic-starter-site.pages.dev/projects/cache-policy-check/?diagnostic=20261107-2113
HTTP 404
Cache-Control: no-store
CF-Ray: a567186f9b1eaa0d-ICN
```

The query variant is diagnostic evidence only. The plain URL must be validated independently. An earlier deleted Page `/projects/publication-proof/` exhibited the same issue, including in Chrome and with no-cache requests.

## Questions for Cloudflare

- How can a Pages owner invalidate stale path responses on the shared pages.dev hostname without zone ownership?
- Is the observed week-long s-maxage expected for this deleted production path? No source rule configured that value.
- What supported deployment/cache procedure ensures a previously visited deleted Page returns 404 on its unchanged URL?

## Official guidance consulted

- [Serving Pages](https://developers.cloudflare.com/pages/configuration/serving-pages/): stale assets guidance uses zone cache purging; asset retention can last one week.
- [Headers](https://developers.cloudflare.com/pages/configuration/headers/).
- [Contacting Support](https://developers.cloudflare.com/support/contacting-cloudflare-support/): available technical support channels depend on the plan; Free plans generally use Community/Discord.

The current CLI credential cannot access the shared pages.dev zone and lacks owned-zone DNS/cache permissions. Pages build-cache purging was not substituted for CDN response-cache purging. A separate approved custom-subdomain validation is pending DNS setup.

## Approved custom-domain follow-up

Attached `astro-starter.hyeongjongkim.dev` with active DNS/certificate validation. Production origin updated and rebuilt. Existing personal apex/www Pages connection remains intact.

A fresh hidden `/projects/domain-validation/` Page passed initial publication, edit, rollback and restore on its unchanged custom-domain URL. Removing it in 597be97a49cd4b9aba7a9cbed1830d60ba11422a produced successful deployment b7bef704-5712-42f4-b4c8-c7aab9879c56, selected as current canonical. Nevertheless, plain custom URL returned HTTP 200 with deleted revision-two HTML, CF-Cache-Status DYNAMIC and `public, s-maxage=604800`; a diagnostic query returned 404/no-store. Chrome reload reproduced the deleted title.

Applied exact-URL purge, then the official Pages guidance's zone Purge Everything via authenticated dashboard. Dashboard purge response explicitly returned HTTP 200/success true/errors empty. Subsequent plain custom URL still returned HTTP 200, Age 204, CF-Ray a5672540b958472e-SIN. What additional supported procedure invalidates Pages' stale deleted-path response after an accepted zone purge?

Production pages.dev now uses the official Bulk Redirect procedure to the custom hostname; the old proof path redirects and ends at custom 404. Preview hosts remain independent. This is not presented as a cache fix for the newly failing custom-domain URL.

Authenticated Free-plan support portal → Submit a case → Other says technical support cases are unavailable, directing to Community/AI/docs. This document remains a draft pending explicit authorization to publish externally.

## Deployment history, routing and cache comparison

2026-11-07 KST follow-up requested by maintainer. Read-only Pages API confirmed canonical production deployment b7bef704-5712-42f4-b4c8-c7aab9879c56, commit 597be97a49cd4b9aba7a9cbed1830d60ba11422a (temporary Page removed), successful deployment completed 2026-11-06 21:18:40 UTC. Its custom alias is correctly attached. Both obsolete Page-containing deployment GET requests returned 404. The build root, command and output match the agreed static Site. Latest deployment is a separate preview deployment from 1e686d1; it is not incorrectly selected as production.

| Request path / host                                              | Observed result                                           |
| ---------------------------------------------------------------- | --------------------------------------------------------- |
| Current deployment-specific host, `/projects/domain-validation/` | 404, deleted title absent                                 |
| Production custom host, same unchanged path                      | 200, deleted revision two, Age 2424, DYNAMIC, SIN         |
| Production custom host, diagnostic query variant                 | 404; body SHA-256 matches current deployment-specific 404 |
| Preview host, same deleted path                                  | 404                                                       |
| Production pages.dev alias                                       | 301 to matching custom path                               |
| Custom host, `/projects/domain-validation` (no slash)            | 404                                                       |
| Custom host, `/projects/domain-validation/index.html`            | 404                                                       |

Interpretation: the current production build does not itself contain this Page. Preserved deployment history alone does not explain the wrong custom-host response. A path/host/edge-specific response persists. Do not treat query/path variation as an acceptance fix.

Authenticated dashboard inspection found no Cache Rules, no Cache Response Rules and no Page Rules; official zone Workers routes API returned an empty list. DNS target is this Pages project's hostname. Always Online is off; development mode is off; cache level is the dashboard's Standard setting (API value aggressive), browser cache TTL 14400. No additional cache rule was created.

Consulted [Debugging Pages](https://developers.cloudflare.com/pages/configuration/debugging-pages/), which recommends DNS Only comparison when custom-domain behavior differs. Temporarily switched only the starter CNAME to DNS Only at 2026-11-06 22:00:25 UTC, with the intention to restore it after comparison. Dashboard PATCH returned 200; authoritative nameserver then returned CNAME to this Pages project with TTL 300. Pages domain/certificate remained active. Initial ordinary requests still used the old proxied IPv6 address and returned cached 200/HIT/SIN. Explicit connections preserving the same HTTPS hostname/path to both current Pages IPv4 and IPv6 addresses returned 404/ICN. A curl -4 request also returned 404/HKG while curl -6 still used the old address and returned 200/HIT/SIN. These controlled address-selection requests are diagnostics, not proof that every normal client has recovered; DNS propagation and data-center differences are confounded.

Official [Serving Pages](https://developers.cloudflare.com/pages/configuration/serving-pages/) documents per-data-center asset retention up to one week. This makes retained edge assets a plausible explanation, not a confirmed cause. Official [cache response guidance](https://developers.cloudflare.com/cache/concepts/cache-responses/) explains that Age measures cached-object age and can reflect an upper tier; it is not elapsed time since deletion. Continued observation is necessary before asserting a permanent failure or a DNS-only fix.

The two deleted deployment-specific hosts (8451ec17 and 51d7801a) also returned HTTP 404, with and without diagnostic query strings, and neither response contained the deleted title. This differs from an orphaned deployment host still serving content. Root cause is not established by deployment-history retention.

During the DNS-only interval, authoritative DNS advertised the expected CNAME, TTL 300, while an ordinary curl connection still used the formerly proxied IPv6 address 2606:4700:3037::6815:16d5 (SIN) and received stale 200/HIT. Address-controlled requests to current Pages IPv4 addresses 172.66.47.120/172.66.44.136 and IPv6 addresses 2606:4700:310c::ac42:2c88/2606:4700:310c::ac42:2f78 all returned 404/ICN while preserving URL hostname, TLS verification and path. The CLI environment had no proxy variables. These results identify a route/data-center difference but do not independently prove an IPv6-specific product defect.

## Fresh Page test rejects DNS Only as a general fix

After observing the original deleted path return ordinary 404 with refreshed DNS, restored proxy once for comparison and reproduced stale 200 on the old proxied IPv6/SIN address (Age 2894), while IPv4/HKG returned 404. Then reapplied DNS Only and created a new hidden `/projects/dns-validation/` Page specifically to avoid mistaking an uncached edge for a fix.

- Create 6a1137df → deployment 37085ae3-120a-4f27-b98f-ed994c7236d7: ordinary URL returned 200/revision one through current Pages IPv6, with public max-age=0/must-revalidate.
- Update 10b49c5f → deployment fb3508ae-fac6-4828-9bac-5c22090df905: same ordinary URL returned 200/revision two.
- Rollback to 37085ae3: immediate response still revision two, so not accepted as proof; after 10 seconds same URL returned revision one. Restored fb3508ae and after 10 seconds revision two was verified.
- Delete 36673506 → deployment da8ba288-ce8c-42c5-a2f4-ede41df128d4: deployment completed successfully at 2026-11-06 22:10:30 UTC and was selected canonical. The previously visited unchanged custom URL still returned 200/HIT/Age51 with deleted HTML through current Pages IPv6 2606:4700:310c::ac42:2f78, CF-Ray a5676ddf4d4b580b-ICN, public s-maxage=604800. Thus a newly cached path reproduces deletion staleness with DNS Only and on the current Pages network target; initial recovery of the older URL was not a general fix.

Restored the starter CNAME to original Proxied status after rejecting the experiment. Apex/www were unchanged throughout. Removed temporary Page source and deleted only the obsolete containing deployments 37085ae3/fb3508ae after protecting current canonical/latest. No ineffective new cache rule, query workaround or architecture change remains.

Narrowed conclusion: current static build and production deployment selection are correct; retained historical deployments do not alone explain the symptom; an additional proxied-zone cache rule or Worker route is not required to reproduce it. Pages' per-host/path/edge retained response or propagation behavior is the leading explanation, but its exact internal mechanism and whether the delay is expected remain unverified. Asset retention documentation is a clue, not proof that public deletion should take one week. Continue time-based observation and seek a supported explanation before claiming a defect or a permanent solution.

Final cross-route observation at 2026-11-06 22:12:12 UTC (about 102 seconds after the deletion deployment completed): restored-proxy ordinary `/projects/dns-validation/` returned 404/DYNAMIC/SIN, and current deployment-specific URL returned 404/ICN. However, connections to the previously visited current Pages IPv4 and IPv6 addresses preserving the same HTTPS host/path returned 200/DYNAMIC/Age157/ICN. Thus ordinary recovery coincided with a routing change and does not establish global invalidation. The symptom is demonstrably data-center/route-dependent, rather than universally broken or specific to IPv6. DNS was restored to the original Proxied setting; no experimental infrastructure setting remains.
