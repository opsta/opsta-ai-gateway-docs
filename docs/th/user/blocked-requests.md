> 🌐 **เอกสารภาษาไทยกำลังจัดทำ** — เนื้อหาด้านล่างเป็นภาษาอังกฤษชั่วคราว จนกว่าจะมีการแปล. _This page is not yet translated; English content is shown temporarily._

# Blocked requests

If a request is rejected by a **guardrail** (not a budget), it returns `403` and appears on your **Blocked
requests** page, where you can see why and report a false positive.

::: info Prerequisite
You're signed in ([Get access](/th/user/get-access)).
:::

## Why a request is blocked

Guardrails screen each request before it reaches a model. A request is blocked when it matches:

- a **PII** rule (sensitive data like an email, phone number, or key), or
- a **prompt-injection** rule (pattern-based or semantic) intended to subvert the model.

A blocked request never reaches the provider, so it costs nothing against your budget.

## Review and report

1. Open **Blocked requests** in the console.
2. Find the request — you'll see the time and the rule that matched.
3. If it was wrongly blocked, click **Report** to flag it as a false positive. Your org admin can then tune the
   guardrail.

![Your blocked requests — the matched guardrail rule, the snippet, and a report action](/images/blocked-requests.png)

::: tip Distinguish 403 from 429
A **403** means a guardrail blocked the content. A **429** means you hit a budget or token limit — see
[Usage & budget](/th/user/usage-and-budget). The [request lifecycle](/th/overview/request-lifecycle) table maps each
status to its gate.
:::

## Next steps

- Administrators tune rules in [Guardrails](/th/admin/guardrails).
