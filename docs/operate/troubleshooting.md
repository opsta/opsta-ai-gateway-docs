# Troubleshooting

A field guide to the most common issues, organized by the symptom you'll see. Most gateway problems are a
**policy gate doing its job** — the status code tells you which one.

::: info Who this is for
Platform engineers diagnosing a running installation. For what each gate means to a developer, see
[When a request is blocked](/user/blocked-requests).
:::

## Gateway returns an unexpected status

Requests pass through an ordered chain of gates; the status code identifies which one stopped the request. See
the [Request lifecycle](/overview/request-lifecycle) for the full chain.

| Status | Gate | Likely cause | Where to look |
|---|---|---|---|
| `401 Unauthorized` | Key-auth | Missing/invalid/expired API key, or key not yet reconciled | Confirm the key exists in the console; check the key prefix/header config |
| `403 Forbidden` | Guardrails / tenant guard | Prompt-injection or PII match; or an MCP key reaching another project | [Guardrails](/admin/guardrails); check the path tenant matches the key |
| `404 Not Found` | Routing | Model name not mapped for the project | [Routing](/admin/routing) — add a model route |
| `429 Too Many Requests` | Budget & limits | Over USD budget or over the token-per-minute limit | [Budgets & limits](/admin/budgets-and-limits) |
| `413 Payload Too Large` | Gateway | Request body exceeds the buffered max (default 10 MiB) | Raise `gateway.maxRequestBytes` if you need larger multimodal payloads |
| `503 Service Unavailable` | Upstream / reconcile | Provider unreachable, or gateway not yet reconciled | Check provider connectivity and control-plane readiness below |

## A new key, budget, or provider hasn't taken effect

The control plane reconciles changes onto the gateway continuously, normally within seconds.

- Confirm the **control plane is ready**:
  ```bash
  kubectl -n opsta-ai-gateway get pods -l app=control-plane
  kubectl -n opsta-ai-gateway logs deploy/control-plane | tail -50
  ```
- The first reconcile runs at startup and **gates readiness** — if `control-plane` isn't `Ready`, the gateway may
  still be serving the previous configuration. Wait for rollout to complete.
- A periodic reconcile also runs as a self-healing backstop, so transient drift corrects itself.

## Certificate or DNS problems

- **Browser shows an untrusted/invalid certificate**: check the certificate was issued. For `letsencrypt`, look
  at the cert-manager Certificate/Order resources; a stuck DNS-01 challenge usually means the DNS provider token
  can't manage the configured `dnsZone`. See [TLS & domains](/operate/tls-and-domains).
- **Hostname doesn't resolve**: confirm the `*.your-domain` wildcard DNS record points at the gateway (or that
  the Cloudflare Tunnel hostnames are configured).
- **Issuance rate-limited**: you're on `letsencrypt-prod` while still testing — switch to `letsencrypt-staging`
  until it works, then back.

## Sign-in fails on the console

- Confirm `sso.emailDomain` matches your users' email domain and `sso.mode` is correct for the environment
  (`google` vs. an in-cluster mock for tests).
- For per-organization SSO, verify the IdP connection and claim mappings — see
  [SSO & IdP brokering](/admin/sso-and-idp).
- Make sure a **bootstrap admin** email was set at install, or no one can reach the admin areas.

## A pod won't start

- `kubectl -n opsta-ai-gateway describe pod <name>` — look for image-pull errors (check `imagePullSecrets` and,
  in air-gap, that the image is mirrored), PVC binding issues (check `global.storageClass`), or readiness-probe
  failures.
- Database-dependent components wait for PostgreSQL — confirm the CloudNativePG cluster is healthy first.

## Telemetry looks empty or cross-tenant

- Dashboards scoped to the wrong tenant usually mean the **control plane is disabled** — per-org isolation needs
  it. See [Platform observability](/operate/observability-platform).
- No data at all: check the collector is scraping the gateway and that `observability.enabled` is `true`.

## Still stuck?

Gather the control-plane logs, the gateway pod logs, and the output of `kubectl get pods -A` for the platform
namespaces before escalating. If you have an [Opsta Managed Service](https://www.opsta.co.th) agreement, contact
support with those details.

## Next steps

- [Request lifecycle](/overview/request-lifecycle) — the gate chain behind the status codes.
- [Configuration reference](/reference/configuration) — every value and its default.
