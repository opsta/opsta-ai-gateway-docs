# Opsta AI Gateway Docs Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: use superpowers:subagent-driven-development or
> superpowers:executing-plans to implement task-by-task. Steps use checkbox (`- [ ]`) syntax.
> **Spec:** `docs-redesign-spec.md` (repo root) — read it; §3 holds every page's content outline.

**Goal:** Replace the patched VitePress docs with a branded, bilingual-ready, persona-structured enterprise
product manual (Overview · User Guide · Admin Guide · Deploy & Operate · Security · Reference · Release notes),
deployed at `docs.ai-gateway.opsta.co.th`.

**Architecture:** Keep VitePress (~1.5.0 + mermaid). Add a custom branded theme (`.vitepress/theme/`), i18n
locale scaffold (EN root + `/th/`), a custom home, and a new sidebar/IA. Content is written per persona to the
spec's outlines. Thai content is NOT written here — the `/th/` scaffold is wired and handed to Gemini later.

**Tech stack:** VitePress, Vue (theme), Mermaid, `@fontsource/montserrat`, GitHub Pages + Cloudflare DNS, `bun`.

**"Tests" for a docs project** = `bun run docs:build` completes clean (no unexpected dead links), Mermaid renders,
the dev server shows the page, search indexes it. Each task ends: build clean → eyeball in `bun run docs:dev` →
commit (on the branch).

**⚠️ Branch & deploy strategy (IMPORTANT):** do ALL of this on **`feature/docs-redesign`**, NOT on `main`.
Pushing to `main` deploys to the LIVE site, and Phase 0's stubs would **replace the current 12 real pages with
"being written" placeholders** — a public regression. **Merge to `main` (→ live `docs.ai-gateway.opsta.co.th`)
only when content is ready** (all phases done, or at minimum Overview + User + Admin). The old `intro/`/`guides/`
pages stay live on `main` until that merge.

**Build-spike (validated 2026-06-14):** the Phase-0 risky bits are **verified working** — VitePress 1.5 i18n
`locales` config builds; the custom theme + `@fontsource/montserrat` builds; **Mermaid renders under the custom
`extends: DefaultTheme` theme** (screenshot-confirmed); the `public/**.html` redirect form works on GitHub Pages
(pretty-URLs). The config/theme/home code below is the verified version.

---

## File structure (target `docs/` tree)
```
docs/
  index.md                     # branded home (layout: home)
  .vitepress/
    config.js                  # i18n + nav + sidebar + head + mermaid  (REWRITTEN)
    theme/
      index.js                 # extends DefaultTheme + fonts + custom.css   (NEW)
      custom.css               # Opsta brand tokens + Montserrat + home polish (NEW)
  public/
    CNAME                      # docs.ai-gateway.opsta.co.th (already set)
    favicon.svg                # Opsta symbolic mark (NEW)
    logo.svg  logo-dark.svg    # Opsta wordmark for nav, light/dark (NEW)
    intro/* guides/*           # meta-refresh redirect stubs for old URLs (NEW)
  overview/   {what-is, concepts, architecture, request-lifecycle, multi-tenancy}.md
  user/       {get-access, connect-a-client, api-keys, models-and-routing, use-mcp-servers, usage-and-budget, blocked-requests}.md
  admin/      {console-tour, organizations-and-members, projects, providers, routing, budgets-and-limits, guardrails, semantic-cache, semantic-guard, mcp-servers, sso-and-idp, observability, pricing, audit-log}.md
  operate/    {requirements, install, configuration, tls-and-domains, high-availability, air-gap, byo-operators, upgrades, backup-and-dr, observability-platform, troubleshooting}.md
  security/   {overview, data-sovereignty, rbac, audit-and-compliance, hardening}.md
  reference/  {rest-api, configuration, supported-providers, glossary}.md
  releases/   index.md
  th/                          # Phase 6: mirror of the EN tree (Gemini fills content)
```
Delete `docs/intro/` and `docs/guides/` `.md` files after migration (Phases 1–5); replace with redirect stubs.

---

# PHASE 0 — Foundation (branded shell + i18n + IA skeleton)

Outcome: the site looks like an Opsta enterprise product, every nav section exists (stub pages), EN/TH switch +
light/dark work, deploys clean. No real content yet.

## Task 0.1: Brand assets + fonts

**Files:** create `docs/public/{favicon.svg,logo.svg,logo-dark.svg}`; modify `package.json`.

- [ ] **Step 1: Copy brand assets** from the brand repo.
```bash
cd /home/winggundamth/git/opsta-ai-gateway-docs
cp "../opsta-logo-and-guideline/Logo svg/Symbolic.svg" docs/public/favicon.svg
cp "../opsta-logo-and-guideline/Logo svg/logo without tagline.svg" docs/public/logo.svg
cp "../opsta-logo-and-guideline/Logo svg/logo without tagline white.svg" docs/public/logo-dark.svg
```
- [ ] **Step 2: Add the Montserrat font package.**
```bash
bun add @fontsource/montserrat
```
- [ ] **Step 3: Commit.**
```bash
git add docs/public/favicon.svg docs/public/logo.svg docs/public/logo-dark.svg package.json bun.lock
git commit -m "docs: add Opsta brand assets (logo, favicon) + Montserrat font"
```

## Task 0.2: Custom theme (brand CSS + Montserrat)

**Files:** create `docs/.vitepress/theme/index.js`, `docs/.vitepress/theme/custom.css`.

- [ ] **Step 1: `theme/index.js`:**
```js
import DefaultTheme from "vitepress/theme";
import "@fontsource/montserrat/400.css";
import "@fontsource/montserrat/500.css";
import "@fontsource/montserrat/600.css";
import "@fontsource/montserrat/700.css";
import "@fontsource/montserrat/800.css";
import "./custom.css";

export default { extends: DefaultTheme };
```
- [ ] **Step 2: `theme/custom.css`** (Opsta brand tokens; `--vp-c-brand-1` is the accessible darker blue for
  links/text, `#008BEA` for accents):
```css
:root {
  --vp-c-brand-1: #0067b8;
  --vp-c-brand-2: #008bea;
  --vp-c-brand-3: #008bea;
  --vp-c-brand-soft: rgba(0, 139, 234, 0.14);
  --vp-font-family-base: "Montserrat", ui-sans-serif, system-ui, -apple-system, sans-serif;
  --vp-home-hero-name-color: transparent;
  --vp-home-hero-name-background: linear-gradient(120deg, #008bea 20%, #111f35);
  --vp-home-hero-image-background-image: linear-gradient(-45deg, #008bea55, #96cc0033);
  --vp-home-hero-image-filter: blur(48px);
}
.dark {
  --vp-c-bg: #0d1626;
  --vp-c-bg-alt: #111f35;
  --vp-c-bg-soft: #16284a;
  --vp-c-brand-1: #5cb8ff;
}
h1, h2, h3, h4, .VPNavBarTitle .title, .VPHero .name, .VPHero .text {
  font-family: "Montserrat", sans-serif;
  letter-spacing: -0.01em;
}
.VPNavBar .title { font-weight: 700; }
/* brand-tinted custom blocks */
.custom-block.tip { border-color: var(--vp-c-brand-2); }
```
- [ ] **Step 3: Gate.** `bun run docs:dev` → open the site → confirm Montserrat + blue accents load (no console
  errors). Then `bun run docs:build` → clean.
- [ ] **Step 4: Commit.**
```bash
git add docs/.vitepress/theme/
git commit -m "docs: custom branded VitePress theme (Opsta navy/blue, Montserrat)"
```

## Task 0.3: Rewrite `config.js` — i18n + nav + sidebar + head

**Files:** rewrite `docs/.vitepress/config.js`.

- [ ] **Step 1: Replace the whole file** with the config below. (Root = English; `th` locale wired for Phase 6.
  Sidebars defined once and shared by path; `ignoreDeadLinks: true` stays until content lands.)
```js
import { defineConfig } from "vitepress";
import { withMermaid } from "vitepress-plugin-mermaid";

const nav = [
  { text: "Overview", link: "/overview/what-is", activeMatch: "^/overview/" },
  { text: "User Guide", link: "/user/get-access", activeMatch: "^/user/" },
  { text: "Admin Guide", link: "/admin/console-tour", activeMatch: "^/admin/" },
  { text: "Deploy", link: "/operate/requirements", activeMatch: "^/operate/" },
  { text: "Security", link: "/security/overview", activeMatch: "^/security/" },
  { text: "Reference", link: "/reference/rest-api", activeMatch: "^/reference/" },
  { text: "Releases", link: "/releases/" },
];

const sidebar = {
  "/overview/": [{ text: "Overview", items: [
    { text: "What is Opsta AI Gateway", link: "/overview/what-is" },
    { text: "Key concepts & glossary", link: "/overview/concepts" },
    { text: "Architecture", link: "/overview/architecture" },
    { text: "Request lifecycle", link: "/overview/request-lifecycle" },
    { text: "Multi-tenancy model", link: "/overview/multi-tenancy" },
  ]}],
  "/user/": [{ text: "User Guide", items: [
    { text: "Get access", link: "/user/get-access" },
    { text: "Connect a client", link: "/user/connect-a-client" },
    { text: "Manage API keys", link: "/user/api-keys" },
    { text: "Models & routing", link: "/user/models-and-routing" },
    { text: "Use MCP servers", link: "/user/use-mcp-servers" },
    { text: "Usage & budget", link: "/user/usage-and-budget" },
    { text: "Blocked requests", link: "/user/blocked-requests" },
  ]}],
  "/admin/": [{ text: "Administrator Guide", items: [
    { text: "Console tour", link: "/admin/console-tour" },
    { text: "Organizations & members", link: "/admin/organizations-and-members" },
    { text: "Projects", link: "/admin/projects" },
    { text: "Providers", link: "/admin/providers" },
    { text: "Routing", link: "/admin/routing" },
    { text: "Budgets & limits", link: "/admin/budgets-and-limits" },
    { text: "Guardrails", link: "/admin/guardrails" },
    { text: "Semantic cache", link: "/admin/semantic-cache" },
    { text: "Semantic guard", link: "/admin/semantic-guard" },
    { text: "MCP servers", link: "/admin/mcp-servers" },
    { text: "SSO & IdP brokering", link: "/admin/sso-and-idp" },
    { text: "Observability", link: "/admin/observability" },
    { text: "Pricing", link: "/admin/pricing" },
    { text: "Audit log", link: "/admin/audit-log" },
  ]}],
  "/operate/": [{ text: "Deploy & Operate", items: [
    { text: "Requirements", link: "/operate/requirements" },
    { text: "Install", link: "/operate/install" },
    { text: "Configuration", link: "/operate/configuration" },
    { text: "TLS & domains", link: "/operate/tls-and-domains" },
    { text: "High availability", link: "/operate/high-availability" },
    { text: "Air-gapped install", link: "/operate/air-gap" },
    { text: "Reuse existing operators", link: "/operate/byo-operators" },
    { text: "Upgrades", link: "/operate/upgrades" },
    { text: "Backup & DR", link: "/operate/backup-and-dr" },
    { text: "Platform observability", link: "/operate/observability-platform" },
    { text: "Troubleshooting", link: "/operate/troubleshooting" },
  ]}],
  "/security/": [{ text: "Security & Compliance", items: [
    { text: "Overview", link: "/security/overview" },
    { text: "Data sovereignty", link: "/security/data-sovereignty" },
    { text: "RBAC model", link: "/security/rbac" },
    { text: "Audit & compliance", link: "/security/audit-and-compliance" },
    { text: "Hardening", link: "/security/hardening" },
  ]}],
  "/reference/": [{ text: "Reference", items: [
    { text: "REST API", link: "/reference/rest-api" },
    { text: "Configuration values", link: "/reference/configuration" },
    { text: "Supported providers", link: "/reference/supported-providers" },
    { text: "Glossary", link: "/reference/glossary" },
  ]}],
  "/releases/": [{ text: "Release notes", items: [{ text: "Changelog", link: "/releases/" }]}],
};

export default withMermaid(defineConfig({
  title: "Opsta AI Gateway",
  description: "Enterprise AI gateway — govern cost, access, and risk for every LLM and AI-agent request, on infrastructure you own.",
  cleanUrls: true,
  ignoreDeadLinks: true,
  appearance: { toggle: true },
  head: [
    ["link", { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }],
    ["meta", { name: "theme-color", content: "#111F35" }],
  ],
  themeConfig: {
    logo: { light: "/logo.svg", dark: "/logo-dark.svg", alt: "Opsta AI Gateway" },
    search: { provider: "local" },
    footer: {
      message: "Enterprise AI governance, on infrastructure you own.",
      copyright: "© 2026 Opsta (Thailand) Co., Ltd.",
    },
  },
  locales: {
    root: { label: "English", lang: "en-US", themeConfig: { nav, sidebar } },
    th: {
      label: "ไทย", lang: "th", link: "/th/",
      // Phase 6: Gemini fills docs/th/**. Sidebar/nav reuse the same structure with /th/ prefix.
      themeConfig: {
        nav: nav.map((n) => ({ ...n, link: n.link ? "/th" + n.link : n.link, activeMatch: n.activeMatch ? "^/th" + n.activeMatch.slice(1) : undefined })),
        sidebar: Object.fromEntries(Object.entries(sidebar).map(([k, v]) => ["/th" + k, v.map((g) => ({ ...g, items: g.items.map((i) => ({ ...i, link: "/th" + i.link })) }))])),
      },
    },
  },
  mermaid: {},
}));
```
- [ ] **Step 2: Gate.** `bun run docs:build` → clean (dead links ignored). `bun run docs:dev` → nav shows the 7
  sections, logo renders, search box present, language switcher shows English/ไทย.
- [ ] **Step 3: Commit.**
```bash
git add docs/.vitepress/config.js
git commit -m "docs: new IA — i18n locales + nav + per-section sidebars + brand head"
```

## Task 0.4: Branded home page

**Files:** rewrite `docs/index.md`.

- [ ] **Step 1: Replace `docs/index.md`** (enterprise hero + role entry cards + capability highlights):
```markdown
---
layout: home
hero:
  name: "Opsta AI Gateway"
  text: "Take control of enterprise AI"
  tagline: "Govern cost, access, and risk for every LLM and AI-agent request — self-hosted, on infrastructure you own. Your data never leaves your environment."
  image: { src: /favicon.svg, alt: Opsta }
  actions:
    - { theme: brand, text: "What is it?", link: /overview/what-is }
    - { theme: alt, text: "Administer it", link: /admin/console-tour }
    - { theme: alt, text: "Deploy & operate", link: /operate/requirements }
features:
  - title: "Use it"
    details: "Developers: connect your tools, manage API keys, pick models, use MCP servers, track your spend."
    link: /user/get-access
  - title: "Administer it"
    details: "Org & platform admins: orgs, projects, providers, budgets, guardrails, MCP, SSO, audit — all from the console."
    link: /admin/console-tour
  - title: "Deploy & operate it"
    details: "Platform engineers: install on Kubernetes, configure, secure, scale, air-gap, upgrade, and back up."
    link: /operate/requirements
  - title: "Control the cost"
    details: "Hierarchical USD budgets (org → project → group → user), token limits, and semantic caching."
    link: /admin/budgets-and-limits
  - title: "Govern access & safety"
    details: "API-key auth, RBAC, PII masking, prompt-injection guardrails, full audit log, SSO/IdP brokering."
    link: /admin/guardrails
  - title: "Keep it yours"
    details: "Self-hosted, air-gappable, multi-tenant. The data plane runs entirely in your cluster."
    link: /security/data-sovereignty
---
```
- [ ] **Step 2: Gate.** `bun run docs:dev` → home shows the branded hero (gradient name), 6 cards, logo.
- [ ] **Step 3: Commit.** `git add docs/index.md && git commit -m "docs: branded enterprise home page"`

## Task 0.5: Stub every IA page (so nav/build are green)

**Files:** create one stub `.md` per page listed in the File-structure tree (overview/ user/ admin/ operate/
security/ reference/ ×N, releases/index.md).

- [ ] **Step 1: Generate stubs** with a script (each stub = H1 from the sidebar title + a one-line purpose +
  a "content coming" note so the page isn't blank):
```bash
cd /home/winggundamth/git/opsta-ai-gateway-docs/docs
mk() { mkdir -p "$(dirname "$1")"; printf '# %s\n\n> This page is being written. See the [documentation overview](/overview/what-is).\n' "$2" > "$1"; }
mk overview/what-is.md "What is Opsta AI Gateway"
mk overview/concepts.md "Key concepts & glossary"
mk overview/architecture.md "Architecture"
mk overview/request-lifecycle.md "Request lifecycle"
mk overview/multi-tenancy.md "Multi-tenancy model"
mk user/get-access.md "Get access"
mk user/connect-a-client.md "Connect a client"
mk user/api-keys.md "Manage API keys"
mk user/models-and-routing.md "Models & routing"
mk user/use-mcp-servers.md "Use MCP servers"
mk user/usage-and-budget.md "Usage & budget"
mk user/blocked-requests.md "Blocked requests"
mk admin/console-tour.md "Console tour"
mk admin/organizations-and-members.md "Organizations & members"
mk admin/projects.md "Projects"
mk admin/providers.md "Providers"
mk admin/routing.md "Routing"
mk admin/budgets-and-limits.md "Budgets & limits"
mk admin/guardrails.md "Guardrails"
mk admin/semantic-cache.md "Semantic cache"
mk admin/semantic-guard.md "Semantic guard"
mk admin/mcp-servers.md "MCP servers"
mk admin/sso-and-idp.md "SSO & IdP brokering"
mk admin/observability.md "Observability"
mk admin/pricing.md "Pricing"
mk admin/audit-log.md "Audit log"
mk operate/requirements.md "Requirements"
mk operate/install.md "Install"
mk operate/configuration.md "Configuration"
mk operate/tls-and-domains.md "TLS & domains"
mk operate/high-availability.md "High availability"
mk operate/air-gap.md "Air-gapped install"
mk operate/byo-operators.md "Reuse existing operators"
mk operate/upgrades.md "Upgrades"
mk operate/backup-and-dr.md "Backup & DR"
mk operate/observability-platform.md "Platform observability"
mk operate/troubleshooting.md "Troubleshooting"
mk security/overview.md "Security & compliance"
mk security/data-sovereignty.md "Data sovereignty"
mk security/rbac.md "RBAC model"
mk security/audit-and-compliance.md "Audit & compliance"
mk security/hardening.md "Hardening"
mk reference/rest-api.md "REST API reference"
mk reference/configuration.md "Configuration reference"
mk reference/supported-providers.md "Supported providers"
mk reference/glossary.md "Glossary"
mk releases/index.md "Release notes"
```
- [ ] **Step 2: Gate.** `bun run docs:build` → clean; every nav link resolves to a page (no 404 in `docs:dev`).
- [ ] **Step 3: Commit.** `git add docs/overview docs/user docs/admin docs/operate docs/security docs/reference docs/releases && git commit -m "docs: stub all IA pages (skeleton live)"`

## Task 0.6: Thai locale stub  (redirects DEFERRED — see note)

**Files:** create `docs/th/index.md`.
> **Build-spike correction:** redirect stubs in `docs/public/intro/*.html` would **collide** with the still-present
> `docs/intro/*.md` (both emit `dist/intro/*.html`). So **redirects are created in the content phases, paired with
> deleting each old page** (e.g. when Phase 1 deletes `docs/intro/*.md`, it adds the matching
> `docs/public/intro/*.html` redirect). Phase 0 only adds the Thai home stub; old `/intro` & `/guides` pages stay
> live (orphaned from the new nav) until their replacement lands.

- [ ] **Step 1: Thai home stub** (so the `ไทย` switcher isn't a dead link until Phase 6/Gemini):
```bash
mkdir -p docs/th
printf -- '---\nlayout: home\nhero:\n  name: "Opsta AI Gateway"\n  text: "เอกสารภาษาไทยกำลังจัดทำ"\n  tagline: "Thai documentation is being prepared. View the English docs meanwhile."\n  actions:\n    - { theme: brand, text: "English docs", link: /overview/what-is }\n---\n' > docs/th/index.md
```
- [ ] **Step 2: Redirect stubs** for the old URLs (meta-refresh HTML in `public/` so shared `/intro/*` and
  `/guides/*` links land on the new pages). Create one per old page:
```bash
cd docs/public
red() { mkdir -p "$(dirname "$1")"; printf '<!doctype html><meta charset=utf-8><meta http-equiv=refresh content="0; url=%s"><link rel=canonical href="%s"><title>Redirecting…</title><a href="%s">Moved here</a>' "$2" "$2" "$2" > "$1"; }
red intro/what-is.html /overview/what-is
red intro/whats-next.html /overview/what-is
red intro/architecture.html /overview/architecture
red intro/features.html /overview/what-is
red intro/getting-started.html /operate/install
red guides/connect-a-provider.html /admin/providers
red guides/use-from-opencode.html /user/connect-a-client
red guides/sign-in-with-google.html /user/get-access
red guides/when-a-request-is-blocked.html /user/blocked-requests
red guides/production-deployment.html /operate/install
red guides/automated-testing.html /security/hardening
cd ../..
```
- [ ] **Step 3: Gate.** `bun run docs:build` clean; in `docs:dev`, the `ไทย` switch loads the Thai home stub.
- [ ] **Step 4: Commit.** `git add docs/th docs/public/intro docs/public/guides && git commit -m "docs: Thai locale stub + redirect stubs for old URLs"`

## Task 0.7: Build-verify the branded shell (do NOT deploy to production yet)

- [ ] **Step 1: Build clean on the branch.** `bun run docs:build` → exit 0.
- [ ] **Step 2: Visual check.** `bun run docs:preview --port 4173`, open it (or screenshot
  `http://localhost:4173/`): branded (Opsta logo/Montserrat/blue), 7 nav sections, sidebar correct, EN/ไทย +
  light/dark toggles work, a Mermaid page renders.
- [ ] **Step 3: Push the BRANCH (not main).** `git push -u origin feature/docs-redesign`.
- [ ] **Step 4: Production deploy is DEFERRED** — do NOT merge to `main` until content is ready (see the Branch &
  deploy strategy note). Merging now would replace the live docs with stubs. After the content phases, merge to
  `main`; the Pages workflow deploys; then verify `https://docs.ai-gateway.opsta.co.th/` (home 200) +
  `/intro/what-is.html` (redirect).

---

# PHASES 1–5 — Content (one persona section at a time)

**How to write each content page (the template — apply to EVERY page):**
1. Open the spec `docs-redesign-spec.md` §3 row for this page → it lists *purpose · key content · diagrams ·
   screenshot placeholders · source material*.
2. Replace the stub with: `# <Title>` · a one-sentence purpose · a `::: info Prerequisites` block where
   relevant · the content (concept pages = prose + diagram; procedure pages = numbered steps with **expected
   result**; reference pages = tables) · a `## Related` links list.
3. **Diagrams** → fenced ```mermaid blocks (see the diagram list below). **Screenshots** → insert a marked
   placeholder exactly: `> 📸 **Screenshot:** <what to capture> — _placeholder; real capture pending._`
4. Pull facts from the source material (do NOT invent): feature behavior from
   `../opsta-ai-gateway-marketing/feature-inventory.md`; architecture from
   `../higress-ai-gateway/docs/ARCHITECTURE.md`; API/config from the Reference tasks; console actions from the
   spec's console-source column.
5. **Accuracy guardrails (enterprise positioning):** present the commercial product; don't surface OSS/Higress/
   GitHub on user/admin pages; semantic *routing* is NOT shipped (only cache + guard); MCP is Stage-1 (govern +
   catalog), no budget/guardrails-on-tools yet; data-masking is opt-in.
6. **Gate per page:** `bun run docs:build` clean + render in `docs:dev`. **Commit per 1–3 pages**, message
   `docs(<section>): <pages>`. **Deploy per phase** (push at the end of each phase).

**Mermaid diagrams to author** (place in the page noted; keep them simple, brand-neutral):
- `overview/architecture.md` — control plane (Postgres) ↔ reconcile ↔ data plane (Higress) + components.
- `overview/request-lifecycle.md` — gate chain: client → key-auth → guardrails → routing → budget/limits →
  cache → provider; plus a 401/403/429 outcome table.
- `overview/multi-tenancy.md` — Org → Project → Group → User tree; and the budget-hierarchy chain.
- `admin/sso-and-idp.md` — IdP brokering flow (corporate IdP → Keycloak → org/group/role → console).
- `admin/mcp-servers.md` — MCP request flow: agent → `mcp.<domain>/{org.project}/{server}` → key-auth →
  tenant-guard → mcp-proxy → backend MCP server.
- `operate/install.md` or `operate/requirements.md` — deployment topology (namespaces, operators, data plane,
  control plane, LGTM).

### Phase 1 — Overview (5 pages)
Write `overview/{what-is, concepts, architecture, request-lifecycle, multi-tenancy}.md` per template + the 3
overview diagrams. *Gate:* `bun run docs:build` clean on the branch. *Migrate:* delete `docs/intro/*.md`
(redirects already cover the URLs). Commit `docs(overview): …`.

### Phase 2 — User Guide (7 pages)
Write `user/*` per template; each procedure page gets its `[SS]` placeholder (per spec §3 table). Pull the
connect snippets from the real console `/onboarding` behavior. *Migrate:* delete `docs/guides/use-from-opencode.md`,
`when-a-request-is-blocked.md`. *Gate:* `bun run docs:build` clean on the branch (NO production deploy until the final merge).

### Phase 3 — Administrator Guide (14 pages)
Write `admin/*` per template; one `[SS]` per console screen (spec §3 console-source column); the `mcp-servers`
and `sso-and-idp` pages include their Mermaid diagrams. This closes the MCP documentation gap. *Migrate:* delete
`docs/guides/connect-a-provider.md`, `sign-in-with-google.md`. *Gate:* `bun run docs:build` clean on the branch (NO production deploy until the final merge).

### Phase 4 — Deploy & Operate (11 pages)
Write `operate/*` per template; `requirements`/`install` carry the topology diagram; `configuration` links to
`reference/configuration`. Source: ARCHITECTURE.md §§ TLS, HA/air-gap, release pipeline, observability +
`docs/guides/production-deployment.md` (reuse/rewrite, then delete the old file). *Gate:* `bun run docs:build` clean on the branch (NO production deploy until the final merge).

### Phase 5 — Security + Reference + Release notes (~10 pages)
- `security/*` — from ARCHITECTURE.md §§ control-plane auth, audit, hardening.
- `reference/rest-api.md` — the grouped route tables (build a fresh inventory: `grep -nE 'mux.HandleFunc' in
  ../higress-ai-gateway/components/control-plane/main.go`, group by resource, columns: Method · Path · Purpose ·
  Auth/role).
- `reference/configuration.md` — the grouped config tables (source:
  `../higress-ai-gateway/charts/opsta-ai-gateway/values.yaml`; columns: Key · Purpose · Default).
- `reference/supported-providers.md`, `reference/glossary.md` (or re-export glossary from `overview/concepts`).
- `releases/index.md` — user-facing changelog condensed from `../higress-ai-gateway/docs/PLAN.md` milestone
  history (v1.0→v1.9; each = what changed · for whom · action needed).
*Gate:* `bun run docs:build` clean on the branch (NO production deploy until the final merge). Delete `docs/guides/automated-testing.md` (redirect covers it).

---

# PHASE 6 — Thai i18n handoff (no content written here)
- [ ] Mirror the EN tree under `docs/th/` as English-copy placeholders (so the `/th/` routes resolve), e.g.
  `for f in $(cd docs && find overview user admin operate security reference releases -name '*.md'); do mkdir -p docs/th/$(dirname $f); cp docs/$f docs/th/$f; done`.
- [ ] Commit `docs: th tree scaffold (EN placeholders) for Gemini translation`.
- [ ] **Hand off to Gemini** to translate `docs/th/**` EN→TH (English technical terms kept as loanwords, per the
  landing-page style). This plan does NOT write Thai.

---

## Self-review (done)
- **Spec coverage:** every spec §3 page has a stub task (0.5) + a content task (Phases 1–5); theme/i18n/home/
  redirects/diagrams/screenshots/migration all have tasks. ✓
- **Placeholders:** Phase 0 has complete code; content phases intentionally reference the spec's per-page
  outlines (the prose is the execution work) + a fixed page template + per-page file list + gates — not vague
  "write content" but a concrete template + source map. The `[SS]` markers are the agreed screenshot convention.
- **Consistency:** nav/sidebar links in `config.js` exactly match the stub file paths in Task 0.5 and the File-
  structure tree. ✓

## Acceptance
`bun run docs:build` clean; `docs.ai-gateway.opsta.co.th` branded (Opsta logo/navy-blue/Montserrat), 7 sections,
EN + ไทย-stub + light/dark; old `/intro|/guides` URLs redirect; MCP documented; no OSS/GitHub framing on home/
overview; release notes through v1.9. Thai content handed to Gemini.
