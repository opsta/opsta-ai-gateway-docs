# Air-gapped install

The platform is designed to run with **no internet egress**. Every image it needs can be mirrored into your own
registry, TLS can be self-signed from an internal CA, and identity stays inside your network. This page covers
the air-gap-specific settings.

::: info Who this is for
Platform engineers deploying into disconnected or tightly-egress-controlled environments (regulated industries,
on-prem data centers).
:::

## 1. Mirror the images

Every image — the gateway, control plane, console, databases, identity, observability, and the built-in plugins —
is pinned to an explicit version and **copied** (not rebuilt) from the public release registry
`ghcr.io/opsta/opsta-ai-gateway` into **your** registry. Run this once, from a host that can reach both your
registry and `ghcr.io` (the source images are public — no Opsta credentials needed).

### Prerequisites

- [`oras`](https://oras.land) and [`yq`](https://github.com/mikefarah/yq) on the connected host (the repo's
  `task` runner uses both).
- Log in to **your** registry: `oras login your-registry.internal` (use `-u/-p` or a token). The `ghcr.io`
  source is public, so it needs no login.

### One command for the whole set

From a checkout of the product repo at the release tag you're installing:

```bash
task mirror:product MIRROR=your-registry.internal/agw VERSION=v1.14.0
# add PLAIN_HTTP=1 if your registry serves plain HTTP (no TLS)
```

`mirror:product` copies **everything** into one project: the Opsta-built images
(`your-registry.internal/agw/<name>:v1.14.0`), the built-in AI plugins
(`your-registry.internal/agw/plugins/<name>`), and every third-party upstream image (oauth2-proxy, redis,
nginx, …) flattened to `your-registry.internal/agw/<leaf>`. It is idempotent — re-running skips images already
present. (Internally it runs `task mirror` for the upstream images and `task mirror:images` for ours + plugins;
you can run those two steps separately if you prefer.)

### Point the chart at your registry

Set both `registry` and `imageMirror` to the **same** project so the entire product is served from one place:

```yaml
global:
  registry: your-registry.internal/agw       # Opsta-built images + AI plugins
  imageMirror: your-registry.internal/agw    # upstream third-party images (same project)
  imageMirrorFlatten: true                   # collapse everything under that one project
  imagePullSecrets:
    - name: internal-registry                # a Secret granting pull on your registry
```

::: tip One project, no repo sprawl
`imageMirrorFlatten: true` rewrites every upstream image to `<imageMirror>/<leaf>:<tag>`, and the Opsta-built
leaf names are unique across the whole set (our console ships as `opsta-console` so it never clashes with
Higress's `console`). With `registry` and `imageMirror` pointed at the same `<host>/<project>`, **the entire
product sits under one Harbor/ECR/Artifactory project** — you create a single repository, not dozens. The chart
rewrites image references automatically; you never edit manifests.
:::

The exact image list and tested versions live in the chart's component matrix — see [Upgrades](/operate/upgrades)
and the [Configuration reference](/reference/configuration#images). `mirror:product` always copies the whole set
for the product version you check out; the set is tested together.

## 2. Self-signed or internal-CA TLS

Public ACME providers aren't reachable in an air-gap, so use a certificate source you control:

```yaml
tls:
  mode: selfsigned     # cert-manager issues a self-signed wildcard
```

…or `tls.mode: provided` with a wildcard certificate from your **internal CA**, which your clients already
trust. See [TLS & domains](/operate/tls-and-domains).

## 3. Reuse in-cluster operators if you have them

If your platform already runs cert-manager, a Redis operator, or CloudNativePG, reuse them instead of installing
duplicates — see [Reuse existing operators](/operate/byo-operators). This also means fewer images to mirror.

## 4. Identity stays internal

Keycloak runs in-cluster as the identity broker, so sign-in never leaves your network. Organizations connect
their corporate IdP to Keycloak over your internal network — see [SSO & IdP brokering](/admin/sso-and-idp). Avoid
the `google` SSO mode in a true air-gap; broker an internal OIDC/SAML provider instead.

## 5. Observability is self-hosted

The bundled metrics/logs/traces stack runs entirely in-cluster — nothing is shipped to a third-party cloud. In
HA, point it at your internal object storage. See [Platform observability](/operate/observability-platform).

## What never leaves the cluster

- LLM request and response **content** (the gateway proxies to the providers _you_ configure).
- **Telemetry** — metrics, logs, traces.
- **Identity** — sign-in and tokens.
- **Configuration and audit** — stored in your PostgreSQL.

See [Data sovereignty](/security/data-sovereignty) for the full statement.

## Egress allowlist (non-air-gapped clusters)

If you are **not** fully air-gapped but want to restrict outbound access, configure NetworkPolicy
`Egress` rules or a firewall allowlist to these destinations only:

| Destination | Port | When required | Purpose |
|---|---|---|---|
| Your LLM provider endpoints (e.g. `api.openai.com`) | 443 | Always | Forwarding chat-completion requests |
| Your MCP server endpoints | 443 (or custom) | If MCP servers configured | MCP tool calls |
| `acme-v02.api.letsencrypt.org` | 443 | `tls.mode: letsencrypt` only | ACME cert issuance |
| Kubernetes API server | 443 | Always | Operator reconcile loops (CNPG, Redis operator, cert-manager) |
| Your OIDC/SAML IdP endpoints | 443 | SSO configured | Keycloak broker discovery + token exchange |
| Your S3-compatible object store | 443 | HA + backups enabled | LGTM blocks + Postgres WAL archiving |
| Your internal image registry | 443 | Air-gap + image pulls | Required if `imagePullPolicy: Always` is active |

**No outbound connection to Opsta.** The platform has no telemetry, license check, or call-home.

For a true air-gap (full `imageMirror` + `tls.mode: provided`/`selfsigned` + internal IdP + local
object store), **zero** outbound connections are required after installation beyond your LLM providers.

## Next steps

- [Reuse existing operators](/operate/byo-operators) · [Upgrades](/operate/upgrades) ·
  [Data sovereignty](/security/data-sovereignty) · [Hardening](/security/hardening)
