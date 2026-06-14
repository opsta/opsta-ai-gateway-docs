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
is pinned to an explicit version. Mirror them into your registry, then tell the chart to pull from there.

```yaml
global:
  registry: registry.internal/opsta-ai-gateway   # your registry for Opsta-built images
  imageMirror: registry.internal/mirror           # mirror for upstream third-party images
  imageMirrorFlatten: true                         # collapse all images under one project/repo
  imagePullSecrets:
    - name: internal-registry
```

::: tip Flatten to avoid repo sprawl
`imageMirrorFlatten: true` rewrites every upstream image to `<imageMirror>/<leaf>:<tag>`, so you don't have to
create dozens of nested repositories in Harbor/ECR/Artifactory. The chart rewrites image references
automatically; you don't edit manifests.
:::

The exact image list and tested versions live in the chart's component matrix — see [Upgrades](/operate/upgrades)
and the [Configuration reference](/reference/configuration#images). Mirror the whole set for the product version
you're installing; the set is tested together.

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

## Next steps

- [Reuse existing operators](/operate/byo-operators) · [Upgrades](/operate/upgrades) ·
  [Data sovereignty](/security/data-sovereignty)
