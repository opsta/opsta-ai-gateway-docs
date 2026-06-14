# Backup & disaster recovery

The control-plane **PostgreSQL** database is the single source of truth — organizations, projects, providers,
budgets, limits, guardrail config, API keys, usage ledger, and the audit log all live there. Protecting it is the
core of your DR plan.

::: info Who this is for
Platform engineers responsible for data protection and recovery.
:::

## What to back up

| Data | Where it lives | Why it matters |
|---|---|---|
| Tenant & policy config | Control-plane PostgreSQL | Recreates all orgs, projects, budgets, providers, guardrails |
| API keys | Control-plane PostgreSQL | Keys keep working after restore |
| Usage ledger | Control-plane PostgreSQL | Month-to-date spend and history |
| Audit log | Control-plane PostgreSQL | Compliance trail |
| Identity | Keycloak PostgreSQL | Users, brokered-IdP config, group mappings |
| Secrets | Kubernetes Secrets / your secret store | Provider keys, OIDC secrets, DB passwords |

Metrics, logs, and traces in the observability stack are operational telemetry — back them up only if your
retention policy requires it. They can be reconstructed from live traffic; the config database cannot.

## Backing up PostgreSQL

The control-plane database runs on CloudNativePG, which supports scheduled backups to object storage:

```yaml
postgres:
  backup:
    enabled: true
    method: objectStore            # or volumeSnapshot
    objectStore:
      destinationPath: s3://backups/opsta-ai-gateway/
      endpointURL: https://s3.internal:9000
```

This produces base backups plus continuous WAL archiving, enabling **point-in-time recovery**. Apply the same
approach to the Keycloak database cluster.

::: tip Back up before every upgrade
Always take a fresh backup immediately before an [upgrade](/operate/upgrades) so you can roll back a schema
migration if needed.
:::

## Restoring

1. Restore the PostgreSQL cluster from the most recent base backup (and replay WAL to a target time for
   point-in-time recovery), following CloudNativePG's restore procedure.
2. Ensure the Kubernetes **Secrets** are present (from your secret store or backup).
3. Bring up the platform with `helm install`/`upgrade`. On start, the control plane connects to the restored
   database and **reconciles** the gateway from it — providers, budgets, guardrails, and keys are projected back
   onto the data plane automatically.

Because the gateway holds **no configuration of its own**, restoring the database restores the whole platform's
behavior. There's no separate gateway state to recover.

> 📸 **Screenshot:** a completed CloudNativePG backup listed in its status — _placeholder; real capture pending._

## Disaster-recovery posture

- **Database**: in [HA](/operate/high-availability), a 3-instance cluster tolerates node loss; object-store
  backups protect against cluster loss.
- **Reproducibility**: the platform rebuilds from the chart plus the restored database — no hand-built state.
- **Secrets**: keep them in an external secret store so they survive cluster loss independently.

## Next steps

- [High availability](/operate/high-availability) — survive node failures without restoring.
- [Upgrades](/operate/upgrades) — back up first, every time.
- [Data sovereignty](/security/data-sovereignty) — where your data lives.
