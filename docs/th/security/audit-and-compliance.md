> 🌐 **เอกสารภาษาไทยกำลังจัดทำ** — เนื้อหาด้านล่างเป็นภาษาอังกฤษชั่วคราว จนกว่าจะมีการแปล. _This page is not yet translated; English content is shown temporarily._

# Audit & compliance

Every mutating administrative action is recorded in a tamper-evident **audit log** — including actions that were
**denied**. The trail captures who did what, to what, with what outcome, giving you the evidence regulated
environments require.

::: info Who this is for
Compliance, audit, and security stakeholders, and the administrators who review the trail.
:::

## What's recorded

Each entry captures:

- **Actor** — the email and group membership of the person who acted.
- **Organization** — the tenant the action belongs to (stored as a stable slug, so it survives even if the org is
  later deleted).
- **Action** — a structured name, e.g. `provider.create`, `key.revoke`, `org.delete`.
- **Target** — what was acted on.
- **Outcome** — allowed or denied.
- **Status** — the HTTP result.

Denied attempts are recorded too — useful for detecting attempts to act outside one's permissions.

::: tip No secrets in the trail
The audit record captures the action, target, and outcome — never request bodies or credentials. The log itself
cannot leak the secrets it governs.
:::

## Who can read it

- **Org admins** read **their organization's** trail.
- **Platform admins** read **every** organization's trail, with an org filter.

Filter by actor, action prefix (e.g. `org.`, `key.`, `limit.`), and date range. See the admin-facing
[Audit log](/th/admin/audit-log) page for the console workflow.

## Retention

Audit retention is set centrally and defaults to a long window suited to on-prem compliance:

```yaml
audit:
  retentionDays: 365
```

The control plane prunes entries older than the window on a daily schedule. Set it to match your regulatory
requirement.

## Supporting compliance

The platform gives you the building blocks auditors look for:

- **Access control** — least-privilege [RBAC](/th/security/rbac) with verified identity.
- **Accountability** — this audit trail, including denials.
- **Data residency** — everything stays in your cluster ([Data sovereignty](/th/security/data-sovereignty)).
- **Encryption in transit** — TLS terminated in-cluster ([TLS & domains](/th/operate/tls-and-domains)).
- **Recoverability** — database backups and DR ([Backup & DR](/th/operate/backup-and-dr)).
- **Supply-chain assurance** — pinned, scanned images ([Hardening](/th/security/hardening)).

The platform supports your compliance program; certification against a specific framework depends on how you
operate the surrounding environment.

## Next steps

- [Audit log](/th/admin/audit-log) — read and filter the trail in the console.
- [RBAC model](/th/security/rbac) — the roles whose actions are audited.
- [Hardening](/th/security/hardening) — the controls behind the trail.
