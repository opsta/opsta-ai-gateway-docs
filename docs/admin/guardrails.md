# Guardrails

Guardrails screen every request **before it reaches a model**, in your cluster. They block sensitive-data
leakage and prompt-injection attempts, and a blocked request never incurs provider cost.

::: info Who can do this
**Org admins** (for their organization) and **platform admins**, on **Projects → Guardrails**.
:::

## Types of guardrail

| Guardrail | What it does | Configured on |
|---|---|---|
| **PII masking** | Redacts sensitive data (email, phone, IP, keys) in requests | Platform/operator config (opt-in) |
| **Prompt-injection (pattern)** | Blocks requests matching jailbreak / system-prompt-leak patterns | **Guardrails** tab |
| **Semantic prompt-injection** | Blocks requests by *meaning*, not just keywords | [Semantic guard](/admin/semantic-guard) |

::: info PII masking is opt-in
PII masking is an opt-in capability enabled by the platform operator (it can interact with streaming responses).
Ask your platform engineer to enable it where required — see [Hardening](/security/hardening).
:::

## Add a prompt-injection rule

1. Open **Projects → Guardrails**.
2. Click **Add pattern** — choose one from the curated **library**, or enter a **custom** regular expression.
3. Save. The control plane validates the pattern (rejecting unsafe ones) and reconciles it to the gateway.

![The Guardrails tab — per-project prompt-injection patterns](/images/guardrails.png)

::: tip Safe patterns only
The control plane rejects regular expressions that could be unsafe (e.g. catastrophic backtracking) so a bad
rule can never destabilize the data plane.
:::

## Review what's being blocked

The **Guardrail blocks** screen (Organization section) lists every blocked request across the org — the
consumer, the project, and the rule that matched — and flags those a member reported as a false positive, so
you can tune the rules.

> 📸 **Screenshot:** the org Guardrail blocks list — _placeholder; real capture pending._

## Next steps

- [Semantic guard](/admin/semantic-guard) — block injection by meaning.
- Members see their own blocks under [Blocked requests](/user/blocked-requests).
