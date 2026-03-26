# Estado del Mega-Proyecto: Ticketing + Wallet

## Progreso Actual: Semana 1 - Bloque 1 (Fundamentos de Diseño)
**Hito actual:** Dominio puro en TS: entidades, value objects y use cases de Ticketing y Wallet sin frameworks.

### Logros Completados ✅
- [x] **Setup del Monorepo:** Estructura creada con `pnpm workspaces` dividida por Bounded Contexts (Ticketing, Wallet, Realtime, Shared).
- [x] **Infraestructura Base:** `docker-compose.yml` configurado con PostgreSQL y Redis.
- [x] **Estándares de Código:** Implementación de ESLint con tipado estricto (`eslint.config.ts`) e integración de Prettier para formato (estándar Enterprise).
- [x] **Control de Versiones:** Repositorio inicializado y subido a GitHub con `.gitignore` robusto.
- [x] **Clean Architecture:** Carpetas de domain, application, infrastructure y presentation creadas para Ticketing.

### Siguiente Paso 🚧
- [ ] Aplicar Single Responsibility Principle (SRP): definir la entidad `Seat` con una sola responsabilidad.
- [ ] Escribir tests unitarios desde cero para la entidad `Seat`.