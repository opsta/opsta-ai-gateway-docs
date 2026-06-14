# RBAC model

Access is governed by **three roles** and the tenant hierarchy. Every administrative action is scoped: a platform
admin spans all organizations, an org admin is confined to their own organization, and a member has read-only,
self-service access. The same model is enforced at the console and at the configuration API.

::: info Who this is for
Security stakeholders and administrators who assign access.
:::

## The roles

| Role | Scope | Can do |
|---|---|---|
| **Platform admin** | All organizations | Create/delete organizations, appoint org admins, set platform-wide pricing and login methods, read every org's audit and usage |
| **Org admin** | One organization | Manage their org's projects, members, providers, routing, budgets, guardrails, MCP servers, and SSO; read their org's audit and usage |
| **Member** | Their own consumer | Read their own usage and blocked requests; manage their own API keys |

A member's mutating actions on shared configuration are refused — they get a clear "forbidden" outcome, which is
also recorded in the audit log.

## How a role is determined

- **Platform admin** comes from membership in a designated admin **group** (from your IdP) or an explicit email
  allowlist — a break-glass path. Group-based assignment is the primary route.
- **Org admin** comes from a membership record with the org-admin role for that organization.
- **Member** is the default for an authenticated user in an organization.

Roles are driven by the **claims your IdP sends** (groups and email), mapped through
[SSO & IdP brokering](/admin/sso-and-idp). New users are provisioned just-in-time on first login.

## Scoping is enforced, not advisory

The configuration API checks the caller's verified identity on **every** request:

- An org admin acting on a path that belongs to **another** organization is refused.
- Cross-organization reads of usage or audit are refused.
- Members are limited to their own self-service endpoints.

Authorization is based on the **verified token**, not on any header a client could forge — see
[Hardening](/security/hardening#verified-identity).

## Least privilege in practice

- Grant org-admin to the smallest group that needs to manage an organization.
- Keep the platform-admin email allowlist for break-glass only; prefer the admin group.
- Use [hierarchical budgets and limits](/admin/budgets-and-limits) so even authorized users operate within caps.

## Next steps

- [SSO & IdP brokering](/admin/sso-and-idp) — map IdP groups to roles.
- [Audit & compliance](/security/audit-and-compliance) — every role's actions are recorded.
- [Multi-tenancy model](/overview/multi-tenancy) — the hierarchy roles act within.
