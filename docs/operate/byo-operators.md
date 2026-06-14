# Reuse existing operators

The platform depends on three Kubernetes operators — **cert-manager**, a **Redis operator**, and
**CloudNativePG**. By default the chart installs them for you. If your cluster already runs compatible versions,
you can reuse them instead and avoid duplicates.

::: info Who this is for
Platform engineers integrating the gateway into an existing cluster that already has shared operators.
:::

## The three toggles

```yaml
certManager:
  enabled: false     # reuse the cert-manager already on the cluster
redisOperator:
  enabled: false     # reuse an existing Redis operator
cnpg:
  enabled: false     # reuse an existing CloudNativePG operator
```

Each toggle controls only whether the **operator** is installed. The platform's own custom resources (the
certificate, the Redis instance, the PostgreSQL clusters) are always created by the chart and run against the
operator that's present.

| Toggle | Reuses | Required when |
|---|---|---|
| `certManager.enabled` | cert-manager | `tls.mode` is `letsencrypt` or `selfsigned` |
| `redisOperator.enabled` | Redis operator | `redis.enabled: true` |
| `cnpg.enabled` | CloudNativePG | `postgres.enabled: true` or `keycloak.enabled: true` |

::: warning Match the tested versions
A reused operator must be a version compatible with the one the chart would have installed. The tested versions
are part of the product's component matrix — check them against what's on your cluster before disabling a toggle.
See [Upgrades](/operate/upgrades).
:::

## When to reuse vs. let the chart install

- **Reuse** when these operators are shared cluster infrastructure managed by another team, or when you're
  minimizing the image set for an [air-gapped install](/operate/air-gap).
- **Let the chart install** (the default) when this is a dedicated cluster or you want the platform to be fully
  self-contained and reproducible from one chart.

## Custom resources still belong to the platform

Even with all three toggles off, the chart still owns and reconciles its certificate, Redis instance, and
PostgreSQL clusters. You manage the **operators**; the platform manages **its resources**. This keeps the
gateway reproducible from the chart while fitting into your existing operator landscape.

## Next steps

- [Air-gapped install](/operate/air-gap) — fewer operators means fewer images to mirror.
- [High availability](/operate/high-availability) — how the database and Redis clusters scale.
- [Backup & DR](/operate/backup-and-dr) — protecting CloudNativePG data.
