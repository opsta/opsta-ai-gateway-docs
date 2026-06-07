# Features

What the gateway does today (delivered milestones M0–M6 + M2.5 — Phase 0 complete).

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

## API-key authentication + USD budgets (M2.5)

The machine API (`/v1`) is authenticated with **API keys** (`Authorization:
Bearer …`, OpenAI-compatible): each key maps to a **consumer** (`project.user`)
that every policy keys on. On top of token limits, each consumer gets a real
**dollar budget**: a controller continuously reads token usage, prices it with a
per-model USD price table, and cuts the consumer off once they exceed their
budget → **HTTP 403**. It's all in-cluster (no proprietary component), and the
budget/price config lives in the Project spec.

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

## Enterprise identity & SSO (M9)

Human access (console + dashboards) is gated by **Keycloak** running **in your
cluster** as the identity broker — an open-source IAM (Apache-2.0), no SaaS, no
per-seat fees. It supports every common login method, and they can **coexist**:

- **Local users in a database** (default) — usernames + passwords managed in the
  product, ideal when you don't have a corporate IdP.
- **Active Directory / LDAP**, and **Google / Microsoft Entra / any OIDC or SAML**
  identity provider — connect your existing directory.
- **Per-scheme group mapping** (external groups/claims → product groups) — the same
  GitLab/Grafana-style model — so each login method maps cleanly onto the gateway's
  group-based limits, budgets, and admin rights.

Admins configure the common cases **right inside the product console** — a built-in
**Identity & authentication** screen to add a login method (Google, Microsoft Entra, or
any OIDC by discovery URL), create groups, and create local users — without ever opening
Keycloak. Advanced setups (AD/LDAP, SAML, per-provider claim mappers) link out to the full
Keycloak admin console; whichever path you use, the change is preserved across upgrades.
The product realm itself is shipped as code. On login, identity + group flow through
as the tuple the gateway's policies already use, and a member of the admin group gets
admin in both the console and Grafana — no separate password. Built on
Keycloak + oauth2-proxy (no proprietary components).

## In-cluster TLS + remote access (M0.5)

TLS is terminated **in-cluster** by Higress using a **Let's Encrypt**
certificate from cert-manager (ACME DNS-01 via Cloudflare). A **Cloudflare
Tunnel** is the dev front door; in production it's removed and the same
certificate serves clients directly — zero manifest change.

## Coming next

See the [Roadmap](./roadmap) — Phase 0 (the single-tenant engine) is complete;
next is the multi-tenant control plane, USD budgets, and API keys.
