---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Opsta AI Gateway"
  text: "One self-hosted gateway for all your LLM traffic"
  tagline: Route work-type to the right model, cap tokens and spend per team, enforce model allow-lists and guardrails, and see every token — built on Higress, fully Infrastructure-as-Code, on-premise, no cloud lock-in.
  actions:
    - theme: brand
      text: What is it? ->
      link: /intro/what-is
    - theme: alt
      text: Getting started
      link: /intro/getting-started

features:
  - title: Work-type → model routing
    details: Header/tag-based routing to logical model routes (coding-default, bulk) with fallback — native Gateway API config, no plugin.
    link: /intro/features
  - title: Per-group/user limits
    details: Redis-backed token rate limits and per-group model allow-lists, keyed by the {org, project, group, user} identity tuple.
    link: /intro/features
  - title: Observability
    details: Grafana LGTM (Loki/Mimir/Tempo) + Alloy — tokens, latency and rate-limits per model & route, per-user via logs.
    link: /intro/features
  - title: In-cluster TLS + remote access
    details: Let's Encrypt certificates terminated in-cluster (cert-manager, DNS-01); Cloudflare Tunnel for dev, direct in prod — same config.
    link: /intro/architecture
---
