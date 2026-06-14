> 🌐 **เอกสารภาษาไทยกำลังจัดทำ** — เนื้อหาด้านล่างเป็นภาษาอังกฤษชั่วคราว จนกว่าจะมีการแปล. _This page is not yet translated; English content is shown temporarily._

# High availability

A single toggle switches the whole platform between **standalone** (one replica per component) and **high
availability** (multiple replicas, disruption budgets, and clustered databases). You don't tune each component by
hand — the chart derives sensible replica counts from one decision.

::: info Who this is for
Platform engineers sizing the platform for production. Standalone is fine for pilots and single teams; HA is for
production traffic and many teams.
:::

## The single toggle

```yaml
global:
  highAvailability: true
```

- `false` (default) → **standalone**: one replica per component, no PodDisruptionBudgets, no anti-affinity.
  Lowest footprint; suitable for pilots and non-critical use.
- `true` → **high availability**: multiple replicas, PodDisruptionBudgets, and soft pod anti-affinity so replicas
  spread across nodes.

## What HA changes

When `global.highAvailability` is `true`, each component's replica count derives automatically:

| Component | Standalone | High availability |
|---|---|---|
| Gateway (data plane) | 1 | 2+ |
| Control plane | 1 | 2 (leader-elected for background jobs) |
| Web console | 1 | 2 |
| SSO (oauth2-proxy) | 1 | 2 |
| Keycloak | 1 | 2 |
| PostgreSQL (control plane) | 1 instance | 3-instance cluster with failover |
| Keycloak PostgreSQL | 1 instance | 3-instance cluster |
| Redis | 1 | 3 (replication + Sentinel) |
| Observability | 1 | 2+ (object storage backend) |

You can still override any single component's count by setting its `replicas` value explicitly (e.g.
`gateway.replicas: 3`); leave it unset to follow the global toggle.

## Disruption budgets and spreading

In HA mode the chart renders **PodDisruptionBudgets** for the disruption-sensitive components and applies **soft
anti-affinity** by hostname, so a node drain or rolling upgrade won't take all replicas of a component down at
once.

::: tip Background jobs are leader-elected
The control plane runs periodic tasks — reconcile, price sync, audit pruning. With multiple replicas these are
guarded by a single-holder lock in PostgreSQL, so they run once cluster-wide. Write-driven reconciles are
idempotent and need no lock.
:::

## Stateful components in HA

- **PostgreSQL** runs as a 3-instance CloudNativePG cluster with streaming replication and automatic failover.
  Pair this with [Backup & DR](/th/operate/backup-and-dr).
- **Redis** runs with replication and Sentinel for automatic master failover.
- **Observability** uses an **object-storage** backend (`observability.storage: object`) in HA rather than local
  volumes — see [Platform observability](/th/operate/observability-platform).

## Sizing

HA roughly doubles to triples the standalone footprint. Confirm your cluster has the headroom from
[Requirements](/th/operate/requirements) before enabling it, and remember that turning on the semantic features adds
Qdrant and Ollama on top.

## Next steps

- [Backup & DR](/th/operate/backup-and-dr) — protect the PostgreSQL source of truth.
- [Platform observability](/th/operate/observability-platform) — storage backend and retention in HA.
- [Upgrades](/th/operate/upgrades) — rolling upgrades with disruption budgets.
