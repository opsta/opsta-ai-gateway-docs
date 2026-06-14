> 🌐 **เอกสารภาษาไทยกำลังจัดทำ** — เนื้อหาด้านล่างเป็นภาษาอังกฤษชั่วคราว จนกว่าจะมีการแปล. _This page is not yet translated; English content is shown temporarily._

# Providers

A **provider** is an upstream AI service you connect to a project. The gateway supports OpenAI-compatible
providers, DeepSeek, Anthropic, and generic endpoints. Provider credentials are stored as **per-organization
secrets** — never in plaintext config and never exposed back through the API.

::: info Who can do this
**Org admins** (for their organization) and **platform admins**, on **Projects → LLM Providers**.
:::

## Add a provider

1. Open **Projects**, select the project, and go to the **LLM Providers** tab.
2. Click **Add provider** and choose a **type** (OpenAI-compatible, DeepSeek, Anthropic, or generic).
3. Enter the **base URL** and the **API key** for that provider.
4. Click **Test connection** to verify the credentials before saving.
5. Save. The provider is now available to [routing](/th/admin/routing).

![The LLM Providers tab — add-provider form](/images/providers.png)

::: tip Credentials are secrets
Provider API keys are written to a per-organization Kubernetes Secret by the control plane. They are never
returned in any API response and never leave your cluster.
:::

## Manage providers

The Providers tab lists the project's providers. You can **test** a provider's connection again at any time or
**delete** one (after removing routes that point to it).

## Next steps

[Routing](/th/admin/routing) — map logical models to this provider.
