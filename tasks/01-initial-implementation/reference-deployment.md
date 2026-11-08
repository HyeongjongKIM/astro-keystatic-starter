# Reference deployment investigation notes

Historical reference-environment details moved from the customer setup guide on 2026-11-09. These are not customer setup defaults.

## Reference deployment and unresolved deletion freshness

The approved reference production origin is `https://astro-starter.hyeongjongkim.dev`, backed by the existing Git-connected Pages project. Preview remains `https://preview.astro-keystatic-starter-site.pages.dev`. The personal site's apex/www connections remain intact.

For a customer custom domain, register it in Pages before adding its CNAME; set production PUBLIC_SITE_URL and rebuild. Cloudflare documents account Bulk Redirects to send the production pages.dev hostname to the custom origin. Preserve query string, subpath matching and path suffix; keep Include subdomains off when preview/deployment aliases must remain independent. The reference uses list `starter_production_domain`, one 301 entry from `astro-keystatic-starter-site.pages.dev` to its custom origin. Manage or disable this rule before detaching/changing that custom domain. See [custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/) and [Pages domain redirects](https://developers.cloudflare.com/pages/how-to/redirect-to-custom-domain/).

The maintainer accepted deleted-page freshness as an unresolved, non-blocking limitation for initial implementation on 2026-11-07 KST. See [CACHE-01](../../docs/known-issues.md) for its disposition, operational checks and reopening conditions. This is a deferral, not a verified cache fix or an immediate global deletion guarantee.

During investigation, previously visited deleted paths sometimes returned old HTTP 200 after successful deployments and accepted cache purges, while current deployment-specific URLs and other network paths returned 404. Fresh tests under DNS Only reproduced the behavior, so DNS Only was rejected as a general fix and the starter CNAME was restored to Proxied. No additional Cache Rules, Page Rules or Worker route was introduced. Query variants are diagnostic only. Allow propagation, check the unchanged URL, and record timestamps/response headers when following up; Pages' documented asset retention is not a verified deletion SLA.

No paid upgrade or public support message was sent. The reference account's Free-plan support portal directed technical issues to Community/AI/docs. The [reproduction draft](pages-cache-support.md) and [Task 05 evidence](05-deployment.md) preserve the observed results. Further support posting and infrastructure experiments are on hold under the maintainer's deferral.

The local Workers module-error fix, remaining local OAuth validation limits and Admin bundle-size warning are documented in [known issues](../../docs/known-issues.md). Use deployed validation for authentication and writes, and the approved Node configuration only for App provisioning.
