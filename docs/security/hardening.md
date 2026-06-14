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

## Hardening checklist

- [ ] OIDC issuer configured (identity verification on)
- [ ] `controlPlane.networkPolicy.enabled` and `observability.networkPolicy.enabled` on, with an enforcing CNI
- [ ] Secrets referenced from an external store, not committed values
- [ ] TLS from a trusted source; `letsencrypt-prod` or internal CA
- [ ] Admin access via group membership, email allowlist for break-glass only
- [ ] Backups configured and tested ([Backup & DR](/operate/backup-and-dr))
- [ ] Audit retention set to your policy ([Audit & compliance](/security/audit-and-compliance))

## Next steps

- [RBAC model](/security/rbac) · [Audit & compliance](/security/audit-and-compliance) ·
  [Data sovereignty](/security/data-sovereignty)
