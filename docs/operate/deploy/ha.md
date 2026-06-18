# Production deployment (HA)

A literal, ordered, copy-paste sequence to stand up the full Opsta AI Gateway **appliance** in a
**high-availability** configuration on a conformant Kubernetes cluster. The whole bundled stack —
Higress, PostgreSQL, Redis, Keycloak, the LGTM observability stack, cert-manager, and our
control-plane/console — installs as **one versioned unit**.

::: info Who this is for
The platform engineer doing the install. You bring a **conformant HA Kubernetes cluster**, storage,
and DNS; optionally an external IdP and object store. The appliance installs the **same way on any
supported distribution** — only how you provision the cluster differs (see Phase 0). For a single-node
pilot, see the [Standalone quick-start](#appendix-a-standalone-quick-start).
:::

::: warning Verify before you trust
Every command here is run-once-for-real on a live cluster before publication, and every "expected
output" is one that was actually observed. Each step pairs an exact command with what you should see
and how to verify it. Do not skip the verification steps.
:::

Before you start, read the [Reference architecture](/operate/reference-architecture) (what you're
deploying and why) and clear the [Production-readiness checklist](/operate/production-readiness). This
runbook *executes* that architecture; it doesn't restate it.

## Supported platforms

The gateway runs on **native Kubernetes of your choice** — install (Phases 1–5) is identical across
all of them; only Phase 0 (provisioning the cluster) is platform-specific.

| Environment | Distribution | Provision the cluster with |
|---|---|---|
| **On-prem (default)** | **Rancher / RKE2** | Your platform team (Opsta SE can lead this) — see Phase 0 |
| On-prem | OpenShift | Red Hat's installer (IPI/UPI) |
| On-prem | VMware Tanzu (TKG) | Tanzu's cluster tooling |
| Cloud | **GKE / AKS / EKS / CCE / OKE** | The provider's managed-Kubernetes service |

---

## Pre-flight — what you must have before you start

Fill in this worksheet first. Every later phase references it. Nothing below is run yet.

### 1. A conformant HA cluster

Provisioned in Phase 0. Sizing from the
[Requirements](/operate/requirements#high-availability-sizing-estimated) page: **≥3 worker nodes**
(so HA replicas + anti-affinity spread), each **4 vCPU / 8 GiB minimum → 8 / 16 GiB comfortable**,
100 GiB SSD. The cluster's **CNI must enforce NetworkPolicy** and a **default StorageClass (RWO)**
must exist.

- Distribution chosen: `__________` · nodes (count + size): `__________`

### 2. DNS

- **`*.<baseDomain>` → the ingress IP** (from step 5). `baseDomain`: `__________`
- Subdomains used (all under the wildcard): `api`, `console`, `auth`, `grafana`, `mcp`.

### 3. TLS

- **`letsencrypt`** (cert-manager issues + renews via DNS-01/HTTP-01) **or** **`provided`** (you supply
  a wildcard cert + key for `*.<baseDomain>`, placed in secrets, never in git).
- Chosen: `__________` · (if `provided`) cert + key ready: ☐

### 4. Object store (HA)

S3-compatible bucket(s) + credentials for the LGTM stack (logs/metrics/traces) and PostgreSQL backups
(a [readiness](/operate/production-readiness#data-protection) gate; self-hosted → SeaweedFS).

- Endpoint: `__________` · bucket(s): `__________` · creds in your vault: ☐

### 5. Load balancer (the ingress IP)

The gateway is reached through one LoadBalancer Service; `*.<baseDomain>` points at its external IP.

- **Cloud LoadBalancer** — provisioned automatically for the `type: LoadBalancer` Service.
- **Customer-provided / existing load balancer** — point your L4 LB (F5, HAProxy, NSX, etc.) at the
  node IPs/NodePorts, or hand the Service an external IP your LB fronts.
- **MetalLB** — bare-metal with no external LB; hands out an IP from a pool you own.
- Chosen: `__________` · ingress IP (once known): `__________`

### 6. External identity provider (optional)

- Type: `__________` (OIDC / SAML) · client id + secret in vault: ☐ · allowed email domain(s): `__________`

### 7. LLM provider keys

- At least one provider key, kept in secrets (never in git). Provider(s): `__________` · in vault: ☐

### 8. Tooling on your workstation

`kubectl`, `helm` (pinned — see [Upgrades](/operate/upgrades)), `helmfile`, `yq`, `jq`, plus your
TLS/secret tooling. The released chart is pulled from `oci://ghcr.io/opsta/opsta-ai-gateway/charts` at
a pinned `vX.Y.Z` — no repo clone needed for the install.

---

## The deployment flow

Each phase follows the same shape: **intent → exact command → expected output → verification.** The
exact commands + observed outputs are captured from the validated end-to-end run and land here as each
phase is completed.

### Phase 0 — Provision a conformant cluster
Stand up an HA Kubernetes cluster on your chosen platform (table above) with: ≥3 worker nodes; a
NetworkPolicy-enforcing CNI; a default RWO StorageClass; a reachable object store (HA); and an ingress
IP via your chosen LoadBalancer option. **On-prem Rancher/RKE2 is Opsta's default** — your Opsta SE
provisions it from Opsta's internal cluster runbooks (compute → RKE2 → Rancher → downstream). For
OpenShift/Tanzu or a managed cloud (GKE/AKS/EKS/CCE/OKE), provision per that platform's docs. The rest
of this runbook is identical regardless of how the cluster was created.

### Phase 1 — Configure the appliance
Fill values: `global.baseDomain`, `global.highAvailability=true`, `global.storageClass`, TLS mode,
`postgres.backup` (enabled + object store), SSO/IdP, LGTM object storage, image registry (+ air-gap
mirror if used). Create the secrets (the `secrets-values.yaml` pattern) — provider keys, IdP secret,
TLS material — as **placeholders here, sourced from your vault**.

### Phase 2 — Install
One `helmfile sync` sequences the whole stack via `needs:` (cert-manager → redis-operator → cnpg →
LGTM → opsta-ai-gateway → keycloak). Watch the rollout; confirm each component reaches its ready state.

### Phase 3 — Verify the install
DNS/TLS resolves; the gateway answers a **real** chat completion (a seeded key → 200); console SSO
login → admin home; Grafana → overview dashboard; Keycloak reachable; control-plane reconcile healthy;
the first backup job succeeded.

### Phase 4 — Day-1 configuration
Bootstrap/break-glass admin login; wire the external IdP + email-domain restriction; create an
org → project → user; issue an API key; set a budget; enable guardrails. Hand the key to an app and
confirm a governed request flows and shows in usage.

### Phase 5 — Production hardening sign-off
Walk the [Production-readiness checklist](/operate/production-readiness); record RTO/RPO from the
restore drill; confirm alerts are wired to your paging; assign secret-rotation owners.

---

## Appendices

- **Appendix A — Standalone / PoC quick-start** — the diffs from the HA flow (1 node,
  `highAvailability=false`, backups optional, single-binary LGTM): the shortest path to a demo.
- **Appendix B — Air-gap** — registry mirror, OCI chart, image list, egress allowlist.
- **Appendix C — BYO operators (advanced)** — reuse an existing CloudNativePG / Redis / cert-manager.
- **Appendix D — Upgrade & rollback** — `helmfile` upgrade; back-up-before-upgrade; the forward-only
  migration caveat; the rollback procedure. See [Upgrades](/operate/upgrades).
- **Appendix E — Uninstall / teardown.**
- **Appendix F — Troubleshooting** — common failures per phase + the diagnostics-bundle command. See
  [Troubleshooting](/operate/troubleshooting).
