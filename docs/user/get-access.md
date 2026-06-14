# Get access

This page is for **developers** who want to use the gateway. It covers signing in, what your account gives you,
and where to go next.

## Sign in

Open the web console at `https://console.<your-domain>` and sign in with your **corporate single sign-on**
(Google Workspace, Microsoft Entra, or your organization's identity provider). There is no separate password to
manage — your identity comes from your company login.

On first sign-in you are placed into the right **organization** and **group** automatically, based on your
identity-provider groups. No per-user setup is required.

::: info Prerequisite
Your administrator must have invited your email to an organization (or configured your identity provider to
provision members on first login). If you see an "account isn't linked" message, contact your org admin — see
[Organizations & members](/admin/organizations-and-members).
:::

## What your account gives you

Once signed in, the **Overview** is your dashboard. From the portal you can:

- See your **usage and budget** — tokens used and USD spent vs. your remaining budget, per model. See
  [Usage & budget](/user/usage-and-budget).
- View your **profile** — your name, email, team/group, and the models your group is allowed to use.
- Issue and manage your own **[API keys](/user/api-keys)**.
- Get the exact config to **[connect a client](/user/connect-a-client)** (opencode, Crush, or any
  OpenAI-compatible SDK).
- Review your **[blocked requests](/user/blocked-requests)** if a guardrail rejected something.

![The Profile page](/images/profile.png)

## Next steps

- [Connect a client](/user/connect-a-client) — start sending requests.
- [Manage API keys](/user/api-keys) — issue your first key.
