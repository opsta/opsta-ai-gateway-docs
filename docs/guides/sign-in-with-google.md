# Sign in with Google (and other IdPs)

Each organization connects its **own** identity provider — Google Workspace,
Microsoft Entra, Okta, any OIDC or SAML — through the console. Users in that org's
email domain then log in with their corporate account; they're provisioned into
the right org, group, and role on first login (JIT). This is **one mechanism** for
every org, including the operator's own.

## How an org admin connects Google

1. In the console, go to **Admin → Identity providers**.
2. Add a connection:
   - **Type** — OIDC
   - **Discovery URL** — `https://accounts.google.com/.well-known/openid-configuration`
   - **Client ID / Client secret** — from your Google Cloud OAuth client
   - **Email domain(s)** — e.g. `opsta.co.th` (claimed by your org; another org
     can't claim the same domain)
3. Save. Users at `@opsta.co.th` can now sign in with Google.

## What happens under the hood

The console never touches Keycloak directly. When you save, the control plane:

1. Writes the connection metadata to its database and the **client secret** to a
   per-org Kubernetes Secret (never in git, never in the database).
2. Runs its reconcile loop, which calls the Keycloak Admin API to provision a
   **Keycloak Organization** (carrying your verified domain) and a **brokered
   Identity Provider** linked to it — for Google, a `providerId: google` with the
   hosted-domain pin, trusted email, and just-in-time first login.

At login, a user enters their email; Keycloak **Organizations** matches the domain
and routes them to Google. After they authenticate, first-broker-login creates the
user and applies the org/group/role mappings.

## One out-of-repo step

In your Google Cloud OAuth client, register the broker redirect URI. The broker
alias is **`<org>-<connectionId>`** (org-namespaced), so for org `opsta` with a
connection id `google` it is `opsta-google`:

```
https://auth.<your-domain>/realms/<realm>/broker/<org>-<connectionId>/endpoint
# e.g. https://auth.ai-gateway.example/realms/opsta/broker/opsta-google/endpoint
```

That is the **only** redirect URI Google needs — logins flow through Keycloak, so
Google only ever redirects back to the Keycloak broker endpoint (never to the
console or Grafana directly). (Same idea for any other OIDC/SAML provider — register
the org's broker endpoint with that provider.)

## Why there's no separate "platform login"

The operator's own staff (e.g. an `opsta.co.th` Workspace) log in through the
*same* per-org connection — there is deliberately no second, chart-level way to
wire SSO. One path to learn, one path to operate, no drift between "how we log in"
and "how customers log in".
