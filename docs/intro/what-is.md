# What is Opsta AI Gateway

**Opsta AI Gateway** is a single, self-hosted gateway that sits in front of your
LLM providers and gives an organisation one controlled, observable entry point
for all AI traffic. It is built on **[Higress](https://higress.io/)** (a CNCF,
Apache-2.0 gateway), runs entirely on your own Kubernetes, and is defined
**100% as Infrastructure-as-Code** — reproducible from the repository with a
single command, with **no managed-cloud dependency and no vendor lock-in**.

## Why a gateway

Teams calling LLM providers directly means no central control over **cost**,
**which models are allowed**, **rate limits**, **data leaving the building**, or
**who used what**. Opsta AI Gateway puts those controls in one place:

- **Route by work type** — send "coding" traffic to a strong model and "bulk"
  traffic to a cheaper one, with provider fallback. (Native config, no plugin.)
- **Limit per team and per user** — token-per-minute rate limits and per-group
  **model allow-lists**, keyed to the caller's identity.
- **See everything** — tokens, latency and rejections per model and route, with
  per-user attribution, in Grafana.
- **Guardrails** — PII masking and content / prompt-injection checks
  (on the roadmap), with **no third-party cloud** in the data path.
- **Enterprise access** — Google Workspace SSO restricted to your domain
  (on the roadmap), feeding the same identity into limits and budgets.

## Principles

- **One tool.** Higress is the single gateway/data plane — not a stack of
  proxies to operate.
- **Built-in first.** Prefer Higress' built-in AI plugins; write custom code
  only for a genuine gap, and keep it minimal and on-prem.
- **On-premise, no cloud lock-in.** Everything runs on your cluster; no
  managed/SaaS dependency sits in the request path.
- **Infrastructure-as-Code.** If it isn't in the repo, it doesn't exist; the
  whole stack rebuilds from code.

## Where it runs

Locally it runs on **k3d** (k3s in Docker) for development and testing; the same
manifests and Helm releases deploy to any real Kubernetes cluster. See
[Architecture](./architecture) for how the pieces fit together and
[Getting started](./getting-started) to bring it up.
