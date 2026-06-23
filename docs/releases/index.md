# Release notes

A user-facing summary of what each release delivered, newest first. Each product version pins a tested
[component matrix](/operate/upgrades) — the whole set is verified and shipped together.

::: info How to read this
These notes describe capabilities in product terms. For upgrade mechanics see [Upgrades](/operate/upgrades); for
the full configuration surface see the [Configuration reference](/reference/configuration).
:::

## v1.20.28 — Add Agent & Service-account in a dialog _(latest)_

Continuing the move to dialogs for create/edit forms: **Register AI agent** (Agents tab) and
**New service account** (Users tab) now open in a modal that closes on success — consistent with the
provider, MCP, and new-project dialogs. (Inline settings panels and primary list actions stay inline
by design.)

## v1.20.27 — See when each API key was last used

The **API keys** table now has a **Last used** column, so you can spot stale keys and revoke them
with confidence. The gateway records (best-effort, ~5-minute granularity) when a key last
authenticated a request.

::: info Coverage
Last-used is recorded for **OpenAI-compatible** providers (DeepSeek, OpenAI, etc.). Keys used only
through **native** providers (Claude, Gemini, Bedrock, Vertex) show **"—"** for now.
:::

## v1.20.26 — API keys: search, filter, sort, paginate & purge

The **API keys** page is now manageable at scale:
- **"Issue new key"** moved to the right of the Name/Expires fields (reads left-to-right).
- A controls bar: **search** by name/ID, **filter** by status (defaults to **Active**, so revoked/
  expired keys no longer clutter the view) and by project, plus **sortable** columns.
- **Pagination** (10/page) once the list is long.
- **Purge revoked** — one click to permanently delete all your revoked keys (active keys untouched;
  spend history is preserved).

## v1.20.25 — Cleaner Overview & API-keys header

The identity line on the **Overview** and **API keys** pages is now a tidy row of labelled chips
(Organization · Project · Team), and the project switcher sits neatly inside its chip. Fixes a
duplicated "Project" label that appeared next to the switcher.

## v1.20.24 — Switch between your projects

Members who belong to **more than one project** now get a **Project switcher** in the Overview and
API-keys pages (next to your organization). Pick a project to see its own budget, usage and keys,
and — on the API-keys page — **issue a key for the selected project**. The keys table shows a
**Project** column when your keys span multiple projects. If you're in a single project, nothing
changes.

## v1.20.23 — New-project dialog + correct per-project settings

- **Creating a project** is now a dialog with a clear **"Project created"** confirmation, and it
  closes on create instead of leaving the form on screen.
- **Switching projects** now always shows the selected project's own settings. Previously the
  configuration tabs (notably **Semantic Cache**) could still display the *previous* project's
  values — so a brand-new project looked like it already had caching enabled. New projects start
  with semantic cache **off** (unchanged default — it just now displays correctly).

## v1.20.22 — Fix: budget showed $0 for some users

Users whose email local-part contains a dot or other non-letter (e.g. `parame.s@…`, `chakrit.p@…`)
saw **$0 budget and no usage** on their Overview, even though their project budget was set. Their
gateway username is slugified (`parame.s` → `parame-s`), and the console wasn't matching the email
back to that username. The Overview now resolves the user correctly and shows the real budget and
spend. Users with simple emails (no dots) were unaffected.

## v1.20.21 — Overview shows your organization; cleaner error messages

- The **Overview** page now shows your **Organization** alongside Project and team, so it's clear
  which org you're working in.
- Error banners no longer dump a raw proxy/CDN error page (e.g. a Cloudflare "502 Bad gateway"
  HTML blob) into the console. When the gateway is briefly unreachable you now get a short
  "service is temporarily unavailable — please retry" message instead.

## v1.20.20 — Connect page: reasoning-effort ready

The **Connect a client** page now emits an opencode config with `reasoning: true` on the model, so
opencode shows its **reasoning-effort selector** (Default / Low / Medium / High) for your gateway
model — the gateway forwards the chosen effort upstream. Previously opencode hid the selector
because it didn't recognise the custom model name. Existing users: add `"reasoning": true` to your
model block, or just re-copy the config from the Connect page. Per-route default effort (set in
**Projects → Routing**) still applies when a client sends nothing.

## v1.20.19 — Release-pipeline hardening

A maintenance release — **no user-facing changes**. The release promotion now copies the exact
**commit-pinned image** built for the merged change (instead of a floating `:dev` tag), so a
concurrent push can never race the promotion and ship a stale image under a release tag. All
v1.20.18 capabilities are unchanged.

## v1.20.18 — Reasoning effort for Claude (experimental)

- **Reasoning effort now reaches Claude — experimentally.** Setting a route's **Reasoning
  effort** on a Claude provider injects a `thinking` budget (low/med/high → 2k/8k/16k tokens) at
  the gateway. It's **default-off** and clearly marked experimental in the UI.

::: warning Experimental
Anthropic exposes no documented thinking control through the upstream proxy, so this uses a
raw passthrough that is **rendered and tested but not verified end-to-end** against a live Claude
key — and it may not take effect (Anthropic also requires `max_tokens` > the thinking budget).
Treat it as best-effort and confirm in your own environment. **Bedrock/Vertex** are still
unsupported.
:::

## v1.20.17 — Reasoning effort for Gemini

- **Reasoning effort now reaches Gemini.** Setting a route's **Reasoning effort** on a Gemini
  provider now applies a matching **thinking budget** (low/med/high → 2k/8k/16k tokens) at the
  gateway. Because Gemini's thinking budget is a per-provider setting, a provider with several
  routes uses the **strongest** effort among them. (OpenAI-compatible providers like DeepSeek
  already got `reasoning_effort` in v1.20.14.)
- **Claude/Bedrock/Vertex** reasoning effort is still **planned** — the upstream proxy exposes no
  thinking-budget control for those yet, so we won't ship an unverifiable guess.

::: info Note
The Gemini thinking-budget config is rendered and tested, but its live effect hasn't been
verified end-to-end against a real Gemini key yet — set it and confirm in your own environment.
:::

## v1.20.16 — Pick an exact key expiry date

- **Expire a key on a specific date.** The **Expires** control on your API keys page now has an
  **On a date…** option with a date picker, alongside the quick presets (30/90/180/365 days) — so
  you can set a key to expire on an exact day, not just a rolling window.

## v1.20.15 — Name your API keys

- **Give each API key a name.** When you issue a key on your **API keys** page you can add an
  optional label (e.g. `laptop`, `CI`, `opencode`), shown in a new **Name** column — so a
  consumer with several keys can tell them apart at a glance. Existing keys simply show a dash.

## v1.20.14 — Per-route reasoning effort

- **Set a default reasoning effort on a model route.** On a project's **Routing** tab, each route
  now has a **Reasoning effort** (none / low / medium / high). When set, the gateway adds a default
  `reasoning_effort` to requests for that logical model — so you can make `coding-pro` think hard
  and `coding-fast` stay light without changing client code. A value sent in the request always
  wins. Applies to **OpenAI-compatible** providers (DeepSeek, etc.) for now; native Claude/Gemini
  thinking-budget support is planned.

## v1.20.13 — Edit a provider in place + test before saving

- **Edit an LLM provider.** Each provider row now has an **Edit** button that opens the form
  prefilled — change the base URL or **rotate the API key in place** (leave the key blank to keep
  the current one). No more delete-and-re-add, which previously risked orphaning a model route.
- **Test the connection from inside the dialog.** The Add/Edit provider dialog has a **Test
  connection** button that probes the upstream with the values you've entered (or the stored key
  when editing) and shows **✓ Connection OK** or a clear reason — so you can verify before saving.

## v1.20.12 — Streaming usage is metered again

- **Token usage from streaming requests is now counted.** Most clients (opencode, IDE
  assistants, chat UIs) stream their responses, and a parser bug meant the usage reported at the
  end of a streamed response was missed — so those calls showed **0 tokens / $0** on dashboards
  and didn't draw down budgets. Streaming usage is now captured correctly. (Non-streaming was
  always fine; no historical data is affected — metering is corrected going forward.)
- **A provider in use can't be deleted out from under its routes.** Deleting an LLM provider is
  now blocked while any model route still points at it — repoint or delete those routes first.
  This prevents a "dangling route" that would fail requests with a confusing error.

## v1.20.11 — Key expiry + self-serve key management

- **Set an expiry when you issue a key.** Your **API keys** page now has an **Expires** choice —
  Never, 30/90/180 days, or 1 year — so you can mint short-lived keys instead of only permanent
  ones. (The gateway already enforced expiry; now you can set it.)
- **Members manage their own keys.** The misleading **Rotate key** button is gone from member
  rows on a project — it didn't rotate (it just piled up extra keys) and members already manage
  their keys (issue, set expiry, revoke) on their own **Keys** page. Service accounts, which have
  no login, keep admin key management.

## v1.20.10 — Clearer, tidier in-app messages

- **Saves now confirm themselves.** Saving a setting — Semantic Cache, providers, routing,
  budgets, members, and the rest of a project's tabs — shows a green **✓ Saved** confirmation
  instead of appearing to do nothing.
- **Messages can be closed and don't linger.** Every error, success, and provider-test result
  now has a **×** to dismiss it, and switching tabs or projects clears stale messages — so a
  message never follows you onto an unrelated screen. Messages also appear **inside the content
  area**, next to the setting they relate to, rather than floating above the page.
- **Guidance reads as guidance, not errors.** Helpful empty-state hints (e.g. "add a provider
  first" on the Routing tab before any provider exists) now show as a calm blue note instead of
  an alarming red error.
- **Semantic Cache has a "coding" preset.** One click fills in conservative settings tuned for
  coding — high similarity, full-conversation key, shorter TTL — so a similar-but-different
  prompt never returns the wrong code (with a note to prefer leaving the cache off for
  tool-calling/streaming agents).

## v1.20.8 — Clearer provider test results

- **A failed provider test now names the real cause.** When the **Test** button reached a
  provider that rejected the credentials, the result mislabeled it as "your session has
  expired." It now reads correctly — e.g. **"The provider rejected the API key (HTTP 401) —
  check the key"** — and distinguishes a bad base URL (404), rate-limiting (429), or an
  upstream outage (5xx) from anything to do with your console login.

## v1.20.7 — Budget delete, provider templates & clearer errors

- **Remove a budget or limit.** The **Budgets & Limits** table now has a **Delete** on every
  row — project ceiling, group default, or individual override. Deleting a limit falls back
  to the next level up (member → group → project → organization).
- **Provider connection test now works.** Testing an LLM provider could fail with a confusing
  `certificate signed by unknown authority` even for a valid provider. That's fixed — the test
  now verifies the upstream's certificate correctly and reports a clean **Connection OK** (or a
  readable reason if it genuinely fails).
- **Friendlier errors, everywhere.** Error messages across the console no longer dump raw
  server JSON. You get a clear, plain-language message (and a dismissible red banner), on the
  project pages and beyond.
- **Add a provider from a template gallery.** The provider **Add** form is now a focused dialog
  with a gallery of **branded templates** — DeepSeek, OpenAI, Anthropic, Fireworks, Together,
  Groq, Self-hosted/vLLM, or **Custom** — click one to prefill the connection, then edit any
  field. The old cramped search box is gone.

## v1.20.6 — MCP usability: real connect URL + modal forms

- **MCP "Copy URL" now copies the real address.** Each MCP server's connect URL shows and
  copies your actual gateway domain (e.g. `https://mcp.your-domain/<org>.<project>/<name>`)
  instead of a `<domain>` placeholder.
- **Add/Edit moved into a focused dialog.** Registering or editing an MCP server now opens
  a clean modal instead of a cramped inline form — less clutter, more room.

## v1.20.5 — Project page polish + dashboard budget fix

- **Project page layout fixed and polished.** A wide table on a project's tab (LLM
  Providers, MCP Servers) could be cut off at the right edge after the v1.20.4 layout
  change, and that clipping made the buttons appear to flicker. Wide tables now fit/scroll
  cleanly and the page uses more width. The left section menu also gets **icons** per item,
  and the **MCP Servers** table is tidied up with a one-click **Copy URL** for each server's
  connect address.
- **Dashboard budget matches the enforced budget.** A user's *effective budget* shown in
  the console now resolves the full project → group → user limit hierarchy, so the number
  you see is the number actually enforced.

## v1.20.4 — Project settings, reorganized + flexible service accounts

Two improvements to project administration:

- **The project page is now grouped.** The 14 configuration tabs are organized into five
  sections — **Access**, **Models**, **Safety & Prompts**, **Tools**, **Governance** — in a
  side menu, so it reads like a settings page instead of a long row of tabs. Nothing moved
  in terms of *what* you can configure; it's just easier to find.
- **Service accounts no longer require an owner.** A service account belongs to the
  **project** and is managed by org admins. You can still optionally name an owner so that
  member can self-manage its key from their portal — but if they later leave the
  organization, the service account keeps working untouched.

## v1.20.3 — Group list reflects deletions

The **Group** picker on a project's Users/Agents tabs now lists exactly your
organization's groups (plus **default**). Previously a group could keep appearing in the
picker after you deleted it; it now disappears as soon as it's removed under
**Organization → Groups**.

## v1.20.2 — Smoother member onboarding

Three rough edges in member management are gone:

- **Deleting a member (or group, provider, project) no longer shows a false "HTTP 500".**
  The delete was actually working, but the console mishandled the server's empty
  "no content" response and surfaced a spurious error. Deletes now report success
  cleanly.
- **Members create their own API key.** Adding a member no longer hands the admin a key
  the member doesn't need — each person generates their own from their **Keys** page
  after signing in. (Service accounts and AI agents, which have no login, still get their
  key at creation.)
- **Adding a member is one tap.** Every organization now has a **default** group that's
  pre-selected on the form, so you don't have to set one up first.

## v1.20.1 — Reliable member management + group controls

Adding people to a project is now solid. Previously, adding a member could fail with a database error
(and still leave a half-created entry) when the chosen **group** hadn't been set up for the organization
yet. Now the group is **created automatically** as part of the add, the whole operation is **atomic** (it
either fully succeeds or changes nothing — no orphaned entries), and adding the **same person twice** to a
project is politely rejected instead of creating a duplicate.

Group management is rounder too: the project **Users** tab now lists your organization's real groups, and
you can **delete** a group from **Organization → Groups** (blocked while anyone still uses it). See
[Groups](/admin/organizations-and-members#groups).

## v1.20 — Agent tool-access enforcement

Govern not just *who* an agent is, but *what it can touch*. You can now give any AI agent a **tool
allow-list** — pick exactly which [MCP tools](/admin/mcp-servers) it may call, and the gateway blocks
every other tool call (before it reaches the tool). It's **opt-in and default-allow**: an agent with no
list keeps full access, so scoping one agent never disrupts the rest. Set it on the project's **Agents**
tab → an agent's **Tool access**.

See [Restrict which tools an agent can call](/admin/agents#restrict-which-tools-an-agent-can-call).

## v1.19.1 — Security maintenance

A maintenance release — **no user-facing changes**. Hardens the **admin console** container image by
removing the unused `npm` CLI from the runtime, which clears a HIGH-severity advisory
(CVE-2026-12151, an `undici` denial-of-service) the image scanner flagged. The console behaves exactly
as in v1.19; all v1.19 capabilities below are unchanged.

## v1.19 — Agent & Tool catalog

One governance overview of everything that can act in your organization. The new **Agent & Tool
catalog** (admin sidebar) lists every **AI agent** and every governed **tool** (MCP server) across
all projects — with its **owner** and **risk tier** — and a risk filter to focus on what matters.

- **Tools get owner + risk** — MCP servers now carry the same governance metadata as agents (owner,
  risk tier, description), set on the project's MCP servers tab.
- **One pane for "what exists, who owns it, how risky"** — across every project in the org.

See [Agent & Tool catalog](/admin/catalog).

## v1.18 — Trusted Agent Identity

Make every autonomous AI agent a **first-class, governed principal** instead of an anonymous shared
key. Register an agent under a project's new **Agents** tab — give it an owner, who it *acts for*, and a
**risk tier** — and it gets its own verifiable, revocable credential that flows through every LLM **and**
MCP/tool call.

- **Per-agent everything, no new machinery** — an agent is governed exactly like any principal:
  per-agent [budgets](/admin/budgets-and-limits), model allow-lists, [guardrails](/admin/guardrails),
  [MCP](/admin/mcp-servers) isolation, and the [kill-switch](/admin/kill-switch).
- **Per-agent cost** — agent spend is labeled and attributed on the [FinOps](/admin/finops) chargeback.
- **Stop one agent instantly** — rotate or delete an agent to revoke its credential at the gateway.

See [AI Agents — trusted agent identity](/admin/agents).

## v1.17 — FinOps: chargeback & forecast

Turn usage into money. A per-tenant **chargeback statement** (project → group → user → model,
priced server-side, **CSV-exportable** for internal billing) and a **budget forecast** that
projects where this month's spend will land — so you can act before a cap is hit.

- **Chargeback** — on **Usage → FinOps**, pick a month and export a priced statement. Pricing is the
  same the gateway *enforces* with, so the bill can't disagree with what capped spend.
- **Unpriced usage is flagged**, never silently billed $0.
- **Forecast** — per budget (project/user): spend-to-date, % consumed, projected month-end, with an
  over-budget warning.

See [FinOps — chargeback & forecast](/admin/finops).

## v1.16 — Guardrail review & approval

Guardrail changes are now **governed**, not applied live by one person. A change to a project's
prompt-injection patterns or [semantic guard](/admin/semantic-guard) is a **staged, versioned
revision**: one admin proposes, a different admin approves (4-eyes), and only then does it reach the
gateway.

- **Propose → approve → publish** — proposed changes are **pending** (not live) until a second admin
  approves; every version is recorded with who proposed and who approved, and is **revertible**.
- **Approval mode per organization** — **strict** (4-eyes) or **self** (single-admin teams / dev).
- **Tune from evidence** — a per-project **policy-hit** view shows how often each rule fires and how
  many users flagged a false positive.

See [Guardrails](/admin/guardrails).

## v1.15 — AI kill-switch

An **emergency stop** for AI traffic. An admin can instantly block **all** LLM and agent (MCP)
traffic for a scope — for an incident, a suspected key leak, abuse, or a compliance hold — and
resume it just as fast.

- **One-click suspend/resume** — on **Projects → Settings**, suspend all traffic for a project
  (with an optional reason); every consumer in it gets `503` within seconds. Resume restores it.
- **Three scopes** — project, organization, or global (whole platform), mirroring budgets.
- **Reversible & audited** — budgets, keys, and config are untouched; every suspend/resume is in
  the audit log with the actor and reason.

See [AI kill-switch](/admin/kill-switch).

## v1.14 — Native providers (Bedrock, Vertex, Claude, Gemini) + failover

Connect **AWS Bedrock, Google Vertex, Anthropic Claude, and native Google Gemini** directly — your apps
keep speaking the OpenAI chat API and the gateway **translates the protocol** automatically. Native
providers also get built-in **resilience**.

- **Native providers** — on **Projects → LLM Providers**, pick Bedrock / Vertex / Claude / Gemini and enter
  that provider's own credentials (AWS keys, Vertex service-account, API keys). No app changes.
- **Failover + retry** — give a native provider multiple API keys and the gateway rotates off a failing key
  (with health-checks); optionally retry failed requests.
- **No disruption** — OpenAI-compatible providers (OpenAI/DeepSeek/Fireworks/self-hosted, …) work exactly as
  before; native providers run alongside them per project.

See [Providers](/admin/providers) and [Routing](/admin/routing).

## v1.13 — Turn REST APIs into governed MCP servers

Register an existing REST API as a **governed MCP server** in clicks — no code. Paste the API's
**OpenAPI/Swagger spec**, **pick which operations** agents may call, and the gateway exposes each as
an MCP tool, fronted by the same project-key authentication, per-project isolation, and audit as the
rest of your traffic.

- **OpenAPI → MCP** — on **Projects → MCP Servers**, choose **Source → REST API (OpenAPI)**, paste the
  spec, and **Discover tools**.
- **Pick the tools agents get** — the operation checklist is the access policy; unticked operations
  are never exposed.
- **Same connect URL and governance** as a proxied MCP server — agents can't tell the difference, and
  cross-project keys are still refused (`403`).

See [MCP servers](/admin/mcp-servers) and [Use MCP servers](/user/use-mcp-servers).

## v1.12 — Governed MCP tool calls, end-to-end

The MCP gateway now **proxies agent tool calls through to your registered servers**. A governed
`tools/list` / `tools/call` reaches the backend MCP server and returns real results — with the same
project-key authentication, strict per-project isolation, and activity recording as your LLM traffic.
Earlier releases registered and fronted MCP servers; this release completes the governed data path.

- **Tool calls flow through the gateway** — list and call tools on a registered server with your
  project API key; a key from another project is still refused (`403`).
- **Choose the transport per server** — register each MCP server as **Streamable HTTP** (the default)
  or **SSE**, to match how your backend speaks MCP.

See [MCP servers](/admin/mcp-servers) and [Use MCP servers](/user/use-mcp-servers).

## v1.11 — Observability stack modernization _(internal)_

Platform internals only — **no change to how you use the gateway**. The bundled metrics/logs/traces
stack moved to maintained community Helm charts, and the standalone metrics store was simplified for
more reliable single-node installs. See [Platform observability](/operate/observability-platform).

## v1.10 — Prompt management & model rollouts

Three additions that put the **prompt** and **model choice** under governance — all per-project,
configured from the console, default-off.

- **Enforced prompt** — set a project-wide system prompt + policy the gateway prepends to every
  request before the model. Applied at the gateway, so an app (or a compromised client) can't
  strip it; change it once and every app picks it up. See [Prompt management](/admin/prompt-management).
- **Prompt template catalog** — author named, versioned prompt templates with `{{variable}}`
  placeholders; apps invoke a *published* template by name and pass values, instead of hard-coding
  prompt text. Draft vs published keeps edits off live traffic until you publish. See
  [Prompt templates](/admin/prompt-templates) and [Use prompt templates](/user/use-prompt-templates).
- **Canary / A-B rollouts** — split a logical model's traffic across two providers by weight
  (e.g. 90/10 → 50/50 → 100) to A/B test or safely roll out a new provider — randomized per
  request, with no client changes. See [Rollouts](/admin/canary-rollouts).

## v1.9 — MCP gateway

Governed access to AI-agent tools. Register remote **Model Context Protocol** servers per project; the gateway
fronts them with the same project API key, strict per-project isolation, and activity recording you already use
for LLM traffic.

- One key for chat and tools — agents authenticate with the project API key.
- A key can only reach its own project's MCP servers; cross-project access is refused.
- A per-project catalog of registered servers, with a connect URL for developers.

See [MCP servers](/admin/mcp-servers) and [Use MCP servers](/user/use-mcp-servers).

## v1.8 — Semantic guard

Embedding-based prompt-injection protection that catches **paraphrased** attacks a regex would miss. Each project
can tune it with its own allow/deny sample prompts, and the multilingual embedding model handles non-English
prompts (including Thai).

See [Semantic guard](/admin/semantic-guard).

## v1.7 — Semantic cache

A response cache keyed by **meaning**. Semantically similar prompts reuse a prior answer, cutting latency and
upstream spend. Cache savings are visible in the dashboards, and cache-aware pricing keeps cost figures accurate.

See [Semantic cache](/admin/semantic-cache).

## v1.6 — Control plane & multi-project

The configuration **control plane** (PostgreSQL source of truth) with continuous reconcile onto the gateway, plus
multi-organization, multi-project tenancy. Administrators manage everything through the console or the API;
nothing is hand-edited on the cluster.

This release also brought **per-org observability isolation**, **hierarchical budgets and limits** (org →
project → group → user), **per-project providers, routing, and guardrails**, member **self-service API keys**,
**per-organization IdP brokering** (OIDC/SAML), the **audit log**, and control-plane **hardening** (verified
identity, internal-service auth, network policy).

See [Architecture](/overview/architecture), [Multi-tenancy model](/overview/multi-tenancy),
[Budgets & limits](/admin/budgets-and-limits), and [SSO & IdP brokering](/admin/sso-and-idp).

## v1.4–v1.5 — SSO & observability

Single sign-on for the console and dashboards via your corporate IdP, and a **self-hosted** metrics/logs/traces
stack with per-organization usage and cost dashboards.

See [Observability](/admin/observability) and [SSO & IdP brokering](/admin/sso-and-idp).

## v1.3 — Dashboards & guardrails

Usage and cost dashboards from gateway telemetry, plus the first guardrails — prompt-injection detection and
optional PII masking.

See [Guardrails](/admin/guardrails).

## v1.2 — Budgets & limits

USD **budgets** and token-per-minute **limits** per group and user, with API-key authentication and a budget
controller that prices usage and enforces caps.

See [Budgets & limits](/admin/budgets-and-limits).

## v1.1 — Engine & routing

The core gateway: an OpenAI-compatible endpoint with **work-type → model routing**, so developers call stable
logical model names and administrators decide which provider and model serve them.

See [Routing](/admin/routing) and [Models & routing](/user/models-and-routing).

## Next steps

- [What is Opsta AI Gateway](/overview/what-is) — the product in one page.
- [Upgrades](/operate/upgrades) — how to move to a new version.
