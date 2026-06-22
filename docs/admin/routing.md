# Routing

Routing maps the **logical model** a client requests (e.g. `coding-default`) to a **provider** and an
**upstream model**. This indirection is the stable contract: clients use logical names, and you re-point them
without changing any client code.

::: info Who can do this
**Org admins** (for their organization) and **platform admins**, on **Projects → Routing**.
:::

## Add a route

1. Open **Projects → Routing**.
2. Click **Add route**.
3. Set the **logical model** (the name clients send, e.g. `coding-default` or `bulk`).
4. Choose the **provider** ([added here](/admin/providers)) and the **upstream model** that provider serves.
5. (Optional) Set a **Reasoning effort** (none / low / medium / high). When set, the gateway adds a
   default `reasoning_effort` to requests for this logical model — a request that sets the field
   itself always overrides it. Applies to OpenAI-compatible providers (DeepSeek, etc.); native
   Claude/Gemini support is planned.
6. Save. Requests for that logical model now flow to the chosen provider and model.

![The Routing tab — logical model names mapped to providers](/images/routing.png)

## How it's enforced

When a request arrives, the gateway resolves its `model` field through these routes before applying budgets and
calling the provider — see [Request lifecycle](/overview/request-lifecycle). Because the logical name is the
contract, you can switch a route's provider or model and clients see no change.

::: tip Keep logical names stable
Agree on logical names with your developers (e.g. `coding-default`, `bulk`) and keep them stable. Swap the
provider behind them as your cost or quality needs change.
:::

## Next steps

- [Budgets & limits](/admin/budgets-and-limits) — cap spend on these routes.
- [Pricing](/admin/pricing) — set the cost basis used for budgets.
