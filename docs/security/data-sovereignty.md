# Data sovereignty

The platform is **self-hosted by design**. It runs on your Kubernetes cluster, and the data that matters —
prompt and response content, telemetry, identity, configuration, and audit history — stays inside your
environment. This is what lets regulated organizations adopt AI without sending sensitive data to a third party.

::: info Who this is for
Security, compliance, and data-residency stakeholders.
:::

## What stays in your environment

| Data | Where it lives | Leaves your cluster? |
|---|---|---|
| Prompt & response **content** | Proxied through the gateway to the providers _you_ configure | Only to **your chosen** LLM/MCP providers |
| **Telemetry** (metrics, logs, traces) | Self-hosted observability stack | No |
| **Identity** (users, sign-in, tokens) | In-cluster Keycloak + your brokered IdP | No |
| **Configuration** (orgs, projects, budgets, providers, guardrails) | Your PostgreSQL | No |
| **API keys** | Your PostgreSQL | No |
| **Usage ledger & audit log** | Your PostgreSQL | No |

There is **no Opsta-operated cloud** in the data path. The platform does not phone home, and no usage or content
is sent to Opsta.

## You choose where requests go

The only data that crosses your trust boundary is the request the gateway forwards to an **LLM or MCP provider
that you explicitly configured**. You decide which providers exist, per project, and you hold their credentials.
If you run a fully internal model, nothing leaves your network at all.

## Runs air-gapped

The platform is built to operate with **no internet egress**:

- All container images can be **mirrored** into your registry.
- TLS can be issued from your **internal CA** or self-signed.
- Identity is brokered through **in-cluster** Keycloak to your corporate IdP.
- Observability is **self-hosted**.

See [Air-gapped install](/operate/air-gap) for the mechanics.

## Residency and retention

Because every store is in your cluster, **data residency follows your cluster** — deploy in the region or data
center your policy requires. Retention is under your control:

- Telemetry retention is configured per signal — see
  [Platform observability](/operate/observability-platform).
- Audit retention is configured centrally — see [Audit & compliance](/security/audit-and-compliance).
- Configuration and usage persist in your database until you remove them, and are protected by your
  [backups](/operate/backup-and-dr).

## Ownership and reproducibility

The entire platform is reproducible from the Helm chart plus your database. There's no hidden state and no
managed dependency — you can rebuild it, move it, or audit it entirely from artifacts you hold.

## Next steps

- [Air-gapped install](/operate/air-gap) — running with no egress.
- [Backup & DR](/operate/backup-and-dr) — protecting your data.
- [Hardening](/security/hardening) — securing the platform itself.
