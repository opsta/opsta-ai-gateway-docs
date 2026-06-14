# Opsta AI Gateway — Documentation Redesign Spec

**Date:** 2026-06-14 · **Status:** spec for review, then phased implementation.
**Repo:** `opsta-ai-gateway-docs` (VitePress ~1.5.0 + mermaid 11.4 / vitepress-plugin-mermaid 2.0.17).
**Deploys to:** `https://docs.ai-gateway.opsta.co.th` (GitHub Pages, `docs/public/CNAME`).

## 1. Goals & decisions (locked)
- Replace the patched-by-feature docs with a **structured enterprise product manual** — Overview, **User Guide**,
  **Administrator Guide**, Deploy & Operate, Security & Compliance, Reference, Release notes.
- **Look trusted & enterprise:** custom-branded VitePress theme (Opsta navy/blue, Montserrat, logo, custom home),
  consistent callouts, light + dark (a theme toggle IS appropriate for docs).
- **Bilingual EN + TH** via VitePress i18n: English at the root, Thai under `/th/`. **EN written fully; the i18n
  scaffold (locale config + `/th/` tree + language switcher) is set up so Thai can drop in, but Thai content is
  NOT written here — it's handed to Gemini to translate later** (landing-page precedent). Don't block the rewrite
  on translating ~45 pages.
- **Enterprise-product framing:** present the commercial product. De-emphasize OSS/Higress/GitHub on the home &
  overview; keep "built on" / underlying-tech mentions only where technically necessary (architecture/reference).
  Remove the GitHub nav link; point external links to the company/product site.
- **Diagrams-first + screenshot placeholders:** Mermaid (+ custom SVG) everywhere; admin/user procedures carry
  clearly-marked screenshot placeholders that real dev-env captures fill later.
- **Maintainable by capability + persona, never chronologically.** A new feature slots into the right Admin/User
  page + a release-note entry. Every procedure follows one template (below).

## 2. Tech setup
- **i18n:** restructure `docs/.vitepress/config.js` to `locales: { root: {label:'English', lang:'en-US'}, th:
  {label:'ไทย', lang:'th', link:'/th/', themeConfig: { nav, sidebar localized } } }`. Thai pages mirror the EN
  tree under `docs/th/`. Keep `search: { provider: 'local' }` (multi-locale aware), `cleanUrls`, mermaid.
- **Custom theme:** add `docs/.vitepress/theme/{index.js,custom.css}` extending `DefaultTheme`.
  - `custom.css`: brand tokens — `--vp-c-brand-1:#008BEA; --vp-c-brand-2:#0067b8; --vp-c-brand-3:#005a9e;`
    navy `#111F35` for the dark-theme bg accents/footer/hero; **Montserrat** for headings + UI (self-host or
    Google Fonts), readable body font; brand-colored callouts.
  - Home hero + feature-card styling to look bespoke, not default-VitePress.
- **Brand assets** → `docs/public/`: Opsta logo SVGs (from `opsta-logo-and-guideline`), favicon = symbolic mark
  (already added for the website — reuse). Set `themeConfig.logo` + `head` favicon/theme-color/OG.
- **Nav/footer:** nav = Overview · User Guide · Admin Guide · Deploy · Security · Reference · Release notes; a
  language switcher (i18n built-in) + theme toggle. Footer: Opsta (Thailand) Co., Ltd. © 2026; no GitHub.

## 3. Information architecture (per-page outlines)
> Each page = **purpose · key content · diagram(s) · screenshot placeholder(s) · source material**. `[SS]` =
> screenshot placeholder; `[MMD]` = Mermaid diagram.

### Home — `docs/index.md`
Branded hero (enterprise tagline aligned to marketing: *"Take control of enterprise AI — on infrastructure you
own"*); three role entry-cards → User Guide / Admin Guide / Deploy & Operate; a row of capability highlights
(cost control, guardrails, multi-tenancy, MCP, sovereignty). Custom layout.

### Overview — `docs/overview/`
| Page | Content | Diagrams / SS | Source |
|---|---|---|---|
| `what-is.md` | What it is (enterprise framing), who it's for, the core promise (govern cost/access/risk on your infra) | — | feature-inventory; intro/what-is |
| `concepts.md` | Key concepts + **glossary table**: Organization, Project, Group, User, Consumer, API key, Provider, logical model/route, budget, guardrail, semantic cache/guard, MCP server, control plane vs data plane | — | ARCH; product knowledge |
| `architecture.md` | Control plane (Postgres = source of truth) + data plane (gateway) + reconcile loop; component map | `[MMD]` architecture; `[MMD]` control-plane↔data-plane | ARCH §Layers/§Control plane |
| `request-lifecycle.md` | A request's path through the gates (key-auth → guardrails → routing → budget/limits → cache → provider); **"which gate rejected me" (401/403/429) table** | `[MMD]` request flow | ARCH §Layers/§gates |
| `multi-tenancy.md` | Org→Project→Group→User; RBAC (platform_admin/org_admin/member); per-org isolation & observability | `[MMD]` tenancy tree; `[MMD]` budget hierarchy | ARCH §Multi-tenant |

### User Guide — `docs/user/` (the developer who consumes the gateway)
| Page | Content | SS | Console source |
|---|---|---|---|
| `get-access.md` | Sign in (SSO), self-enrol, your profile/org/group/allowed models | `[SS]` Profile | `/profile`, `/` |
| `connect-a-client.md` | Base URL, get a key, copy-paste configs for opencode/Crush/OpenAI SDK/curl | `[SS]` Connect-a-client | `/onboarding` |
| `api-keys.md` | Issue / rotate / revoke your keys; one-time display; activity/last-used | `[SS]` API keys | `/keys` |
| `models-and-routing.md` | Logical model aliases, allowed models, how routing resolves for you | — | `/onboarding`, `/profile` |
| `use-mcp-servers.md` | Connect to governed MCP servers — the catalog, the connect URL, use your project key | `[SS]` MCP catalog | `/onboarding`, MCP tab (read) |
| `usage-and-budget.md` | View your token usage, spend vs budget, per-model breakdown | `[SS]` Overview dashboard | `/` |
| `blocked-requests.md` | Why a request was blocked (403), report a false positive | `[SS]` Blocks | `/blocks` |

### Administrator Guide — `docs/admin/` (org admin + platform admin)
| Page | Content | SS | Console source |
|---|---|---|---|
| `console-tour.md` | Console layout, role-based nav (member/org-admin/platform-admin sections), setup guide | `[SS]` nav + admin home | NavRail, SetupGuide |
| `organizations-and-members.md` | Create orgs, invite members, roles/RBAC, groups | `[SS]` Orgs, Members | `/admin/orgs`, `/admin/org?tab=members\|groups` |
| `projects.md` | Project model; create/rename/delete; the config editor & its tabs (overview) | `[SS]` Projects + tabs | `/admin/projects` |
| `providers.md` | Add/manage LLM providers; per-project keys (per-org Secrets); test connection | `[SS]` Providers tab | tab=providers |
| `routing.md` | Logical model → provider → upstream model; work-type aliases | `[SS]` Routing tab | tab=routing |
| `budgets-and-limits.md` | Hierarchical USD budgets (org≥project≥group≥user), TPM limits; org usage view | `[SS]` Limits, Usage | tab=limits, `/admin/usage` |
| `guardrails.md` | PII masking + prompt-injection (pattern); the library + custom regex; org block review | `[SS]` Guardrails, Org blocks | tab=guardrails, `/admin/blocks` |
| `semantic-cache.md` | Enable; TTL, similarity threshold, key strategy; savings | `[SS]` Cache tab | tab=cache |
| `semantic-guard.md` | Enable; threshold; deny/allow prompt examples | `[SS]` Guard tab | tab=guard |
| `mcp-servers.md` | **Register remote MCP servers, connect snippet, cross-project isolation, activity** (the missing feature) | `[SS]` MCP tab | tab=mcp |
| `sso-and-idp.md` | Per-org IdP brokering (OIDC/SAML), claim→group→role mapping, JIT; platform login methods | `[SS]` Org SSO | tab=sso |
| `observability.md` | Per-org Grafana dashboards; usage/cost/cache panels; how to read them | `[SS]` Grafana | external Grafana |
| `pricing.md` | Platform model pricing overrides (drives all budgets) | `[SS]` Pricing | `/admin/pricing` |
| `audit-log.md` | Audit trail, filters (actor/action/date), org vs platform scope | `[SS]` Audit | `/admin/audit` |

### Deploy & Operate — `docs/operate/` (platform engineers)
`requirements.md` · `install.md` (Helm/helmfile, the one config surface) · `configuration.md` (concerns + link
to Reference; domains/subdomains/separator) · `tls-and-domains.md` (`tls.mode` letsencrypt/provided/selfsigned,
wildcard cert, Cloudflare tunnel/DNS) · `high-availability.md` (`global.highAvailability`, replicas/PDBs/
anti-affinity) · `air-gap.md` (mirror every image, offline) · `byo-operators.md` (reuse cert-manager/redis/cnpg)
· `upgrades.md` (component matrix, build-once/promote-by-retag) · `backup-and-dr.md` (CNPG backups, restore) ·
`observability-platform.md` (LGTM, retention, per-org tenant isolation, NetworkPolicy) · `troubleshooting.md`
(gateway 401/403/429/503, reconcile-not-ready, cert/DNS). `[MMD]` deployment topology. Source: ARCH §§ TLS,
HA/air-gap, release pipeline, observability; config inventory.

### Security & Compliance — `docs/security/`
`overview.md` · `data-sovereignty.md` (on-prem, air-gap, data never leaves, residency) · `rbac.md` (model,
least privilege) · `audit-and-compliance.md` (audit log, retention) · `hardening.md` (NetworkPolicies, secrets,
internal-auth + JWT verification, supply-chain scanning). Source: ARCH §§ control-plane auth, audit, hardening.

### Reference — `docs/reference/`
| Page | Content | Source |
|---|---|---|
| `rest-api.md` | ~70 routes grouped by resource (orgs/projects/providers/models/budgets/guardrails/cache/guard/**mcp-servers**/keys/members/idp/audit/usage/ingest/health); method · path · purpose · auth/role | API inventory (this spike) |
| `configuration.md` | ~100 operator knobs grouped (global/tls/redis/postgres/observability/sso/keycloak/controlPlane/budgets/guardrails/rateLimits/semantic*/mcp/console/images/dev); key · purpose · default | values.yaml inventory |
| `supported-providers.md` | Provider types (OpenAI-compatible, DeepSeek, Anthropic, generic) + how to add | providers tab |
| `glossary.md` | (link/merge with `overview/concepts.md`) | — |

### Release notes — `docs/releases/index.md`
User-facing, versioned changelog condensed from the milestone history (v1.0 engine → SSO → control plane →
enterprise identity → multi-tenant → semantic cache (v1.7) → semantic guard (v1.8) → **MCP Gateway (v1.9)**),
each entry = what changed, for whom, any action needed. New features append here going forward.

## 4. Diagram inventory (Mermaid; `[MMD]` above)
Architecture (control/data plane + reconcile) · request lifecycle (gate chain) · identity/SSO brokering flow ·
multi-tenancy tree · budget hierarchy · MCP request flow · deployment topology (namespaces/operators/data
plane). Branded SVG only where Mermaid is insufficient (e.g. the home hero).

## 5. Authoring conventions (the maintainability fix)
- **Page template:** H1 · one-sentence purpose · *Prerequisites* (callout) · numbered steps · *Expected result*
  · *Related* links. Reference pages use tables.
- **Callouts:** `::: tip / warning / danger / info` used consistently (prereqs=info, gotchas=warning,
  destructive=danger).
- **Voice:** second person, active, concise; define a term once (glossary) then link.
- **One concept per page**; cross-link rather than duplicate. New feature → its Admin/User page + a release note,
  not a new top-level patch.

## 6. Migration map (old 12 pages → new)
| Old | New home |
|---|---|
| `intro/what-is`, `intro/whats-next` | `overview/what-is` |
| `intro/architecture` | `overview/architecture` + `overview/request-lifecycle` |
| `intro/features` | distributed across User + Admin guides |
| `intro/getting-started` | `operate/install` + `user/get-access` |
| `guides/connect-a-provider` | `admin/providers` |
| `guides/use-from-opencode` | `user/connect-a-client` |
| `guides/sign-in-with-google` | `user/get-access` + `admin/sso-and-idp` |
| `guides/when-a-request-is-blocked` | `user/blocked-requests` + `admin/guardrails` |
| `guides/production-deployment` | `operate/*` (split) |
| `guides/automated-testing` | drop from public docs (internal eng concern) or `security/hardening` note |
Delete the old `intro/` and `guides/` dirs once content is migrated; add VitePress redirects for any externally
shared old URLs (`/intro/what-is` → `/overview/what-is`, etc.) via a small redirects map.

## 7. Build phases (decomposed — each ends green + deployed)
0. **Foundation** — i18n config + custom branded theme + home + full nav/sidebar + **stub pages for every
   section** (so the structure is live and looks enterprise). Migrate nothing yet. *Gate:* `bun run docs:build`
   clean, deploys, branded, all nav present.
1. **Overview** (5 pages + diagrams).
2. **User Guide** (7 pages + SS placeholders).
3. **Administrator Guide** (14 pages + SS placeholders).
4. **Deploy & Operate** (11 pages + topology diagram).
5. **Security & Compliance + Reference + Release notes** (~10 pages).
6. **Thai i18n scaffold + handoff** — the `/th/` locale, localized nav/sidebar, and language switcher are wired
   in Phase 0; this phase mirrors the EN page tree under `docs/th/` (stub/English-copy placeholders) and hands
   off to **Gemini for the actual EN→TH translation** later. We do NOT write Thai content.
Prune old pages + add redirects as each section's replacement lands.

## 8. Acceptance
- `bun run docs:build` clean (no dead links beyond the intentional `ignoreDeadLinks` during stubs); mermaid
  renders; local search works; light/dark + EN/TH switch work.
- Deployed at `docs.ai-gateway.opsta.co.th`; branded (Opsta logo/colors/Montserrat), not default VitePress.
- No GitHub/OSS framing on home/overview; enterprise positioning consistent with the marketing site.
- Every admin/user procedure follows the page template with prereqs/steps/result + a marked `[SS]` placeholder.
- The MCP Gateway is documented (User: use-mcp-servers; Admin: mcp-servers; Reference: mcp-servers routes).

## 9. Decisions locked (no further questions needed)
- **Thai:** EN-first; i18n scaffold in Phase 0; **Gemini translates EN→TH later** — we don't write Thai content.
- **Screenshots:** `[SS]` placeholders now; a dedicated real-capture pass (or user-provided captures) comes later
  — implementation does NOT block on dev-console SSO automation.
- **Old `.opsta.dev` redirect:** out of scope (different DNS zone); track separately.
