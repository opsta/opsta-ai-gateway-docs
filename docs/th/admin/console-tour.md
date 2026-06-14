> 🌐 **เอกสารภาษาไทยกำลังจัดทำ** — เนื้อหาด้านล่างเป็นภาษาอังกฤษชั่วคราว จนกว่าจะมีการแปล. _This page is not yet translated; English content is shown temporarily._

# Console tour

The web console is where administrators run the platform — no command line, no Kubernetes access, no editing
YAML. This page orients you; the rest of the Administrator Guide covers each area in depth.

::: info Who can see what
The console shows different sections by role ([RBAC](/th/overview/multi-tenancy#roles-and-access-rbac)):
**members** see the personal portal; **org admins** also see their organization's admin areas; **platform
admins** see everything across all organizations.
:::

## Navigation

The left navigation is grouped by scope:

- **Portal** (everyone) — Overview, Profile, API keys, Blocked requests, Connect a client.
- **Organization** (org & platform admins) — Organization, Projects, Usage, Guardrail blocks, Audit log.
- **Platform** (platform admins only) — Organizations, Users & access, Pricing.

> 📸 **Screenshot:** the console with the role-based left navigation — _placeholder; real capture pending._

## First-time setup

A dismissible **setup guide** on the admin home walks a new platform through the path:
**create an organization → connect its identity provider → invite org admins → users sign in → groups auto-map**.

## Where to go next

| To do this | Go to |
|---|---|
| Create orgs, invite members, set roles | [Organizations & members](/th/admin/organizations-and-members) |
| Configure a project's providers, routing, guardrails, budgets, MCP | [Projects](/th/admin/projects) |
| Connect a corporate identity provider | [SSO & IdP brokering](/th/admin/sso-and-idp) |
| See usage and spend across the org | [Budgets & limits](/th/admin/budgets-and-limits) |
| Review every administrative change | [Audit log](/th/admin/audit-log) |
