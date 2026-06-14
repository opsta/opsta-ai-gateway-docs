> 🌐 **เอกสารภาษาไทยกำลังจัดทำ** — เนื้อหาด้านล่างเป็นภาษาอังกฤษชั่วคราว จนกว่าจะมีการแปล. _This page is not yet translated; English content is shown temporarily._

# Models & routing

You call the gateway with a **logical model name**, not a provider's raw model ID. The gateway resolves that
name to a configured provider and upstream model. This keeps your client stable even when an administrator
re-points a model behind the scenes.

## Logical models

A logical model is a stable alias your administrator defines per project — for example:

| Logical model | Typical use |
|---|---|
| `coding-default` | Day-to-day coding and reasoning |
| `bulk` | High-volume, lower-cost tasks |

Send the logical name in the `model` field; the gateway routes it to the right provider and real model. If the
administrator later swaps the underlying provider or model, **your code does not change**.

## Which models can I use?

Your **group** determines the models you're allowed to call. You can see your allowed models on your **Profile**
and on the **Connect a client** page. If you request a model your group isn't allowed, the gateway rejects the
request.

::: tip
Use the logical names your team agreed on (e.g. `coding-default`) rather than provider-specific IDs — it's the
stable contract and lets the platform optimize cost and routing without breaking your client.
:::

## Next steps

- [Connect a client](/th/user/connect-a-client) — send a request with a logical model.
- Administrators configure these in [Routing](/th/admin/routing).
