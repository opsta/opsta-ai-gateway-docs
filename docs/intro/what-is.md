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
  traffic to a cheaper one, with provider fallback.
- **Limit per team and per user** — token-per-minute rate limits, per-group
  **model allow-lists**, and **monthly USD budgets**, all keyed to the caller's
  identity.
- **See everything** — tokens, USD spend and remaining budget per model, right
  in the web console. No Grafana access required.
- **Guardrails** — PII masking and prompt-injection checks run in-cluster,
  **no third-party cloud** in the data path.
- **Enterprise access** — your corporate Google Workspace, Microsoft Entra, or
  any OIDC/SAML provider, with users provisioned into the right org and group
  on first login.

## A complete web console

Every user logs into an **SSO-gated console** — their personal portal to see
usage and budget, issue API keys, and connect their tools (opencode, Crush).
Admins manage organisations, members, projects, pricing, identity providers,
and audit logs from the same interface — no command line needed.

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

Opsta AI Gateway deploys to any Kubernetes cluster. The same Helm chart runs
on a local development cluster (k3d) or in production — one configuration
surface, no fork needed.
