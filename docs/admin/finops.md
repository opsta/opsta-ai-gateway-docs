# FinOps — chargeback & forecast

The **FinOps** view turns the gateway's usage into money: an authoritative, exportable **cost
statement** per tenant for a billing month, and a **budget forecast** that projects where this
month's spend will land. Unlike cost-*visibility* tools, the gateway both **enforces** your budgets
*and* bills from the same numbers — chargeback can never disagree with what actually capped spend.

::: info Who can do this
**Org admins** (their own organization) and **platform admins** (any org), under **Usage → FinOps**.
:::

## Chargeback statement

For a chosen month, the statement breaks spend down by **project → group → user → model**, priced
server-side from the same rates the budget controller enforces with. Each line shows input/output and
cached tokens and the **USD** cost.

1. Open **Usage**, pick the organization, scroll to **FinOps**.
2. Choose a **month** (blank = current) and **Refresh**.
3. Click **Export CSV** to download the statement for your finance system.

![The FinOps view — chargeback statement + budget forecast](/images/finops.png)

::: tip Usage is always attributed, never silently $0
Every line shows **how it was priced** (`pricedVia`): its own model price, the **default fallback
rate**, or — if you've configured no default — **flagged as unpriced** and listed, rather than
silently billed as $0. Either way you can set a model-specific rate on the
[Pricing](/admin/pricing) tab and re-run. The CSV is safe to open in any spreadsheet
(formula-injection is neutralized).
:::

## Budget forecast

For every USD budget you've set (project or user), the forecast shows **spend-to-date**, **% of
budget consumed**, and a **projected month-end** total (a linear run-rate from the month so far).
Scopes projected to exceed their budget are flagged, so you can act before the cap is hit rather than
after traffic is already being refused.

Budgets themselves are configured on [Budgets & limits](/admin/budgets-and-limits); this view reports
against them.

## Next steps

- [Budgets & limits](/admin/budgets-and-limits) — set the caps this view forecasts against.
- [Pricing](/admin/pricing) — set per-model prices that drive chargeback.
- [Observability](/admin/observability) — token/latency dashboards.
