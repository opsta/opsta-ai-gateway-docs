# Backup & disaster recovery

The control-plane **PostgreSQL** database is the single source of truth — organizations, projects,
providers, budgets, limits, guardrail config, API keys, usage ledger, and the audit log all live
there. Protecting it is the core of your DR plan.

::: info Who this is for
Platform engineers responsible for data protection and recovery.
:::

## What to back up

| Data | Store | Why it matters |
|---|---|---|
| Tenant & policy config | Control-plane PostgreSQL | Recreates all orgs, projects, budgets, providers, guardrails |
| API keys | Control-plane PostgreSQL | Keys keep working after restore |
| Usage ledger | Control-plane PostgreSQL | Month-to-date spend and history |
| Audit log | Control-plane PostgreSQL | Compliance trail |
| Identity | Keycloak PostgreSQL | Users, brokered-IdP config, group mappings |
| Kubernetes Secrets | Your secret store / Secrets backup | Provider keys, OIDC secrets, DB passwords |

Metrics, logs, and traces in the observability stack are operational telemetry — back them up only
if your retention policy requires it. They can be reconstructed from live traffic; the config
database cannot.

**Redis is ephemeral.** Quota counters and rate-limit state are not backed up — they reset to zero
on cluster rebuild. This may allow a brief over-quota window after a restore until the ledger
resynchronises. Design your DR plan around this.

---

## Enabling PostgreSQL backup

CloudNativePG supports base backups plus continuous WAL archiving to any S3-compatible object
store. Set this in your Helm values before the first installation (or add it before the next
upgrade):

```yaml
postgres:
  backup:
    enabled: true
    retentionPolicy: "7d"
    objectStore:
      destinationPath: s3://your-bucket/opsta-ai-gateway/
      endpointURL: https://s3.example.com      # omit for AWS S3
      credentials:
        accessKeyId:
          name: pg-s3-credentials              # Kubernetes Secret name
          key: ACCESS_KEY_ID
        secretAccessKey:
          name: pg-s3-credentials
          key: ACCESS_SECRET_KEY
      wal:
        compression: gzip
        maxParallel: 2
      data:
        compression: gzip
        immediateCheckpoint: true
```

Create the credentials secret before applying the chart:

```bash
kubectl -n opsta-ai-gateway create secret generic pg-s3-credentials \
  --from-literal=ACCESS_KEY_ID='<your-key>' \
  --from-literal=ACCESS_SECRET_KEY='<your-secret>'
```

Once applied, CloudNativePG archives WAL continuously. Check archiving health:

```bash
kubectl --context <your-context> get cluster -n opsta-ai-gateway opsta-pg \
  -o jsonpath='{.status.conditions[*].message}'
# Expected: "Cluster is Ready  Continuous archiving is working"
```

Apply the same configuration to the Keycloak database cluster.

::: tip Back up before every upgrade
Always take a fresh base backup immediately before an upgrade so you can roll back a schema
migration if needed. See [Upgrades → Rollback](./upgrades.md#rollback-procedure).
:::

---

## Taking an on-demand backup

Trigger a base backup at any time with a `Backup` resource:

```bash
kubectl --context <your-context> apply -f - <<'EOF'
apiVersion: postgresql.cnpg.io/v1
kind: Backup
metadata:
  name: opsta-pg-pre-upgrade-$(date +%Y%m%d)
  namespace: opsta-ai-gateway
spec:
  cluster:
    name: opsta-pg
  method: barmanObjectStore
EOF
```

Monitor progress:

```bash
kubectl --context <your-context> get backup -n opsta-ai-gateway -w
```

Expected output when complete:

```
NAME                        AGE   CLUSTER    METHOD              PHASE
opsta-pg-pre-upgrade-...    30s   opsta-pg   barmanObjectStore   completed
```

**Observed backup time (v1.11.1, PoC dataset, 4.2 MiB compressed):** ~3 seconds.
Production datasets will be larger; allow 2–10 minutes for a database with months of audit log.

---

## Restoring from backup

This procedure restores a PostgreSQL cluster from a barman object-store backup into a new
namespace. Use it after cluster loss, data corruption, or a failed upgrade.

::: warning Honesty note — this is restore-based DR
This procedure recovers the **database** only. The full application recovery also requires:
applying Kubernetes Secrets (provider keys, OIDC config), and `helmfile sync` to bring up the
platform. Total wall-clock RTO depends on your IaC automation.
:::

### 1 — Prepare credentials

Create the S3 credentials secret in the target namespace:

```bash
kubectl --context <your-context> create namespace opsta-ai-gateway
kubectl --context <your-context> -n opsta-ai-gateway create secret generic pg-s3-credentials \
  --from-literal=ACCESS_KEY_ID='<your-key>' \
  --from-literal=ACCESS_SECRET_KEY='<your-secret>'
```

### 2 — Create the recovery cluster

```yaml
apiVersion: postgresql.cnpg.io/v1
kind: Cluster
metadata:
  name: opsta-pg                           # must match the original cluster name for the platform to connect
  namespace: opsta-ai-gateway
spec:
  instances: 1                             # scale up after verified restore
  imageName: <your-registry>/cloudnative-pg/postgresql:18.3-system-trixie
  bootstrap:
    recovery:
      source: opsta-pg-backup-source
  externalClusters:
  - name: opsta-pg-backup-source
    barmanObjectStore:
      destinationPath: s3://your-bucket/opsta-ai-gateway/
      endpointURL: https://s3.example.com  # omit for AWS S3
      serverName: opsta-pg                 # REQUIRED — must match the original cluster name
      s3Credentials:
        accessKeyId:
          name: pg-s3-credentials
          key: ACCESS_KEY_ID
        secretAccessKey:
          name: pg-s3-credentials
          key: ACCESS_SECRET_KEY
      wal:
        maxParallel: 2
  storage:
    size: 5Gi
```

::: warning `serverName` is required
Without `serverName: opsta-pg`, CNPG looks for backups named after the external cluster reference
(`opsta-pg-backup-source`) and returns **"no target backup found"**. Always set `serverName` to
the original cluster name.
:::

### 3 — Wait for ready

```bash
kubectl --context <your-context> wait --for=condition=Ready \
  cluster -n opsta-ai-gateway opsta-pg --timeout=300s
```

**Observed restore time (v1.11.1, 4.2 MiB database, local object store):** ~51 seconds
(from cluster resource creation to `Ready` — includes PVC provision, base backup download,
WAL replay, and PostgreSQL startup).

Production datasets with months of WAL archiving may take 5–20 minutes. PITR to a specific
timestamp adds WAL replay time proportional to the replay window.

### 4 — Verify data integrity

```bash
kubectl --context <your-context> exec -n opsta-ai-gateway opsta-pg-1 \
  -- psql -U postgres -d opsta -c "
SELECT (SELECT count(*) FROM organizations) AS orgs,
       (SELECT count(*) FROM projects)      AS projects,
       (SELECT count(*) FROM users)         AS users,
       (SELECT count(*) FROM providers)     AS providers,
       (SELECT count(*) FROM keys)          AS api_keys,
       (SELECT count(*) FROM audit_log)     AS audit_rows;"
```

Compare the output with your pre-backup record. In the drill (2026-06-16, v1.11.1) the counts
matched exactly: 2 orgs, 3 projects, 8 users, 3 providers, 12 API keys, 197 audit rows.

### 5 — Restore Kubernetes Secrets and bring up the platform

```bash
# Restore provider keys, OIDC secrets, and TLS credentials from your secret store / Velero backup
# Then sync the platform:
helmfile -f helmfile.yaml sync
```

The control plane reconnects to the restored database and reconciles the entire gateway
configuration automatically — providers, budgets, guardrails, and API keys are projected onto the
data plane without manual intervention.

---

## DR posture & observed RTO/RPO

### Drill results (2026-06-16, v1.11.1, Standalone)

| Step | Time observed |
|---|---|
| On-demand base backup (4.2 MiB) | ~3 seconds |
| Database restore to new cluster (local object store) | ~51 seconds |
| **Total database RTO** (restore only, no IaC rebuild) | **~1 minute** |
| **Full application RTO** (IaC + secret restore + helmfile sync) | Not measured — depends on IaC automation and cluster provisioning time |

### DR objectives (honest baseline)

| Metric | Standalone | HA |
|---|---|---|
| **RPO** | Age of last backup (backups off by default) | Seconds (continuous WAL archiving) |
| **RTO — database restore** | ~1 min (measured; local store) | ~1–5 min (distributed store + WAL replay) |
| **RTO — full platform** | IaC rebuild + secret restore + DB restore + helmfile sync | Same steps; HA survives single-node loss without restore |
| **Node loss** | Full outage | Absorbed by replicas; no restore needed |
| **Site / cluster loss** | Restore from backup | Restore from backup onto fresh infrastructure |

::: warning Single-site baseline
Both topologies are **single-site, restore-based DR**. HA survives node loss within the cluster
but does not survive a full site loss without a restore from off-site backup. Design backup
retention and object-store replication accordingly.
:::

---

## Scheduled backups

Enable automatic base backups in addition to WAL archiving:

```yaml
postgres:
  scheduledBackup:
    enabled: true
    schedule: "0 2 * * *"     # nightly at 02:00 UTC
    retentionPolicy: "7d"
```

Or create a `ScheduledBackup` resource directly:

```yaml
apiVersion: postgresql.cnpg.io/v1
kind: ScheduledBackup
metadata:
  name: opsta-pg-nightly
  namespace: opsta-ai-gateway
spec:
  schedule: "0 2 * * *"
  cluster:
    name: opsta-pg
  method: barmanObjectStore
  backupOwnerReference: self
  immediate: false
```

---

## Keycloak backup

Keycloak uses a separate PostgreSQL cluster (`keycloak-pg`). Apply the same barman configuration
to it. Restoring Keycloak without a backup requires reconfiguring all brokered-IdP connections,
user groups, and role mappings from scratch. A break-glass local admin (`kcadmin`) lets you log
into the console while KC is unavailable, but the brokered-IdP config must be re-entered.

---

## Velero UI — managing backups from the web

Alongside the Postgres PITR above, the platform backs up **Kubernetes resources** (all namespaces;
persistent-volume data is opt-in) with [Velero](https://velero.io), and ships a web console —
**Velero UI** — to browse and run those backups without `kubectl`. It's exposed at
**`https://backup.<your-domain>`** (e.g. `backup.ai-gateway.example.com`):

- **Single sign-on.** Log in with the same Keycloak identity as the console and Grafana — no separate
  credentials. The UI runs the OIDC authorization-code flow natively against Keycloak; an HTTP request
  redirects to HTTPS automatically.
- **Admin-group access.** A built-in authorization policy grants full **manage** (view, create, restore)
  only to members of the `opsta-admins` or `backup-admins` Keycloak groups; everyone else is denied.
  Restores are destructive, so add a backup operator to **`backup-admins`** to grant backup rights without
  full platform-admin.
- **What you can do.** List and inspect backups and restores, trigger an on-demand backup or a restore, and
  review schedules — a GUI over the same operations available from the `velero` CLI.

From the CLI those same backups are at `kubectl -n velero get backups.velero.io` — use the fully qualified
kind, since a bare `backup` resolves to CloudNativePG's CRD.

---

## Next steps

- [High availability](./high-availability.md) — survive node failures without a restore.
- [Upgrades](./upgrades.md) — back up first, every time.
- [Reference architecture → DR objectives](./reference-architecture.md#reliabilityhaddr) —
  topology comparison and RTO/RPO table.
- [Data handling](./data-handling.md) — what's stored where and retention controls.
