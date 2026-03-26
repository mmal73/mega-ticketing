# 🎟️ Mega-Project: Ticketing + Wallet (Fintech)

This repository documents the evolution of a highly technical distributed system that combines two complex domains: **high-concurrency ticketing** and a **virtual wallet** with financial-grade security.

## 🏗️ Key Technical Challenges
This system is designed to solve four advanced architectural problems:
1. **Extreme Concurrency (Ticketing):** Prevention of double seat reservations using distributed *Seat Locks* (Redis) and *Optimistic Locking* (PostgreSQL).
2. **Distributed Transactions (Fintech):** Coordinating the payment flow across domains using the *Saga Pattern* based on choreography and events.
3. **Real-Time (WebSockets):** Live updates of the seating map for thousands of users using Redis Pub/Sub for fan-out across instances.
4. **Resilience and Scale:** Implementation of *CQRS*, *Event Sourcing* for perfect financial auditing, and extreme *Cache-aside* to handle massive traffic spikes.

## 🛠️ Technology Stack
* **Core:** Node.js, TypeScript, pnpm workspaces.
* **Architecture:** Clean Architecture, Domain-Driven Design (DDD).
* **Databases:** PostgreSQL (Relational/ACID), Redis (Cache/Locks/Pub-Sub).
