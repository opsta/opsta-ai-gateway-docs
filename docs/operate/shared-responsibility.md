# Shared responsibility & capability maturity

This is the single most important page for an architecture- or security-review board. For every
capability it states two things plainly: **who is responsible** for it (Opsta vs. you), and its
**maturity today** — so you can size the work and the risk before you sign off. We would rather tell
you a control is opt-in or on the roadmap than imply a posture the product doesn't have yet.

::: info Who this is for
Platform, security, and architecture-review teams evaluating Opsta AI Gateway for production. Read
this with the [Production-readiness checklist](./production-readiness.md) — every "you provide" item
here has a verifiable counterpart there.
:::

## How to read the maturity column

| Maturity | Meaning |
|---|---|
| **Shipped** | On by default and working. |
| **Shipped (toggle)** | Built and supported; you turn it on for your topology (e.g. HA). |
| **Opt-in** | Built, but **OFF by default** — you must enable it (and accept any stated trade-off). |
| **Roadmap** | Not built yet. A documented interim control and/or recipe may exist; the native capability is planned. |
| **You provide** | The product relies on a control your platform supplies (the cluster, storage, KMS, IdP, paging). |

The product is delivered as a **full appliance**: the whole bundled stack — Higress, PostgreSQL
(CloudNativePG), Redis, Keycloak, the LGTM observability stack, cert-manager, and our
control-plane/console — is installed and versioned as one tested unit. You bring a conformant
Kubernetes cluster, storage, and DNS; optionally an external identity provider and an object store.

## The matrix

| Capability | Maturity | Opsta provides | You provide |
|---|---|---|---|
| Multi-LLM routing, per-org/project budgets, guardrails, audit log, RBAC | **Shipped** | the product | configuration + policy |
| Per-org observability tenant isolation (metrics/logs) | **Shipped** | tenant-scoped LGTM + enforcing proxy | — |
| High availability — in-cluster replication, PodDisruptionBudgets, anti-affinity, clustered DB/Redis | **Shipped (toggle)** | the chart (`global.highAvailability: true`) | a ≥3-node cluster |
| TLS at ingress (Let's Encrypt or your own wildcard cert) | **Shipped (toggle)** | cert-manager + issuers | DNS + a reachable ACME path, or a cert+key |
| Database backup & restore | **Opt-in — OFF by default** | CloudNativePG backup hooks + a documented recipe | an object store, enable it, and **run a restore drill** |
| Point-in-time recovery (continuous WAL archiving) | **Roadmap** | a CNPG WAL recipe (interim) | — |
| Secrets encrypted at rest | **You provide** | secrets are kept out of git and the database; written as standard Kubernetes Secrets | etcd encryption, sealed-secrets, or an external-secrets/KMS integration |
| PII masking on prompts/completions | **Opt-in — OFF by default** | the masking plugin | enable it and accept the current streaming trade-off (below) |
| Guardrail-block content retention | **Opt-in posture** | guardrail blocking | decide retention / redaction of the stored offending-content excerpt (below) |
| Cross-site / region DR failover | **Roadmap** | single-site, restore-based DR | a DR site is out of scope today |
| Image signing / SBOM / provenance | **Roadmap** | image **digest pinning** (interim) | scan-on-pull / verify in your pipeline (interim) |
| Identity de-provisioning (SCIM) | **Roadmap** | JIT provisioning + manual de-provision in Keycloak | an offboarding runbook |
| Paging / alerting on the golden signals | **You provide** | Grafana + recommended alert rules | wire alerts to your pager (PagerDuty/Opsgenie/etc.) |
| The Kubernetes platform, storage classes, network CNI | **You provide** | tested against a conformant matrix | a conformant cluster + RWO storage (+ object store for HA) |

## The honesty notes (verified against the shipped code)

These are the items a review board will probe. Each states the reality, why, and what you do about it.

### Backups are OFF by default
Database backups (`postgres.backup.enabled`) ship **off** so the product installs without forcing you
to provision an object store first. **For production you must turn them on, point them at an
S3-compatible bucket, and perform a restore drill** — see [Backup & DR](./backup-and-dr.md). The
production-readiness checklist gates on this. The HA profile is moving to default backups on, but it
still requires you to supply the bucket.

### Point-in-time recovery is not wired yet
Backups today are periodic snapshots, not continuous WAL archiving — so the recovery point is your
backup interval, not "to the second." Continuous PITR is on the roadmap; a CNPG WAL-archive recipe is
provided as an interim path if you need a tighter RPO.

### Secrets are at rest as Kubernetes Secrets
Provider API keys and IdP/MCP client secrets are **never** stored in the database or in git — they
live only as Kubernetes Secrets. Those are base64-encoded, **not encrypted at rest** unless your
platform enables it. **You must enable a secret-at-rest control**: etcd encryption, sealed-secrets, or
an external-secrets/KMS integration. Native external-secrets/Vault support is on the roadmap.

### PII masking is opt-in
The masking plugin is **off by default** because, with the current upstream, it can truncate streaming
tool-call responses. Enable it when your data-handling policy requires masking and you've accepted the
streaming trade-off. See [Data sovereignty](../security/data-sovereignty.md).

### Guardrail blocks store an excerpt of the offending content
When a guardrail blocks a request, a short **excerpt of the offending content** is recorded for audit —
which can include the very PII or secret-like text the guardrail caught. Treat this as sensitive in
your data inventory; you can set its retention and disable/redact the excerpt.

### DR is single-site, restore-based
`global.highAvailability` replicates components **within one cluster** — it survives node loss, not
site loss. There is no second-site standby or cross-region failover. The honest headline: *survives
node loss within the cluster (HA replicas); survives cluster/site loss only by restore-from-backup
onto new infrastructure.* Multi-cluster DR is out of scope today.

### The supply chain is not signed yet
Images are built and promoted by retag (dev → uat → vX.Y.Z); there are **no cosign signatures, no
published SBOM, and no SLSA provenance** yet. The interim control is **image digest pinning** plus
your own scan-on-pull. Signing, SBOM, and provenance are on the roadmap.

### Identity is JIT-provisioned; de-provisioning is manual
Users are created on their first brokered login (just-in-time). There is **no SCIM auto-de-provision**
on HR offboard yet — de-provisioning is a manual step in Keycloak today. Own an offboarding runbook;
SCIM is on the roadmap.

## Upgrade reversibility

Control-plane database migrations are **forward-only at runtime**. Down-migrations exist for manual
rollback but are not applied automatically, so rolling the control-plane image back across a schema
change is not automatic. **Always back up before an upgrade**; see [Upgrades](./upgrades.md) for the
rollback procedure.
