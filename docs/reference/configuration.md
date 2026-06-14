# Configuration reference

Every operator-facing setting is a Helm value with a sane default. This page lists the values grouped by concern,
with purpose and default. For the conceptual overview of the config surface, see
[Configuration](/operate/configuration).

::: tip Defaults are production-minded
Most environments only change a handful of values — domain, TLS mode, the HA toggle, and which subsystems are on.
The rest have defaults tuned for a long-running on-prem product.
:::

## global

| Key | Purpose | Default |
|---|---|---|
| `global.baseDomain` | Root domain; subdomains derive from it | `ai-gateway.opsta.dev` |
| `global.subdomainSeparator` | `"."` (two-level) or `"-"` (single-level under a parent wildcard) | `"."` |
| `global.subdomains.api` / `.console` / `.grafana` / `.auth` / `.mcp` | Subdomain labels | `api` / `console` / `grafana` / `auth` / `mcp` |
| `global.highAvailability` | Standalone vs. HA for the whole platform | `false` |
| `global.registry` | Registry for Opsta-built images | `ghcr.io/opsta/opsta-ai-gateway` |
| `global.imageMirror` | Mirror for upstream images (air-gap) | `""` |
| `global.imageMirrorFlatten` | Collapse mirrored images under one repo | `false` |
| `global.imagePullSecrets` | Pull secrets applied to all images | `[]` |
| `global.namespacePrefix` | Prefix for platform-managed namespaces | `""` |
| `global.storageClass` | StorageClass for all PVCs (`""` = cluster default) | `""` |

## tls

| Key | Purpose | Default |
|---|---|---|
| `tls.mode` | `letsencrypt` · `provided` · `selfsigned` | `letsencrypt` |
| `tls.wildcardSecretName` | Wildcard cert Secret name | `ai-gateway-wildcard-tls` |
| `tls.letsencrypt.issuer` | `letsencrypt-staging` or `letsencrypt-prod` | `letsencrypt-staging` |
| `tls.letsencrypt.email` | ACME contact email | _(set per env)_ |
| `tls.letsencrypt.dns01.provider` | DNS-01 provider | `cloudflare` |
| `tls.letsencrypt.dns01.dnsZone` | Zone the DNS token manages | `opsta.dev` |

## Operators (bring-your-own)

| Key | Purpose | Default |
|---|---|---|
| `certManager.enabled` | Install cert-manager (vs. reuse existing) | `true` |
| `redisOperator.enabled` | Install the Redis operator | `true` |
| `cnpg.enabled` | Install CloudNativePG | `true` |

See [Reuse existing operators](/operate/byo-operators).

## ingress & secrets

| Key | Purpose | Default |
|---|---|---|
| `ingress.tunnel.enabled` | Cloudflare Tunnel front door | `false` |
| `secrets.createFromValues` | Chart creates Secrets from a git-ignored values file (`true`) or references existing Secrets (`false`) | `true` |
| `secrets.values.*` / `secrets.existing.*` | Secret contents or references | _(per env)_ |

## postgres (control-plane database)

| Key | Purpose | Default |
|---|---|---|
| `postgres.enabled` | Deploy the control-plane database | `false` |
| `postgres.instances` | Cluster size (`null` = derive from HA) | `null` |
| `postgres.database` / `.owner` | Database name / owner role | `opsta` / `opsta` |
| `postgres.storageSize` | PVC size | `5Gi` |
| `postgres.backup.enabled` | Scheduled backups | `false` |
| `postgres.backup.method` | `objectStore` or `volumeSnapshot` | `objectStore` |
| `postgres.backup.objectStore.destinationPath` / `.endpointURL` | Backup target | `""` |

## redis

| Key | Purpose | Default |
|---|---|---|
| `redis.enabled` | Deploy Redis (rate-limit + quota counters) | `true` |
| `redis.replicas` | Replicas (`null` = derive from HA) | `null` |
| `redis.timeoutMs` | Plugin timeout | `2000` |

## controlPlane

| Key | Purpose | Default |
|---|---|---|
| `controlPlane.enabled` | Deploy the control plane (needs `postgres.enabled`) | `false` |
| `controlPlane.replicas` | Replicas (`null` = derive from HA) | `null` |
| `controlPlane.networkPolicy.enabled` | Default-deny ingress to the API | `true` |
| `controlPlane.networkPolicy.extraIngressNamespaces` | Extra namespaces allowed in | `[]` |
| `controlPlane.bootstrapAdmin.enabled` | Seed a first-deploy admin | `true` |
| `controlPlane.bootstrapAdmin.email` | Bootstrap admin email (**set in prod**) | `""` |
| `controlPlane.bootstrapAdmin.group` | Bootstrap admin group | `opsta-admins` |

## console

| Key | Purpose | Default |
|---|---|---|
| `console.enabled` | Deploy the web console | `true` |
| `console.replicas` | Replicas (`null` = derive from HA) | `null` |
| `console.adminGroups` | Groups with admin access | `[opsta-admins]` |
| `console.adminEmails` | Break-glass admin email allowlist | `[]` |

## keycloak (identity)

| Key | Purpose | Default |
|---|---|---|
| `keycloak.enabled` | Deploy Keycloak + its database | `false` |
| `keycloak.replicas` | Server replicas (`null` = derive) | `null` |
| `keycloak.realm.name` | Realm name | `opsta` |
| `keycloak.realm.adminGroup` | Group whose members are admins | `opsta-admins` |
| `keycloak.realm.groups` | Seed realm groups | `[eng, opsta-admins]` |

## sso

| Key | Purpose | Default |
|---|---|---|
| `sso.enabled` | OIDC sign-in for console + dashboards | `true` |
| `sso.mode` | `google` or `mock` (dev/test) | `google` |
| `sso.emailDomain` | Allowed email domain | _(per env)_ |
| `sso.requireVerifiedEmail` | Require `email_verified` | `true` |
| `sso.scopes` / `.emailClaim` / `.groupsClaim` / `.nameClaim` | OIDC scopes and claim names | `openid email profile groups` / `email` / `groups` / `name` |

## observability

| Key | Purpose | Default |
|---|---|---|
| `observability.enabled` | Bundled metrics/logs/traces stack | `true` |
| `observability.replicas` | Auth-proxy replicas (`null` = derive) | `null` |
| `observability.storage` | `local` or `object` (HA) | `local` |
| `observability.metricsRetention` | Metrics retention | `8760h` (365d) |
| `observability.logsRetention` | Logs retention | `4320h` (180d) |
| `observability.tracesRetention` | Traces retention | `2160h` (90d) |
| `observability.networkPolicy.enabled` | Lock backends to the auth proxy | `true` |

## Policy defaults (data plane)

| Key | Purpose | Default |
|---|---|---|
| `budgets.enabled` | Key-auth + USD budgets | `true` |
| `budgets.reconcileSchedule` | Budget reconcile cadence | `*/1 * * * *` |
| `budgets.keyHeader` / `.keyPrefix` | API-key header / prefix | `Authorization` / `Bearer ` |
| `rateLimits.enabled` | Token-per-minute limiting | `true` |
| `rateLimits.defaultUserPerMinute` | Default TPM per consumer | `100000` |
| `modelAllowlist.enabled` | Per-group model allow-list | `true` |
| `modelAllowlist.defaultAction` | `deny` or `allow` when unmatched | `deny` |
| `modelRouter.enabled` | Body-model → header routing | `true` |
| `modelRouter.modelHeader` | Header to route on | `x-higress-llm-model` |
| `guardrails.promptInjection.enabled` | Prompt-injection guard | `true` |
| `guardrails.dataMasking.enabled` | PII masking (opt-in; see note) | `false` |
| `gateway.maxRequestBytes` | Max buffered request body | `10485760` (10 MiB) |
| `audit.retentionDays` | Audit-log retention | `365` |

::: warning Data-masking is opt-in
`guardrails.dataMasking.enabled` defaults to `false` because the upstream masking plugin can truncate streaming
responses that contain tool calls, which breaks agentic clients. Enable it only when you need a PII floor and
don't rely on streaming tool-calls. See [Guardrails](/admin/guardrails).
:::

## Semantic features & MCP

| Key | Purpose | Default |
|---|---|---|
| `semanticCache.enabled` | Semantic response cache | `false` |
| `semanticCache.collection` | Vector collection name | `opsta_cache` |
| `semanticGuard.enabled` | Embedding-based prompt guard | `false` |
| `semanticGuard.collection` | Guard vector collection | `opsta_guard` |
| `semantic.qdrant.replicas` / `.storage` | Vector DB replicas / disk | `null` / `10Gi` |
| `semantic.ollama.replicas` / `.storage` / `.model` | Embedding service | `null` / `5Gi` / `bge-m3:latest` |
| `mcp.enabled` | MCP gateway | `false` |
| `mcp.transport` | MCP transport | `streamable` |

## images

| Key | Purpose | Default |
|---|---|---|
| `images.builtTag` | Tag for Opsta-built images (release version in prod) | `dev` |
| `images.external.*` | Pinned upstream image references | _(matrix)_ |
| `images.aiPlugins.*` | Built-in plugin mirror source, tag, names | _(matrix)_ |

The full pinned set is the product's tested **component matrix** — bumped deliberately per release. See
[Upgrades](/operate/upgrades).

## dev (test-only)

`dev.mockUpstream`, `dev.mockOidc`, `dev.deepseekPoc`, `dev.mcpTestServer` — test fixtures, all `false` by
default. **Never enable in production.**

## Next steps

- [Configuration](/operate/configuration) — the conceptual overview.
- [REST API reference](/reference/rest-api) — the runtime management API.
