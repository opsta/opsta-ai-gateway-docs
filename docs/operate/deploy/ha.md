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

## Validation status

::: info What's been run for real
The **appliance install + data path** (Phases 1–3) are validated from scratch on a clean cluster at
v1.12.0 (clean `helmfile sync` → all core pods Running → 120/120 governed chat completions at `200`,
guardrails blocking). The **released-OCI-chart** install path is exercised by every production deploy.
**Still pending a real multi-node cluster:** the HA-specific behaviors (3-node replica spread +
anti-affinity, clustered Postgres/Redis failover, object-storage LGTM, an external LoadBalancer, and
the backup **restore drill**) — these can't be proven on a single node and are marked where they apply.
:::

## The deployment flow

Each phase follows the same shape: **intent → exact command → expected output → verification.** The
exact commands + observed outputs are captured from the validated run.

### Phase 0 — Provision a conformant cluster
Stand up an HA Kubernetes cluster on your chosen platform (table above) with: ≥3 worker nodes; a
NetworkPolicy-enforcing CNI; a default RWO StorageClass; a reachable object store (HA); and an ingress
IP via your chosen LoadBalancer option. **On-prem Rancher/RKE2 is Opsta's default** — your Opsta SE
provisions it from Opsta's internal cluster runbooks (compute → RKE2 → Rancher → downstream). For
OpenShift/Tanzu or a managed cloud (GKE/AKS/EKS/CCE/OKE), provision per that platform's docs. The rest
of this runbook is identical regardless of how the cluster was created.

### Phase 1 — Configure the appliance

**Intent:** set the values and secrets the install reads. Two files: a values file (non-secret config)
and a git-ignored `secrets-values.yaml` (credentials).

1. **Values.** Set at minimum:
   ```yaml
   global:
     baseDomain: <your-domain>          # e.g. ai-gateway.example.com
     highAvailability: true             # HA; false for the standalone quick-start
     storageClass: <your-default-sc>
   tls:
     mode: letsencrypt                  # or "provided" (you supply the wildcard cert)
   postgres:
     backup: { enabled: true }          # + object store (see secrets); a readiness gate
   ```
2. **Secrets** (the `secrets-values.yaml` pattern — never commit it):
   ```bash
   cp secrets-values.example.yaml secrets-values.yaml
   ./gen-secrets.sh secrets-values.yaml        # fills GENERATE placeholders with strong values
   # then edit secrets-values.yaml: provider API key(s), IdP client secret, object-store creds,
   # and (if tls.mode=provided) the wildcard cert + key. Source them from your vault.
   ```
   `secrets.createFromValues: true` turns these into Kubernetes Secrets at install.
3. **Image pull.** The released images are private; create the GHCR pull secret the chart references:
   ```bash
   kubectl create secret docker-registry ghcr-pull -n higress-system \
     --docker-server=ghcr.io --docker-username=<user> --docker-password=<token-with-read:packages>
   ```

::: tip Verified
The values + `secrets-values.yaml` + `gen-secrets.sh` + `createFromValues` flow is the one the product
installs from in every environment (dev and the live prod deploy).
:::

### Phase 2 — Install

**Intent:** install the Gateway API CRDs, then sync the whole appliance from the released OCI chart in
one command (it sequences the operators → gateway → keycloak via `needs:`).

```bash
# 1. Gateway API CRDs (server-side: the HTTPRoute CRD exceeds kubectl's client-side limit)
kubectl apply --server-side --force-conflicts -f \
  https://github.com/opsta/opsta-ai-gateway/raw/v1.12.0/manifests/crds/gateway-api/experimental-install.yaml

# 2. Log in to the chart/image registry, then sync the appliance at the pinned version
echo "$GHCR_TOKEN" | helm registry login ghcr.io -u <user> --password-stdin
PRODUCT_VERSION=v1.12.0 helmfile -e <your-env> sync --sync-args "--server-side=false --timeout 20m"
```

`helmfile sync` installs cert-manager → redis-operator → cnpg → LGTM → opsta-ai-gateway → keycloak in
dependency order. Watch the rollout:

```bash
kubectl get pods -A
```

**Expected:** every component reaches Running. On a from-scratch standalone install of v1.12.0
(validated on a clean cluster) this settles at **all core pods Running** — Higress gateway +
controller, control-plane, console, Postgres (cnpg), Redis, Keycloak, and the LGTM stack
(mimir/loki/tempo/grafana/alloy) — with the WasmPlugin chain programmed (`kubectl get wasmplugin -A`
shows key-auth, ai-statistics, model-router, the guardrail/cache/MCP plugins, etc.).

### Phase 3 — Verify the install

**Intent:** prove the data path works, not just that pods are up.

```bash
# Real governed chat completion through the gateway with a project key → HTTP 200
curl -s https://api-<baseDomain>/v1/chat/completions \
  -H "Authorization: Bearer <project-key>" -H 'Content-Type: application/json' \
  -d '{"model":"<your-model>","messages":[{"role":"user","content":"say hello"}]}'
```

**Expected:** a `200` with a normal completion body. Then confirm the surfaces:

- **API** answers governed traffic — validated end-to-end: **120/120 seeded chat completions returned
  `200`, and 3/3 prompt-injection attempts were blocked** by guardrails.
- **Console** (`https://console-<baseDomain>/`) → SSO login → admin home renders.
- **Grafana** (`https://grafana-<baseDomain>/`) → overview dashboard shows token/spend panels.
- **Keycloak** (`https://auth-<baseDomain>/`) reachable; control-plane reconcile healthy.
- **(HA)** the first PostgreSQL backup job succeeded (see [Backup & DR](/operate/backup-and-dr)).

::: tip Verified
This phase was run from scratch on a clean cluster against the v1.12.0 release: clean `helmfile sync`,
all core pods Running, and 120/120 governed completions at `200`. The released-OCI-chart install path
is additionally exercised by every production deploy.
:::

### Phase 4 — Day-1 configuration

**Intent:** make the gateway usable — an admin signs in, identity is wired, and a first project + key
serves governed traffic. Each step links the detail page; do them in this order.

1. **Sign in as the bootstrap admin.** Open `https://console-<baseDomain>/` and sign in. The
   break-glass/bootstrap admin is set at install (`controlPlane.bootstrapAdmin`); store its credential
   in your vault. See the [Console tour](/admin/console-tour).
2. **Wire the external IdP + restrict the email domain** so staff log in via your SSO and only your
   domain(s) are allowed. See [SSO & IdP brokering](/admin/sso-and-idp).
3. **Create an organization → project → members.** See
   [Organizations & members](/admin/organizations-and-members).
4. **Issue a project API key** (one key for chat and tools). See [Manage API keys](/user/api-keys).
5. **Set a budget** and **enable guardrails** for the project. See
   [Budgets & limits](/admin/budgets-and-limits) and [Guardrails](/admin/guardrails).
6. **Prove it end-to-end:** hand the key to an app ([Connect a client](/user/connect-a-client)), send a
   request, and confirm it flows and appears in usage. (This is the same governed `200` path verified
   in Phase 3.)

### Phase 5 — Production hardening sign-off

**Intent:** the go-live gate. Walk the [Production-readiness checklist](/operate/production-readiness)
top to bottom and record the result:

- Confirm every checklist item, or log it as an accepted risk with an owner (see the
  [Shared-responsibility & maturity matrix](/operate/shared-responsibility) for what you vs. Opsta own).
- **Record RTO/RPO** from the [backup restore drill](/operate/backup-and-dr).
- Confirm **alerts are wired to your paging** ([Platform observability](/operate/observability-platform)).
- Assign **secret-rotation owners** for provider keys, IdP secrets, and TLS material.

Sign the checklist's sign-off table; you're in production.

---

## Appendices

- **Appendix A — Standalone / PoC quick-start** — the diffs from the HA flow: one node,
  `global.highAvailability=false` (1 replica per component, no PDB/anti-affinity), backups optional,
  single-binary LGTM (Loki/Tempo single-binary + the all-in-one Mimir chart). Same Phase 1–3 commands;
  just the standalone values. This is the shortest path to a demo and is the configuration validated
  end-to-end above (32 pods Running, 120/120 governed completions at `200`).
### Appendix B — Air-gap
No outbound internet: mirror the chart + every image into your internal registry (e.g. Harbor) and
point the install at it, plus the LLM-provider egress allowlist. Full procedure:
[Air-gapped install](/operate/air-gap).

### Appendix C — BYO operators (advanced)
Reuse an existing CloudNativePG / Redis / cert-manager operator instead of the bundled ones (toggles in
values). The appliance is still one support boundary, but the operator lifecycle becomes yours. See
[Reuse existing operators](/operate/byo-operators).

### Appendix D — Upgrade & rollback
Upgrade = bump `PRODUCT_VERSION` and re-run `helmfile -e <env> sync`. **Always back up the database
first** — control-plane migrations are **forward-only at runtime**, so a rollback across a schema
change is not automatic (see [Shared-responsibility](/operate/shared-responsibility#upgrade-reversibility)).
Full upgrade/rollback procedure: [Upgrades](/operate/upgrades).

### Appendix E — Uninstall / teardown
```bash
# Remove the appliance releases (keeps the cluster)
helmfile -e <your-env> destroy
# PVCs are retained by default — delete them to remove data (irreversible):
kubectl get pvc -A | grep -E 'opsta|observability|cnpg|redis'
# kubectl delete pvc <name> -n <ns>   # only when you mean it
```
Then delete the cluster per your platform (e.g. via Rancher, or your cloud console).

### Appendix F — Troubleshooting
Common failures per phase, and the standard diagnostics to gather (`kubectl get pods -A`,
`kubectl describe`, `kubectl logs`, `kubectl get events -A --sort-by=.lastTimestamp`,
`helm -n <ns> history <release>`): [Troubleshooting](/operate/troubleshooting).
