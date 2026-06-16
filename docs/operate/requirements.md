# Requirements

Opsta AI Gateway runs entirely on **your own Kubernetes cluster**. Nothing is sent to a managed cloud, and the
whole platform is reproducible from the Helm chart. This page lists what the cluster needs before you install.

::: info Who this is for
Platform engineers deploying and operating the gateway. If you only want to _use_ the gateway, start with
[Get access](/user/get-access) instead.
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

The tables below are measured on a real Standalone cluster (k3s v1.36, product v1.11.1).
Load model: PoC/small-team — ~5 RPS sustained chat-completions, 1 org, 1 project, ~10 users.

### Standalone — measured idle and under load (PoC load model)

| Component | Idle CPU | Idle RAM | Under load CPU | Under load RAM | PVC |
|---|---|---|---|---|---|
| **Higress gateway** | 7m | 1263 Mi | 9m | 1277 Mi | — |
| **Higress controller** | 3m | 83 Mi | 3m | 111 Mi | — |
| **Control plane** | 1m | 14 Mi | 1m | 16 Mi | — |
| **Console (Next.js)** | 2m | 72 Mi | 8m | 73 Mi | — |
| **Console oauth2-proxy** | 1m | 11 Mi | 1m | 11 Mi | — |
| **PostgreSQL (CNPG, 1 instance)** | 11m | 73 Mi | 8m | 104 Mi | 5 Gi |
| **Redis (standalone)** | 6m | 4 Mi | 6m | 4 Mi | 1 Gi |
| **Keycloak** | 3m | 646 Mi | 3m | 647 Mi | — |
| **Keycloak PostgreSQL** | 8m | 83 Mi | 7m | 115 Mi | 5 Gi |
| **Mimir (all-in-one)** | 10m | 160 Mi | 14m | 131 Mi | 5 Gi |
| **Loki (single-binary)** | 8m | 135 Mi | 7m | 137 Mi | 5 Gi |
| **Tempo (single-binary)** | 5m | 37 Mi | 4m | 37 Mi | 5 Gi |
| **Grafana** | 11m | 210 Mi | 13m | 213 Mi | 2 Gi |
| **Alloy (collector)** | 15m | 129 Mi | 16m | 128 Mi | — |
| **cert-manager** (3 pods) | 4m | 76 Mi | 4m | 76 Mi | — |
| **CNPG operator** | 5m | 42 Mi | 4m | 43 Mi | — |
| **Redis operator** | 7m | 30 Mi | 5m | 27 Mi | — |
| **Qdrant** *(optional — semantic)* | 1m | 28 Mi | — | — | 10 Gi |
| **Ollama** *(optional — semantic/local model)* | 1m | 138 Mi | — | — | 5 Gi |
| **Total (core, no semantic)** | **~108m (0.1 vCPU)** | **~3.8 GiB** | **~113m** | **~3.9 GiB** | **~28 Gi** |
| **Total (with semantic)** | **~110m** | **~4.0 GiB** | — | — | **~43 Gi** |

**Node total at idle** (both k3s nodes including system pods): 385m CPU / 5.1 GiB RAM on a 2-node cluster (16 vCPU / 30 GiB each).

### Standalone node sizing recommendation

For a Standalone / PoC deployment at the load model above:

| Resource | Minimum | Comfortable |
|---|---|---|
| vCPU | 4 | 8 |
| RAM | 8 GiB | 16 GiB |
| Disk (PVCs) | 30 Gi RWO | 50 Gi RWO |

::: tip Higress gateway is the RAM anchor
The Higress gateway pod holds ~1.3 GiB RAM at idle due to Envoy's filter + Wasm plugin chains. This is the largest single memory consumer — plan for it when sizing the node.
:::

### High-availability sizing (estimated)

HA sizing requires a cluster measurement at production load (RA.1 cluster window — pending). The
following is derived from the standalone measurements plus expected replica overhead:

| Component | HA replicas | Est. CPU | Est. RAM | Storage |
|---|---|---|---|---|
| Higress gateway | ≥2 | ~20m | ~2.6 GiB | — |
| Control plane | 2 | ~4m | ~32 Mi | — |
| Console | 2 | ~20m | ~150 Mi | — |
| PostgreSQL (CNPG, 3 instances) | 3 | ~30m | ~300 Mi | 15 Gi |
| Redis (Replication + Sentinel) | 3+3 | ~40m | ~30 Mi | 3 Gi |
| Keycloak | 2 | ~6m | ~1.3 GiB | — |
| LGTM stack (distributed) | varies | ~200m | ~2 GiB | object store |
| Operators + cert-manager | same | ~20m | ~200 Mi | — |
| **Total (estimated)** | | **~340m** | **~7 GiB** | **≥20 Gi + object store** |

**HA node sizing recommendation (per worker node, ≥3 nodes):**

| Resource | Minimum per node | Comfortable per node |
|---|---|---|
| vCPU | 4 | 8 |
| RAM | 8 GiB | 16 GiB |
| Disk | 20 Gi RWO | 50 Gi RWO |

Enabling the **semantic** features (Qdrant + Ollama) adds ~170 Mi RAM and ~15 Gi disk per node
hosting those pods. See [High availability](/operate/high-availability) for replica counts.

## Networking & DNS

- A **base domain** you control (e.g. `ai-gateway.example.com`). The platform serves several subdomains under it
  — `api.`, `console.`, `grafana.`, `auth.`, and (if enabled) `mcp.`. See
  [TLS & domains](/operate/tls-and-domains).
- The ability to issue a **wildcard TLS certificate** for that domain — via Let's Encrypt (DNS-01), your own
  certificate, or a self-signed issuer for air-gapped sites.
- Inbound reachability to the gateway. You can expose it through your own ingress/load balancer, or use the
  built-in **Cloudflare Tunnel** option for environments without inbound public IPs.

## Identity

- An **OIDC identity provider** for console and dashboard sign-in. The platform ships Keycloak as an embedded
  broker, so organizations can connect their own corporate IdP — see [SSO & IdP brokering](/admin/sso-and-idp).
- At least one **bootstrap administrator** email, set at install time, so the first person can sign in and
  configure everything else.

## Tooling

- **Helm 3** and **kubectl**, configured against the target cluster.
- Access to the container images — either pull from the public registry, or mirror them into your own registry
  for [air-gapped installs](/operate/air-gap).

## Next steps

- [Install](/operate/install) — deploy the chart.
- [Configuration](/operate/configuration) — the one config surface and how it maps to environments.
