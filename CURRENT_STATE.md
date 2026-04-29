# Current State of the Repository
**Project:** Mega-Project: Ticketing + Wallet (Fintech)
**Date:** 2026-04-22
**Overall Phase:** Week 1, Block 1 — Design Fundamentals (Domain Layer, Pure TypeScript, No Frameworks)

---

## 1. Repository Structure

```
mega-ticketing-wallet/
├── docs-planning/
│   └── plan.md                          ✅ Complete mentorship plan (Months 1–12)
├── packages/
│   └── shared/
│       └── src/                         🔴 Empty — no shared code yet
├── services/
│   ├── ticketing/
│   │   ├── src/
│   │   │   ├── domain/                  ✅ Active — main focus of current phase
│   │   │   ├── application/             🟡 Folder exists, use-cases dir empty
│   │   │   ├── infrastructure/          🔴 Folder exists, empty
│   │   │   └── presentation/            🔴 Folder exists, empty
│   │   └── tests/
│   │       └── domain/                  🔴 Folder exists, empty
│   ├── wallet/
│   │   └── src/
│   │       ├── domain/                  🟡 Partially implemented (Wallet stub, Strategies)
│   │       ├── application/             🔴 Folder exists, empty
│   │       ├── infrastructure/          🔴 Folder exists, empty
│   │       └── presentation/            🔴 Folder exists, empty
│   └── realtime/
│       └── src/                         🔴 Folder exists, empty
├── 0001-monorepo-and-typescript-configuration.md  ✅ ADR-001 documented
├── ESTADO_MVP.md                        ✅ Spanish progress tracker
├── docker-compose.yml                   ✅ PostgreSQL 16 + Redis 7 configured
├── eslint.config.ts                     ✅ Flat config + Prettier integration
├── package.json                         ✅ Root workspace with test/lint scripts
├── pnpm-workspace.yaml                  ✅ Declares services/* and packages/*
└── tsconfig.json                        ✅ Strict ESNext + Bundler resolution
```

---

## 2. Implemented Files — Detail

### 2.1 `services/ticketing` — Domain Layer ✅

#### Entities (`src/domain/entities/`)

| File | Status | Description |
|---|---|---|
| `Seat.ts` | ✅ Done | State machine: `available → locked → reserved`. Uses `SeatId` VO. Guards transitions with `InvalidSeatStatusError`. Exposes `lock()`, `reserve()`, `release()`. |
| `Seat.spec.ts` | ✅ Done | BDD tests co-located with the entity. Covers state machine transitions and error throwing. |
| `SeatMap.ts` | ✅ Done | Aggregate that encapsulates a `Map<string, Seat>`. Exposes `addSeat()`, `getAvailableSeats()`, `findSeatById()`. Enforces event ownership and duplicate prevention. |
| `SeatMap.spec.ts` | ✅ Done | BDD tests covering available seat filtering, error on duplicate, error on event mismatch. |
| `Event.ts` | ✅ Done | State machine: `draft → published`, `* → cancelled`. Guards invalid transitions. Uses plain `string` IDs (not yet a VO). |
| `Venue.ts` | ✅ Done | Simple entity. Validates `totalCapacity > 0` in constructor. |

#### Value Objects (`src/domain/value-objects/`)

| File | Status | Description |
|---|---|---|
| `SeatId.ts` | ✅ Done | Immutable VO with a private constructor. `SeatId.create(value)` validates non-empty, trims whitespace, throws `InvalidSeatIdError`. Has `equals()` method. |
| `SeatId.spec.ts` | ✅ Done | Tests creation, rejection of empty strings, and equality comparison. |

> **Note:** `EventId` and `BookingStatus` value objects are listed as **next steps** — they are not yet implemented.

#### Errors (`src/domain/errors/`)

| File | Status | Description |
|---|---|---|
| `DomainError.ts` | ✅ Done | Abstract base class extending `Error`. Handles V8-specific `captureStackTrace` defensively. |
| `TicketingErrors.ts` | ✅ Done | 5 concrete domain errors: `InvalidSeatStatusError`, `SeatNotFoundError`, `EventMismatchError`, `SeatAlreadyExistsError`, `InvalidEventStatusError`. |

#### Repositories (`src/domain/repositories/`)

| File | Status | Description |
|---|---|---|
| `SeatRepository.ts` | ✅ Done | Domain interface only: `findById(id)` and `save(seat)`. No implementation (correctly separated). |

#### Application Layer (`src/application/use-cases/`)

| Status | Description |
|---|---|
| 🔴 Empty | `use-cases/` directory exists but contains no files. `ReserveSeat` use case is the defined **next step**. |

#### Infrastructure & Presentation

| Layer | Status |
|---|---|
| `src/infrastructure/` | 🔴 Empty — No ORM adapters, no DB drivers, no Redis clients yet. |
| `src/presentation/` | 🔴 Empty — No HTTP framework (Fastify/Express), no controllers, no routes yet. |

#### Tests (`tests/domain/`)

| Status | Description |
|---|---|
| 🔴 Empty | Tests are currently co-located with source files (Test Colocation pattern). The separate `tests/` directory is available for integration tests but has nothing yet. |

---

### 2.2 `services/wallet` — Domain Layer 🟡

#### Entities (`src/domain/entities/`)

| File | Status | Description |
|---|---|---|
| `Wallet.ts` | 🟡 Stub | Minimal class: `id`, `userId`, `_balance`. Exposes `balance` getter. **No business methods implemented yet** (no `credit()`, `debit()`, balance validation, or domain errors). |

#### Repositories (`src/domain/repositories/`)

| File | Status | Description |
|---|---|---|
| `WalletRepository.ts` | ✅ Done | Domain interface: `findById(id)` and `save(wallet)`. |

#### Strategies (`src/domain/strategies/`)

| File | Status | Description |
|---|---|---|
| `PaymentStrategy.ts` | ✅ Done | `PaymentStrategy` interface with `pay(amount, userId)`. `PaymentResult` type with `success`, `transactionId?`, `errorMessage?`. |
| `Implementations.ts` | ✅ Done | Two concrete strategies: `WalletBalanceStrategy` and `CreditCardStrategy`. Both are stubs (console.log + fake `txn_*` IDs). |
| `PaymentStrategy.spec.ts` | ✅ Done | Tests OCP pattern via a `PaymentProcessor` that accepts any `PaymentStrategy`. Covers both implementations. |

#### Application, Infrastructure, Presentation

| Layer | Status |
|---|---|
| `src/application/` | 🔴 Empty |
| `src/infrastructure/` | 🔴 Empty |
| `src/presentation/` | 🔴 Empty |

---

### 2.3 `services/realtime` — 🔴 Empty

Only the `src/` folder exists. No Pub/Sub, no WebSocket gateway, no event consumers implemented.

---

### 2.4 `packages/shared` — 🔴 Empty

Only the `src/` folder exists. No shared types, domain events, or utility code yet.

---

## 3. Infrastructure & Tooling

| Tool | File | Status | Notes |
|---|---|---|---|
| **pnpm workspaces** | `pnpm-workspace.yaml` | ✅ Done | Declares `services/*` and `packages/*` |
| **TypeScript** | `tsconfig.json` | ✅ Done | `strict`, `verbatimModuleSyntax`, `moduleResolution: bundler`, `ESNext` target |
| **Vitest** | `package.json` | ✅ Done | `test`, `test:strict` (typecheck + vitest) scripts |
| **ESLint + Prettier** | `eslint.config.ts` | ✅ Done | Flat config, TypeScript-ESLint, Prettier integrated |
| **Docker** | `docker-compose.yml` | ✅ Done | PostgreSQL 16-alpine + Redis 7-alpine, named volumes |
| **ADR-001** | `0001-*.md` | ✅ Done | Documents monorepo + `Bundler` resolution decision |

> ⚠️ **Trade-off noted in ADR-001:** Using `moduleResolution: "Bundler"` means raw `tsc` output cannot run directly in Node.js. A bundler (`tsup` or `esbuild`) will be required for the production build pipeline.

---

## 4. Test Coverage Summary

| Service | Test Files | Covered |
|---|---|---|
| `ticketing/domain/entities` | `Seat.spec.ts`, `SeatMap.spec.ts` | State machines, aggregates, error throwing |
| `ticketing/domain/value-objects` | `SeatId.spec.ts` | Creation, validation, equality |
| `wallet/domain/strategies` | `PaymentStrategy.spec.ts` | OCP pattern, both strategy implementations |
| `ticketing/application` | — | ❌ None (not implemented yet) |
| `wallet/domain/entities` | — | ❌ None (`Wallet` entity is a stub) |
| `realtime` | — | ❌ None (not started) |

---

## 5. What Is NOT Yet Implemented

The following are explicitly defined as **next steps** in `ESTADO_MVP.md`:

- [ ] **Value Objects:** `EventId` and `BookingStatus` — eliminate Primitive Obsession in `Event.ts`
- [ ] **`reserveSeat()` function** — max one level of abstraction per function (Clean Code rule)
- [ ] **`ReserveSeat` Use Case** — Application layer connecting Domain to boundaries with CQRS mindset
- [ ] **Wallet entity business logic** — `credit()`, `debit()`, balance invariants, domain errors
- [ ] **`packages/shared`** — shared domain events, common types between bounded contexts
- [ ] **Infrastructure adapters** — Prisma ORM, PostgreSQL client, Redis client for seat locks
- [ ] **HTTP layer** — REST API controllers (Fastify or Express), route definitions
- [ ] **Realtime service** — WebSocket gateway, Redis Pub/Sub fan-out for seat map updates
- [ ] **Saga / Choreography** — distributed transaction coordination between Ticketing and Wallet
- [ ] **Production build pipeline** — `tsup` or `esbuild` bundler (required by ADR-001 trade-off)

---

## 6. Architecture Decisions Taken

| Decision | Status | Reference |
|---|---|---|
| pnpm workspaces for monorepo | ✅ Accepted | ADR-001 |
| `moduleResolution: "Bundler"` (no `.js` extensions) | ✅ Accepted | ADR-001 |
| ESLint Flat Config + Prettier | ✅ Accepted | ADR-001 |
| Test colocation (`.spec.ts` next to source) | ✅ In practice | `ESTADO_MVP.md` |
| `DomainError` abstract base class | ✅ In practice | `DomainError.ts` |
| Domain repository interfaces owned by the domain layer | ✅ In practice | `SeatRepository.ts`, `WalletRepository.ts` |
| PostgreSQL for Ticketing + Wallet (ACID) | 📋 Planned | `docker-compose.yml` + `plan.md` |
| Redis for seat locks + cache + Pub/Sub | 📋 Planned | `docker-compose.yml` + `plan.md` |
| CQRS for Application layer | 📋 Planned | `plan.md` |
| Event Sourcing for Wallet transactions | 📋 Planned | `plan.md` |
| Saga pattern (choreography) for cross-domain flows | 📋 Planned | `plan.md` |
