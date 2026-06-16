# Production-readiness checklist

A copy-pasteable gate to sign **before** you put Opsta AI Gateway in front of production traffic. Every
item is actionable and verifiable — tick it only when you've confirmed it on your cluster. It pairs with
the [Shared-responsibility & maturity matrix](./shared-responsibility.md): each "you provide" there has a
check here.

::: info Who this is for
The platform + security owners doing the go-live sign-off. Standalone pilots can skip the HA-only items
(marked _HA_); a production deployment should clear everything.
:::

::: warning Sign-off rule
Don't go live with an unchecked item silently skipped. If you're accepting a gap deliberately (e.g. PITR
not yet needed), record it as an accepted risk with an owner — don't leave it ambiguous.
:::

## Platform
- [ ] Kubernetes is on the **tested version matrix** (a conformant cluster; the reference platform is RKE2 on Linux VMs).
- [ ] **≥3 worker nodes** so HA replicas and pod anti-affinity can actually spread (_HA_).
- [ ] A default **StorageClass (RWO)** exists; for HA, an **S3-compatible object store** is reachable for LGTM + backups (_HA_).
- [ ] A **LoadBalancer** (cloud LB, or MetalLB on bare-metal) or a documented ingress path is in place; the ingress IP is known for DNS.
- [ ] The cluster **CNI enforces NetworkPolicy** (the gateway ships default-deny policies that are no-ops on a non-enforcing CNI).
- [ ] **NTP and DNS** are sane on every node.

## Data protection
- [ ] `postgres.backup.enabled: true` and the backup target object store is reachable.
- [ ] A **restore drill has been performed** on a fresh cluster, and the actual **RPO/RTO are recorded** (see [Backup & DR](./backup-and-dr.md)).
- [ ] A **secret-at-rest control** is enabled — etcd encryption, sealed-secrets, or external-secrets/KMS (secrets are plaintext Kubernetes Secrets otherwise).
- [ ] Retention is set for the audit log, metrics, logs, and traces; the **guardrail-block excerpt** retention/redaction decision is made.

## Security
- [ ] TLS source chosen (`letsencrypt` or `provided`) and the **wildcard cert for `*.<baseDomain>` is valid**.
- [ ] **SSO/OIDC is wired** and restricted to your allowed **email domain(s)**.
- [ ] **NetworkPolicies are on** and the egress allowlist covers the LLM-provider endpoints the gateway must reach.
- [ ] Image references are **digest-pinned** (interim supply-chain control) and you scan-on-pull.
- [ ] **Secret-rotation owners are assigned** for provider keys, IdP secrets, and TLS material.

## Identity
- [ ] The **external IdP is brokered** through Keycloak (local/LDAP-AD/OIDC/SAML as applicable).
- [ ] The **bootstrap / break-glass admin** is documented and its credential stored in your vault.
- [ ] A **de-provisioning runbook** is owned (SCIM auto-deprovision is not available yet; offboarding is manual in Keycloak).

## Observability
- [ ] Grafana is reachable and the platform dashboards render.
- [ ] **Alerts are wired to your paging** (PagerDuty/Opsgenie/etc.) on the golden signals.
- [ ] Log/metric/trace **retention** is set to your policy.

## Operational
- [ ] The **upgrade/rollback runbook** has been reviewed, including the **back-up-before-upgrade** rule and the forward-only-migration caveat (see [Upgrades](./upgrades.md)).
- [ ] The **diagnostics-bundle** command is known to your on-call.
- [ ] The **support tier and contacts** are confirmed.

## Sign-off

| Field | Value |
|---|---|
| Environment / cluster | |
| Topology | Standalone / HA |
| Product version | |
| RPO / RTO (from restore drill) | |
| Accepted risks (with owners) | |
| Signed off by / date | |
