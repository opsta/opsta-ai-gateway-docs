# First look

Opsta AI Gateway is a self-hosted product that runs on your own Kubernetes
cluster. Once it's deployed, every user interacts with it through a **web
console** — no command line needed.

## The console

Your gateway is reachable at `console.<your-domain>`. Log in with your
corporate account (Google Workspace, Microsoft Entra, or any OIDC/SAML
provider your org has connected). If your organisation hasn't connected an
identity provider yet, you're enrolled into a default workspace on first
login so you can start using the gateway immediately.

### What you see

- **Overview** — your month-to-date token usage, USD spent, remaining budget,
  and a per-model cost breakdown.
- **Profile** — your identity, groups, consumer mapping, and allowed models.
  Your profile is managed in Keycloak (your identity provider); edit it there
  and it updates here automatically.
- **API keys** — issue your own API key (shown once, copy it immediately).
  Keys can carry an optional expiry date. Revoke a key at any time; the change
  takes effect within about one second.
- **Connect a client** — the exact copy-paste configuration for opencode and
  Crush, pre-filled with your gateway URL and logical model aliases. Paste in
  your API key and you're connected.
- **Blocked requests** — if guardrails block one of your requests, see exactly
  why and report a false positive.

### What admins see

In the **Admin** section (visible only if you have the right role):

- **Organizations** — create and manage organisations. Each org is an isolated
  tenant with its own projects, members, and provider connections.
- **Org overview** — manage members, their roles (member / viewer / org_admin).
  An org_admin can add and remove members; granting org_admin is a platform
  admin action.
- **Projects** — configure every aspect of a project in tabbed panels:
  providers, model routing, guardrails, budgets and limits, and a review tab
  showing the effective configuration the gateway enforces.
- **Organization SSO** — connect your own identity provider so your users log
  in with their corporate account and land in the right group automatically.
- **Pricing** — view and override per-model pricing per 1M tokens. Changes
  persist across price syncs — no redeploy needed.
- **Platform Login Methods** — configure global login methods (Google,
  Microsoft Entra, any OIDC) that apply across the whole gateway.
- **Guardrail blocks** — see blocked requests across your org and tune the
  injection pattern rules.
- **Audit log** — every mutating action (create org, set budget, issue key,
  link IdP) recorded with who did it, what they did, and the outcome.

## Making your first request

1. Log into the console.
2. Go to **API keys** and issue a key.
3. Go to **Connect a client** and copy the opencode config.
4. Paste it into `~/.config/opencode/opencode.json` and start coding.

Or use curl directly:

```bash
curl https://api.<your-domain>/v1/chat/completions \
  -H "Authorization: Bearer sk-…your-key…" \
  -H "Content-Type: application/json" \
  -d '{"model":"coding-default","messages":[{"role":"user","content":"say hello"}]}'
```

The request passes through key authentication, guardrails, the model
allow-list, token metering, rate limiting, and your USD budget — then hits
the real provider. You get back a standard OpenAI-style completion.

## Trying it locally

The gateway runs on k3d (k3s in Docker) for local development and evaluation.
Clone the repository and run `task setup-dev` — it provisions a sample tenant
end to end with a real provider connection and an issued key, then prints the
exact client config. See the repository README for details.
