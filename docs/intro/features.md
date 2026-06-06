# Features

What the gateway does today (delivered milestones M0–M5).

## Work-type → model routing (M1)

Requests route to a **logical model route** by header/tag — `workload: bulk`
goes to the cheaper bulk model, everything else to the coding default — with a
documented fallback to a second provider. This is native Gateway API config (no
plugin). Logical aliases (`coding-default`, `bulk`) are the stable client
contract; the real provider/model behind each is data you can change without
touching clients.

## Per-user / per-group token limits (M2)

Token-per-minute rate limits are enforced by the built-in **ai-statistics** +
**ai-token-ratelimit** plugins (Redis-backed), keyed by the caller's identity
and namespaced by `{org, project}`. Over the limit → **HTTP 429**. Redis is
managed by the Opstree operator (standalone for dev, HA + Sentinel available).

> **USD budgets** (dollar caps, not just tokens) are planned for after SSO —
> per-token prices differ ~36× across providers, so a dollar cap needs the
> authenticated-consumer identity that SSO/API-keys provide.

## Per-group model allow-list (M3)

A small custom Wasm guard rejects any request whose `model` isn't in the
caller's **group allow-list** → **HTTP 403**. The allow-list is data in the
Project spec, scoped per Project, and on-prem self-contained (no cloud
dependency). Non-LLM requests pass through untouched.

## Guardrails — PII masking + prompt-injection (M5)

Two guards screen every prompt **before** the model sees it:

- **PII masking** uses the built-in **ai-data-masking** plugin to mask sensitive
  data (emails, phone numbers, IPs, API keys) in both the request and the model's
  response. It runs entirely in-cluster with local rules — **no data leaves the
  cluster** — and the masking rules are data in the Project spec, toggleable per
  Project.
- **Prompt-injection blocking** is a small custom Wasm guard that rejects known
  jailbreak / instruction-override prompts (e.g. "ignore previous instructions",
  "reveal your system prompt") → **HTTP 403**, with a configurable pattern list.

Both are on-prem and self-contained — no third-party cloud call — meeting the
privacy requirement.

## Observability (M4)

A full **Grafana LGTM** stack — **Loki** (logs), **Mimir** (metrics), **Tempo**
(traces) — with **Grafana Alloy** scraping the gateway's token metrics and
tailing its access logs. Grafana ships with an **AI Gateway overview**
dashboard (tokens & latency by model/route, rate-limit rejections) and is
reachable at its own hostname. The LGTM stores sit behind a basic-auth proxy
(tenant credential), with org → tenant isolation ready for multi-tenancy.

Storage is host-mounted local disk for dev (no NFS) with an object-storage
(S3 / SeaweedFS) path for HA.

## In-cluster TLS + remote access (M0.5)

TLS is terminated **in-cluster** by Higress using a **Let's Encrypt**
certificate from cert-manager (ACME DNS-01 via Cloudflare). A **Cloudflare
Tunnel** is the dev front door; in production it's removed and the same
certificate serves clients directly — zero manifest change.

## Coming next

See the [Roadmap](./roadmap) — Google SSO (M6), then the multi-tenant control
plane and USD budgets.
