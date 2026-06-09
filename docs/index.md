---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Opsta AI Gateway"
  text: "One self-hosted gateway for all your LLM traffic"
  tagline: Route work-type to the right model, cap tokens and spend per team, enforce guardrails and model allow-lists, and give every user a personal portal — built on Higress, fully reproducible from code, on-premise, no cloud lock-in.
  actions:
    - theme: brand
      text: What is it? ->
      link: /intro/what-is
    - theme: alt
      text: All features
      link: /intro/features

features:
  - title: Web console
    details: Every user logs into an SSO-gated portal — view usage and budget, issue API keys, connect your tools. Admins manage orgs, members, projects, pricing, and audit from the same UI.
    link: /intro/features
  - title: Work-type → model routing
    details: Header/tag-based routing to logical model routes (coding-default, bulk) with fallback — configure provider and model per route, no client changes needed.
    link: /intro/features
  - title: USD budgets & token limits
    details: Monthly dollar budgets per user, group, or project, with per-minute token rate limits — all enforced at the gateway. Hierarchical: tightest cap wins.
    link: /intro/features
  - title: Guardrails
    details: PII masking and prompt-injection blocking screen every request before it reaches the model. Runs in-cluster — no data leaves your network.
    link: /intro/features
  - title: Enterprise SSO
    details: Each org connects its own Google, Microsoft Entra, or any OIDC/SAML provider. Users land in the right org and group on first login — no per-user setup.
    link: /intro/features
  - title: Connect any provider
    details: Add AI providers per project from the console — DeepSeek, OpenAI-compatible, Anthropic, or generic. No kubectl, no redeploy.
    link: /guides/connect-a-provider
---
