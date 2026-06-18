# Deploy on RKE2 (HA) — production runbook

A literal, ordered, copy-paste sequence to stand up the full Opsta AI Gateway **appliance** on an
**RKE2** cluster, in a **high-availability** configuration, at a customer site. Your platform team
(and ours) follow this same document line by line to a working, verified, production-hardened gateway.

::: info Who this is for
The platform engineer doing the install. The whole bundled stack — Higress, PostgreSQL, Redis,
Keycloak, the LGTM observability stack, cert-manager, and our control-plane/console — installs as
**one versioned unit**. You bring a cluster, storage, and DNS; optionally an external IdP and object
store. For a single-node pilot, see the [Standalone quick-start](#appendix-a-standalone-quick-start).
:::

::: warning Verify before you trust
Every command here is run-once-for-real on a live RKE2 cluster before publication, and every
"expected output" is one that was actually observed. Each step pairs an exact command with what you
should see and how to verify it. Do not skip the verification steps.
:::

Before you start, read the [Reference architecture](/operate/reference-architecture) (what you're
deploying and why) and clear the [Production-readiness checklist](/operate/production-readiness). This
runbook *executes* that architecture; it doesn't restate it.

---

## Pre-flight — what you must have before you start

Fill in this worksheet first. Every later phase references it. Nothing below is run yet — these are
the inputs and decisions to have ready.

### 1. Nodes (VMs)

Size from the [Requirements](/operate/requirements#high-availability-sizing-estimated) page. For HA:

| Role | Count | vCPU / RAM (min → comfortable) | Disk | Notes |
|---|---|---|---|---|
| RKE2 server (control plane) | **3** (odd, for etcd quorum) | 2 / 4 GiB → 4 / 8 GiB | 50 GiB SSD | can be small; they run etcd + the API |
| RKE2 agent (worker) | **≥3** | 4 / 8 GiB → 8 / 16 GiB | 100 GiB SSD | the gateway + stack run here; ≥3 lets HA replicas spread with anti-affinity |

- **OS:** a current Linux on the [tested matrix](/operate/requirements#kubernetes) (the reference is RKE2 on Linux VMs).
- **Access:** SSH to every node; a sudo-capable user.
- **Worksheet:**
  - Server node IPs/hostnames: `__________`
  - Agent node IPs/hostnames: `__________`
  - Per-node vCPU / RAM / disk chosen: `__________`

### 2. DNS

The product serves everything under one wildcard. Create:

- **`*.<baseDomain>` → the ingress IP** (the LoadBalancer address from step 5).
- Your `baseDomain`: `__________` (e.g. `ai-gateway.example.com`)
- Subdomains used: `api`, `console`, `auth`, `grafana`, `mcp` (all under the wildcard).

### 3. TLS

Choose one (set in values in Phase 1):

- **`letsencrypt`** — cert-manager issues + renews a wildcard via DNS-01 or HTTP-01. Requires the
  ACME path to be reachable (DNS-01 needs your DNS provider's API token).
- **`provided`** — you supply a wildcard cert + key for `*.<baseDomain>` (placed in secrets, never in
  git). Choose this if your org issues certs centrally.
- Chosen mode: `__________` · (if `provided`) cert + key ready: ☐

### 4. Object store (HA)

S3-compatible bucket(s) + credentials, used by the LGTM stack (logs/metrics/traces) and PostgreSQL
backups. Backups are a [production-readiness](/operate/production-readiness#data-protection) gate.

- Endpoint: `__________` · Bucket(s): `__________` · Access key / secret: held in your vault ☐
- (Self-hosted? SeaweedFS is the recommended S3 — see [Reference architecture](/operate/reference-architecture).)

### 5. Load balancer (the ingress IP)

The gateway is reached through one LoadBalancer Service; its external IP is what `*.<baseDomain>`
points at. Pick the option that fits your environment:

- **Cloud LoadBalancer** — your cloud's native LB is provisioned automatically for the Service
  (`type: LoadBalancer`). Nothing to install.
- **Customer-provided / existing load balancer** — you already run an L4 LB (F5, HAProxy, NSX, a
  cloud LB you manage, etc.). Point it at the node IPs on the gateway's NodePorts (or hand the
  Service an external IP your LB fronts). Use this to fit the gateway into existing network plumbing.
- **MetalLB (bare-metal reference)** — no external LB available: MetalLB hands out an IP from a pool
  you own. The complete copy-paste path is in [Phase 0](#phase-0-provision-the-platform-rke2).
- Chosen option: `__________` · ingress IP (once known): `__________`

### 6. External identity provider (optional)

To broker SSO (OIDC/SAML) instead of local Keycloak users:

- Type: `__________` (OIDC / SAML) · client id + secret: held in your vault ☐
- Allowed email domain(s) (login is restricted to these): `__________`

### 7. LLM provider keys

At least one provider API key for the gateway to route to (kept in secrets, never in git):

- Provider(s): `__________` · key(s) held in your vault ☐

### 8. Tooling on your workstation

- `kubectl`, `helm` (pinned version — see [Upgrades](/operate/upgrades)), `helmfile`, `yq`, `jq`
- The TLS/secret tooling you chose (e.g. your DNS provider's token for DNS-01, or sealed-secrets/ESO
  for [secret-at-rest](/operate/shared-responsibility)).
- The released chart is pulled from `oci://ghcr.io/opsta/opsta-ai-gateway/charts` at a pinned
  `vX.Y.Z` — no repo clone needed for the install.

---

## The deployment flow

Each phase below follows the same shape: **intent → exact command → expected output → verification.**
The exact commands and observed outputs are captured from the validated end-to-end RKE2 run and land
here as each phase is completed.

### Phase 0 — Provision the platform (RKE2)
Install the RKE2 server on node 1; join the additional servers (HA control plane, odd count); join the
agent/worker nodes (≥3). Fetch the kubeconfig; confirm nodes Ready and the CNI enforces NetworkPolicy.
Confirm the default StorageClass (RWO) and that the object store is reachable. Stand up the ingress IP
via your chosen LoadBalancer option (cloud / provided LB / MetalLB).

### Phase 1 — Configure the appliance
Fill the values: `global.baseDomain`, `global.highAvailability=true`, `global.storageClass`, TLS mode,
`postgres.backup` (enabled + object store), SSO/IdP, LGTM object storage, image registry (+ air-gap
mirror if used). Create the secrets (the `secrets-values.yaml` pattern) — provider keys, IdP secret,
TLS material — as **placeholders here, sourced from your vault**.

### Phase 2 — Install
One `helmfile sync` sequences the whole stack via `needs:` (cert-manager → redis-operator → cnpg →
LGTM → opsta-ai-gateway → keycloak). Watch the rollout; confirm each component reaches its ready state.

### Phase 3 — Verify the install
DNS/TLS resolves; the gateway answers a **real** chat completion (a seeded key → 200); console SSO
login → admin home; Grafana → overview dashboard; Keycloak reachable; the control-plane reconcile is
healthy; the first backup job succeeded.

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
