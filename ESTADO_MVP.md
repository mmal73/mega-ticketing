# Estado del Mega-Proyecto: Ticketing + Wallet

## Progreso Actual: Semana 1 - Bloque 1 (Fundamentos de Diseño)
**Hito actual:** Dominio puro en TS: entidades, value objects y use cases de Ticketing y Wallet sin frameworks.

### Logros Completados ✅
- [x] **Setup del Monorepo:** Estructura creada con `pnpm workspaces` dividida por Bounded Contexts (Ticketing, Wallet, Realtime, Shared).
- [x] **Infraestructura Base:** `docker-compose.yml` configurado con PostgreSQL y Redis.
- [x] **Estándares de Código:** Implementación de ESLint con tipado estricto (`eslint.config.ts`) e integración de Prettier para formato (estándar Enterprise).
- [x] **Control de Versiones:** Repositorio inicializado y subido a GitHub con `.gitignore` robusto.
- [x] **Clean Architecture:** Carpetas de domain, application, infrastructure y presentation creadas para Ticketing.
- [x] **Arquitectura de Tests:** Implementación de *Test Colocation* y uso de la convención semántica BDD con archivos `.spec.ts`.
- [x] **SRP (Single Responsibility):** Entidad `Seat` implementada aislando su estado interno y protegiendo sus invariantes de negocio.
- [x] **Tests Unitarios:** Especificaciones creadas para la máquina de estados de `Seat` usando Vitest.

### Siguiente Paso 🚧
- [ ] Aplicar Open/Closed Principle (OCP): Diseñar la interfaz `PaymentStrategy` que usará el dominio Wallet.
- [ ] Asegurar que el sistema de pagos sea extensible sin tener que modificar el código del núcleo.
- [x] **OCP (Open/Closed Principle):** Designed the `PaymentStrategy` interface for the Wallet domain. The system is now extensible to new payment methods without modifying the core processor.