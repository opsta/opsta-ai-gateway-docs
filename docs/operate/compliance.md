# Compliance & control mapping

This page maps the platform's security and operational controls to the most common frameworks your
compliance and audit teams will ask about: **SOC 2, ISO 27001, NIST SP 800-53, CIS Kubernetes
Benchmark, GDPR, and PDPA (Thailand)**.

::: info Who this is for
Compliance officers, internal auditors, and security architects producing evidence packages for
certification, audit, or due-diligence reviews. Read alongside the
[Shared responsibility & maturity](./shared-responsibility.md) matrix — every "Customer" item in
that matrix is a control gap you must satisfy.
:::

::: warning This is a mapping guide, not a certification
Opsta AI Gateway is not itself certified under any of these frameworks. This mapping identifies
**which controls the product addresses** and **which controls remain your responsibility** as the
operator. Your auditor determines sufficiency; this document gives them a starting point.
:::

---

## How to read this page

Each table row maps a control requirement to:
- **Product control** — what the platform provides out of the box.
- **Where to find evidence** — the page, log, or artifact that demonstrates the control.
- **Operator action** — what you must do to satisfy the control at your site.

Maturity levels follow the [Shared responsibility matrix](./shared-responsibility.md) legend:
**Shipped** · **Shipped (toggle)** · **Opt-in** · **Roadmap** · **Customer**.

---

## SOC 2 Type II

SOC 2 evaluates controls across five Trust Services Criteria (TSC). The AI gateway most
commonly appears in a SOC 2 audit as a system component under **Security (CC)** and
**Availability (A)**.

### Security (CC)

| CC | Requirement | Product control | Maturity | Evidence | Operator action |
|---|---|---|---|---|---|
| CC6.1 | Logical access restricted to authorised users | Key-auth plugin; RBAC (3 roles) | **Shipped** | Audit log; RBAC model | Configure Keycloak groups + platform-admin emails |
| CC6.2 | Access revocation on role change | API key revoke; Keycloak user disable | **Shipped** | Audit log entries for `key.revoke`, `member.remove` | Maintain offboarding runbook (SCIM de-provision is roadmap) |
| CC6.3 | Least privilege | Org-scoped admin; member read-only | **Shipped** | [RBAC model](/security/rbac) | Review group membership quarterly |
| CC6.6 | Transmission encryption | TLS at ingress; CP→Postgres TLS | **Shipped** | cert-manager cert; `PGSSLMODE=require` | Enforce enforcing CNI for internal network isolation |
| CC6.7 | Encryption of data at rest | PVC + etcd encryption | **Customer (G3)** | StorageClass config; etcd encryption manifest | Enable etcd encryption or sealed-secrets/ESO |
| CC6.8 | Malware / change prevention | Trivy + gosec CI gates; read-only container FS | **Shipped** | CI workflow results; `readOnlyRootFilesystem: true` | Pin chart to OCI digest; scan images on pull |
| CC7.1 | Vulnerability detection | Trivy SCA + IaC scan; gosec | **Shipped** | CI scan results; [lifecycle](/security/lifecycle) patch SLA | Subscribe to security-announce; apply patches per SLA |
| CC7.2 | Security incident monitoring | Grafana alerts; guardrail block log | **Shipped (toggle)** | [Alert rules](/operate/observability-platform); `guardrail_blocks` | Wire alerts to your pager; define incident response runbook |
| CC9.1 | Vendor risk management | Self-hosted; no Opsta cloud in data path | **Shipped** | [Data sovereignty](/security/data-sovereignty) | Assess LLM provider contracts (no-train/ZDR) |

### Availability (A)

| A | Requirement | Product control | Maturity | Evidence | Operator action |
|---|---|---|---|---|---|
| A1.1 | Capacity planning | Sizing guidance (RA.1 pending) | **Shipped (doc pending RA.1)** | [Requirements](/operate/requirements) | Monitor saturation alerts; plan for peak load |
| A1.2 | Environmental safeguards | HA topology (PDB + anti-affinity) | **Shipped (toggle)** | `global.highAvailability: true`; PDB manifests | Use ≥3-node cluster; enforce anti-affinity |
| A1.3 | Backup and recovery | CNPG backup + helmfile IaC | **Opt-in (G1)** | `postgres.backup.enabled`; [Backup & DR](/operate/backup-and-dr) | Enable backups; run restore drill; record RTO/RPO |

---

## ISO 27001:2022

The gateway maps most directly to Annex A controls in the **Access control (A.5-A.9)**,
**Cryptography (A.10)**, **Operations (A.12)**, **Communications (A.13)**, and
**Incident management (A.16)** domains.

| ISO 27001 control | Requirement | Product control | Maturity | Operator action |
|---|---|---|---|---|
| A.5.15 | Access control policy | Key-auth + RBAC + KC groups | **Shipped** | Document access policy; review quarterly |
| A.5.16 | Identity management | Keycloak broker (local/LDAP/OIDC/SAML); JIT | **Shipped** | Maintain KC realm; offboarding runbook (SCIM roadmap) |
| A.5.17 | Authentication information | HMAC-hashed API keys; OIDC tokens; no plaintext keys in DB | **Shipped** | Key rotation procedure; session secret rotation |
| A.5.28 | Collection of evidence | Audit log (all mutating actions + denials) | **Shipped** | Set `audit.retentionDays` to ≥365; protect log export |
| A.8.7 | Protection against malware | Read-only FS; CI scan; no shell in containers | **Shipped** | Pin image digests; scan on pull |
| A.8.9 | Configuration management | IaC only (helmfile); no manual state | **Shipped** | GitOps workflow; Taskfile as the only entrypoint |
| A.8.24 | Use of cryptography | TLS at ingress; TLS CP→Postgres; no data-at-rest encryption native | **Shipped / Customer** | Enable etcd encryption + StorageClass encryption (G3) |
| A.8.25 | Secure development | gosec SAST; Trivy SCA; license check; pre-commit gate | **Shipped** | Review CI results; apply patches per [lifecycle SLA](/security/lifecycle) |
| A.8.32 | Change management | Semver releases; changelog; pre-commit + CI gate | **Shipped** | Document change approval process; use release workflow |
| A.5.26 | Response to information security incidents | Guardrail blocks; alert rules; audit log | **Shipped (toggle)** | Define IR runbook; wire alerts to pager |
| A.8.15 | Logging | Gateway logs → Loki; audit log → Postgres | **Shipped** | Set log retention; protect Loki storage |

---

## NIST SP 800-53 Rev 5

Key control families applicable to an AI gateway deployment:

| Family | Controls | Product | Maturity | Notes |
|---|---|---|---|---|
| **AC — Access Control** | AC-2 (account mgmt), AC-3 (enforcement), AC-6 (least privilege), AC-17 (remote access) | RBAC + key-auth + KC | **Shipped** | AC-2: maintain user lifecycle; AC-17: TLS enforced |
| **AU — Audit and Accountability** | AU-2 (audit events), AU-3 (content), AU-9 (protection), AU-11 (retention) | Audit log | **Shipped** | AU-9: protect log export; AU-11: set `retentionDays` |
| **IA — Identification & Authentication** | IA-2 (user authn), IA-3 (device authn), IA-5 (authenticator mgmt) | Key-auth + KC OIDC | **Shipped** | IA-3: API keys act as device authenticators |
| **SC — System & Communications** | SC-8 (transmission confidentiality), SC-28 (protection at rest) | TLS at ingress + CP→PG; PVC encryption | **Shipped / Customer** | SC-28: StorageClass + etcd encryption (G3) |
| **SI — System Integrity** | SI-2 (flaw remediation), SI-3 (malware), SI-7 (software integrity) | Patch SLA + Trivy + gosec | **Shipped** | SI-7: digest pinning interim (G8); signing roadmap |
| **CP — Contingency Planning** | CP-9 (backup), CP-10 (recovery) | CNPG backup + IaC restore | **Opt-in (G1)** | Enable backups; test restore; record RTO/RPO |
| **RA — Risk Assessment** | RA-5 (vuln scanning), RA-7 (risk response) | Trivy + gosec CI | **Shipped** | RA-7: apply patches per [lifecycle SLA](/security/lifecycle) |
| **SA — System Acquisition** | SA-12 (supply chain), SA-15 (dev process) | Version-pinned matrix; CI gate; license check | **Shipped (G8 partial)** | SA-12: digest pinning; signing/SBOM roadmap |

---

## CIS Kubernetes Benchmark

The platform targets CIS K8s Benchmark v1.9 (Level 1) for the workloads it controls.
Third-party sub-charts (Higress, Keycloak, LGTM) follow their own upstream hardening; verify them
separately.

| CIS section | Requirement | Status | Notes |
|---|---|---|---|
| 5.1 — RBAC | Minimal RBAC; no cluster-admin service accounts | **Met** | Opsta pods use namespace-scoped service accounts with least-privilege roles |
| 5.2 — PSA | Non-root, no privileged, seccomp | **Met** | `runAsNonRoot`, `drop ALL`, `seccompProfile: RuntimeDefault` on all Opsta-built pods |
| 5.3 — NetworkPolicy | Default-deny + allowlist | **Met (toggle)** | `controlPlane.networkPolicy.enabled: true`; requires enforcing CNI |
| 5.4 — Secrets | Secrets not in env vars in plain; no secrets in image | **Met** | Secrets mounted as files or env from SecretKeyRef; never baked into images |
| 5.5 — Image provenance | Image tag pinned; no `latest` | **Met** | All images pinned in `version.yaml`; digest pinning recommended |
| 5.7 — Namespaces | Separate namespaces per logical group | **Met** | `higress-system`, `opsta-ai-gateway`, `opsta-keycloak`, `opsta-observability` |
| 4.2 — API server audit | Audit log enabled | **Customer** | Enable K8s API server audit log in your cluster config |

---

## GDPR and PDPA (Thailand)

The gateway processes personal data (user emails in `members` table, audit log actor emails,
guardrail-block `user_email` field). The mapping below applies to both GDPR (EU 2016/679) and
Thailand PDPA (B.E. 2562).

| Requirement | Product support | Maturity | Operator action |
|---|---|---|---|
| **Lawful basis / purpose limitation** | Configuration stores only what is necessary for access control, billing, and safety | **Shipped** | Document your legal basis for processing member emails and audit data |
| **Data minimisation** | Guardrail snippet ≤280 chars; no prompt body stored | **Shipped** | Review `retentionDays`; evaluate disabling snippet column (G4 roadmap) |
| **Retention and erasure** | `audit.retentionDays` configurable; DB `DELETE` API for orgs/members | **Shipped** | Set short retention (e.g. 90 days) for GDPR/PDPA minimisation; document erasure procedure |
| **Right to access / portability** | Admin can query audit log and member records via API or `psql` | **Shipped** | Document DSR (Data Subject Request) procedure for your org |
| **Right to erasure** | Delete member record + associated keys/usage | **Shipped (manual)** | Document erasure workflow; test it |
| **Security of processing (Art. 32 / §37)** | TLS, RBAC, audit log, network isolation | **Shipped** | Add etcd encryption (G3); enable backups; wire alerts |
| **Data transfer outside EEA / Thailand** | Prompts sent to your configured providers only | **Customer** | Assess provider data-transfer terms; use providers in the required geography or self-host (Ollama) |
| **Data Protection Officer notification** | No automatic DPO notification | **Customer** | Implement your own incident notification workflow |
| **Consent for AI training** | No consent mechanism native | **Customer** | Use providers with no-train terms, or self-host |

---

## Related pages

- [Shared responsibility & maturity](./shared-responsibility.md) — the primary maturity matrix
- [Production-readiness checklist](./production-readiness.md) — the gating checklist before go-live
- [Data handling](./data-handling.md) — full data inventory and retention controls
- [Security overview](/security/overview) — threat model and defence-in-depth
- [Hardening](/security/hardening) — encryption matrix, securityContext, egress allowlist
- [Software lifecycle & support](/security/lifecycle) — patch SLA and EOL policy
- [Audit & compliance](/security/audit-and-compliance) — audit log structure and access
