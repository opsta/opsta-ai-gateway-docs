# Getting started

Opsta AI Gateway runs locally on **k3d** and is driven entirely through a
**Taskfile** — the only supported entrypoint.

## Prerequisites

Docker, [k3d](https://k3d.io/), kubectl, [helm](https://helm.sh/),
[helmfile](https://helmfile.readthedocs.io/), [yq](https://github.com/mikefarah/yq),
[oras](https://oras.land/), Go 1.24+, yamllint, kubeconform, and
[Task](https://taskfile.dev/). On Windows, run inside WSL2 with the Docker WSL2
backend.

## Bring it up

```bash
git clone https://github.com/opsta/opsta-ai-gateway.git
cd opsta-ai-gateway

task hooks      # install the enforced git hooks (once)

# Copy the secrets template and fill in the real values (git-ignored):
cp manifests/secrets/secrets.example.yaml manifests/secrets/secrets.yaml
# → Cloudflare API token (DNS-01), tunnel token, Redis/Grafana/LGTM passwords, …

task reset      # destroy + rebuild the whole cluster from code
task test       # smoke test against the live gateway
```

`task reset` creates the k3d cluster, installs Higress + cert-manager + the
Redis operator + the LGTM observability stack, applies all manifests, and wires
the plugins. `task test` then verifies routing, limits, the model allow-list,
in-cluster TLS, and the dashboards end-to-end.

## Everyday commands

| Command | What it does |
|---|---|
| `task up` | create cluster + install all Helm releases |
| `task deploy` | apply manifests + (re)load plugins |
| `task status` | show gateway / pods / certs / plugins |
| `task test` | smoke test the live gateway |
| `task lint` | yaml/helm/manifest + Go checks |
| `task reset` | destroy and rebuild everything from code |
| `task down` | delete the cluster |

## Calling the gateway

Send OpenAI-style requests to the gateway hostname; identity is supplied via
headers (until SSO):

```bash
curl https://ai-gateway.opsta.dev/v1/chat/completions \
  -H "x-dev-user: alice" -H "x-dev-group: eng" \
  -H "Content-Type: application/json" \
  -d '{"model":"coding-default","messages":[{"role":"user","content":"hi"}]}'
```

Tag bulk traffic with `-H "workload: bulk"` to route it to the cheaper model.

## Configuration

Everything is pinned and configured in a few well-known files:

- **`version.yaml`** — every version (k3s, charts, images) + toggles
  (`redis.mode`, `observability.mode/storage`, domains).
- **`specs/default.yaml`** — the Project spec (identity, limits, model
  allow-list) that the gateway config is rendered from.
- **`manifests/secrets/secrets.yaml`** — all secrets (git-ignored; template in
  `secrets.example.yaml`).
