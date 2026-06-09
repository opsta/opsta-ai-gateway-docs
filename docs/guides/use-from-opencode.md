# Use the gateway from opencode

Once an admin has [connected a provider](./connect-a-provider) and mapped a
logical model, a project user points their client at the gateway, requests the
**logical alias**, and gets a real provider response — through the full
governance chain.

## Get your API key

Each project user has their **own** key (the gateway identifies the consumer as
`org.project.user`). Issue it in the console (**Keys**), or an admin can issue one
via the control-plane API. The key authenticates you *and* binds your usage to
your budget.

## Point opencode at the gateway

Add the gateway as an OpenAI-compatible provider in
`~/.config/opencode/opencode.json`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "opsta": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "Opsta AI Gateway",
      "options": {
        "baseURL": "https://api.<your-domain>/v1",
        "apiKey": "sk-…your-key…"
      },
      "models": { "coding-default": { "name": "coding-default" } }
    }
  }
}
```

`coding-default` is the **logical alias**, not a real model name. The gateway
rewrites it to the project's upstream model (e.g. `deepseek-chat`) and injects the
project's provider key.

## Or just curl it

```bash
curl https://api.<your-domain>/v1/chat/completions \
  -H "Authorization: Bearer sk-…your-key…" \
  -H "Content-Type: application/json" \
  -d '{"model":"coding-default","messages":[{"role":"user","content":"say hello"}]}'
```

You get back a normal OpenAI-style completion — served by the real provider
(e.g. DeepSeek), but only after the request passed auth, the model allow-list,
guardrails, token metering, your token rate-limit, and your USD budget.

## What you'll see if a gate stops you

| Response | Which gate | Meaning |
|---|---|---|
| `401` | key-auth | missing / revoked / expired key |
| `403` (model) | model allow-list | your group isn't allowed that model |
| `403` (budget) | USD budget | your dollar cap is spent |
| `429` | token rate-limit | per-minute token ceiling hit |
| `200` | — | served by the real provider |

## Dev box: one-command bring-up

On a local dev cluster, `task setup-dev` provisions a sample tenant end-to-end
(org + project + a real DeepSeek provider from your git-ignored secrets + a user
with a `$20` budget + an issued key) and prints the exact opencode config above —
so you can go from a fresh cluster to a real round-trip in one step.
