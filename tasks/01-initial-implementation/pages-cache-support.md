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
