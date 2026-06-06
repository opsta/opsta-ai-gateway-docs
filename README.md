# opsta-ai-gateway-docs

Product/user documentation for **Opsta AI Gateway** — a single, self-hosted AI
gateway on Kubernetes (Higress). Built with [VitePress](https://vitepress.dev/).

The engineering docs (build plan, milestone acceptance, internal architecture)
live in the [opsta-ai-gateway](https://github.com/opsta/opsta-ai-gateway) repo
under `docs/`; this repo is the published, user-facing site.

## Local development

```bash
bun install
bun run docs:dev      # http://localhost:5173
bun run docs:build    # static site → docs/.vitepress/dist
```

## Deploy

Pushed to `main` → GitHub Actions builds the VitePress site and deploys it to
GitHub Pages (`.github/workflows/deploy.yml`). Enable Pages with **Source:
GitHub Actions** in the repo settings.
