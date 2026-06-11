# How it's tested — automated UAT

The AI gateway ships with a layered, fully automated test suite. Every behaviour
is asserted at the **cheapest layer that can cover it** and in **exactly one
place** — no duplicate coverage between layers.

## Layers

| Layer | Command | What it covers |
|---|---|---|
| **Unit** | `task test:unit` | Pure Go logic (JWT verification, budget math, key issuance, plugin helpers). No cluster needed. |
| **Chart** | `task test:chart` | Renders every Helm profile through `kubeconform`. Catches bad values and missing templates. No cluster needed. |
| **Smoke** | `task test:e2e:smoke` | Single-tenant data-plane: routing, rate limits, model allow-lists, guardrails, SSO, budgets, observability, write API, Keycloak. Requires a live cluster. |
| **Journey** | `task test:e2e:journey` | Multi-tenant persona flow (Acme Robotics + Globex Media): org/project RBAC, providers, model routes, limits, key lifecycle, audit trail, IdP brokering. Requires a live cluster. |
| **UI (Playwright)** | `task test:e2e:ui` | Headless-Chromium browser tests against the live console: login, /keys, /usage, /admin/audit, /admin/projects, Users tab, and full brokered-login JIT proof (mock-OIDC as a real separate IdP). Requires a live cluster. |

`task test` runs all five layers in order from a clean cluster reset. CI fans them
out: unit + chart on every push; smoke + journey + UI on demand via `workflow_dispatch`.

## Fast iterate loop

While the cluster is already up, use:

```sh
task uat
```

This runs the journey + UI layers only (no reset) and finishes in ~1–2 minutes.
Use it to iterate on persona flows and console behaviour without a full cluster rebuild.

## CI artifacts

When the on-demand e2e job runs, GitHub Actions publishes:

- **JUnit XML** (`e2e-junit-<run_id>`) — per-scenario pass/fail for smoke, journey, and UI; visible in the CI test summary.
- **Playwright HTML report** (`playwright-report-<run_id>`) — full trace + screenshot for every UI test; download from the Actions run artifacts tab.

## Brokered-login proof

The UI suite includes a hard-gated browser test (`brokered-login.spec.ts`) that
drives a full login through **mock-OIDC as a genuinely separate external IdP** for a
test organisation ("pwtest"). It verifies:

- **Positive:** a user with the correct `groups` claim lands on the console and is
  JIT-provisioned into the right Keycloak org group.
- **Negative:** a user with an unmapped groups claim authenticates but has no org
  group membership.

This replaces the earlier best-effort token-exchange smoke and proves the end-to-end
brokered-login flow at the browser level.
