# REST API reference

The control plane exposes a REST API for everything the console does — managing organizations, projects,
providers, routing, budgets, limits, guardrails, keys, MCP servers, identity, usage, and audit. Anything you can
do in the console you can automate here.

::: info Authentication & roles
Calls are authenticated with a verified OIDC token and authorized by [role](/security/rbac): **platform admin**,
**org admin** (own organization only), or **member** (self-service). Endpoints marked **internal** are for
in-cluster components (data-plane ingest, probes) and are gated by internal tokens. Paths use `{org}`,
`{project}`, `{user}` for the tenant tuple.
:::

::: tip This reference describes capability, not a network contract
Exact base paths and request/response shapes can evolve between versions. Treat the console as the supported
surface and this list as the map of what's available; pin to a product version for automation.
:::

## Health & metrics

| Method · Path | Purpose | Auth |
|---|---|---|
| `GET /healthz` | Liveness probe | public |
| `GET /readyz` | Readiness (gates on first reconcile) | public |
| `GET /metrics` | Prometheus metrics | internal |

## Organizations

| Method · Path | Purpose | Role |
|---|---|---|
| `GET /api/orgs` | List organizations | platform admin / console |
| `GET /api/orgs/{org}` | Get an organization | org admin |
| `POST /api/orgs` | Create organization | platform admin |
| `DELETE /api/orgs/{org}` | Delete organization | platform admin |
| `POST /api/orgs/{org}/admins` | Appoint org admin | platform admin |
| `GET /api/orgs/{org}/memberships` | List members | org admin |
| `POST /api/orgs/{org}/memberships` | Invite a member | org admin |
| `DELETE /api/orgs/{org}/memberships/{email}` | Remove a member | org admin |
| `GET /api/orgs/{org}/groups` | List groups | org admin |
| `POST /api/orgs/{org}/groups` | Create a group | org admin |
| `POST /api/orgs/{org}/groups/{group}/projects/{project}` | Assign a group to a project | org admin |

## Projects

| Method · Path | Purpose | Role |
|---|---|---|
| `GET /api/projects` | List all projects | internal |
| `POST /api/orgs/{org}/projects` | Create a project | org admin |
| `PATCH /api/orgs/{org}/projects/{project}` | Rename a project | org admin |
| `DELETE /api/orgs/{org}/projects/{project}` | Delete a project | org admin |

## Consumers (users)

| Method · Path | Purpose | Role |
|---|---|---|
| `GET /api/orgs/{org}/projects/{project}/consumers` | List consumers in a project | org admin |
| `POST /api/orgs/{org}/projects/{project}/consumers` | Create a consumer | org admin |
| `DELETE /api/orgs/{org}/projects/{project}/consumers/{user}` | Delete a consumer | org admin |
| `PUT /api/orgs/{org}/projects/{project}/consumers/{user}/budget` | Set a consumer's USD budget | org admin |

## API keys

| Method · Path | Purpose | Role |
|---|---|---|
| `GET /api/me/keys` | List my keys | member |
| `POST /api/me/consumers/{name}/key` | Issue a key for my consumer | member |
| `DELETE /api/me/keys/{id}` | Revoke my key | member |
| `POST /api/orgs/{org}/projects/{project}/consumers/{user}/key` | Issue/rotate a consumer key | org admin |
| `DELETE /api/orgs/{org}/projects/{project}/consumers/{user}/keys/{id}` | Revoke a consumer key | org admin |

## Providers

| Method · Path | Purpose | Role |
|---|---|---|
| `GET /api/orgs/{org}/projects/{project}/providers` | List providers | org admin |
| `POST /api/orgs/{org}/projects/{project}/providers` | Add a provider (config + key) | org admin |
| `POST /api/orgs/{org}/projects/{project}/providers/{id}/test` | Test connectivity | org admin |
| `DELETE /api/orgs/{org}/projects/{project}/providers/{id}` | Remove a provider | org admin |

## Models & routing

| Method · Path | Purpose | Role |
|---|---|---|
| `GET /api/orgs/{org}/projects/{project}/models` | List model routes | org admin |
| `POST /api/orgs/{org}/projects/{project}/models` | Create a route (logical → provider) | org admin |
| `DELETE /api/orgs/{org}/projects/{project}/models/{logical}` | Delete a route | org admin |

## Budgets & limits

| Method · Path | Purpose | Role |
|---|---|---|
| `GET /api/orgs/{org}/projects/{project}/limits` | List project/group/user limits | org admin |
| `PUT /api/orgs/{org}/projects/{project}/limits` | Set the project limit | org admin |
| `PUT /api/orgs/{org}/projects/{project}/groups/{group}/limits` | Set a group limit | org admin |
| `PUT /api/orgs/{org}/projects/{project}/users/{user}/limits` | Set a user limit | org admin |
| `GET /api/orgs/{org}/projects/{project}/effective-config` | Effective merged limits + guardrails | org admin |

## Guardrails

| Method · Path | Purpose | Role |
|---|---|---|
| `GET /api/orgs/{org}/projects/{project}/guardrails` | List guardrail patterns | org admin |
| `POST /api/orgs/{org}/projects/{project}/guardrails` | Add a pattern | org admin |
| `DELETE /api/orgs/{org}/projects/{project}/guardrails/{pattern}` | Remove a pattern | org admin |

## Semantic cache

| Method · Path | Purpose | Role |
|---|---|---|
| `GET /api/orgs/{org}/projects/{project}/semantic-cache` | Get cache settings | org admin |
| `PUT /api/orgs/{org}/projects/{project}/semantic-cache` | Update cache settings | org admin |
| `POST /api/cache-hits` | Ingest cache-hit events | internal |

## Semantic guard

| Method · Path | Purpose | Role |
|---|---|---|
| `GET /api/orgs/{org}/projects/{project}/semantic-guard` | Get guard config | org admin |
| `PUT /api/orgs/{org}/projects/{project}/semantic-guard` | Update guard config | org admin |
| `GET /api/orgs/{org}/projects/{project}/semantic-guard/prompts` | Get sample prompts | org admin |
| `PUT /api/orgs/{org}/projects/{project}/semantic-guard/prompts` | Update sample prompts | org admin |

## MCP servers

| Method · Path | Purpose | Role |
|---|---|---|
| `GET /api/orgs/{org}/projects/{project}/mcp-servers` | List MCP servers | org admin |
| `POST /api/orgs/{org}/projects/{project}/mcp-servers` | Register an MCP server | org admin |
| `PUT /api/orgs/{org}/projects/{project}/mcp-servers/{id}` | Update an MCP server | org admin |
| `DELETE /api/orgs/{org}/projects/{project}/mcp-servers/{id}` | Unregister an MCP server | org admin |
| `POST /api/mcp-calls` | Ingest MCP call metrics | internal |

## Identity providers

| Method · Path | Purpose | Role |
|---|---|---|
| `GET /api/orgs/{org}/idp` | List IdP connections | org admin |
| `POST /api/orgs/{org}/idp` | Add an IdP (OIDC/SAML) | org admin |
| `GET /api/orgs/{org}/idp/{id}` | Get an IdP connection | org admin |
| `DELETE /api/orgs/{org}/idp/{id}` | Remove an IdP | org admin |

## Pricing

| Method · Path | Purpose | Role |
|---|---|---|
| `GET /api/prices` | List model prices | internal / admin |
| `POST /api/prices` | Set a price override | platform admin |
| `POST /api/prices/sync` | Sync the price catalog | platform admin |

## Usage

| Method · Path | Purpose | Role |
|---|---|---|
| `GET /api/usage` | Query my/scope usage (tokens, cost, MTD) | member / org admin |
| `GET /api/usage/history` | Usage time series | member / org admin |
| `GET /api/usage/months` | Available month windows | member / org admin |
| `GET /api/orgs/{org}/usage` | Org-wide usage | org admin |
| `GET /api/orgs/{org}/projects/{project}/usage` | Project usage | org admin |
| `POST /api/usage/ingest` | Ingest per-request token events | internal |

## Blocked requests

| Method · Path | Purpose | Role |
|---|---|---|
| `GET /api/me/blocks` | List my blocked requests | member |
| `POST /api/me/blocks/{id}/report` | Flag a block as a false positive | member |
| `GET /api/orgs/{org}/blocks` | List the org's blocks (for tuning) | org admin |
| `POST /api/guardrail-blocks` | Ingest block events | internal |

## Audit

| Method · Path | Purpose | Role |
|---|---|---|
| `GET /api/audit` | Platform-wide audit trail | platform admin |
| `GET /api/orgs/{org}/audit` | Org audit trail | org admin |

## Onboarding & console config

| Method · Path | Purpose | Role |
|---|---|---|
| `POST /api/self-enroll` | First-login enrollment into the default org | member |
| `GET /api/console-config` | Tenant view for the web console | console (SSO-gated) |

## Next steps

- [Configuration reference](/reference/configuration) — operator values.
- [RBAC model](/security/rbac) — what each role can call.
