# ADR 001: Monorepo and TypeScript Configuration

## Status
Accepted

## Date
2026-03-26

## Context
We are building a highly concurrent Ticketing platform and a Fintech Wallet within the same ecosystem. To maintain logical separation (Bounded Contexts) while sharing core libraries (e.g., domain events, types), we need a solid repository structure. 
Furthermore, modern Node.js development relies heavily on ECMAScript Modules (ESM), but strict TypeScript configurations (like `NodeNext`) enforce the usage of explicit `.js` extensions in relative imports, which harms Developer Experience (DX) and code readability.

## Decision
1. **Monorepo Management:** We will use `pnpm workspaces`. `pnpm` enforces strict dependency resolution (preventing ghost dependencies) and provides a fast, disk-efficient global store.
2. **Linting and Formatting:** We adopt ESLint's Flat Config (`eslint.config.ts`) integrating Prettier under the hood via `eslint-plugin-prettier`. This provides a single source of truth for both code quality and formatting.
3. **Module Resolution:** We configure TypeScript with `"moduleResolution": "Bundler"`. This allows us to write clean ESM imports without `.js` extensions. 

## Consequences
### Positive
* **Clean Codebase:** Imports remain clean (`import { Seat } from './Seat';`).
* **Strict Boundaries:** Bounded contexts (Ticketing, Wallet, Realtime) are isolated but can easily share packages via workspace symlinks.
* **Security & Reliability:** `pnpm` protects the supply chain by avoiding phantom dependencies.

### Negative / Trade-offs
* By using `"moduleResolution": "Bundler"`, we cannot execute raw compiled output (`tsc`) directly with Node.js in production. We are committing to using a bundler (like `esbuild` or `tsup`) for the final production build pipeline.