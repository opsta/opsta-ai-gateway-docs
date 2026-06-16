# Platform observability

The platform ships a **self-hosted** metrics, logs, and traces stack with **per-organization tenant isolation**.
Everything runs in your cluster; no telemetry is sent to a third-party cloud. This page covers operating that
stack — administrators reading dashboards should see [Observability](/admin/observability) instead.

::: info Who this is for
Platform engineers operating the telemetry backend (retention, storage, isolation).
:::

## What's in the stack

A self-hosted stack handles each signal:

- **Metrics** — token and USD usage, cache hit rates, request health.
- **Logs** — gateway and platform logs.
- **Traces** — request traces (available for deep debugging).
- A **collector** scrapes the gateway and tails logs, labeling each record with the tenant it belongs to.
- **Grafana** renders dashboards as code.

```yaml
observability:
  enabled: true
  storage: local        # local volumes (standalone) | object (HA, S3-compatible)
```

## Retention

Retention is set per signal, with defaults tuned for a long-running on-prem product:

```yaml
observability:
  metricsRetention: "8760h"   # 365 days — keep usage stats for long-term cost reporting
  logsRetention:    "4320h"   # 180 days
  tracesRetention:  "2160h"   # 90 days
```

::: tip Metrics drive cost reporting
Usage and spend dashboards read from metrics, so the metrics retention is the longest by default — it determines
how far back usage and budget history goes.
:::

## Storage backend

- **Standalone** uses `storage: local` — filesystem-backed volumes. Simple, single-replica.
- **High availability** uses `storage: object` — an S3-compatible object store — so the telemetry backends can
  run multiple replicas. Pair this with [High availability](/operate/high-availability).

## Per-organization isolation

Each organization's telemetry is kept in an **isolated tenant**. The collector derives the organization from the
request's consumer identity and routes each org's records to its own tenant. When a dashboard or the console
queries telemetry, an authenticating proxy forces the caller's tenant scope, so one organization can never read
another's data — even though the backend is shared.

This isolation depends on the control plane being enabled (it resolves each caller's organization). Without it,
the stack runs single-tenant.

## Network isolation

```yaml
observability:
  networkPolicy:
    enabled: true   # default: deny-by-default, only the auth proxy may reach the telemetry backends
```

The backends are locked down so only the authenticating proxy can reach them, preventing direct, unscoped access.

::: warning NetworkPolicy needs an enforcing CNI
This guard relies on a CNI that enforces NetworkPolicy. Lightweight CNIs (k3d/flannel) ignore it — the platform
still runs, but you don't get network-level isolation. Use an enforcing CNI in production.
:::

## Dashboard access

Platform operators reach Grafana directly at `grafana.your-domain`, gated by SSO and restricted to the admin
group. Organization users read their own scoped telemetry through the **console** rather than Grafana — see
[Observability](/admin/observability).

## Golden signals

The four golden signals for the AI gateway — monitor all four in production:

| Signal | Metric / source | What it tells you |
|---|---|---|
| **Latency** | p50 / p95 / p99 of `higress_http_request_duration_seconds` per route | End-to-end request latency including provider round-trip |
| **Traffic** | `higress_http_requests_total` (rate) | Requests per second by route and consumer |
| **Errors** | `higress_http_requests_total{status=~"5.."}` + 403 (quota/guard) + 429 (rate-limit) | Upstream errors vs. policy denials |
| **Saturation** | Pod CPU/memory (`container_cpu_usage_seconds_total`, `container_memory_working_set_bytes`) | Gateway and control-plane resource pressure |

Additional AI-specific signals to track:

| Signal | Metric | What it tells you |
|---|---|---|
| **Token throughput** | `higress_ai_tokens_total` by org/project | Burn rate vs. budget |
| **Budget utilisation** | Budget ledger via Grafana dashboard | USD spend vs. limit |
| **Cache hit rate** | `higress_ai_cache_hits_total / requests_total` | Semantic-cache effectiveness |
| **Guardrail block rate** | `higress_ai_guardrail_blocks_total` by type | Unusual block spike = potential attack |

## SLO definitions

Define SLOs per environment. The table below is the **recommended production baseline** — adjust
thresholds to match your workload's latency profile and provider SLAs.

| SLO | Target | Error budget (30 days) |
|---|---|---|
| **Availability** — % of chat-completion requests returning a non-5xx, non-429 response | ≥ 99.5% | ≤ 3.6 h downtime per month |
| **Latency** — % of requests completing (to first token, streaming) in ≤ 10 s | ≥ 95% | 5% of requests may exceed 10 s |
| **Guardrail accuracy** — false-positive rate (blocks of valid requests reported by users) | ≤ 1% | 1 in 100 blocks may be a false positive |
| **Budget enforcement** — 0 over-budget responses served | 100% | No error budget; hard correctness requirement |

::: info SLOs require error budget tracking
An SLO without an error budget is just a target. Wire Grafana Alerting to notify when the error budget for
availability or latency is consumed faster than the burn rate allows. See recommended alerts below.
:::

## Recommended alert rules

Configure these in Grafana Alerting (or Prometheus AlertManager). The rules below are in PromQL;
adapt the thresholds to your baseline.

### Availability — fast burn

```promql
# Fires when 5xx error rate (1 h window) > 5% — fast-burn on 99.5% availability SLO
sum(rate(higress_http_requests_total{status=~"5.."}[1h]))
  / sum(rate(higress_http_requests_total[1h])) > 0.05
```

Severity: **critical** — page immediately.

### Availability — slow burn

```promql
# Fires when 6 h window error rate > 1% — slow budget drain
sum(rate(higress_http_requests_total{status=~"5.."}[6h]))
  / sum(rate(higress_http_requests_total[6h])) > 0.01
```

Severity: **warning** — ticket within 24 h.

### High latency — p95

```promql
# p95 latency > 10 s (1 h window)
histogram_quantile(0.95,
  sum(rate(higress_http_request_duration_seconds_bucket[1h])) by (le)
) > 10
```

Severity: **warning**.

### Provider errors

```promql
# Rate of 5xx from upstream LLM providers > 5/min sustained 10 min
sum(increase(higress_http_requests_total{status=~"5.."}[10m])) > 50
```

Severity: **warning** — check provider status page.

### Guardrail block spike

```promql
# Guardrail blocks increased > 10× compared to the 24 h baseline
sum(rate(higress_ai_guardrail_blocks_total[5m]))
  / sum(rate(higress_ai_guardrail_blocks_total[24h])) > 10
```

Severity: **warning** — investigate for a prompt-injection campaign.

### Control-plane down

```promql
# No successful control-plane /healthz scrapes for 5 minutes
absent(up{job="control-plane"}) or up{job="control-plane"} == 0
```

Severity: **critical** — reconcile paused; data plane serves last config.

### Disk / PVC high utilisation (standalone)

```promql
# Any PVC in the opsta namespaces > 85% full
(kubelet_volume_stats_used_bytes / kubelet_volume_stats_capacity_bytes) > 0.85
```

Severity: **warning** — expand volume or reduce retention.

::: tip Wire alerts to your pager
Grafana Alerting can deliver to PagerDuty, Opsgenie, Slack, or any webhook. Configure a contact
point and notification policy in `grafana.your-domain/alerting`. This is listed in the
[Production-readiness checklist](/operate/production-readiness.md) as a required step before go-live.
:::

## Per-organization tenant isolation

Each organization's telemetry is kept in an **isolated tenant**. The collector derives the
organization from the request's consumer identity and routes each org's records to its own tenant.
When a dashboard or the console queries telemetry, an authenticating proxy forces the caller's
tenant scope — one organization can never read another's data even though the backend is shared.

This isolation depends on the control plane being enabled (it resolves each caller's organization).
Without it, the stack runs single-tenant.

## Network isolation

```yaml
observability:
  networkPolicy:
    enabled: true   # default: deny-by-default, only the auth proxy may reach the telemetry backends
```

The backends are locked down so only the authenticating proxy can reach them, preventing direct,
unscoped access.

::: warning NetworkPolicy needs an enforcing CNI
This guard relies on a CNI that enforces NetworkPolicy. Lightweight CNIs (k3d/flannel) ignore it —
the platform still runs, but you don't get network-level isolation. Use an enforcing CNI in production.
:::

## Dashboard access

Platform operators reach Grafana directly at `grafana.your-domain`, gated by SSO and restricted to
the admin group. Organization users read their own scoped telemetry through the **console** rather
than Grafana — see [Observability](/admin/observability).

## Next steps

- [Observability](/admin/observability) — the admin/user-facing view.
- [High availability](/operate/high-availability) — object storage and replicas.
- [Hardening](/security/hardening) — network posture and isolation.
