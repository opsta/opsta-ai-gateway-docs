# Usage & budget

The **Overview** dashboard shows what you've used and what you have left — so there are no billing surprises.

::: info Prerequisite
You're signed in and your account is linked to a consumer ([Get access](/user/get-access)).
:::

## What you see

- **Monthly budget** — your USD budget, the amount spent, and the amount remaining for the current calendar
  month (UTC).
- **Token usage** — input, output, and cached tokens.
- **Per-model breakdown** — cost by model, so you can see where your spend goes.

> 📸 **Screenshot:** the Overview dashboard (budget cards + per-model cost table) — _placeholder; real capture pending._

## How budgets work

Your budget is part of a hierarchy — organization ≥ project ≥ group ≥ user — and the **tightest cap applies**.
When you reach a cap, further requests are rejected with `429 Too Many Requests` until the next month or until
an administrator raises the limit.

Semantic caching can stretch your budget: repeated or similar prompts may be served from cache, which costs
nothing against your budget.

## If you hit your limit

- Wait for the monthly reset, or
- Ask your org admin to adjust your [budget or limit](/admin/budgets-and-limits).

## Next steps

- [Blocked requests](/user/blocked-requests) — if a request was rejected by a guardrail rather than a budget.
- [Request lifecycle](/overview/request-lifecycle) — which gate produced a given status code.
