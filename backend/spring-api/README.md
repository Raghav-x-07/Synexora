# Synexora Core Spring Boot API

> **Synexora — Your Intelligent Student Operating System**

## Overview
The Spring Boot Core API acts as the transactional backbone of Synexora. It manages user authentication, relational entities, student profile data, calendar events, tasks, notes, and confirmed controlled memories.

## Technologies
- **Java**: 17+
- **Spring Boot**: 3.2.x
- **Spring Security**: 6.x + JWT
- **Spring Data JPA**: PostgreSQL / H2 Database
- **Build Tool**: Maven

## Endpoints
- `GET /api/v1/health`: API Health & module readiness check.
- `POST /api/v1/auth/register`: Student onboarding.
- `POST /api/v1/auth/login`: Student authentication.
- `GET /api/v1/tasks`: Student tasks and priorities.
- `GET /api/v1/memories`: Student confirmed memories.

## Running Directly
```bash
./mvnw spring-boot:run
```
Or via the parent runner:
```bash
cd ..
npm run dev:api
```
