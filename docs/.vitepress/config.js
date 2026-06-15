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
  { text: "Website", link: "https://ai-gateway.opsta.co.th" },
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
  "/admin/": [
    { text: "Console & access", collapsed: false, items: [
      { text: "Console tour", link: "/admin/console-tour" },
      { text: "Organizations & members", link: "/admin/organizations-and-members" },
    ]},
    { text: "Project configuration", collapsed: false, items: [
      { text: "Projects", link: "/admin/projects" },
      { text: "Providers", link: "/admin/providers" },
      { text: "Routing", link: "/admin/routing" },
      { text: "Canary / A-B rollouts", link: "/admin/canary-rollouts" },
      { text: "Budgets & limits", link: "/admin/budgets-and-limits" },
      { text: "Guardrails", link: "/admin/guardrails" },
      { text: "Semantic cache", link: "/admin/semantic-cache" },
      { text: "Semantic guard", link: "/admin/semantic-guard" },
      { text: "Prompt management", link: "/admin/prompt-management" },
      { text: "Prompt templates", link: "/admin/prompt-templates" },
      { text: "MCP servers", link: "/admin/mcp-servers" },
    ]},
    { text: "Platform", collapsed: false, items: [
      { text: "SSO & IdP brokering", link: "/admin/sso-and-idp" },
      { text: "Observability", link: "/admin/observability" },
      { text: "Pricing", link: "/admin/pricing" },
      { text: "Audit log", link: "/admin/audit-log" },
    ]},
  ],
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

const thNav = nav.map((n) => ({
  ...n,
  link: n.link.startsWith("http") ? n.link : "/th" + n.link,
  activeMatch: n.activeMatch ? "^/th" + n.activeMatch.slice(1) : undefined,
}));

const thSidebar = Object.fromEntries(
  Object.entries(sidebar).map(([k, groups]) => [
    "/th" + k,
    groups.map((g) => ({ ...g, items: g.items.map((i) => ({ ...i, link: "/th" + i.link })) })),
  ]),
);

export default withMermaid(defineConfig({
  title: "Opsta AI Gateway",
  description:
    "Enterprise AI gateway — govern cost, access, and risk for every LLM and AI-agent request, on infrastructure you own.",
  cleanUrls: true,
  ignoreDeadLinks: true,
  appearance: { toggle: true },
  head: [
    ["link", { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }],
    ["meta", { name: "theme-color", content: "#111F35" }],
  ],
  themeConfig: {
    logo: { light: "/logo.svg", dark: "/logo-dark.svg", alt: "Opsta AI Gateway" },
    siteTitle: "AI Gateway",
    search: { provider: "local" },
    footer: {
      message: "Enterprise AI governance, on infrastructure you own.",
      copyright: "© 2026 Opsta (Thailand) Co., Ltd.",
    },
  },
  locales: {
    root: { label: "English", lang: "en-US", themeConfig: { nav, sidebar } },
    th: {
      label: "ไทย",
      lang: "th",
      link: "/th/",
      themeConfig: { nav: thNav, sidebar: thSidebar },
    },
  },
  mermaid: {},
}));
