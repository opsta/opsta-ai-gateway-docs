# Support

This page describes how to get help with Opsta AI Gateway, how to collect a diagnostics bundle
for support cases, and how to report security vulnerabilities.

::: info Who this is for
Platform engineers, IT operations, and procurement teams who need to understand the support model
before deploying in production.
:::

---

## Contact

| Channel | Address | For |
|---|---|---|
| **Support email** | `support@opsta.co.th` | All support requests (bugs, questions, upgrade guidance) |
| **Security disclosure** | `security@opsta.co.th` | Vulnerability reports (private, encrypted if needed) |
| **Security announcements** | `security-announce@opsta.co.th` | Subscribe for patch and EOL notices (low volume) |

---

## Support tiers

| Tier | Included with | Response SLA | Coverage |
|---|---|---|---|
| **Community** | Open-source / self-managed | Best-effort | GitHub Discussions + Issues; community forums |
| **Standard** | Opsta Enterprise License | 2 business days | Email support; bug fixes; upgrade guidance |
| **Priority** | Opsta Enterprise Plus License | 8 business hours | Same as Standard + escalation path; patch SLA commits |

Contact `sales@opsta.co.th` to enquire about Enterprise licensing.

::: info Security SLAs are separate from support tiers
Security vulnerability response (patch SLA) is defined in [Software lifecycle & support](/security/lifecycle)
and applies across all supported versions, independent of support tier.
:::

---

## What to include in a support request

The faster you provide the following, the faster we can help:

1. **Product version** — `helm list -n opsta-ai-gateway | grep opsta`
2. **Kubernetes version** — `kubectl version --short`
3. **Topology** — Standalone or HA; which Kubernetes distribution (k3s, RKE2, EKS, etc.)
4. **What you did** — the exact steps or commands that preceded the issue
5. **What happened** — the error message, status code, or unexpected behaviour
6. **What you expected** — the expected outcome
7. **Diagnostics bundle** — see below

---

## Collecting a diagnostics bundle

A diagnostics bundle captures pod logs, events, and basic cluster state — everything needed to
reproduce most issues. Run the following to collect it:

```bash
# Adjust namespace if you changed the defaults
NAMESPACES="opsta-ai-gateway higress-system opsta-observability opsta-keycloak"
BUNDLE_DIR="opsta-diag-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BUNDLE_DIR"

for NS in $NAMESPACES; do
  kubectl -n "$NS" get pods -o wide > "$BUNDLE_DIR/$NS-pods.txt" 2>&1
  kubectl -n "$NS" get events --sort-by=.metadata.creationTimestamp \
    > "$BUNDLE_DIR/$NS-events.txt" 2>&1
  for POD in $(kubectl -n "$NS" get pods -o name 2>/dev/null); do
    NAME=${POD#pod/}
    kubectl -n "$NS" logs "$NAME" --all-containers --timestamps \
      > "$BUNDLE_DIR/$NS-$NAME.log" 2>&1 || true
    kubectl -n "$NS" logs "$NAME" --all-containers --timestamps --previous \
      > "$BUNDLE_DIR/$NS-$NAME-prev.log" 2>&1 || true
  done
done

kubectl get nodes -o wide > "$BUNDLE_DIR/nodes.txt"
kubectl version >> "$BUNDLE_DIR/nodes.txt"
helm list -A > "$BUNDLE_DIR/helm-releases.txt"

tar czf "$BUNDLE_DIR.tar.gz" "$BUNDLE_DIR"
echo "Bundle: $BUNDLE_DIR.tar.gz"
```

Attach the `.tar.gz` to your support email. **Review it for secrets before sending** — the script
collects logs only, not Secrets objects, but application logs may occasionally include configuration
values. Redact anything sensitive before sending.

---

## Upgrade support

If you are running an unsupported version (see [Software lifecycle & support](/security/lifecycle)),
the first step in any support request is to upgrade to a supported minor. Opsta cannot reproduce
issues against versions that are no longer in the support window.

For upgrade guidance, contact `support@opsta.co.th` with your current and target version — we will
confirm whether any sequential steps are needed between them.

---

## Related pages

- [Software lifecycle & support](/security/lifecycle) — patch SLA, version support windows, EOL policy
- [Upgrades](/operate/upgrades) — upgrade procedure and rollback (including forward-only migration caveat)
- [Troubleshooting](/operate/troubleshooting) — common failure modes and self-service fixes
- [Backup & DR](/operate/backup-and-dr) — backup before upgrading; restore procedure
