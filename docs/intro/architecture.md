# Architecture

Opsta AI Gateway is **Higress as the data plane** with a thin, declarative
control surface around it. Every request flows through one gateway and a chain
of plugins; everything is rendered from code.

## Request flow

```mermaid
flowchart TD
  client["client / app (OpenAI-compatible HTTP)"]
  cf["Cloudflare edge → cloudflared tunnel<br/>(dev front door; removed in prod)"]
  subgraph gw["Higress gateway — in-cluster TLS (Let's Encrypt via cert-manager)"]
    direction TB
    p0["key-auth → API key → consumer (401 if missing/invalid)"]
    p1["ai-data-masking → mask PII in request + response (local)"]
    p2["prompt-guard → 403 on prompt-injection attempts"]
    p3["model-allowlist → 403 if model not allowed for the group"]
    p4["ai-statistics → usage → per-consumer token metrics"]
    pq["ai-quota → 403 if over USD budget (token balance, Redis)"]
    p5["ai-token-ratelimit → 429 if over tokens/min (Redis)"]
    p0 --> p1 --> p2 --> p3 --> p4 --> pq --> p5
  end
  model["upstream model (provider, or a mock in tests)"]
  obs["Grafana Alloy → Mimir (metrics) / Loki (logs) / Tempo (traces) → Grafana"]
  client -->|"POST /v1/chat/completions"| cf --> gw --> model
  p5 -.->|telemetry| obs
```

Human access (dashboards / console):

```mermaid
flowchart LR
  browser["browser"] --> higress["Higress"]
  higress --> op["oauth2-proxy<br/>(Google SSO, domain-restricted)"]
  op -->|"injects the identity tuple"| grafana["Grafana"]
```

## Components

- **Higress** — the gateway (Envoy data plane + controller). Handles routing,
  TLS termination, and runs the AI plugins.
- **cert-manager** — issues Let's Encrypt certificates (ACME DNS-01 via
  Cloudflare) so **TLS is terminated in-cluster**, not at the edge. The same
  certificate serves dev (behind a Cloudflare Tunnel) and production (direct) —
  no manifest change between them.
- **Built-in AI plugins** — `key-auth` (API-key → consumer), `ai-statistics`
  (token accounting), `ai-token-ratelimit` (Redis token limits), `ai-quota`
  (Redis per-consumer USD-budget balance), and `ai-data-masking` (local PII
  masking), mirrored into your own registry (no runtime pull from a public cloud
  registry).
- **Custom plugins** — small Wasm guards written only where no built-in fits:
  the per-group **model-allowlist** and the **prompt-guard** injection blocker.
- **budget-controller** — a small in-cluster CronJob: reads per-consumer token
  usage, prices it with a per-model USD table, and enforces each consumer's
  dollar budget via ai-quota. The dollar "brain"; the gateway is the cutoff.
- **Redis** — backing store for rate-limit counters (managed by the Opstree
  Redis operator; standalone or HA).
- **Observability (LGTM)** — Grafana + Loki + Mimir + Tempo with **Grafana
  Alloy** collecting metrics and logs from the gateway. **Each organization is its
  own tenant** (`X-Scope-OrgID`): Alloy fans out a per-org metrics stream, and a
  credential-aware proxy in front of the stores pins every credential to its tenant
  so reads can't cross organizations. Grafana is a platform-operator tool (login
  limited to platform admins); end users read their own org's usage in the console.
- **oauth2-proxy** — brokers Google Workspace SSO in front of Grafana and the
  console, enforces the company domain, and injects the identity tuple
  downstream. Runs in-cluster; no proprietary component.
- **Web console** — a Next.js app on `console.<baseDomain>`, SSO-gated, where a
  user logs in with their organization email to see their API key, token/USD
  usage and remaining budget, and allowed models; admins get a read-only view of
  every consumer. Reads live usage from Mimir and config from the same values the
  gateway uses.

## Identity

Every limit, budget, metric and key is keyed by the full identity tuple
**`{org, project, group, user}`**. The group/user arrive as request headers
(`x-dev-group` / `x-dev-user`); with SSO enabled, Google Workspace populates the
exact same headers — only the *source* of identity changes, nothing downstream.

## Deployment & configuration

The whole product ships as **one Helm chart** (`opsta-ai-gateway`). A `helmfile`
installs it next to the third-party releases it depends on (Higress,
cert-manager, the Redis operator, and the LGTM stack), and pins every version in
one place. You configure everything through values files — there are no
hand-applied manifests and no per-environment scripts.

```mermaid
flowchart TB
  task["Taskfile (entrypoint)"]
  ver["version.yaml<br/>pinned versions · registry · image tags"]
  hf["helmfile<br/>releases + install-order DAG"]
  task --> hf
  ver -. feeds .-> hf

  subgraph tp["third-party releases"]
    hig["higress"]
    cm["cert-manager"]
    ro["redis-operator"]
    lgtm["loki · tempo · grafana · alloy"]
  end

  subgraph our["product chart: opsta-ai-gateway"]
    chart["chart"]
    v1["values.yaml — defaults"]
    v2["values-dev.yaml — k3d profile"]
    v3["secrets-values.yaml — secrets (git-ignored)"]
    v1 --> chart
    v2 --> chart
    v3 --> chart
  end

  hf --> hig & cm & ro & lgtm & chart
```

**One config surface, layered.** `values.yaml` holds deploy-anywhere defaults;
an environment overrides only what differs (registry, TLS mode, HA on/off,
domain); secrets live in a separate git-ignored file. To deploy elsewhere you
write a small overlay, not a fork.

```mermaid
flowchart LR
  b["values.yaml<br/>base defaults"] --> d["values-&lt;env&gt;.yaml<br/>registry · TLS mode · HA · domain"] --> s["secrets-values.yaml<br/>credentials"]
  s --> chart["one chart, any cluster"]
```

Key toggles in `values.yaml`: `global.highAvailability` (standalone ↔ HA),
`global.registry` / `imagePullSecrets` (any OCI registry), `global.baseDomain`
+ `subdomains`, `tls.mode` (`letsencrypt` | `provided` | `selfsigned`),
`ingress.tunnel.enabled` (optional Cloudflare Tunnel), and
`global.namespacePrefix`.

**Reuse existing operators (BYO).** Clusters often already run cert-manager (and
sometimes the Redis or CloudNativePG operators); installing a second copy
collides on CRDs and webhooks. Set `certManager.enabled`, `redisOperator.enabled`,
or `cnpg.enabled` to `false` to **reuse** an operator already present — the chart
then deploys only the resources that operator manages (certificates, Redis, the
Postgres cluster) against the existing controller. Defaults are `true` (turnkey
install). Reuse assumes a compatible operator version.

**Subdomain scheme (`global.subdomainSeparator`).** Hosts are composed as
`<service><sep><baseDomain>`:

- `"."` → `api.ai-gateway.opsta.dev` — a clean second-level wildcard
  (`*.ai-gateway.opsta.dev`). Behind Cloudflare this needs an edge cert that
  covers that depth (Advanced Certificate Manager / Total TLS), since free
  Universal SSL only covers `example.com` + `*.example.com`.
- `"-"` → `api-ai-gateway.opsta.dev` — a single-level name under the registrable
  domain, covered by free Cloudflare Universal SSL `*.opsta.dev`. No extra cert
  product. (When fronting via a Cloudflare Tunnel, set the origin to
  `https://…:443` with **No TLS Verify** on, since the in-cluster cert won't match
  the dash host.)

## Multi-tenancy

The gateway is a multi-tenant product: a control plane (Postgres source of truth)
reconciles per-**Organization** and per-**Project** config into Higress —
providers, model routing, guardrails, API keys, budgets — and into the
observability layer. Organizations are isolated end to end: cross-org admin and
config writes are refused, and **each org is its own observability tenant** so one
organization can never read another's telemetry. Adding a tenant means adding scoped
config, never rewriting the core.
