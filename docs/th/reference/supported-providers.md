> 🌐 **เอกสารภาษาไทยกำลังจัดทำ** — เนื้อหาด้านล่างเป็นภาษาอังกฤษชั่วคราว จนกว่าจะมีการแปล. _This page is not yet translated; English content is shown temporarily._

# Supported providers

The gateway speaks the **OpenAI-compatible** API, so it works with any provider that exposes that interface — and
with self-hosted models behind an OpenAI-compatible shim. Providers are configured **per project**, with their
credentials held as Kubernetes Secrets in your cluster.

::: info Who this is for
Administrators connecting model providers, and architects evaluating compatibility.
:::

## Provider types

| Type | Examples | Notes |
|---|---|---|
| **OpenAI-compatible** | OpenAI, and any gateway/proxy exposing the OpenAI API | The native interface; works out of the box |
| **DeepSeek** | DeepSeek chat/coder models | Supported including cache-aware pricing tiers |
| **Anthropic** | Claude models | Via the provider integration |
| **Generic / self-hosted** | vLLM, Ollama, internal model servers | Any endpoint that presents an OpenAI-compatible API |

Because routing is by **logical model name**, your developers call stable names (e.g. `coding-default`) and you
map them to whichever provider and real model you choose — see [Routing](/th/admin/routing).

## How to add a provider

1. As an org admin, open **Projects → Providers** for the project.
2. Add the provider: its **type**, the **endpoint**, and the **API key** (stored as a Secret, scoped to the
   project).
3. **Test** the connection from the console.
4. Map one or more **logical model names** to the provider's real model IDs in **Routing**.

The control plane provisions the routing and key injection; your developers immediately get the new model by its
logical name. See [Providers](/th/admin/providers) for the full workflow.

## Pricing & cost accuracy

Each model's per-token price drives every budget and usage figure. For providers that support prompt caching, the
platform tracks **cache-read** and **cache-write** rates separately so cached requests are costed accurately. See
[Pricing](/th/admin/pricing).

## Isolation

A provider's credentials belong to the project that configured them. A key from one project can never use another
project's providers — isolation is enforced at the gateway. See the
[Multi-tenancy model](/th/overview/multi-tenancy).

## Next steps

- [Providers](/th/admin/providers) — connect and test a provider.
- [Routing](/th/admin/routing) — map logical names to provider models.
- [Pricing](/th/admin/pricing) — keep cost figures accurate.
