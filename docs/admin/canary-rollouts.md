# Canary / A-B rollouts

A rollout **splits a logical model's traffic across two providers by weight** — for example, send
90% of `coding-default` requests to your current provider and 10% to a new one, then ramp to 50/50
and 100% as you gain confidence. The split is **per request** (randomized in proportion to the
weights), so you can A/B test or safely roll out a new provider or model.

::: info Who can do this
**Org admins** (for their organization) and **platform admins**, on **Projects → Rollouts**.
:::

## How it works

The gateway routes the logical model to **both** providers using weighted routing — each incoming
request independently goes to provider A or B in proportion to the weights. There's no stickiness:
the same user may hit either provider on successive requests (good for an even A/B test). Removing
the rollout returns the model to its single provider immediately.

## Configure a rollout

1. Open **Projects → Rollouts** and pick a **logical model** (one already configured under Routing).
2. Set **Target A** and **Target B**: each is a registered **provider**, that provider's **upstream
   model** id, and a **weight**. The two weights must **sum to 100**.
3. **Save rollout.** Traffic begins splitting within ~1 second.
4. **Ramp** by editing the weights (e.g. 90/10 → 50/50 → keep the winner). **Remove canary** returns
   the model to its single Routing entry.

![The Rollouts tab](/images/canary-rollouts.png)

## Tips

- Both targets must be **providers you've registered** for the project (see [Providers](/admin/providers)).
- Use it to trial a new provider (e.g. a self-hosted model vs a cloud API) or compare two model
  versions on the same logical name your apps already call — no client changes needed.
- For a gradual *per-user* rollout (a user consistently gets the new model), ask us — that sticky
  mode is a separate option.

## Next steps

- [Routing](/admin/routing) — the logical models and providers a rollout splits between.
- [Providers](/admin/providers) — register the providers used as rollout targets.
