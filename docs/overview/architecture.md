# Architecture

> This page is being written. See the [documentation overview](/overview/what-is).

```mermaid
flowchart LR
  A[Your teams & AI agents] --> GW[Opsta AI Gateway]
  GW --> P[Your providers & MCP servers]
  CP[(Control plane · Postgres)] -. reconcile .-> GW
```
