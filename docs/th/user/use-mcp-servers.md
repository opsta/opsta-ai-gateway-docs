> 🌐 **เอกสารภาษาไทยกำลังจัดทำ** — เนื้อหาด้านล่างเป็นภาษาอังกฤษชั่วคราว จนกว่าจะมีการแปล. _This page is not yet translated; English content is shown temporarily._

# Use MCP servers

The gateway can give your AI agents **governed access to tools** through the Model Context Protocol (MCP). Your
administrator registers approved MCP servers for your project; you connect to them through the gateway using the
same project API key you use for chat.

::: info Prerequisites
- Your administrator has registered one or more MCP servers for your project — see
  [MCP servers (admin)](/th/admin/mcp-servers).
- You have a project API key ([Manage API keys](/th/user/api-keys)).
:::

## Connect to a governed MCP server

Each registered server is reachable at a per-project URL:

```
https://mcp.<your-domain>/<organization>.<project>/<server-name>
```

Point your MCP-capable agent or IDE at that URL (over **Streamable HTTP**) and authenticate with your project
**API key** — the same key you use for the chat API. The gateway authenticates the connection, enforces that
you can only reach **your own project's** servers, and records the activity.

![The MCP Servers tab and connect URL](/images/mcp-servers.png)

::: tip One key for chat and tools
You don't manage a separate credential for tools. Your project API key works for both the LLM chat API and your
project's MCP servers.
:::

## What's governed

- **Authentication** — every connection is authenticated with your project key.
- **Isolation** — a key from another project cannot reach your project's MCP servers (you'll get `403`).
- **Visibility** — tool-call activity is recorded for your organization.

## Next steps

- [Connect a client](/th/user/connect-a-client) — the chat API.
- Administrators register servers in [MCP servers](/th/admin/mcp-servers).
