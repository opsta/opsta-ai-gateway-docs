> 🌐 **เอกสารภาษาไทยกำลังจัดทำ** — เนื้อหาด้านล่างเป็นภาษาอังกฤษชั่วคราว จนกว่าจะมีการแปล. _This page is not yet translated; English content is shown temporarily._

# Requirements

Opsta AI Gateway runs entirely on **your own Kubernetes cluster**. Nothing is sent to a managed cloud, and the
whole platform is reproducible from the Helm chart. This page lists what the cluster needs before you install.

::: info Who this is for
Platform engineers deploying and operating the gateway. If you only want to _use_ the gateway, start with
[Get access](/th/user/get-access) instead.
:::

## Kubernetes

- **Kubernetes ≥ 1.28** — the platform installs Gateway API CRDs and requires a recent control plane.
- **Gateway API v1.4.x** — provides the `v1` and `v1alpha2` route types the gateway needs. The chart can install
  these for you, or reuse what's already on the cluster.
- A working **default StorageClass** (or set `global.storageClass`) — PostgreSQL, Redis, and the observability
  stack all use persistent volumes.
- A **CNI that enforces NetworkPolicy** if you want network isolation between components (recommended for
  production). Lightweight CNIs such as k3d/flannel ignore NetworkPolicy — the platform still runs, but the
  isolation guards become no-ops.

## Compute

Size depends on which optional subsystems you enable. A reasonable production starting point:

| Profile | Suitable for | Rough footprint |
|---|---|---|
| **Standalone** (`global.highAvailability=false`) | Pilots, single-team, non-critical | 1 replica per component; ~6–8 vCPU, ~12–16 GiB RAM |
| **High availability** (`global.highAvailability=true`) | Production, many teams | 2–3 replicas per component + PostgreSQL/Redis clusters; ~16+ vCPU, ~32+ GiB RAM |

Enabling the **semantic** features (cache and guard) adds a vector database (Qdrant) and an embedding service
(Ollama), which need additional CPU/RAM and disk. See [High availability](/th/operate/high-availability) for how
replica counts are derived.

## Networking & DNS

- A **base domain** you control (e.g. `ai-gateway.example.com`). The platform serves several subdomains under it
  — `api.`, `console.`, `grafana.`, `auth.`, and (if enabled) `mcp.`. See
  [TLS & domains](/th/operate/tls-and-domains).
- The ability to issue a **wildcard TLS certificate** for that domain — via Let's Encrypt (DNS-01), your own
  certificate, or a self-signed issuer for air-gapped sites.
- Inbound reachability to the gateway. You can expose it through your own ingress/load balancer, or use the
  built-in **Cloudflare Tunnel** option for environments without inbound public IPs.

## Identity

- An **OIDC identity provider** for console and dashboard sign-in. The platform ships Keycloak as an embedded
  broker, so organizations can connect their own corporate IdP — see [SSO & IdP brokering](/th/admin/sso-and-idp).
- At least one **bootstrap administrator** email, set at install time, so the first person can sign in and
  configure everything else.

## Tooling

- **Helm 3** and **kubectl**, configured against the target cluster.
- Access to the container images — either pull from the public registry, or mirror them into your own registry
  for [air-gapped installs](/th/operate/air-gap).

## Next steps

- [Install](/th/operate/install) — deploy the chart.
- [Configuration](/th/operate/configuration) — the one config surface and how it maps to environments.
