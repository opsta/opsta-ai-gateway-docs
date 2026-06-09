# What's next

Opsta AI Gateway is a live product under active development. Here's what's
on the horizon:

## Near-term

- **SCIM auto-provisioning** — connect your HR system (Okta, Entra ID) and
  users are created, updated, and deactivated automatically — no manual
  member management.
- **FinOps & audit deep-dive** — richer cost breakdowns by project and group,
  budget alerts, scheduled reports, and exportable audit trails.
- **Semantic cache** — cache LLM responses for identical prompts across users,
  saving cost and latency on repeated queries.
- **Canary / A-B model rollout** — direct a percentage of traffic to a new
  model or provider before switching fully, with side-by-side metrics.

## Longer-term

- **Per-org BYOK provider vault** — each organisation brings their own API key
  for a shared provider (e.g. each team has their own OpenAI account), isolated
  in per-org Kubernetes Secrets.
- **Approval workflows** — require a second admin to approve budget increases,
  new provider connections, or guardrail changes.
- **Model catalog & playground** — browse available models, test prompts
  interactively, and see what each model costs before committing.
- **OpenTelemetry export** — send traces and metrics to your existing
  observability platform.

The product is designed so every new capability layers on without rewriting
what's already there — identity is always the `{org, project, group, user}`
tuple, every policy is per-project overridable, and all configuration is
declarative.
