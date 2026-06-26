# AI-Powered Support Desk

A full-stack customer support ticketing system with AI-assisted ticket classification, summarization, response suggestions, and semantic knowledge base search.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Roles & Permissions](#roles--permissions)
- [AI Features](#ai-features)
- [Knowledge Base](#knowledge-base)
- [Project Structure](#project-structure)
- [Deployment](#deployment)

---

## Overview

This application allows customers to submit support tickets, agents to manage and resolve them, and admins to oversee the entire system. AI features powered by Groq (LLaMA 3) help agents work faster by automatically classifying tickets, summarizing conversations, and suggesting grounded responses using relevant knowledge base articles retrieved via semantic search.

---

## Tech Stack

### Backend
- **Java 17**, **Spring Boot 4**
- **Spring Security 7** with JWT authentication
- **PostgreSQL** with **pgvector** extension for vector similarity search
- **Flyway** for database migrations
- **Hibernate 7** with `hibernate-vector` for pgvector support
- **Lombok** for boilerplate reduction
- **RestClient** for external API calls (no Spring AI dependency)

### Frontend
- **React 18** + **Vite**
- **Tailwind CSS** (dark mode)
- **Zustand** for auth state management
- **Axios** with JWT interceptor
- **React Router v6**

### External APIs
- **Groq** — LLaMA 3 (`llama3-8b-8192`) for AI chat features
- **Cohere** — 1024-dimension embeddings for semantic search (`embed-english-v3.0`)

---

## Features

### Customer
- Register and log in
- Create support tickets (title, description, category)
- View own tickets with status tracking
- Add and delete comments on own tickets
- View AI-generated summaries of their tickets

### Agent
- View and self-assign unassigned tickets
- Update ticket status (OPEN → IN_PROGRESS → RESOLVED → CLOSED)
- Add and delete comments on assigned tickets
- AI classify ticket (auto-applies category and priority)
- AI summarize ticket conversation
- AI suggest 2 response options grounded in knowledge base articles
- Surface relevant knowledge base articles per ticket

### Team Lead
- Everything an Agent can do
- View all tickets system-wide
- Reassign tickets to any agent
- Change ticket priority
- View agent workload dashboard

### Admin
- Everything a Team Lead can do
- Manage users (view, change roles, delete)
- Manage knowledge base (create, search, delete articles)
- View audit logs with filtering by action type
- Full ticket detail control (status, priority, assignment)

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     React Frontend                       │
│         Vite + Tailwind + Zustand + React Router        │
└─────────────────────┬───────────────────────────────────┘
                      │ REST API (JWT)
┌─────────────────────▼───────────────────────────────────┐
│                  Spring Boot Backend                     │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │  auth/   │  │ ticket/  │  │ comment/ │             │
│  └──────────┘  └──────────┘  └──────────┘             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │  user/   │  │   ai/    │  │ audit/   │             │
│  └──────────┘  └──────────┘  └──────────┘             │
│  ┌──────────────────┐  ┌────────────────┐              │
│  │  knowledgebase/  │  │  dashboard/    │              │
│  └──────────────────┘  └────────────────┘              │
└──────┬──────────────────────┬────────────────────────────┘
       │                      │
┌──────▼──────┐     ┌─────────▼──────────────────────────┐
│ PostgreSQL  │     │         External APIs               │
│ + pgvector  │     │  Groq (LLM) + Cohere (Embeddings)  │
└─────────────┘     └────────────────────────────────────┘
```

---

## Getting Started

### Prerequisites
- Java 17+
- Node.js 18+
- Docker Desktop
- A Groq API key (free at [console.groq.com](https://console.groq.com))
- A Cohere API key (free at [cohere.com](https://cohere.com))

### 1. Start PostgreSQL with pgvector

```bash
docker run -d \
  --name supportdesk-postgres \
  -e POSTGRES_DB=supportdesk \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  pgvector/pgvector:pg16
```

Then enable the pgvector extension:
```sql
psql -h localhost -U postgres -d supportdesk
CREATE EXTENSION IF NOT EXISTS vector;
```

### 2. Configure the backend

Copy `application.yml` and fill in your keys:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/supportdesk
    username: postgres
    password: postgres
  jpa:
    hibernate:
      ddl-auto: validate
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
  flyway:
    enabled: true

application:
  security:
    jwt:
      secret-key: your-256-bit-secret-key-at-least-32-characters-long
      expiration: 86400000

groq:
  api:
    key: your-groq-api-key

huggingface:
  api:
    key: your-cohere-api-key
```

> **Note:** The `huggingface.api.key` property is used for the Cohere embedding client despite the name. This is a naming artifact from the original setup.

### 3. Run the backend

```bash
cd backend
mvn spring-boot:run
```

Flyway will automatically run all migrations (V1-V5) on startup. The `DataSeeder` will create a default admin account:
- **Email:** `admin@supportdesk.com`
- **Password:** `password123`

> Change this password after first login via the User Management page.

The backend runs on `http://localhost:8080`. Swagger UI is available at `http://localhost:8080/swagger-ui/index.html`.

### 4. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173`.

---

## Environment Variables

| Variable | Description | Required |
|---|---|---|
| `groq.api.key` | Groq API key for LLM features | Yes |
| `huggingface.api.key` | Cohere API key for embeddings | Yes |
| `application.security.jwt.secret-key` | JWT signing secret (min 32 chars) | Yes |
| `application.security.jwt.expiration` | JWT expiration in ms (default 86400000 = 24h) | Yes |
| `spring.datasource.url` | PostgreSQL connection URL | Yes |
| `spring.datasource.username` | PostgreSQL username | Yes |
| `spring.datasource.password` | PostgreSQL password | Yes |

For production on Render, set these as environment variables and use `${VARIABLE_NAME}` syntax in `application-prod.yml`.

---

## API Reference

### Auth
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/v1/auth/register` | Public | Register (CUSTOMER or AGENT only) |
| POST | `/api/v1/auth/login` | Public | Login, returns JWT |

### Tickets
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/v1/tickets` | CUSTOMER | Create ticket |
| GET | `/api/v1/tickets/my` | CUSTOMER | Get own tickets |
| GET | `/api/v1/tickets/assigned` | AGENT | Get assigned tickets |
| GET | `/api/v1/tickets/all` | TEAM_LEAD, ADMIN | Get all tickets (paginated) |
| GET | `/api/v1/tickets/{id}` | All | Get ticket by ID |
| PATCH | `/api/v1/tickets/{id}/assign` | AGENT, TEAM_LEAD, ADMIN | Assign ticket |
| PATCH | `/api/v1/tickets/{id}/status` | AGENT, TEAM_LEAD, ADMIN | Update status |
| PATCH | `/api/v1/tickets/{id}/priority` | TEAM_LEAD, ADMIN | Update priority |

### Comments
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/v1/tickets/{id}/comments` | All | Add comment |
| GET | `/api/v1/tickets/{id}/comments` | All | List comments |
| DELETE | `/api/v1/tickets/{id}/comments/{commentId}` | All | Delete comment |

### AI
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/v1/tickets/{id}/ai/classify` | AGENT, TEAM_LEAD, ADMIN | Classify ticket (auto-applies) |
| GET | `/api/v1/tickets/{id}/ai/summarize` | All | Summarize ticket |
| GET | `/api/v1/tickets/{id}/ai/suggest-response` | AGENT, TEAM_LEAD, ADMIN | Get 2 response suggestions |

### Knowledge Base
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/v1/knowledgebase` | ADMIN | Create document |
| GET | `/api/v1/knowledgebase` | AGENT, TEAM_LEAD, ADMIN | List all documents |
| GET | `/api/v1/knowledgebase/{id}` | AGENT, TEAM_LEAD, ADMIN | Get document |
| GET | `/api/v1/knowledgebase/search?query=` | AGENT, TEAM_LEAD, ADMIN | Semantic search |
| DELETE | `/api/v1/knowledgebase/{id}` | ADMIN | Delete document |
| GET | `/api/v1/tickets/{id}/knowledgebase/suggestions` | AGENT, TEAM_LEAD, ADMIN | Get relevant articles for ticket |

### Users
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/v1/users` | TEAM_LEAD, ADMIN | List all users |
| GET | `/api/v1/users?role=AGENT` | TEAM_LEAD, ADMIN | Filter by role |
| GET | `/api/v1/users/{id}` | TEAM_LEAD, ADMIN | Get user by ID |
| PATCH | `/api/v1/users/{id}/role` | ADMIN | Update user role |
| DELETE | `/api/v1/users/{id}` | ADMIN | Delete user |

### Dashboard
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/v1/dashboard/customer` | CUSTOMER | Customer dashboard stats |
| GET | `/api/v1/dashboard/agent` | AGENT | Agent dashboard stats |
| GET | `/api/v1/dashboard/admin` | TEAM_LEAD, ADMIN | Admin dashboard stats |

### Audit Logs
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/v1/audit` | ADMIN | Get all logs (paginated) |
| GET | `/api/v1/audit/action/{action}` | ADMIN | Filter by action |
| GET | `/api/v1/audit/actor/{actorId}` | ADMIN | Filter by actor |

---

## Roles & Permissions

| Feature | CUSTOMER | AGENT | TEAM_LEAD | ADMIN |
|---|---|---|---|---|
| Create tickets | ✅ | ❌ | ❌ | ❌ |
| View own tickets | ✅ | ❌ | ❌ | ❌ |
| View assigned tickets | ❌ | ✅ | ❌ | ❌ |
| View all tickets | ❌ | ❌ | ✅ | ✅ |
| Self-assign ticket | ❌ | ✅ | ❌ | ❌ |
| Reassign ticket | ❌ | ❌ | ✅ | ✅ |
| Update ticket status | ❌ | ✅ | ✅ | ✅ |
| Update ticket priority | ❌ | ❌ | ✅ | ✅ |
| Add comments | ✅ (own) | ✅ (assigned) | ✅ (any) | ✅ (any) |
| Delete own comments | ✅ | ✅ | ✅ | ✅ |
| Delete any comment | ❌ | ❌ | ✅ | ✅ |
| AI classify | ❌ | ✅ | ✅ | ✅ |
| AI summarize | ✅ | ✅ | ✅ | ✅ |
| AI suggest response | ❌ | ✅ | ✅ | ✅ |
| View knowledge base | ❌ | ✅ | ✅ | ✅ |
| Manage knowledge base | ❌ | ❌ | ❌ | ✅ |
| Manage users | ❌ | ❌ | ❌ | ✅ |
| View audit logs | ❌ | ❌ | ❌ | ✅ |

---

## AI Features

### Ticket Classification
Clicking "Classify ticket" sends the ticket title and description to Groq (LLaMA 3) using a structured prompt. The model returns a JSON response with `category`, `priority`, and `reasoning`. The classification is **automatically applied** to the ticket — no confirmation needed. Results are audit logged.

### Ticket Summarization
Summarizes the ticket description and all comments into a concise overview under 150 words. Available to all roles including customers viewing their own tickets.

### Response Suggestions
Generates 2 response options for the agent:
1. **Empathetic & Detailed** — thorough, warm tone
2. **Concise & Action-Focused** — brief, direct tone

Before generating suggestions, the system automatically performs semantic search on the knowledge base using the ticket content and injects relevant articles into the prompt. This grounds the AI responses in your actual documentation rather than generic answers. Agents can click "Use this" to copy a suggestion into the comment box.

---

## Knowledge Base

The knowledge base stores plain text articles written by admins. Each article is embedded using Cohere's `embed-english-v3.0` model (`search_document` input type) and stored as a 1024-dimension vector in PostgreSQL using pgvector.

### Semantic Search
When searching or finding suggestions for a ticket, the query is embedded using Cohere's `search_query` input type (asymmetric search). pgvector computes cosine distance (`<=>`) between the query vector and all stored document vectors. Results are filtered by a similarity threshold of `0.72` and limited to the top 3 most relevant articles.

> **Tuning the threshold:** The value `0.72` was determined empirically for Cohere embeddings on this dataset. Lower values = stricter (fewer results), higher values = more permissive (more results). If you add many articles and relevance degrades, adjust `DocumentService.suggestForTicket` and `DocumentService.search` accordingly.

---

## Project Structure

```
backend/
├── src/main/java/io/github/nanaaddae/ticket_support/
│   ├── SupportDeskApplication.java
│   ├── auth/
│   ├── security/
│   ├── user/
│   ├── ticket/
│   ├── comment/
│   ├── audit/
│   ├── ai/
│   │   ├── client/LmStudioClient.java   ← calls Groq API
│   │   ├── AiService.java
│   │   └── AiController.java
│   ├── knowledgebase/
│   ├── dashboard/
│   ├── exception/
│   └── config/
│       ├── AiConfig.java                ← RestClient bean for Groq
│       ├── DataSeeder.java              ← seeds default admin on startup
│       ├── OpenApiConfig.java
│       ├── WebConfig.java
│       ├── JacksonConfig.java
│       └── PasswordEncoderConfig.java
├── src/main/resources/
│   ├── application.yml
│   ├── prompts/
│   │   ├── classify-ticket.txt
│   │   ├── summarize-ticket.txt
│   │   └── suggest-response.txt
│   └── db/migration/
│       ├── V1__create_users_table.sql
│       ├── V2__create_tickets_table.sql
│       ├── V3__create_comments_table.sql
│       ├── V4__create_audit_logs_table.sql
│       └── V5__create_knowledge_base_documents_table.sql

frontend/
└── src/
    ├── App.jsx
    ├── store/authStore.js
    ├── lib/api.js
    ├── components/
    │   ├── Layout.jsx
    │   └── ProtectedRoute.jsx
    └── pages/
        ├── auth/
        ├── customer/
        ├── agent/
        └── admin/
```

---

## Deployment

### Backend (Render)

1. Create a new **Web Service** on Render pointing to your backend repo
2. Set build command: `mvn clean package -DskipTests`
3. Set start command: `java -jar target/*.jar`
4. Add a **PostgreSQL** database on Render and enable the pgvector extension
5. Set environment variables:
   ```
   SPRING_DATASOURCE_URL=jdbc:postgresql://...
   SPRING_DATASOURCE_USERNAME=...
   SPRING_DATASOURCE_PASSWORD=...
   GROQ_API_KEY=...
   HUGGINGFACE_API_KEY=...   ← your Cohere key
   JWT_SECRET_KEY=...
   ```
6. Update `application-prod.yml` to use `${VARIABLE_NAME}` syntax for all secrets

### Frontend (Vercel or Render)

1. Update `src/lib/api.js` `baseURL` to point to your deployed backend URL
2. Deploy via Vercel (connect GitHub repo, auto-detects Vite) or Render Static Site
3. Set `VITE_ ` env var if you parameterize the base URL

### Important before deploying
- Remove `logging.level.org.hibernate: DEBUG` from `application.yml`
- Change the default admin password after first login
- Make sure `application.yml` is in `.gitignore` so API keys don't end up on GitHub

---

## Default Admin Account

On first startup, a default admin account is automatically created:

| Field | Value |
|---|---|
| Email | `admin@supportdesk.com` |
| Password | `password123` |
| Role | `ADMIN` |

**Change this password before deploying to production.**

---

## Known Limitations & Planned Features

- No edit for knowledge base articles (delete and recreate)
- Audit log action filter is client-side on current page only (server-side filtering not yet implemented)
- No pagination on customer/agent ticket lists
- No in-app notifications (planned)
- No organization/multi-tenancy support (planned)
- Customer ticket reopen not yet implemented
- No test coverage yet