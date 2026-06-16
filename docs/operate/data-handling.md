# Data handling

This page is the data inventory your security, compliance, and data-protection teams need before
deploying Opsta AI Gateway. It answers: **what is stored, where, at what classification, for how
long, and what controls exist.** It also states the product's current gaps honestly — see the
[Shared responsibility matrix](./shared-responsibility.md) for the maturity column.

::: info Who this is for
Data protection officers, security architects, and compliance teams. Read alongside
[Data sovereignty](/security/data-sovereignty) (residency + air-gap) and
[Audit & compliance](/security/audit-and-compliance) (audit log detail).
:::

---

## Data inventory

### PostgreSQL — source of truth

Managed by CloudNativePG. Contains everything the control plane owns.

| Table / data | Classification | What's there | Retention |
|---|---|---|---|
| `orgs`, `projects`, `members` | Confidential | Organisation names, project names, member email addresses | Until deleted |
| `providers` | Confidential | Provider name, endpoint, model list (no key material — keys are in Kubernetes Secrets) | Until deleted |
| `api_keys` | Confidential | HMAC hash of key + metadata (project, user, label, budget); **raw key material is never stored** | Until revoked |
| `budgets`, `usage_ledger` | Internal | USD budgets, per-key token counters, billing ledger | Until deleted / reset |
| `audit_log` | Confidential | Admin action log — who changed what and when (org/project/provider/key mutations) | Configurable (`audit.retentionDays`, default **365 days**); pruned daily |
| `guardrail_blocks` | **Sensitive** | Per-block record: consumer identity, org/project, timestamp, which gate denied, matched rule, **and a ≤280-character excerpt of the offending request content** | Configurable (`audit.retentionDays`, same setting, default 365 days); pruned daily |
| `guardrail_rules` | Confidential | Guardrail patterns configured by org admins | Until deleted |
| `routing_rules`, `provider_keys`, `canary_rules`, `mcp_servers`, `prompt_templates` | Confidential | Configuration objects | Until deleted |

::: warning Guardrail-block snippets (G4)
The `guardrail_blocks.snippet` column stores up to **280 characters of the request content that
triggered a guardrail block**. This excerpt may contain the sensitive text the guardrail was meant
to catch (PII, a prompt-injection attempt, confidential content). **Treat `guardrail_blocks` as a
sensitive table and apply appropriate access controls, backup encryption, and retention discipline.**

What to do:
- **Reduce retention** — set `audit.retentionDays` to a shorter window (e.g. 90 days) if you do
  not need long-term forensics on blocked content.
- **Restrict access** — the table is in the same database as the rest of the control-plane schema;
  it is not exposed externally, but database-level access (e.g. `psql` as the `opsta` role) can
  read it. Scope database access accordingly.
- **Disable the snippet** — this is not yet a first-class config knob; it is a planned roadmap
  item. In the interim, a post-migration SQL trigger or a custom CNPG hook can zero out the column
  on insert if your policy requires it. Contact Opsta support for guidance.
:::

### Kubernetes Secrets

Created by the chart and operators. Standard Kubernetes Secrets (base64-encoded, **not encrypted
at rest unless you add etcd encryption or an external-secrets/KMS integration**).

| Secret | What's in it | Mounted by |
|---|---|---|
| `provider-keys-<org>` | LLM provider API keys for each org | Higress gateway (Wasm plugin) |
| `idp-secrets-<org>` | OIDC/SAML client secrets for per-org IdP brokering | Keycloak via control plane |
| `mcp-*` | MCP server credentials | Higress gateway |
| `opsta-pg-app` | PostgreSQL connection string (host, user, password, db) | Control plane |
| `keycloak-pg-app` | Keycloak's PostgreSQL connection string | Keycloak |
| Session / CSRF secrets | Web console session signing key | Console |
| TLS cert + key | Wildcard TLS certificate (`*.<baseDomain>`) | cert-manager / Higress |

::: danger Secret encryption at rest (G3)
Kubernetes Secrets are **base64-encoded, not encrypted** unless your cluster has etcd encryption
enabled or you use sealed-secrets / external-secrets. Anyone with cluster-admin access — or raw
etcd access — can decode and read the plaintext API keys and IdP credentials.

**Customer action required for production:**
- Enable [etcd encryption at rest](https://kubernetes.io/docs/tasks/administer-cluster/encrypt-data/)
  (RKE2 and EKS support this natively), or
- Deploy [Bitnami sealed-secrets](https://github.com/bitnami-labs/sealed-secrets) and seal the
  secrets-values.yaml before applying, or
- Use [External Secrets Operator](https://external-secrets.io/) backed by your KMS
  (AWS Secrets Manager, HashiCorp Vault, Azure Key Vault, Google Secret Manager).

Native ESO/Vault integration is on the product roadmap. In the interim, any of the above
customer-applied controls is sufficient.
:::

### Redis — ephemeral quota and cache state

Managed by the Opstree Redis operator. Contains transient state only — **nothing in Redis is the
system of record.** All counters are derived from usage events and can be reconstructed on loss.

| Key space | What's there | Durability |
|---|---|---|
| Quota / rate-limit counters | Per-key token-per-minute and USD-balance counters | Ephemeral — counters reset to the authoritative value from PostgreSQL on the next reconcile |
| Semantic-cache entries | Request embedding + response pairs (opt-in) | TTL-bounded; cache misses degrade to upstream, not errors |

RPO for Redis is **effectively N/A** — a Redis loss causes a brief enforcement gap (see the FMEA
section in [Reference architecture](./reference-architecture.md)), not data loss.

### Object store (HA topology only)

Used by the LGTM observability stack and (when enabled) Postgres WAL archiving. S3-compatible;
you supply and own the bucket.

| Data | Store | Retention control |
|---|---|---|
| Mimir metrics blocks | Your S3 bucket | `mimir.storage.retention` (default: configurable) |
| Loki log chunks | Your S3 bucket | `loki.storage.retention` (default: configurable) |
| Tempo trace blocks | Your S3 bucket | `tempo.storage.retention` (default: configurable) |
| PostgreSQL base backups (when enabled) | Your S3 bucket | CNPG backup schedule + retention policy |

The object store is operated by you. Opsta has no access to its contents.

---

## Data classification summary

| Classification | Data | Required controls |
|---|---|---|
| **Critical** | Provider API keys, IdP client secrets, TLS private keys | etcd encryption or sealed/external secrets; strict RBAC; rotation schedule |
| **Sensitive** | Guardrail-block snippets (≤280 chars of offending content) | Short retention window; database-level access control; encryption at rest |
| **Confidential** | Member emails, org/project names, audit log, usage ledger | Backup encryption; TLS in-transit; access restricted to admin roles |
| **Internal** | Budget config, routing rules, guardrail patterns | Standard access controls |
| **Ephemeral** | Redis counters, semantic cache | No backup required; loss is a service degradation, not a data loss |

---

## Retention controls

### Audit log and guardrail blocks

Both the `audit_log` and `guardrail_blocks` tables use the same retention setting, pruned daily:

```yaml
# charts/opsta-ai-gateway/values.yaml
audit:
  retentionDays: 365    # default — reduce for guardrail-block privacy
```

Set `audit.retentionDays` to your policy requirement (e.g. 90 days for GDPR minimisation, or
730 days if you have a long-term audit obligation).

### Observability retention

Configure per-signal in the LGTM chart values:

```yaml
loki:
  storage:
    retention: 90d      # log chunk retention

mimir:
  # see mimir configuration for compactor retention

tempo:
  storage:
    trace:
      backend: s3
      block_retention: 720h   # 30 days in hours (Go duration)
```

See [Platform observability](./observability-platform.md) for full detail.

---

## PII masking (G5 — opt-in)

The `ai-data-masking` Higress plugin can mask PII patterns in request prompts and completion
responses before they reach or leave the gateway.

::: warning Opt-in — OFF by default
PII masking (`guardrails.masking.enabled`) is **off by default** since v1.8.1. The upstream
plugin truncates streaming responses that include tool-calls (a known upstream bug in the Wasm
plugin's buffering of streaming tool-call frames). Enabling it when your workload uses streaming
tool-call responses may drop the `tool_calls` field.

**When to enable:** enable masking if your workload does not use streaming tool-calls, or if you
need a PII floor and can accept the streaming trade-off.

**When not to enable:** if your workload uses agentic/tool-use patterns with streaming responses,
leave masking off until the upstream bug is fixed (tracked in the Opsta roadmap).
:::

To enable:

```yaml
# charts/opsta-ai-gateway/values.yaml (or your values overlay)
guardrails:
  masking:
    enabled: true
    rules:
      - type: replace
        regex: "\\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}\\b"
        placeholder: "[EMAIL]"
        restore: false
      # Add more rules as needed
```

---

## Provider data-in-flight

Prompts and completion responses **leave your cluster** and travel to your configured LLM provider
over HTTPS. The gateway is a transparent proxy for the content — it does not store prompt or
response bodies (only the guardrail-block snippet, described above).

::: info No-train and zero-data-retention
Whether your provider uses prompt content for model training, or offers a zero-data-retention
(ZDR) contract, is governed entirely by **your agreement with that provider**. Opsta cannot
enforce or audit provider-side data handling — you must select providers whose data-handling terms
satisfy your policy.

For workloads that must not send data off-premises, configure an **on-premises model** via
[Ollama](https://ollama.ai) and route to it exclusively. See [Supported providers](/reference/supported-providers).
:::

### Egress endpoints

At runtime the gateway makes outbound HTTPS connections to:

1. **Configured LLM providers** — endpoints you set per-provider (e.g. `api.openai.com`,
   `api.anthropic.com`). You control the list.
2. **Configured MCP servers** — endpoints you set per-MCP-server. You control the list.
3. **Let's Encrypt ACME API** — `acme-v02.api.letsencrypt.org` (only if `tls.mode: letsencrypt`).
4. **Nothing else.** No telemetry to Opsta. No product analytics. No call-home.

In an air-gapped cluster, configure a local CA (`tls.mode: provided` or `selfsigned`) and mirror
all images — then **zero** outbound connections are required after installation. See
[Air-gapped install](./air-gap.md).

---

## Cross-border and residency

Because all stores run in your cluster, **data residency follows your cluster**. Deploy in the
region or data center your legal and compliance requirements specify.

The only cross-border data movement is the request content forwarded to your LLM providers — and
that is entirely under your control (choose provider endpoints in the required geography, or use
on-premises models).

---

## No external telemetry

The platform does **not** send any of the following to Opsta or any third party:

- Usage metrics (token counts, request rates)
- Prompt or response content
- User or organisation identity
- Configuration or policy
- Error logs

All observability data remains in your self-hosted LGTM stack.

---

## Related pages

- [Shared responsibility & maturity](./shared-responsibility.md) — maturity column for each control above
- [Data sovereignty](/security/data-sovereignty) — residency, air-gap, reproducibility
- [Audit & compliance](/security/audit-and-compliance) — audit log structure and access
- [Backup & DR](./backup-and-dr.md) — protecting PostgreSQL and the object store
- [Hardening](/security/hardening) — securityContext, NetworkPolicy, etcd encryption guidance
- [Reference architecture](./reference-architecture.md) — data store placement in the topology diagrams
