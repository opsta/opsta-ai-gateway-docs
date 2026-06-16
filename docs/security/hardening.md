# Hardening

The platform ships with secure defaults across identity, internal-service trust, network isolation, secret
handling, input validation, and the software supply chain. This page is the operator's checklist for keeping a
production deployment locked down.

::: info Who this is for
Platform engineers and security reviewers hardening a production installation.
:::

## Verified identity

The configuration API authorizes on a **verified token**, not on trust-me headers. When an OIDC issuer is
configured, the control plane fetches the issuer's signing keys and verifies each request's token signature and
claims (issuer, audience, expiry) before deriving the caller's identity and role. Requests without a valid token
are rejected. This closes header-spoofing as an escalation path — see [RBAC model](/security/rbac).

::: tip Configure the OIDC issuer in production
With identity verification enabled, the platform stops trusting forwarded identity headers entirely. Always run
production with a real issuer configured.
:::

## Internal-service authentication

Calls between platform components require a **shared internal secret**, checked with a constant-time comparison.
Data-plane ingest endpoints (usage, cache hits, guardrail blocks) are gated by their own tokens. Health and
readiness probes are the only exempt endpoints.

## Network isolation

Default-deny network policies restrict who can reach sensitive services:

```yaml
controlPlane:
  networkPolicy:
    enabled: true     # only the console and gateway may reach the control-plane API
observability:
  networkPolicy:
    enabled: true     # only the auth proxy may reach the telemetry backends
```

::: warning Needs an enforcing CNI
Network policies are only effective on a CNI that enforces them. Lightweight CNIs (k3d/flannel) ignore them — the
platform still runs, but you lose this layer. Use an enforcing CNI in production.
:::

## Secret hygiene

- Keep credentials **out of git**. Either let the chart create Secrets from a **separate, git-ignored** values
  file (`secrets.createFromValues: true`), or reference **pre-existing Secrets** managed by Vault/sealed-secrets
  (`secrets.createFromValues: false`) — the recommended production mode.
- Provider API keys are stored as Kubernetes Secrets and injected at the gateway; they aren't exposed to other
  tenants.
- The audit log never records bodies or credentials ([Audit & compliance](/security/audit-and-compliance)).

## Request-level safety

The configuration API applies an outer guard on mutating requests:

- A global **rate limit** (token bucket), coordinated across replicas when Redis is enabled.
- A **body-size cap** on mutating methods.
- **Input validation** on identifiers (e.g. organization and project slugs).

The data-plane gateway buffers request bodies up to a configurable max (`gateway.maxRequestBytes`, default
10 MiB) and rejects larger payloads.

## TLS everywhere

TLS terminates in-cluster with a certificate you control — Let's Encrypt, your own, or self-signed for air-gap.
See [TLS & domains](/operate/tls-and-domains). The console also sets strict security response headers.

## Supply chain

- Every image is **pinned** to an explicit, tested version as part of the product's component matrix.
- Images are **scanned** for HIGH/CRITICAL vulnerabilities; releases gate on the results.
- Build-once / promote-by-retag means the **exact digest** that was tested is the one you run — see
  [Upgrades](/operate/upgrades).
- For air-gap, mirror the pinned set into your own registry ([Air-gapped install](/operate/air-gap)).

## Encryption matrix

| Channel / store | Encryption | Status | Notes |
|---|---|---|---|
| **Client → Higress gateway** | TLS 1.2+ at ingress | **Shipped** | cert-manager cert; customer-controlled |
| **Browser → Higress (console · Grafana · auth)** | TLS 1.2+ at ingress | **Shipped** | same wildcard cert |
| **Higress → LLM providers** | HTTPS (TLS 1.2+) | **Shipped** | enforced by the upstream's TLS |
| **Higress → control plane (internal)** | Plain HTTP (cluster-internal) | Cluster-net isolation | No mTLS today; NetworkPolicy restricts callers |
| **Control plane → PostgreSQL** | TLS (`PGSSLMODE=require`) | **Shipped** | CNPG generates self-signed CA |
| **Control plane → Redis** | Plain TCP (cluster-internal) | Cluster-net isolation | No TLS; NetworkPolicy restricts callers |
| **PostgreSQL data at rest** | Depends on StorageClass | **Customer** | PVC encryption is storage-class-level; most cloud CSIs support it |
| **Redis data at rest** | Depends on StorageClass | **Customer** | Same as Postgres — storage-class PVC encryption |
| **Kubernetes Secrets at rest** | base64 (NOT encrypted) | **Customer (G3)** | Requires etcd encryption, sealed-secrets, or ESO |
| **Object store (LGTM / backups)** | Depends on bucket config | **Customer** | Enable server-side encryption in your S3 bucket |
| **Intra-cluster mTLS** | None (no service mesh) | **Customer (optional)** | Add Istio/Linkerd for full mTLS mesh; not required by the product |

## Pod security posture (securityContext)

The chart applies the same hardened security contexts to all Opsta-built workloads via shared Helm helpers.
Third-party sub-charts (Higress, Keycloak, LGTM operators) have their own security contexts — see those charts.

**Pod-level securityContext** (applied to all control-plane, console, and observability proxy pods):

```yaml
runAsNonRoot: true
runAsUser: 65532       # nobody equivalent
runAsGroup: 65532
fsGroup: 65532
seccompProfile:
  type: RuntimeDefault  # syscall allowlist via seccomp
```

**Container-level securityContext** (applied to all containers in Opsta-built pods):

```yaml
allowPrivilegeEscalation: false
readOnlyRootFilesystem: true
runAsNonRoot: true
capabilities:
  drop:
    - ALL               # no Linux capabilities retained
seccompProfile:
  type: RuntimeDefault
```

**Pod Security Standards (PSS) alignment:**

| PSS level | Opsta-built workloads | Notes |
|---|---|---|
| **Baseline** | Met | Non-root, no host namespaces, no privileged containers |
| **Restricted** | Largely met | `runAsNonRoot`, `drop ALL`, `readOnlyRootFilesystem`, `seccompProfile: RuntimeDefault` |
| **Restricted (strict)** | Partial | Higress gateway requires host-port access for port 80/443 (may need `hostPorts` exception in `Restricted` namespace policy) |

To apply a namespace-level Pod Security Admission policy in production:

```bash
kubectl label namespace opsta-ai-gateway \
  pod-security.kubernetes.io/enforce=restricted \
  pod-security.kubernetes.io/warn=restricted
```

Test with `--dry-run=server` and check for violations before enforcing.

## Egress allowlist

At runtime the gateway makes outbound connections only to destinations **you control or explicitly configure**.
The minimal production egress allowlist (for NetworkPolicy `Egress` rules or a firewall):

| Destination | Port | When | Purpose |
|---|---|---|---|
| Your configured LLM provider endpoints | 443 | Always | Forwarding chat-completion requests |
| Your configured MCP server endpoints | 443 (or custom) | If MCP servers configured | MCP tool calls |
| `acme-v02.api.letsencrypt.org` | 443 | `tls.mode: letsencrypt` only | ACME certificate issuance |
| Kubernetes API server (`kubernetes.default.svc`) | 443 | Always (operators) | Operator reconcile loops (CNPG, Redis, cert-manager) |
| Your configured OIDC/SAML IdP endpoints | 443 | SSO configured | Keycloak broker OIDC discovery + token exchange |
| Your S3-compatible object store | 443 | HA + backups enabled | LGTM blocks + Postgres WAL archiving |
| Your image registry | 443 | Image pulls | Applies only if `imagePullPolicy: Always` is active |

**No outbound connection to Opsta.** There is no telemetry, no license check, and no call-home.

For air-gapped clusters, configure `tls.mode: provided` or `selfsigned`, and ensure the image registry is your
internal mirror. After installation, the only required egress is to your LLM providers and IdP.

## Supply chain (G8 — current state and interim controls)

::: warning Image signing and SBOM are roadmap items
Images are built, scanned, and promote by retag (dev → uat → vX.Y.Z). **No cosign signatures, no published
SBOM, and no SLSA provenance attestations are available yet.** This is a known gap (G8 in the
[Shared responsibility matrix](/operate/shared-responsibility.md)).
:::

**Current controls (interim):**

- **Version-pinned component matrix** — every image is pinned to an explicit tag in `version.yaml`; no
  `latest` or floating tags in production.
- **Build-once / promote-by-retag** — the exact image digest tested on `dev` is what ships to prod; no
  rebuilds between environments reduce the window for supply-chain injection.
- **Trivy SCA + IaC scan** — run in CI on every push; gates on HIGH/CRITICAL findings.
- **gosec Go SAST** — run on every Go change in CI; gates on HIGH/CRITICAL.
- **Apache-2.0/MIT dependencies only** — enforced by `task license-check` in the pre-commit hook.
- **Digest pinning (recommended customer control)** — pin the chart to the specific OCI digest rather than the
  version tag in your `helmfile.yaml`; verify the digest against the release notes before updating.

Image signing, SBOM publication, and SLSA provenance are tracked in the product roadmap.

## Hardening checklist

- [ ] OIDC issuer configured (identity verification on)
- [ ] `controlPlane.networkPolicy.enabled` and `observability.networkPolicy.enabled` on, with an enforcing CNI
- [ ] Secrets referenced from an external store, not committed values; etcd encryption enabled (G3)
- [ ] TLS from a trusted source; `letsencrypt-prod` or internal CA
- [ ] StorageClass with at-rest encryption enabled for PostgreSQL and Redis PVCs (customer)
- [ ] S3 bucket server-side encryption enabled (HA / backups)
- [ ] Admin access via group membership, email allowlist for break-glass only
- [ ] Egress NetworkPolicy applied (restrict to allowlist above)
- [ ] Pod Security Admission label applied to `opsta-ai-gateway` namespace
- [ ] Backups configured and tested ([Backup & DR](/operate/backup-and-dr))
- [ ] Audit and guardrail-block retention set to your policy (G4)
- [ ] Chart pinned to OCI digest in your helmfile (interim supply-chain control, G8)

## Next steps

- [RBAC model](/security/rbac) · [Audit & compliance](/security/audit-and-compliance) ·
  [Data sovereignty](/security/data-sovereignty) · [Software lifecycle & support](/security/lifecycle)
