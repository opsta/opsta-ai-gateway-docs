# When a request is blocked

If a request returns **HTTP 403** with a message like *“Your request was blocked by a
security guardrail”*, a **guardrail** rejected it before it reached the model. The most
common guardrail is the **prompt-injection filter**, which blocks attempts to override
the model's instructions (e.g. “ignore previous instructions…”, “reveal your system
prompt”, jailbreak phrasings).

You don't have to guess what happened — the console shows it.

## See why you were blocked

1. Open the console and go to **Blocked requests** (in the Portal menu).
2. Each row shows **when** it happened, the **project**, the **matched rule**, and a short
   **snippet** of the text that tripped it.

This is your own history — every user sees only their own blocked requests.

## How to resolve it

- **It was a real injection attempt** → nothing to do; the guardrail did its job.
- **It was a false positive** (your legitimate prompt just happened to contain a flagged
  phrase): you have two options.
  1. **Rephrase and retry** — often the quickest fix.
  2. **Report it as a false positive** — click *Report false positive* on the row. This
     flags it for your organization's admins, who can review and tune the rule.

Guardrail rules are a security control, so only an **organization admin** can change them.

## For organization admins

Go to **Guardrail blocks** (Admin menu) to see every blocked request in your org, with the
ones users flagged marked **Reported**. To loosen or fix an over-broad rule, open the
**Guardrails editor** on the project (Admin → Projects → Guardrails) and adjust the
prompt-injection patterns. Changes apply to the gateway within about a second.
