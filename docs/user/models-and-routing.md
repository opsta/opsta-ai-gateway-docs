# Models & routing

You call the gateway with a **logical model name**, not a provider's raw model ID. The gateway resolves that
name to a configured provider and upstream model. This keeps your client stable even when an administrator
re-points a model behind the scenes.

## Logical models

A logical model is a stable alias your administrator defines per project — for example:

| Logical model | Typical use |
|---|---|
| `coding-default` | Day-to-day coding and reasoning |
| `bulk` | High-volume, lower-cost tasks |

Send the logical name in the `model` field; the gateway routes it to the right provider and real model. If the
administrator later swaps the underlying provider or model, **your code does not change**.

## Which models can I use?

Your **group** determines the models you're allowed to call. You can see your allowed models on your **Profile**
and on the **Connect a client** page. If you request a model your group isn't allowed, the gateway rejects the
request.

::: tip
Use the logical names your team agreed on (e.g. `coding-default`) rather than provider-specific IDs — it's the
stable contract and lets the platform optimize cost and routing without breaking your client.
:::

## Automated model routing (`auto`)

If your administrator has enabled it, you can send the special model **`auto`** and let the gateway pick
the right model **from your prompt** — a coding question routes to the coding model, a quick chat to a
cheaper one — so you don't have to choose:

```bash
curl https://api.<your-domain>/v1/chat/completions \
  -H "Authorization: Bearer $KEY" \
  -d '{"model":"auto","messages":[{"role":"user","content":"summarize this article in two sentences"}]}'
```

If no route is a confident match, the request falls back to a default model. Everything else — budgets,
limits, metering — works exactly as with a named model. Ask your admin which routes are configured for
your project (they can show you on **Projects → Auto Routing → Test a prompt**).

## Next steps

- [Connect a client](/user/connect-a-client) — send a request with a logical model.
- Administrators configure these in [Routing](/admin/routing) and [Auto routing](/admin/auto-routing).
