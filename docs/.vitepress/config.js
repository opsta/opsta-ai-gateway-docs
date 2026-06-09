import { defineConfig } from "vitepress";
import { withMermaid } from "vitepress-plugin-mermaid";

// https://vitepress.dev/reference/site-config
// withMermaid enables ```mermaid fenced diagrams.
export default withMermaid(defineConfig({
  title: "Opsta AI Gateway",
  description:
    "A single, self-hosted AI gateway on Kubernetes (Higress) — routing, " +
    "per-group/user limits, model allow-lists, observability, guardrails, SSO.",
  lang: "en-US",
  appearance: { theme: "light", toggle: true },
  ignoreDeadLinks: true,
  cleanUrls: true,
  themeConfig: {
    search: { provider: "local" },
    nav: [
      { text: "Introduction", link: "/intro/what-is", activeMatch: "^/intro/" },
      { text: "Guides", link: "/guides/connect-a-provider", activeMatch: "^/guides/" },
      {
        text: "GitHub",
        link: "https://github.com/opsta/opsta-ai-gateway",
      },
    ],
    sidebar: {
      "/intro/": [
        {
          text: "Introduction",
          items: [
            { text: "What is Opsta AI Gateway", link: "/intro/what-is" },
            { text: "Architecture", link: "/intro/architecture" },
            { text: "Getting started", link: "/intro/getting-started" },
            { text: "Features", link: "/intro/features" },
            { text: "Roadmap", link: "/intro/roadmap" },
          ],
        },
      ],
      "/guides/": [
        {
          text: "Guides",
          items: [
            { text: "Connect an AI provider", link: "/guides/connect-a-provider" },
            { text: "Use it from opencode", link: "/guides/use-from-opencode" },
            { text: "Sign in with Google", link: "/guides/sign-in-with-google" },
          ],
        },
      ],
    },
    footer: {
      message:
        "Self-hosted AI gateway on Higress — Infrastructure-as-Code, on-prem, no cloud lock-in.",
      copyright: "Copyright © 2026 Opsta (Thailand). All rights reserved.",
    },
  },
  mermaid: {},
}));
