# Software lifecycle & support

This page states Opsta AI Gateway's security-response and lifecycle policy — the patch SLA,
component support windows, and end-of-life terms your security and procurement teams need before
signing off a production deployment.

::: info Who this is for
Security teams (patch SLA), procurement and IT governance (version support), and operators
(when to upgrade, when a version goes EOL).
:::

---

## Security response

### Vulnerability disclosure

Opsta tracks CVEs and security findings against all components in the product's version matrix
(Higress, CloudNativePG, Redis, Keycloak, Grafana/LGTM, cert-manager, the control-plane + console
images, and all Go + Node.js dependencies).

**How to report a vulnerability in Opsta AI Gateway:**
Email `security@opsta.co.th` with a description of the finding, affected versions, and reproduction
steps. We acknowledge within 2 business days and provide a remediation ETA within 5 business days.

### Patch SLA

| Severity | Response | Fix target |
|---|---|---|
| **Critical (CVSS ≥ 9.0)** | Acknowledge ≤ 24 h | Patch release within **7 calendar days** |
| **High (CVSS 7.0–8.9)** | Acknowledge ≤ 2 business days | Patch release within **30 calendar days** |
| **Medium (CVSS 4.0–6.9)** | Tracked in next minor release | Next scheduled minor |
| **Low (CVSS < 4.0)** | Tracked in backlog | Best-effort |

A "patch release" means a new product version with the affected component updated and re-tested
against the full component matrix. It is published to `oci://ghcr.io/opsta/opsta-ai-gateway/charts`
and announced in the [release notes](/releases/).

::: info CI enforcement
All HIGH and CRITICAL findings in container images (Trivy SCA) and Go code (gosec) block CI. No
release ships with a known HIGH/CRITICAL finding — findings must be fixed, not suppressed, unless a
written justification is recorded in the code or `.trivyignore`.
:::

### How to get notified

- **Watch** the `opsta/opsta-ai-gateway` GitHub repository for releases (GitHub → Releases → Watch).
- **Check the [release notes](/releases/)** — every release lists security fixes.
- Subscribe to the mailing list at `security-announce@opsta.co.th` (low-volume, security and EOL
  notices only).

---

## Version support windows

| Release channel | Support window | Notes |
|---|---|---|
| **Current minor (x.Y.z)** | Active — patches backported | The current latest minor receives all patch fixes |
| **Previous minor (x.Y-1.z)** | Security patches only, 90 days after next minor | Only Critical/High fixes backported |
| **Older versions** | **Unsupported** | Upgrade to the current minor |

Opsta follows [Semantic Versioning](https://semver.org/):
- `patch` (z) — bug fixes and security patches; always safe to apply.
- `minor` (Y) — backward-compatible new features; safe to apply; review the release notes.
- `major` (X) — may include breaking changes; follow the upgrade guide.

**Current supported versions:** see the [release notes](/releases/) for the latest and previous
minor.

---

## Component EOL policy

The product's `version.yaml` pins a tested component matrix. When an upstream component reaches its
EOL (e.g. a Kubernetes minor going out of support, a Keycloak version losing community patches),
Opsta will:

1. Publish a notice in the release notes at least **60 days** before the component EOL date.
2. Release a version that bumps the component to a supported version within **30 days** of the
   upstream EOL (or earlier if a security finding forces it).
3. Mark the product version that contains the EOL component as **unsupported** on the upstream EOL
   date.

**Kubernetes version support:** the product supports the **three most recent Kubernetes minor
versions** in the tested matrix. When a K8s minor goes out of upstream support, it is removed from
the tested matrix in the next product minor.

---

## Upgrade expectations

- **Patch releases (z):** apply promptly. They are safe, backward-compatible, and may include
  security fixes within the patch SLA above.
- **Minor releases (Y):** apply within **90 days** of release to stay in the support window.
- **Schema migrations are forward-only.** Always take a database backup before upgrading. See
  [Upgrades](/operate/upgrades) and the forward-only-migration note (G7 in the
  [Shared responsibility matrix](/operate/shared-responsibility.md)).

---

## Interim controls while on an older version

If you cannot upgrade within the patch SLA:

1. Apply any available Kubernetes `NetworkPolicy` or WAF rule to mitigate the exploit path.
2. Monitor the CVE's public PoC and threat-intel feeds for active exploitation.
3. Contact `security@opsta.co.th` for guidance on a compensating control specific to your
   deployment.

---

## Related pages

- [Hardening](/security/hardening) — supply-chain current state, encryption matrix
- [Upgrades](/operate/upgrades) — upgrade procedure and rollback
- [Shared responsibility & maturity](/operate/shared-responsibility.md) — G8 (supply-chain), G10 (this policy)
- [Release notes](/releases/) — version history and security fixes
