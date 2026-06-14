# Thai translation handoff (for Gemini)

The Thai locale is fully scaffolded. Every English page has a Thai counterpart under `docs/th/` containing the
**English source as a placeholder**. Your job is to translate each `docs/th/**/*.md` file into Thai, in place.

## What's already done

- `docs/.vitepress/config.js` wires the `th` locale with a Thai-prefixed nav and sidebar — no config changes
  needed.
- `docs/th/` mirrors the English tree 1:1 (48 files). The language switcher (English ⇄ ภาษาไทย) works.
- `docs/th/index.md` is a "coming soon" home — replace it with a translated version of the English home
  (`docs/index.md`) when ready.

## How to translate each page

1. Open a file under `docs/th/`. Each starts with this banner — **delete it** once the page is translated:

   ```
   > 🌐 **เอกสารภาษาไทยกำลังจัดทำ** — ... _This page is not yet translated; English content is shown temporarily._
   ```

2. Translate the prose into natural, professional Thai for an enterprise audience. Avoid overly literal or
   "AI-sounding" phrasing.

3. **Do NOT translate:**
   - The product name **Opsta AI Gateway**.
   - Code blocks, YAML keys, Helm value paths (e.g. `global.highAvailability`), API paths (`/api/orgs/...`),
     HTTP methods, status codes, and shell commands.
   - **Mermaid diagram code** (the ```` ```mermaid ```` blocks) — keep diagram labels in **English**.
   - Role names where used as identifiers (`platform_admin`, `org_admin`, `member`) — but you may gloss them in
     Thai prose.
   - URLs and Markdown link targets. Links already point within the Thai tree (`](/th/...)`); keep them.

4. Keep all Markdown structure intact: headings, tables, callout containers (`::: info`, `::: tip`,
   `::: warning`), and the `> 📸 **Screenshot:**` placeholders (translate the caption text, keep the marker).

## Terminology

Use the agreed glossary. Prefer the established Thai industry terms; keep the English term in parentheses on first
use where helpful (e.g. "การกำกับดูแล (governance)"). The English [glossary](docs/reference/glossary.md) lists the
canonical terms. Use **"trusted in regulated industries"** framing consistent with the marketing site.

## After translating

- Run `bun run docs:build` — it must exit 0.
- Spot-check a few pages with `bun run docs:preview` and the language switcher.
- Remove this handoff file when the translation pass is complete.
