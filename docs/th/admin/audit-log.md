> 🌐 **เอกสารภาษาไทยกำลังจัดทำ** — เนื้อหาด้านล่างเป็นภาษาอังกฤษชั่วคราว จนกว่าจะมีการแปล. _This page is not yet translated; English content is shown temporarily._

# Audit log

The audit log records **every mutating administrative action** — including denied attempts — so you have a
complete, filterable trail of who changed what, and when.

::: info Who can see this
**Org admins** see their organization's audit trail. **Platform admins** see every organization, with an org
filter.
:::

## What's recorded

Each entry captures the **actor** (email and groups), the **organization**, the **action** (e.g.
`provider.create`, `key.revoke`, `org.delete`), the **target**, the **outcome** (allowed or denied), and the
**HTTP status**. Denied attempts are recorded too — useful for spotting unauthorized activity.

## Filter and read

1. Open **Audit log** (Organization section; platform admins can add an org filter).
2. Filter by **actor** (email), **action** prefix (e.g. `org.`, `key.`, `limit.`), and **date range**.
3. Page through results.

> 📸 **Screenshot:** the Audit log with filters and the actor/action/outcome columns — _placeholder; real capture pending._

## Retention

The platform operator sets how long audit entries are kept — see [Audit & compliance](/th/security/audit-and-compliance).

## Next steps

- [RBAC model](/th/security/rbac) — the roles whose actions are audited.
- [Audit & compliance](/th/security/audit-and-compliance) — retention and compliance use.
