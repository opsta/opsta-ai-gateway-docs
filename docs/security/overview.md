# Security overview

Opsta AI Gateway is built to be the **trusted control point** for enterprise AI traffic. Security is structural,
not bolted on: the platform runs entirely on infrastructure you own, every request passes an ordered chain of
policy gates, every administrative change is audited, and tenants are isolated by construction.

::: info Who this is for
Security, risk, and compliance stakeholders evaluating the platform, and the engineers who operate it.
:::

## The pillars

| Pillar | What it means | Read more |
|---|---|---|
| **Data sovereignty** | Self-hosted; request content, telemetry, identity, and config never leave your cluster. Runs air-gapped. | [Data sovereignty](/security/data-sovereignty) |
| **Tenant isolation** | Organizations, projects, and users are isolated across keys, budgets, routing, telemetry, and MCP access. | [Multi-tenancy model](/overview/multi-tenancy) |
| **Least-privilege access** | Three roles — platform admin, org admin, member — scope every action; org admins see only their org. | [RBAC model](/security/rbac) |
| **Policy enforcement** | Each request runs key-auth, guardrails, routing, budgets/limits, and cache before reaching a provider. | [Request lifecycle](/overview/request-lifecycle) |
| **Auditability** | Every mutating action — including denied attempts — is recorded with actor, target, outcome, and status. | [Audit & compliance](/security/audit-and-compliance) |
| **Hardened by default** | Verified identity, internal-service auth, network isolation, secret hygiene, supply-chain scanning. | [Hardening](/security/hardening) |

## Defense in depth

Security is layered so that no single control is a single point of failure:

- **At the edge** — TLS terminates in your cluster with a certificate you control.
- **At the gateway** — every request is authenticated and runs the policy gate chain; a failing gate stops the
  request with a clear status code.
- **At the control plane** — the configuration API verifies caller identity (signed tokens), enforces RBAC,
  rate-limits and size-caps requests, and validates input.
- **Between services** — internal calls require a shared secret, and network policy restricts who can reach the
  control plane and the telemetry backends.
- **At rest** — the source of truth is your PostgreSQL; secrets live in Kubernetes Secrets or your external
  secret store.

## Trust boundary

Everything inside the trust boundary — the gateway, control plane, database, identity, telemetry, and console —
runs in **your** Kubernetes cluster. The only things that cross it are requests to the **LLM and MCP providers
you explicitly configure**. There is no Opsta-operated cloud in the data path.

## Threat model summary

The following table identifies the top threats across each trust-boundary crossing and the controls
in place today. The full STRIDE analysis is referenced in the [Reference architecture trust-boundary
diagram](/operate/reference-architecture#trust-boundaries--threat-model).

| Threat | Attack surface | Control | Residual risk |
|---|---|---|---|
| **Unauthenticated API access** | Data-plane `/v1/*` endpoints | `key-auth` plugin — rejects all keyless requests with 401 | Low |
| **Key leakage → abuse** | Provider API keys in Kubernetes Secrets | Keys stored as k8s Secrets (not in DB or git); etcd encryption is customer responsibility (G3) | Medium — depends on customer etcd encryption posture |
| **Prompt injection** | Arbitrary user prompt content | `prompt-guard` plugin — pattern-match + semantic-guard (opt-in) | Medium — pattern coverage is configurable |
| **Tenant data cross-contamination** | Org/project isolation in the control plane | RBAC enforced at API layer; telemetry label-scoped per org; Redis key-prefixed per org | Low |
| **Privilege escalation via headers** | Control-plane configuration API | Verified OIDC tokens replace trust-me headers; constant-time comparison for internal secrets | Low (requires OIDC issuer configured) |
| **Lateral movement from a compromised pod** | Cluster-internal network | NetworkPolicy default-deny + allowlist; separate namespaces per subsystem | Medium — requires enforcing CNI |
| **Secret extraction from etcd** | Kubernetes Secrets (base64) | Customer must add etcd encryption / sealed-secrets / ESO (G3) | **High if unmitigated** |
| **Guardrail-snippet PII exposure** | `guardrail_blocks.snippet` column | 280-char cap; no external exposure; access restricted to DB role (G4) | Medium |
| **Supply-chain compromise** | Container images + Helm charts | Version-pinned matrix + Trivy/gosec CI scan; no signing/SBOM yet (G8) | Medium — interim: digest pinning |
| **Egress data exfiltration** | Outbound to LLM providers / MCP servers | You configure the endpoints; egress allowlist via NetworkPolicy (see [Hardening](/security/hardening)) | Medium — depends on your provider allowlist |
| **DoS on the configuration API** | `/api/*` mutating endpoints | Token-bucket rate limit + body-size cap | Low |
| **Cert expiry → outage** | TLS wildcard cert | cert-manager auto-renew (Let's Encrypt); customer rotation for provided certs | Low (Let's Encrypt) / Medium (provided) |

## Next steps

- [Data sovereignty](/security/data-sovereignty) — exactly what stays in your environment.
- [RBAC model](/security/rbac) · [Audit & compliance](/security/audit-and-compliance) ·
  [Hardening](/security/hardening) · [Software lifecycle & support](/security/lifecycle)
