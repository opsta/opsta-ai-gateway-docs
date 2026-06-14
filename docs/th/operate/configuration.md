> 🌐 **เอกสารภาษาไทยกำลังจัดทำ** — เนื้อหาด้านล่างเป็นภาษาอังกฤษชั่วคราว จนกว่าจะมีการแปล. _This page is not yet translated; English content is shown temporarily._

# Configuration

The platform has **one configuration surface**: the Helm chart's values. Every environment difference — domain,
standalone vs. HA, TLS source, which subsystems are on — is a high-level value with a sane default. You don't
hand-edit manifests, and you don't manage config in several places.

::: tip One surface, few knobs
Prefer changing a value and re-running `helm upgrade` over editing live cluster state. Anything you change by hand
outside the chart will drift and can be overwritten on the next upgrade or reconcile.
:::

## How values are organized

Values are grouped by concern. The most important groups:

| Group | Controls | Where to read more |
|---|---|---|
| `global` | Base domain, subdomains, separator, HA toggle, registry/mirror, storage class, namespace prefix | [TLS & domains](/th/operate/tls-and-domains), [High availability](/th/operate/high-availability) |
| `tls` | Certificate mode and issuer | [TLS & domains](/th/operate/tls-and-domains) |
| `certManager`, `redisOperator`, `cnpg` | Whether to install each operator or reuse an existing one | [Reuse existing operators](/th/operate/byo-operators) |
| `postgres`, `redis`, `keycloak`, `controlPlane`, `console` | The core stateful and application components | this page |
| `observability` | The bundled metrics/logs/traces stack and retention | [Platform observability](/th/operate/observability-platform) |
| `sso` | OIDC sign-in for console and dashboards | [SSO & IdP brokering](/th/admin/sso-and-idp) |
| `budgets`, `rateLimits`, `guardrails`, `modelAllowlist`, `modelRouter` | Policy defaults for the data plane | [Budgets & limits](/th/admin/budgets-and-limits), [Guardrails](/th/admin/guardrails) |
| `semantic`, `semanticCache`, `semanticGuard` | Vector DB + embeddings and the features that use them | [Semantic cache](/th/admin/semantic-cache), [Semantic guard](/th/admin/semantic-guard) |
| `mcp` | The MCP gateway | [MCP servers](/th/admin/mcp-servers) |
| `audit` | Audit-log retention | [Audit & compliance](/th/security/audit-and-compliance) |
| `images` | Registry references and the tested component versions | [Upgrades](/th/operate/upgrades) |
| `secrets` | How credentials are supplied | [§ Secrets](#secrets) below |
| `dev` | Test-only helpers — **never enable in production** | this page |

The complete key-by-key list with defaults is in the [Configuration reference](/th/reference/configuration).

## Domains and the identity separator

`global.baseDomain` is the root; each subdomain is `<label><separator><baseDomain>`. The
`global.subdomainSeparator` is `"."` by default (e.g. `api.ai-gateway.example.com`), or `"-"` to fit everything
under a single parent wildcard (e.g. `api-ai-gateway.example.com`, covered by `*.example.com`).

Tenant identity uses a three-part tuple — `organization.project.user` — as the consumer name. This is the model
behind keys, budgets, and isolation; see the [Multi-tenancy model](/th/overview/multi-tenancy).

## Enabling optional subsystems

Most subsystems are a single `enabled` toggle plus a few settings. For example:

```yaml
controlPlane:
  enabled: true     # required for the console, budgets, and per-project config
postgres:
  enabled: true     # the control plane's source of truth
keycloak:
  enabled: true     # enterprise identity broker (per-org SSO)
semanticCache:
  enabled: true     # needs semantic.qdrant + semantic.ollama, rendered automatically
mcp:
  enabled: true     # MCP gateway
```

Dependencies are enforced sensibly — for instance, the control plane requires PostgreSQL, and the semantic
features automatically render the shared Qdrant + Ollama infrastructure when any of them is on.

## Secrets

Credentials are **never** part of your committed values. Two supported modes:

- `secrets.createFromValues: true` — the chart creates Kubernetes Secrets from a **separate, git-ignored** values
  file. Good for getting started.
- `secrets.createFromValues: false` — the chart references **pre-existing Secrets** you manage with Vault,
  sealed-secrets, or another external system. Recommended for production.

See [Hardening](/th/security/hardening) for the full secret-handling guidance.

## Applying changes

```bash
helm upgrade opsta-ai-gateway oci://ghcr.io/opsta/charts/opsta-ai-gateway \
  -n opsta-ai-gateway -f values.yaml -f secrets-values.yaml
```

Policy and tenant data (consumers, budgets, providers, guardrail patterns) are managed by the control plane at
runtime and reconciled onto the gateway continuously — those don't require a chart upgrade. The chart owns
**product-level** config; the control plane owns **tenant** config. See
[Architecture](/th/overview/architecture).

## Next steps

- [Configuration reference](/th/reference/configuration) — every value with its default.
- [TLS & domains](/th/operate/tls-and-domains) · [High availability](/th/operate/high-availability) ·
  [Air-gapped install](/th/operate/air-gap)
