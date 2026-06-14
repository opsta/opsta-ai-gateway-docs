# Upgrades

The product version pins a **tested component matrix**. Upgrading means moving the whole platform to a new
released version as one set — not drifting individual components. The exact images tested for a release are the
ones that ship to you.

::: info Who this is for
Platform engineers upgrading an existing installation to a newer product version.
:::

## One version, one tested set

Each product version (e.g. `v1.8.0`) pins the versions of every component beside it — Kubernetes baseline, the
gateway, control plane, console, databases, identity, observability, and the built-in plugins. That set is tested
together. Bumping the product version moves the whole set; you don't upgrade one plugin or one database in
isolation.

You select the version through the chart and its image tags. See the
[Configuration reference](/reference/configuration#images) for the image value structure and
[Release notes](/releases/) for what each version delivers.

## Build-once, promote-by-retag

Behind a release, the **exact image digest** that was tested is the one that ships — images are promoted by
retagging, not rebuilt between environments. So the artifact you run in production is bit-for-bit the one that
passed testing. You don't need to reproduce a build; you pull the released tag.

## Upgrade procedure

1. **Read the [release notes](/releases/)** for the target version — note any new required values or behavior
   changes.
2. **Back up** the control-plane PostgreSQL first — see [Backup & DR](/operate/backup-and-dr).
3. **Update your image tags / chart version** to the target release in your values.
4. **Apply** with `helm upgrade`:

   ```bash
   helm upgrade opsta-ai-gateway oci://ghcr.io/opsta/charts/opsta-ai-gateway \
     -n opsta-ai-gateway -f values.yaml -f secrets-values.yaml
   ```

5. **Watch readiness.** The control plane runs any new database migrations and a reconcile before reporting
   ready, so the gateway is never serving against a half-migrated state.

   ```bash
   kubectl -n opsta-ai-gateway rollout status deploy/control-plane
   ```

6. **Smoke-test** a request through the gateway and a console sign-in.

## Rolling upgrades in HA

In [high-availability](/operate/high-availability) mode, PodDisruptionBudgets and anti-affinity keep a quorum of
each component up during the rollout, so the upgrade is non-disruptive to live traffic. Database failover is
handled by CloudNativePG.

::: tip Config you changed by hand will be reconciled
Tenant data (consumers, budgets, providers, guardrails) is owned by the control plane and survives upgrades. The
chart owns product-level config — anything you changed outside the chart can be reset on upgrade, so make changes
through values, not by editing live resources.
:::

## Rolling back

`helm rollback` returns the chart to the previous release. Because PostgreSQL holds the source of truth, restore a
database backup taken before the upgrade if a migration needs to be reversed. Test upgrades in a staging
environment first.

## Next steps

- [Backup & DR](/operate/backup-and-dr) — take a backup before every upgrade.
- [Release notes](/releases/) — what changed between versions.
