# Roadmap v2: Mid → Senior Engineer
## Rediseño completo. Incómodo por diseño.

---

## Por qué el Mega-Proyecto solo NO funciona

El plan anterior asume que un solo proyecto monolítico te enseña todo. Eso es falso. Un solo proyecto te da profundidad en UN tipo de sistema, pero te deja ciego en otros. Un senior ha operado sistemas, ha heredado código ajeno, ha migrado datos sin perder nada, y ha diseñado sistemas desde cero bajo presión de tiempo.

Este roadmap tiene **3 vehículos de aprendizaje**:

**Proyecto A — El Mega-Proyecto (Ticketing + Wallet).** Lo conservas pero lo usas para lo que realmente sirve: DDD, Clean Architecture, concurrencia, Event Sourcing. NO para aprender cosas como API Gateway o CQRS puro que no necesita.

**Proyecto B — Un sistema multi-tenant tipo Capio (simplificado).** Lo construyes desde cero en el Bloque 3. Te fuerza a resolver multi-tenancy, permisos, tenant isolation, y los patrones que ves en los docs de Capio. Es pequeño (2-3 semanas de build) pero tiene los problemas difíciles que el Mega-Proyecto evita.

**Ejercicios de System Design.** No son proyectos — son sesiones de 3-4 horas donde diseñas un sistema en papel, luego implementas la parte más difícil para validar si tu diseño funciona. Uno cada 3-4 semanas a partir del Bloque 2.

---

## Qué eliminé del plan anterior y por qué

**API Gateway (Semana 17 anterior):** Eliminado. Tu sistema es un monorepo con 3 servicios que corren en Docker. No necesitas un gateway. Agregar uno es sobre-ingeniería para que se vea impresionante. Un senior sabe cuándo NO agregar una capa.

**CQRS con read model separado (Semana 16 anterior):** Movido y reducido. CQRS completo con tablas separadas tiene sentido cuando tienes miles de reads por segundo con joins complejos. Tu catálogo de eventos no tiene ese problema. Lo que SÍ vas a hacer es CQRS-lite (Commands y Queries separados a nivel de código) porque eso es lo que usa Capio y el 90% de la industria.

**Semanas 21-24 de "polish":** Eliminadas como bloque. Documentación, code review, y prep de entrevistas se hacen continuamente, no como las últimas 4 semanas. Las reemplacé con trabajo real: heredar un sistema roto, cambio de requirements que te fuerza un refactor profundo, y deploy a un entorno remoto.

**Event Sourcing en Semana 2 (sin DB):** Movido. Implementar ES sin persistencia real es un ejercicio académico. Ahora ES se implementa cuando tienes PostgreSQL conectado, y enfrentas los problemas reales inmediatamente: snapshots, versioning de eventos, rehydration performance.

---

## BLOQUE 1: FUNDAMENTOS QUE DUELEN
### Semanas 1–6

La premisa de este bloque: construir el dominio + infraestructura del Mega-Proyecto hasta tener un sistema que funcione end-to-end, con auth, con tests, con datos reales. Sin atajos.

---

### Semana 1 — Dominio de Ticketing completo + primera decisión con trade-offs

**Concepto del libro:** DDD Tactical (Evans cap. 5-6: Entities, Value Objects, Aggregates). Clean Code (Martin): funciones de un solo nivel de abstracción.

**Qué construyo:**
- Value Objects faltantes: `EventId`, `Money`, `BookingStatus`
- Domain events: `SeatLocked`, `SeatReserved`, `SeatReleased` — acumulados en el aggregate, no publicados
- Función `reserveSeat()` que orqueste la lógica con un solo nivel de abstracción
- Tests exhaustivos incluyendo edge cases: ¿qué pasa si intentas lockear un seat ya locked? ¿qué pasa si el evento está cancelled?

**Decisión de arquitectura (spike obligatorio — 2h):**
`Money` value object: ¿usas centavos como integer, o usas una librería como `dinero.js`? Haz un spike: implementa las operaciones aritméticas básicas (add, subtract, multiply for tax) en ambos approaches. Escribe un ADR con tu conclusión. No hay respuesta correcta — hay trade-offs.

**Problema real que enfrento:**
Los floating point errors de JavaScript. Escribe un test que demuestre que `0.1 + 0.2 !== 0.3` y que tu `Money` VO lo maneja correctamente. Escribe otro test con una cadena de 1000 operaciones de centavos que acumulan error si usas `number`. Esto no es académico — es un bug real en sistemas financieros.

**Preparación para entrevistas:**
Cuando un entrevistador pregunta "¿cómo manejas dinero en tu sistema?", la respuesta "uso centavos como integer" es nivel mid. La respuesta "evaluamos integer vs dinero.js, medimos precision en cadenas de operaciones, y decidimos X por Y razón — aquí está el ADR" es nivel senior.

**Cómo usar Claude:**
> "Aquí está mi Money VO y mi spike de dinero.js. Rompe ambos. Dame un escenario donde cada uno falla."

---

### Semana 2 — Wallet domain + PostgreSQL + primera connection real

**Concepto del libro:** Clean Architecture (Martin cap. 22: The Clean Architecture). DDIA (Kleppmann cap. 2: Data Models and Query Languages).

**Qué construyo:**
- `Wallet` entity COMPLETA: `credit()`, `debit()`, `freeze()`, `unfreeze()` — state-based por ahora, NO Event Sourcing todavía
- Invariantes: balance >= 0, no operar wallet frozen, idempotency via `transactionId`
- Wallet domain errors: `InsufficientFundsError`, `WalletFrozenError`, `DuplicateTransactionError`
- PostgreSQL connection real: Drizzle + migrations para tablas `wallets` y `transactions`
- Repository implementations: `PostgresWalletRepository`, `PostgresSeatRepository`
- Integration tests contra Docker PostgreSQL

**Decisión de arquitectura:**
¿Por qué NO Event Sourcing todavía? Porque ES resuelve un problema específico (auditabilidad completa + reconstrucción de estado). Antes de implementarlo, necesitas saber qué problemas tiene la alternativa simple. Si empiezas con ES, nunca entiendes POR QUÉ existe. Primero state-based, luego migras a ES en Semana 8 cuando el problema de auditoría sea real.

**Spike obligatorio (3h):** Prisma vs Drizzle. Implementa `WalletRepository.findById()` y `save()` en ambos. Mide: type inference, query flexibility, migration DX. ADR-002.

**Problema real que enfrento:**
Optimistic locking en PostgreSQL. Escribe un test de integración donde dos procesos intentan debitar la misma wallet simultáneamente. Sin locking, ambos succeeden y el balance se corrompe. Con `version` column, uno falla. Verifica que falla con el error correcto, no con un crash genérico.

**Preparación para entrevistas:**
"Explain optimistic vs pessimistic locking." Ya no es teoría — tienes un test que lo demuestra y puedes explicar por qué elegiste optimistic para wallets (más lecturas que escrituras, conflictos infrecuentes).

---

### Semana 3 — Application Layer + HTTP + Auth desde el día uno

**Concepto del libro:** Clean Architecture (Martin cap. 20-21: Business Rules, Screaming Architecture). DDIA (Kleppmann cap. 4: Encoding and Evolution — para entender por qué los contratos importan).

**Qué construyo:**
- Use cases: `ReserveSeatUseCase`, `CreditWalletUseCase`, `DebitWalletUseCase`
- NestJS + Fastify adapter (no spike aquí — NestJS es la decisión para alinearse con Capio y el mercado)
- Contract layer con `defineOperation` y Zod (misma idea que Capio)
- Controllers thin: extraer auth + params → construir Command → dispatch → return
- JWT auth desde el PRIMER endpoint: `JwtAuthGuard` que valida RS256 tokens
- Zod validation en request params, query, y body
- Error handling global: `DomainError` → HTTP status codes
- `config.ts` con Zod-validated env vars (como Capio)

**Decisión de arquitectura:**
La seguridad no es un feature que "agregas después". Cada endpoint nace protegido. Si un endpoint debe ser público, lo marcas explícitamente con `@Public()`. Este es el patrón de Capio y es el correcto.

**Problema real que enfrento:**
Escribe un test que demuestre un vulnerability real: sin institution scope check, un usuario de tenant A puede acceder datos de tenant B adivinando UUIDs. Luego implementa el fix: scope check como primera línea del use case (patrón de Capio). Este test debe existir ANTES del fix — es test-driven security.

**Preparación para entrevistas:**
"How do you prevent tenant data leakage in a multi-tenant system?" Tu respuesta tiene un test que lo demuestra y un patrón (scope check first) que lo previene.

**Cómo usar Claude:**
> "Aquí está mi controller. Aplícale el checklist del doc de Capio backend §5 y §14. ¿Qué le falta?"

---

### Semana 4 — Redis locks + concurrencia real + primer load test

**Concepto del libro:** DDIA (Kleppmann cap. 8: The Trouble with Distributed Systems). DDIA (cap. 9: Consistency and Consensus — locks, fencing tokens).

**Qué construyo:**
- `RedisSeatLockService` con `SET NX EX` y Lua script para release seguro
- Fencing tokens: el lock incluye un token monótonamente creciente. Si tu lock expiró y otro proceso tomó el lock, tu token es menor que el actual → tu write es rechazado por PostgreSQL
- Refactorear `ReserveSeatUseCase`: Redis lock → PostgreSQL write con fencing → release
- k6 load test: 50 usuarios simultáneos reservando 10 seats → solo 10 succeeden, 40 fallan limpiamente
- Seed script: genera 1000 eventos con 500 seats cada uno (500K seats). Mide performance de búsqueda y reserva.

**Decisión de arquitectura (spike obligatorio — 2h):**
¿Fencing tokens o solo TTL? Implementa el escenario sin fencing: proceso A toma lock → se pausa (GC, network) → TTL expira → proceso B toma lock → proceso A "despierta" y escribe → overbooking. Luego implementa con fencing y demuestra que A es rechazado. ADR-003.

Este spike viene directamente de Kleppmann cap. 8, sección "Fencing tokens". Léela antes del spike.

**Problema real que enfrento:**
Tu lock de Redis NO es seguro con solo `SET NX EX`. Kleppmann lo explica: si Redis cae entre el SET y tu write a PostgreSQL, pierdes el lock. Si el proceso pausea por GC, el TTL expira sin que te enteres. Los fencing tokens son la mitigación real.

**Preparación para entrevistas:**
"What happens if your distributed lock expires before the operation completes?" Puedes explicar el problema Y la solución con código que lo demuestra.

---

### Semana 5 — Bounded Context integration + shared kernel + Result type

**Concepto del libro:** DDD (Evans cap. 14: Maintaining Model Integrity — Bounded Contexts, Shared Kernel, Anti-Corruption Layer). Clean Architecture (cap. 14: Component Coupling).

**Qué construyo:**
- `packages/shared`: integration events (`ReservationRequested`, `PaymentCompleted`, `PaymentFailed`), `Result<T, E>` monad, shared value objects (`UserId`, `TransactionId`)
- In-process event bus con publicación AFTER-COMMIT (no antes)
- Flujo completo Ticketing → Wallet: reservar seat → debitar wallet → confirmar reserva
- Error flow: wallet sin fondos → seat se libera
- Transactional Outbox: tabla `outbox_events` en PostgreSQL. Misma transacción que el write principal. Poller que lee outbox y publica.

**Decisión de arquitectura:**
El Transactional Outbox NO es opcional. Sin él, un crash entre `commit()` y `publish()` pierde el evento. Con él, el evento se persiste en la misma transacción que el cambio de datos. Un background poller lee la tabla outbox y publica. Es más código, es más complejo, pero es correcto. ADR-004.

**Problema real que enfrento:**
Simula el crash: en tu test de integración, haz que el publish falle (mock que tira error después del commit). Sin outbox, el evento se pierde. Con outbox, el poller lo reintenta. Demuéstralo con un test.

**Preparación para entrevistas:**
"How do you guarantee that an event is published after a database write?" Transactional Outbox, con test que demuestra el failure mode sin él.

**Cómo usar Claude:**
> "Aquí está mi outbox implementation. ¿Es at-least-once delivery? ¿Qué pasa si el poller procesa el mismo evento dos veces? ¿Mis handlers son idempotentes?"

---

### Semana 6 — Saga con compensación + reconciliación + chaos testing

**Concepto del libro:** DDIA (Kleppmann cap. 9: Consistency and Consensus). DDIA (cap. 12: The Future of Data Systems — exactamente el patrón de reconciliación).

**Qué construyo:**
- `ReservationSaga` choreography-based: SeatLocked → DebitWallet → PaymentCompleted → ConfirmReservation
- Compensación completa: PaymentFailed → ReleaseSeat. DebitWallet timeout (15s) → ReleaseSeat.
- Reconciliation job: cron cada 2 minutos que compara estado de seats vs estado de wallet transactions. Detecta: seats locked sin payment matching, payments completados sin seat confirmed. Genera alertas o auto-correcciones.
- Chaos tests:
  - Matar PostgreSQL a mitad de la saga → ¿el sistema se recupera cuando vuelve?
  - Inyectar latencia de 20s en Wallet → ¿el timeout funciona? ¿la compensación se ejecuta?
  - Enviar el mismo evento `PaymentCompleted` dos veces → ¿la confirmación es idempotente?

**Decisión de arquitectura:**
Choreography, no orchestration. Con 2 servicios, un orquestador es overkill. PERO: documenta en el ADR en qué punto agregarías un orquestador (>3 servicios con flujos complejos) y cómo migrarías. Eso demuestra pensamiento senior. ADR-005.

**Problema real que enfrento:**
El reconciliation job es la parte más importante de la semana. Sin él, tu saga es optimista — asume que todo eventualmente se resuelve. El reconciliation es el safety net que Stripe, Square, y toda fintech seria tiene. Es boring engineering, pero es lo que mantiene los sistemas correctos.

**Preparación para entrevistas:**
"What happens when your saga's compensating action also fails?" La respuesta real es: reconciliation + human escalation. Puedes mostrarlo funcionando.

---

## BLOQUE 2: PRODUCCIÓN Y OPERACIÓN
### Semanas 7–10

La premisa de este bloque: tu sistema ya funciona. Ahora necesita ser operable, seguro, performante, y deployable. Este es el trabajo que un senior hace el 60% del tiempo.

---

### Semana 7 — Observability completa: logs, metrics, tracing

**Concepto del libro:** DDIA (Kleppmann cap. 1: Reliability, Scalability, Maintainability). System Design Interview (Xu: cap. sobre monitoring).

**Qué construyo:**
- Structured logging con Pino: JSON, correlation ID, request duration, user ID, tenant ID
- Correlation ID propagation: HTTP request → use case → event handler → outbox poller → todo el mismo `requestId`
- Metrics: request count, latency histograms (p50/p95/p99), error rate por endpoint, active WebSocket connections
- Prometheus endpoint + Grafana dashboard en Docker
- Health checks: `/health` verifica PostgreSQL, Redis, y reporta version + uptime
- Alert rules configuradas: error rate > 5% sustained 1min, p99 > 2s sustained 1min

**Decisión de arquitectura:**
¿Prometheus pull vs push? Para un sistema single-instance, pull es más simple y estándar. Si escalaras a multi-instance, necesitarías un push gateway o service discovery. ADR-006 documenta esto.

**Problema real que enfrento:**
Implementa la observability y LUEGO inyecta un bug deliberado: haz que un query lento (agregar `pg_sleep(2)` a un repositorio mock) afecte 10% de los requests. Sin Grafana, no sabrías. Con Grafana, ves el spike en p99 y puedes tracear el correlation ID hasta el query específico. Haz este ejercicio como validación de que tu observability funciona.

**Preparación para entrevistas:**
"How would you debug a latency spike in production?" Tienes un dashboard y puedes hacer el walkthrough completo: alert → dashboard → correlation ID → specific log → root cause.

---

### Semana 8 — Event Sourcing real: migración, snapshots, schema versioning

**Concepto del libro:** DDIA (Kleppmann cap. 3: Storage and Retrieval, cap. 4: Encoding and Evolution). DDD (Evans: sobre inmutabilidad de domain events).

**Qué construyo:**
- Migrar Wallet de state-based a Event Sourcing. Esto es una migración de datos real: tienes wallets con transacciones en tablas normalizadas, y las conviertes a un event store. Escribe un migration script que genera eventos históricos desde los datos existentes.
- Tabla `wallet_events`: `wallet_id`, `event_type`, `event_version`, `payload (JSONB)`, `sequence_number`, `created_at`
- `Wallet.rehydrate(events)` con fold
- Snapshots: cada 100 eventos, persiste un snapshot del estado actual. Rehydrate = load snapshot + replay eventos posteriores.
- Schema versioning: `MoneyDeposited_v1` tiene `amount: number`. `MoneyDeposited_v2` agrega `currency: string`. Escribe un upcaster que transforma v1 → v2 en runtime.
- Performance test: genera 50,000 eventos para un wallet. Mide rehydrate sin snapshots vs con snapshots. Documenta la diferencia.

**Decisión de arquitectura:**
¿Cada cuántos eventos hacer snapshot? No hay número mágico — depende del tiempo de rehydrate aceptable. Haz un benchmark: mide rehydrate time con 100, 500, 1000, 5000 eventos. Grafica. Decide el threshold basado en tu SLA de latencia (P99 < 200ms para balance query). ADR-007.

**Problema real que enfrento:**
Schema evolution de eventos. Este es el problema #1 de Event Sourcing en producción que nadie te enseña en tutoriales. Tus eventos son inmutables — no puedes modificar los que ya existen. Pero tu modelo evoluciona. La solución son upcasters: funciones que transforman eventos viejos al schema nuevo en runtime. Impleméntalos y testéalos.

**Preparación para entrevistas:**
"What are the downsides of Event Sourcing?" Ya no es teoría — tienes: migration complexity, rehydration cost, schema evolution cost, eventual consistency. Todo con números.

**Cómo usar Claude:**
> "Aquí está mi upcaster de MoneyDeposited v1 → v2. ¿Es correcto? ¿Qué pasa si tengo v3 que elimina un campo? ¿Necesito v1→v2→v3 o puedo hacer v1→v3 directamente?"

---

### Semana 9 — WebSockets + Redis Pub/Sub + Realtime Gateway

**Concepto del libro:** System Design Interview (Xu: chat system, notification system). DDIA (Kleppmann cap. 11: Stream Processing).

**Qué construyo:**
- `services/realtime/`: WebSocket gateway con NestJS
- JWT auth en handshake
- Redis Pub/Sub: Ticketing publica cambios de seats → Realtime Gateway fan-out a clientes
- Rooms por eventId
- Backpressure: si un cliente está lento, dropear mensajes viejos en lugar de acumular (bounded buffer)
- Reconnection: cuando un cliente se reconecta, enviar estado actual completo (no replay de mensajes perdidos)
- Test: script que conecta 100 WebSocket clients a una room, reservar un seat, verificar que los 100 reciben la actualización en < 200ms

**Decisión de arquitectura:**
¿Redis Pub/Sub o Redis Streams? Pub/Sub es fire-and-forget (si nadie escucha, el mensaje se pierde). Streams persiste y permite consumer groups. Para UI updates, Pub/Sub es suficiente — si el cliente pierde un update, se reconecta y recibe el estado completo. Para el Outbox poller, NECESITAS persistence (ya tienes la tabla). ADR-008.

**Problema real que enfrento:**
¿Qué pasa cuando tienes 10,000 clientes conectados y cada seat change genera un broadcast? Eso es 10,000 writes al socket por cada cambio. Implementa batching: acumula cambios durante 50ms y envía un batch. Mide la diferencia en CPU con k6.

---

### Semana 10 — CI/CD real + deploy a un entorno remoto + zero-downtime migrations

**Concepto del libro:** DDIA (Kleppmann cap. 4: Encoding and Evolution — backward/forward compatibility). Práctica de producción real.

**Qué construyo:**
- GitHub Actions: lint → typecheck → unit tests → integration tests (Docker services) → build → push Docker images
- `pnpm install --frozen-lockfile` en CI (supply chain security)
- `git-secrets` para detectar credentials
- GitHub Actions pinned by hash, no by tag (GlassWorm mitigation)
- Docker multi-stage build para cada servicio
- `tsup` bundler para producción (resolviendo ADR-001 trade-off)
- Deploy a un VPS barato (Hetzner/DigitalOcean $5/mo) con Docker Compose
- Zero-downtime migration: practica Expand/Contract pattern en una tabla real. Agrega una columna, haz dual-write, migra lecturas, elimina la vieja.
- TLS con Let's Encrypt (certbot + nginx reverse proxy)

**Decisión de arquitectura:**
¿Docker Compose en producción o Kubernetes? Para un proyecto personal con 3 servicios, Docker Compose es correcto. K8s es overkill. ADR-009 documenta esto Y el punto de inflexión donde migrarías a K8s.

**Problema real que enfrento:**
Tu primera migration en "producción" (el VPS). Si falla, tu sistema se cae. Practica: haz una migration que rompa la app intencionalmente (rename una columna que el código usa), observa el error, haz rollback, implementa la migración correcta con Expand/Contract.

**Preparación para entrevistas:**
"How do you deploy database migrations without downtime?" Expand/Contract, con un ejemplo real que ejecutaste en tu VPS.

---

## BLOQUE 3: MULTI-TENANCY Y PROBLEMAS DE PRODUCCIÓN REAL
### Semanas 11–14

La premisa de este bloque: dejas el Mega-Proyecto en pausa y construyes algo nuevo. Un mini-sistema multi-tenant que te fuerza a resolver los problemas que Capio resuelve.

---

### Semana 11 — Proyecto B: Sistema multi-tenant desde cero

**Concepto del libro:** DDD (Evans cap. 14-15: Bounded Contexts, Distillation). System Design (Xu: design a URL shortener / key-value store — el principio de scope reduction).

**Qué construyo:**
Un sistema simplificado de gestión de contenido multi-tenant. Piénsalo como un mini-CMS interno donde diferentes organizaciones (tenants) gestionan sus propios recursos. Pequeño — no más de 4-5 endpoints. Pero con los problemas difíciles:
- NestJS + Drizzle + PostgreSQL (misma stack que Capio)
- Multi-tenancy: `organizationId` en cada tabla, scope check en cada activity
- Personas: `admin`, `editor`, `viewer` con permisos diferentes
- Permission registry + AuthorizeGuard (replica del patrón de Capio)
- Contract layer con `defineOperation`
- Activity pattern (Command → Handler → Response)
- JWT auth con persona y organizationId claims
- Tests que demuestran tenant isolation: editor de org A NO puede ver recursos de org B

**Decisión de arquitectura (spike obligatorio — 3h):**
Multi-tenancy: ¿shared database (discriminator column) o database-per-tenant? Implementa el query pattern de cada uno. Shared DB: `WHERE organization_id = ?` en cada query. DB-per-tenant: connection switching. Mide complejidad, isolation level, y costo operacional. ADR-B01.

La respuesta para este proyecto es shared DB (es lo que hace Capio y el 90% de SaaS B2B). Pero debes entender POR QUÉ y cuándo database-per-tenant es la opción correcta (compliance, large enterprise clients).

**Problema real que enfrento:**
Escribe un test que envía un request con `organizationId: "org-B"` usando un JWT que tiene `organizationId: "org-A"`. Sin el scope check, el request succeeds y retorna datos de org-B. Con el scope check, retorna 403. Este test DEBE existir antes del fix.

**Preparación para entrevistas:**
"Design a multi-tenant SaaS platform. How do you isolate data between tenants?" Tienes código funcionando que demuestra ambos approaches y puedes explicar el trade-off.

---

### Semana 12 — Proyecto B: Permisos complejos + row-level security + audit logging

**Concepto del libro:** DDIA (Kleppmann cap. 1: Maintainability). Clean Architecture (Martin cap. 16: Independence).

**Qué construyo:**
- Permission registry: `admin` puede CRUD todo, `editor` puede CRUD su propio contenido, `viewer` solo read
- Ownership rules: un `editor` solo puede editar recursos que creó (no los de otros editores del mismo tenant)
- PostgreSQL Row-Level Security (RLS) como segunda capa de defensa: aunque el application code falle el scope check, la DB rechaza queries cross-tenant
- Audit log: tabla `audit_events` que registra quién hizo qué, cuándo, desde qué IP, con qué persona. Append-only.
- Test matrix: para cada endpoint × cada persona × own-resource vs other-resource × same-tenant vs cross-tenant. Eso es una tabla de 4 dimensiones. Cada celda es un test.

**Decisión de arquitectura:**
¿RLS en PostgreSQL o solo application-level scope checks? La respuesta senior: ambos. Application-level es la primera línea (rápido de debuggear, errores claros). RLS es la segunda línea (defense in depth — si un developer olvida el scope check, la DB lo atrapa). ADR-B02.

**Problema real que enfrento:**
La test matrix. Con 5 endpoints × 3 personas × 2 ownership states × 2 tenant states = 60 test cases. Escribir los 60 es tedioso pero es lo que se hace en sistemas reales con compliance requirements. Usa table-driven tests (parametrized tests en Vitest con `it.each`).

**Preparación para entrevistas:**
"How would you implement role-based access control in a multi-tenant system?" Puedes mostrar 3 capas: JWT claims → application scope check → PostgreSQL RLS.

**Cómo usar Claude:**
> "Aquí está mi permission matrix. Genera los parametrized tests para cada combinación. Luego revisa si hay combinaciones que olvidé."

---

### Semana 13 — Volver al Mega-Proyecto: aplicar multi-tenancy + hardening de seguridad

**Concepto del libro:** OWASP Top 10 (lectura completa esta semana). DDIA (Kleppmann cap. 1: Reliability).

**Qué construyo:**
- Portar lo aprendido en Proyecto B al Mega-Proyecto: agregar `organizationId` (o equivalente) a Ticketing, scope checks en use cases, permission guard
- OWASP checklist aplicado:
  - Injection: test con payload `'; DROP TABLE seats; --` en seatId → debe ser 400, no 500
  - Broken Auth: test con JWT manipulado (cambiar payload sin re-firmar) → 401
  - Broken Access Control: test cross-tenant → 403
  - Security Misconfiguration: `helmet` headers, no exponer stack traces en prod
  - Rate limiting: sliding window con Redis, por usuario + por IP
  - Log injection: test con `\n` en input → no corrompe los logs
- Penetration test manual: dedica 2h a intentar romper tu propio sistema. Documenta lo que encuentras.

**Problema real que enfrento:**
El pentesting manual es incómodo porque vas a encontrar cosas que pensabas que estaban bien y no lo están. Eso es exactamente el punto. Un senior no asume que su código es seguro — lo prueba.

---

### Semana 14 — Performance bajo presión real

**Concepto del libro:** DDIA (Kleppmann cap. 3: Storage and Retrieval — SSTable, B-tree, column-oriented). System Design Interview (Xu: back-of-the-envelope estimation).

**Qué construyo:**
- Seed masivo: 5,000 eventos, 500 seats/evento = 2.5M seats. 100,000 wallets con 50 transactions/wallet = 5M transacciones. 50,000 wallet events para ES.
- k6 scenario completo: 500 virtual users, 5 minutos sostenidos. Flujo: search events → view seats → reserve → pay.
- `EXPLAIN ANALYZE` en TODAS las queries. Documenta cada query: current plan, missing index, fix, improvement.
- Connection pool tuning: mide qué pasa con pool size = 2, 5, 10, 20. Grafica throughput vs pool size.
- Identify y fix el top 3 bottlenecks.
- Back-of-the-envelope: calcula teóricamente cuántos requests/second tu hardware debería soportar. Compara con lo que mides. Si hay discrepancia > 2x, hay un bug de performance.

**Decisión de arquitectura:**
Si tu catálogo de eventos es el bottleneck (lecturas frecuentes, datos que cambian poco), AHORA es cuando un read cache o view denormalized tiene sentido. No antes. Decides basado en números, no en "CQRS suena bien". ADR-010 documenta: "el catálogo tiene un ratio de 100:1 reads:writes y p99 de Xms, por lo que un read cache con TTL de 60s reduce p99 a Yms".

**Problema real que enfrento:**
Tu seed de 2.5M seats va a hacer que queries sin índice tarden >5 segundos. Vas a descubrir que tu schema necesita índices que no planeaste. Vas a descubrir que connection pool exhaustion causa timeouts en cascada. Esto es lo que pasa en producción cuando creces.

**Preparación para entrevistas:**
"How would you handle a system that needs to serve 10K requests per second?" Ya no es teoría — tienes un baseline, un report de optimización, y números reales.

---

## BLOQUE 4: SYSTEM DESIGN + PROBLEMAS AVANZADOS
### Semanas 15–18

La premisa de este bloque: ya construiste dos sistemas reales. Ahora los usas como base para practicar system design y enfrentar problemas avanzados que aparecen en entrevistas y en producción.

---

### Semana 15 — System Design Exercise #1: Rediseña tu propio sistema desde cero

**Concepto del libro:** System Design Interview (Xu: framework completo). DDIA (Kleppmann: todo).

**Ejercicio (día completo, 6-8h):**
Pretende que no has escrito una línea de código. Un "cliente" te dice: "Necesito un sistema de reserva de asientos para eventos con integración de pagos, como Ticketmaster pero más simple. 1M usuarios concurrentes en picos."

Haz el ejercicio completo de system design:
1. Requirements gathering: functional + non-functional
2. API design: endpoints, request/response shapes
3. Data model: qué tablas, qué relaciones, qué tipos de DB
4. High-level architecture: diagrama de componentes
5. Deep dive #1: ¿cómo garantizo cero overbooking?
6. Deep dive #2: ¿cómo manejo el pico de 1M usuarios?
7. Deep dive #3: ¿qué pasa cuando el servicio de pagos falla?
8. Bottlenecks y scaling: dónde está el cuello de botella y cómo lo resuelvo

**Después del diseño:**
Compara tu diseño con lo que implementaste. Escribe un documento de 3-5 páginas con las diferencias y por qué divergen. ¿Tu diseño en papel es mejor que tu implementación? ¿O tu implementación descubrió problemas que tu diseño no previó?

**Cómo usar Claude:**
> "Hazme una mock interview de system design de 45 minutos. Sé el entrevistador de Meta/Google. Pregunta follow-ups agresivos cuando mi respuesta sea vaga."

---

### Semana 16 — System Design Exercise #2: Diseña algo que NO construiste

**Concepto del libro:** System Design Interview (Xu: notification system, chat system, rate limiter).

**Ejercicio (6-8h):**
Elige UN sistema que NO es tu Mega-Proyecto:
- Opción A: Chat system en tiempo real (WhatsApp simplificado)
- Opción B: Notification system (like/comment push notifications)
- Opción C: Rate limiter as a service

Haz el mismo ejercicio de system design completo. LUEGO implementa la parte más difícil (no todo el sistema — solo el core problem) en 4-6h:
- Chat: implementa el message ordering problem con un prototipo
- Notifications: implementa el fan-out problem (1 celebrity post → 10M followers notified)
- Rate limiter: implementa sliding window con Redis y demuestra que funciona bajo concurrencia

**Preparación para entrevistas:**
Este es el formato exacto de una entrevista de system design. La diferencia es que tú también implementas la parte difícil, lo cual te da profundidad que otros candidatos no tienen.

---

### Semana 17 — Heredar un sistema roto y estabilizarlo

**Concepto del libro:** DDIA (Kleppmann cap. 1: Reliability — faults vs failures). Práctica de senior engineering real.

**Qué hago:**
Toma tu Mega-Proyecto y introdúcete estos problemas deliberadamente:
1. Un memory leak: un array que crece sin límite en un event handler (no limpia listeners)
2. Un N+1 query: en el listado de eventos, carga seats uno por uno en lugar de batch
3. Un race condition: en la saga, remueve la idempotency check de un handler
4. Un security hole: en UN endpoint, "olvida" el scope check
5. Un bug de schema evolution: cambia el schema de un event sin upcaster

Ahora, cierra los archivos donde hiciste los cambios. Ábrelos en 24h. Usa SOLO tus logs, métricas, y tests para encontrar cada problema. No puedes mirar el diff. Solo puedes usar las herramientas que construiste.

**Problema real que enfrento:**
Esto simula tu primer mes en un equipo nuevo. No conoces el codebase, algo está mal, y tu único recurso son los logs y las métricas. Si tu observability es buena, encuentras todo. Si no, estás ciego.

**Preparación para entrevistas:**
"Tell me about a time you debugged a complex production issue." Ahora tienes una historia real (aunque sea auto-infligida) con: síntoma → investigación → root cause → fix → prevention.

---

### Semana 18 — Cambio de requirements que rompe tu modelo

**Concepto del libro:** DDD (Evans cap. 15: Distillation — cuando el modelo necesita evolucionar). DDIA (Kleppmann cap. 4: Encoding and Evolution).

**El cambio de requirements:**
"Los venues ahora tienen múltiples secciones (VIP, General, Balcón) con pricing diferente por sección. Un evento puede tener descuentos temporales que cambian el precio de una sección durante un periodo."

**Qué construyo:**
- Refactorear `Venue` y `SeatMap`: agregar `Section` entity con `pricingTier`
- Migrar la tabla `seats`: agregar `section_id` con zero-downtime migration (Expand/Contract)
- `PricingService` domain service: calcula el precio de un seat basado en sección + descuentos activos
- Backward compatibility en la API: `v1` sigue funcionando sin secciones (default "General"), `v2` incluye secciones
- Migrar datos existentes: todos los seats actuales pertenecen a sección "General"
- Tests de regresión: TODO lo que funcionaba antes sigue funcionando

**Problema real que enfrento:**
Tu modelo de dominio cambió. Tu API tiene clientes que usan v1. Tu base de datos tiene millones de rows que necesitan migración. Este es el trabajo diario de un senior: evolucionar un sistema vivo sin romperlo.

**Preparación para entrevistas:**
"How do you handle API versioning and backward compatibility?" Tienes un ejemplo real con v1/v2 coexistiendo y una migration story.

**Cómo usar Claude:**
> "Aquí está mi modelo actual de Venue/SeatMap. Necesito agregar secciones con pricing. Revisa si mi migration plan tiene huecos. ¿Qué pasa con los integration tests existentes?"

---

## BLOQUE 5: CONSOLIDACIÓN Y CRECIMIENTO SENIOR
### Semanas 19–22

---

### Semana 19 — Feature no planificado: Admin Dashboard API

**Qué construyo:**
Un set de endpoints de admin que NO estaban en el diseño original:
- `GET /admin/v1/stats`: reservas por día, revenue por evento, wallets con balance negativo (si hay bugs), saga failures pendientes
- `GET /admin/v1/reconciliation-report`: output del reconciliation job en formato API
- `POST /admin/v1/events/:id/force-release-seats`: liberar seats stuck (locked > 15min)
- Auth: solo persona `admin` puede acceder. Nuevo permission tier.

**Por qué importa:**
Agregar un feature a un sistema maduro que tú mismo creaste es diferente a construir desde cero. Tienes que entender las implicaciones en el schema existente, en los tests existentes, en la API existente. Este es el 80% del trabajo real de un senior.

---

### Semana 20 — System Design Exercise #3: el que más te asuste

**Ejercicio (6-8h):**
Elige el sistema que más te asusta diseñar:
- Opción A: Distributed key-value store (como DynamoDB simplificado) — fuerza: consistent hashing, replication, conflict resolution
- Opción B: Search engine (como Elasticsearch simplificado) — fuerza: inverted indexes, ranking, sharding
- Opción C: Payment processing system (como Stripe simplificado) — fuerza: exactly-once semantics, reconciliation, idempotency at scale

Diseño completo + implementación del core problem (4-6h).

---

### Semana 21 — Tu VPS en llamas: incident response simulation

**Qué hago:**
Tu sistema está corriendo en el VPS. Simula un incident real:
1. Genera tráfico sostenido con k6 (200 req/s durante 10 min)
2. A los 3 minutos, `docker exec` al container de PostgreSQL y ejecuta `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'mega_project'` — mata todas las connections
3. Observa: ¿qué pasa? ¿Los error rates suben? ¿El sistema se recupera solo? ¿Cuánto tarda?
4. Escribe un postmortem: timeline, impact, root cause, what we did, what we'll do to prevent recurrence
5. Implementa la prevención: connection retry logic, circuit breaker para DB calls, alert para connection pool exhaustion

**Preparación para entrevistas:**
Ahora tienes un postmortem real que puedes discutir. "Tell me about an incident you handled" ya no es inventado.

---

### Semana 22 — Documentación, portfolio, y preparación final

**Qué construyo:**
- Architecture Decision Records: todos los ADRs revisados y actualizados con lo que aprendiste
- README profesional de ambos proyectos
- Diagramas C4 (Context, Container, Component) actualizados
- `docs/interview-prep.md`: para cada componente del sistema, las 3 preguntas más difíciles que un entrevistador haría y tus respuestas con trade-offs y números
- Un blog post (o documento largo) explicando la decisión más difícil que tomaste y por qué
- System design template: tu framework personal para abordar cualquier problem de system design, basado en tu experiencia

---

## Protocolo semanal con Claude

### Lunes — Planning + Spike
> "Esta semana necesito [X]. Antes de codear, necesito decidir entre [A] y [B]. Ayúdame a estructurar un spike de 2h: qué implemento en cada approach, qué mido, y qué criterios uso para decidir."

### Miércoles — Code Review agresivo
> "Aquí está mi implementación. Aplica estas lentes en este orden: (1) ¿viola algún principio de los docs de Capio? (2) ¿sobreviviría un load test de 500 req/s? (3) ¿un developer nuevo entendería esto en 10 minutos? (4) ¿qué escenario de fallo no estoy manejando?"

### Viernes — System Design Drill (30 min)
> "Dame un system design problem random de nivel senior. Tengo 5 minutos para el high-level design. Critica mi approach."

### Reglas actualizadas
1. **Siempre pega código.** No preguntes en abstracto.
2. **Siempre pide un escenario de fallo.** "¿Dónde se rompe esto?" es la pregunta más valiosa.
3. **Después de cada spike, pide comparación.** "¿Mi ADR tiene sentido? ¿Qué opción elegiría un Staff Engineer y por qué?"
4. **Una vez por semana, pide un quiz.** "Dame 5 preguntas de entrevista sobre lo que construí esta semana. Quiero responder como si estuviera en una entrevista real."
5. **No pidas validación.** "¿Está bien?" es una pregunta mid. "¿Dónde falla esto?" es una pregunta senior.

---

## Mapa de Libros → Semanas

| Libro / Concepto | Semanas donde se aplica |
|---|---|
| **Kleppmann — DDIA cap. 1** (Reliability) | S7, S13, S17, S21 |
| **Kleppmann — DDIA cap. 2-3** (Data Models, Storage) | S2, S8, S14 |
| **Kleppmann — DDIA cap. 4** (Encoding, Evolution) | S3, S8, S10, S18 |
| **Kleppmann — DDIA cap. 8** (Distributed Problems) | S4, S6 |
| **Kleppmann — DDIA cap. 9** (Consistency, Consensus) | S5, S6 |
| **Kleppmann — DDIA cap. 11** (Stream Processing) | S9 |
| **Martin — Clean Architecture** (capas, dependencias) | S2, S3, S5 |
| **Martin — Clean Code** (funciones, naming) | S1, S19 |
| **Evans — DDD Tactical** (entities, VOs, aggregates) | S1, S2, S11 |
| **Evans — DDD Strategic** (bounded contexts, shared kernel) | S5, S11, S18 |
| **Xu — System Design Interview** | S15, S16, S20 |
| **OWASP Top 10** | S13 |
| **Patrones de Capio** (contracts, activities, auth, multi-tenancy) | S3, S7, S11, S12, S13 |

---

## Lo que este plan NO cubre (y por qué)

**Kubernetes:** No lo necesitas para pasar de mid a senior. Lo necesitas para pasar de senior a staff. Tu VPS con Docker Compose es suficiente.

**Microservicios extraídos:** Tu monorepo con bounded contexts es la decisión correcta. Extraer a microservicios reales (repos separados, networking, service mesh) es un problema de scale que no tienes. Un senior sabe cuándo NO hacer microservicios.

**Frontend:** Este plan es backend-focused. Si quieres agregar un frontend, hazlo después de la Semana 22 como un proyecto separado que consume tus APIs.

**Kafka/RabbitMQ:** Redis Pub/Sub + Outbox table es suficiente para tu escala. Un message broker dedicado es correcto cuando tienes >10 consumers o necesitas delivery guarantees que Redis no da. Documéntalo en un ADR y no lo implementes.

**GraphQL:** REST con contracts tipados (como Capio) te da type safety end-to-end sin la complejidad de un schema language adicional. GraphQL es correcto cuando tienes múltiples clientes con necesidades de datos muy diferentes. No es tu caso.
