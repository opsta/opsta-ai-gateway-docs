# Budgets & limits

Budgets and limits are how you control AI spend. The gateway enforces **hierarchical monthly USD budgets** and
**per-minute token limits**, so no team can run up a surprise bill.

::: info Who can do this
**Org admins** (for their organization) and **platform admins**, on **Projects → Budgets & Limits**.
:::

## The hierarchy

Budgets cascade: **organization ≥ project ≥ group ≥ user**, and the **tightest cap always wins**. A platform
owner sets a hard ceiling at the top and delegates finer caps downward.

```mermaid
flowchart LR
  O["Organization"] --> P["Project"] --> G["Group"] --> U["User → enforced minimum"]
```

## Set a budget

1. Open **Projects → Budgets & Limits**.
2. Set a **project**, **group**, or **user** monthly USD budget.
3. Optionally set a **per-minute token limit (TPM)** at the same level.
4. Save. The control plane reconciles the limits to the gateway within seconds.

> 📸 **Screenshot:** the Budgets & Limits tab with budget and TPM fields — _placeholder; real capture pending._

## What happens at the cap

When a consumer reaches the tightest applicable budget or token limit, further requests are rejected with
`429 Too Many Requests` until the monthly reset (calendar month, UTC) or until you raise the cap. Semantic
caching reduces spend against budgets by serving similar prompts from cache.

## See where spend goes

The **Usage** screen (Organization section) breaks down token and cached-token usage by project and consumer,
so you can find the heavy users before they hit a cap.

> 📸 **Screenshot:** the org Usage breakdown table — _placeholder; real capture pending._

## Next steps

- [Pricing](/admin/pricing) — the per-model rates budgets are calculated from.
- [Semantic cache](/admin/semantic-cache) — cut spend with caching.
