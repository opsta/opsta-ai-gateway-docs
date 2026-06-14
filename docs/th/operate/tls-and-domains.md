> 🌐 **เอกสารภาษาไทยกำลังจัดทำ** — เนื้อหาด้านล่างเป็นภาษาอังกฤษชั่วคราว จนกว่าจะมีการแปล. _This page is not yet translated; English content is shown temporarily._

# TLS & domains

The gateway terminates TLS **in your cluster**, with a single wildcard certificate covering every subdomain.
You choose how that certificate is issued — automatically from Let's Encrypt, supplied by you, or self-signed for
air-gapped sites.

::: info Who this is for
Platform engineers. TLS and DNS are set at install time and rarely change afterward.
:::

## Subdomains

All services live under your `global.baseDomain`:

| Subdomain | Service | Value |
|---|---|---|
| `api.` | The OpenAI-compatible gateway endpoint | `global.subdomains.api` |
| `console.` | The web console | `global.subdomains.console` |
| `grafana.` | Observability dashboards | `global.subdomains.grafana` |
| `auth.` | Keycloak (identity) | `global.subdomains.auth` |
| `mcp.` | The MCP gateway (when enabled) | `global.subdomains.mcp` |

The **separator** between the label and the base domain is `global.subdomainSeparator`:

- `"."` (default) → `api.ai-gateway.example.com`. Needs a certificate for `*.ai-gateway.example.com`.
- `"-"` → `api-ai-gateway.example.com`. Fits under a single parent wildcard like `*.example.com`, which is handy
  when you already have one.

## TLS modes

Set `tls.mode` to one of:

### `letsencrypt` (default)

cert-manager requests a wildcard certificate from Let's Encrypt using a **DNS-01** challenge, so no inbound HTTP
is required during issuance.

```yaml
tls:
  mode: letsencrypt
  letsencrypt:
    issuer: letsencrypt-prod        # or letsencrypt-staging while testing
    email: platform@example.com
    dns01:
      provider: cloudflare
      dnsZone: example.com          # the zone your DNS token can manage
```

::: tip Test against staging first
Let's Encrypt rate-limits production issuance. Use `issuer: letsencrypt-staging` until DNS and the challenge work
end to end, then switch to `letsencrypt-prod`.
:::

### `provided`

You supply your own wildcard certificate as a Kubernetes Secret and point the platform at it. Use this when your
organization issues certificates from an internal CA or a commercial provider.

```yaml
tls:
  mode: provided
  wildcardSecretName: ai-gateway-wildcard-tls   # a Secret you create containing tls.crt / tls.key
```

### `selfsigned`

cert-manager issues a self-signed wildcard certificate. Intended for **air-gapped** or internal environments
where a public CA isn't reachable and clients trust your internal root.

```yaml
tls:
  mode: selfsigned
```

## The front door

The certificate covers the in-cluster listener regardless of how traffic reaches it. Two common patterns:

- **Your own ingress / load balancer** — point a wildcard DNS record at it.
- **Cloudflare Tunnel** (`ingress.tunnel.enabled: true`) — for environments without a public inbound IP. The
  tunnel relays bytes to the in-cluster listener; your in-cluster certificate still serves the connection
  end to end.

> 📸 **Screenshot:** a browser padlock on `console.your-domain` showing the issued certificate — _placeholder; real capture pending._

## DNS

Create a **wildcard record** — `*.your-domain` — pointing at the gateway's external address (or, with Cloudflare
Tunnel, let the tunnel manage the public hostnames). For DNS-01 issuance, the certificate's DNS provider token
must be able to manage the `dnsZone` you configured.

## Next steps

- [High availability](/th/operate/high-availability) — production replicas and disruption budgets.
- [Air-gapped install](/th/operate/air-gap) — self-signed TLS and mirrored images.
- [Hardening](/th/security/hardening) — TLS, secrets, and network posture.
