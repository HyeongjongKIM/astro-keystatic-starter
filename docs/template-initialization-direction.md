# Template initialization direction

Deferred proposal, recorded on 2026-11-12. This is an open direction for future discussion, not an implementation specification or a scheduled phase. It does not change the current task order or customer setup process.

## Opportunity

Each customer receives an independent copy of this template. Adapting that copy requires repeated setup and decisions across repository identity, site branding, environments and deployment settings. Initialization assistance could make that process easier to understand and reduce accidentally retained template defaults.

The desired outcome is a customer repository whose remaining setup work is clear. Generating configuration alone would not establish that authentication, publishing or deployment works.

## Possible directions

Depending on what customer setup experience reveals, assistance might take the form of a guided checklist, configuration validation, a local script, or several smaller tools. Some preparation could be automated while account-specific steps remain guided. These are alternatives to explore, not committed features.

Useful areas to consider include identifying customer-specific settings, explaining missing configuration, and helping a maintainer resume incomplete setup. The command names, interface, supported platforms and extent of external service automation remain undecided.

## Questions to revisit

- Which repeated steps cause the most confusion or mistakes in actual customer setup?
- Who performs initialization, and what repository, GitHub and Cloudflare access do they already have?
- What belongs to initial setup, and what should remain ordinary configuration or ongoing maintenance?
- How should assistance handle an untouched template, a partially configured repository and an existing customer project?
- Which steps can be verified locally, and which require account-owner action or deployed validation?
- What is the smallest useful improvement, including improvements to documentation alone?

## Constraints to preserve

Any future implementation should preserve customer isolation, existing content and settings, secret handling, and normal account authorization flows. Changes and unfinished steps should be understandable; rerunning assistance should not silently overwrite customer work. It should follow the branch and deployment policy in effect at that time rather than freeze today's workflow into a new tool.

## When to revisit

Revisit this direction when the publishing workflow is clearer and customer setup experience provides concrete needs. Review the [customer setup guide](customer-setup.md) and current [task queue](../tasks/README.md) then, and check applicable official APIs before choosing an approach. Only create a phase, detailed requirements or implementation tasks once the scope is agreed.
