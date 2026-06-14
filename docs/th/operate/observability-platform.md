> 🌐 **เอกสารภาษาไทยกำลังจัดทำ** — เนื้อหาด้านล่างเป็นภาษาอังกฤษชั่วคราว จนกว่าจะมีการแปล. _This page is not yet translated; English content is shown temporarily._

# Platform observability

The platform ships a **self-hosted** metrics, logs, and traces stack with **per-organization tenant isolation**.
Everything runs in your cluster; no telemetry is sent to a third-party cloud. This page covers operating that
stack — administrators reading dashboards should see [Observability](/th/admin/observability) instead.

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
  run multiple replicas. Pair this with [High availability](/th/operate/high-availability).

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
[Observability](/th/admin/observability).

## Next steps

- [Observability](/th/admin/observability) — the admin/user-facing view.
- [High availability](/th/operate/high-availability) — object storage and replicas.
- [Hardening](/th/security/hardening) — network posture and isolation.
