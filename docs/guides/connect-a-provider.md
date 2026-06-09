# Connect an AI provider

An admin connects any AI provider to a **project** in the console; the control
plane reconciles it into the gateway automatically. You never edit Higress or
Kubernetes by hand — you fill a form, and the data plane is wired within ~1s.

## What you configure

A project owns its providers. For each provider you give:

- **Type** — `deepseek`, `openai-compatible` (any OpenAI-style endpoint),
  `anthropic`, or `generic`.
- **Base URL** — e.g. `https://api.deepseek.com`.
- **API key** — stored in a per-project Kubernetes Secret, **never** in the
  database or git.

Then you map one or more **logical models** (aliases your users request) to a
provider + the provider's real upstream model:

| Logical model | Provider | Upstream model |
|---|---|---|
| `coding-default` | `deepseek` | `deepseek-chat` |
| `bulk` | `deepseek` | `deepseek-chat` |

A user only ever sends the logical alias (`coding-default`); the gateway rewrites
it to the real model and injects the project's key on the way out.

## In the console

1. Go to **Admin → Projects**, pick (or create) a project.
2. Under **Providers**, choose a preset (e.g. *DeepSeek*) or fill the fields,
   paste the API key, **Add provider**. Use **Test** to probe reachability.
3. Under **Model routes**, map a logical model → provider → upstream model.

That's it. Behind the scenes the control plane writes the route + the egress
upstream into Higress (a Gateway-API `HTTPRoute` to the provider, the per-project
key injected, the model rewritten). No `kubectl`, no Higress edit.

## What a request flows through

Every call a project user makes traverses the full enterprise chain before it
leaves the cluster:

```
key-auth → model allow-list → guardrails (PII mask, prompt-injection)
  → token metering → token rate-limit → USD budget → audit → egress
```

So the provider only ever sees authenticated, in-budget, allow-listed,
guard-railed traffic — and the project's key, not the user's.

## Provider keys stay isolated

Each project's provider key lives in its own Kubernetes Secret. Two projects can
both expose a `coding-default` alias pointing at **different** providers; routing
is keyed by the authenticated consumer (`org.project.user`), so a user always
reaches *their* project's provider.

Next: [use it from opencode](./use-from-opencode).
