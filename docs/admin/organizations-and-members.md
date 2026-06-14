# Organizations & members

An **organization** is the top-level boundary — one enterprise customer, fully isolated. This page covers
creating organizations, managing members and roles, and grouping users.

::: info Who can do this
**Platform admins** create organizations and appoint org admins. **Org admins** manage members, roles, and
groups within their own organization.
:::

## Create an organization (platform admin)

1. Open **Organizations** under the Platform section.
2. Click **Create organization** and give it a name and slug.
3. Appoint one or more **org admins** by email — they receive admin rights scoped to this organization.

> 📸 **Screenshot:** the Organizations list with the create form — _placeholder; real capture pending._

## Manage members (org admin)

On **Organization → Members** you can:

- **Invite** a member by email.
- **Set a role** — `member` or `org_admin` (only a platform admin can grant `org_admin`).
- **Remove** a member.

Members are global identities; a person can belong to more than one organization, each with its own role.

> 📸 **Screenshot:** the Members tab with invite form and role dropdowns — _placeholder; real capture pending._

## Roles

| Role | Scope |
|---|---|
| **Platform admin** | All organizations; pricing; platform login methods; cross-org audit |
| **Org admin** | One organization — members, projects, providers, budgets, guardrails, MCP, IdP |
| **Member** | Personal portal — own keys, usage, blocked requests |

## Groups

On **Organization → Groups** you create groups (teams) that map from your identity provider. Groups are used
for **model access** and **budget aggregation**, and are assigned to projects. When you connect an identity
provider ([SSO & IdP](/admin/sso-and-idp)), users land in the right group automatically on first login.

## Next steps

- [Projects](/admin/projects) — configure what each team can do.
- [SSO & IdP brokering](/admin/sso-and-idp) — connect your corporate login.
