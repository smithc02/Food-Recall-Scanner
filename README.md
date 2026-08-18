# Food Recall Scanner

Mobile-first browser platform for rapidly triaging packaged food and beverage products for potential U.S. recall matches.

The core workflow is intentionally two-stage:

1. **AI-assisted visual triage** — a user captures a photo or short video of a pantry, refrigerator, freezer, countertop, or group of packaged products. The system identifies likely products and compares them with authoritative recall records.
2. **Item-level verification** — only products with plausible recall matches are flagged for barcode / lot / date-code verification before the service presents a confirmed product-level result.

> **Safety principle:** AI may identify and rank possible recall candidates, but it does not independently declare a specific physical package recalled without sufficient verification evidence.

## V1

V1 focuses on U.S. packaged food and beverage recall triage using FDA and USDA FSIS recall data, with a mobile Progressive Web App experience.

Project documentation:

- [V1 Technical Architecture](docs/V1-ARCHITECTURE.md)
- [MVP Scope](docs/MVP-SCOPE.md)
- [Milestones](docs/MILESTONES.md)
- [Safety and Confidence Model](docs/SAFETY-AND-CONFIDENCE.md)
- [Recall Data Sources](docs/DATA-SOURCES.md)
- [Codex Development Workflow](docs/CODEX-WORKFLOW.md)

## Local development (Windows 11 / PowerShell)

### Prerequisites

- Node.js 22 or newer (Node.js 24 is used in CI)
- pnpm 10 or newer, invoked with Corepack (`corepack pnpm`)
- Docker Desktop configured to use the WSL2 backend

The repository does not contain development credentials. Create a local `.env` from the
placeholder template and use unique values that are only for your machine:

```powershell
Copy-Item .env.example .env
notepad .env
```

Set `POSTGRES_USER`, `POSTGRES_PASSWORD`, `REDIS_PASSWORD`, `MINIO_ACCESS_KEY`, and
`MINIO_SECRET_KEY`. Keep the `DATABASE_URL` and `REDIS_URL` values consistent with those
credentials. All passwords and the MinIO secret key must be at least 16 characters.

Bootstrap dependencies and start the local dependency stack:

```powershell
corepack pnpm install --frozen-lockfile
docker compose up -d
docker compose ps
```

Start the web app and worker in separate PowerShell windows:

```powershell
corepack pnpm dev:web
corepack pnpm dev:worker
```

The web health endpoint is `http://127.0.0.1:3000/api/health`. The worker intentionally
only validates its configuration and starts a shell in Milestone 0; it does not connect to,
ingest from, or process any external service yet.

Run repository checks:

```powershell
corepack pnpm lint
corepack pnpm format:check
corepack pnpm typecheck
corepack pnpm test
corepack pnpm build
```

Docker services bind only to `127.0.0.1` for local development. They are not production
deployment configuration. To stop local dependencies, run `docker compose down`; add `-v`
only when intentionally deleting local development data.

## Project status

**Planning / architecture.** No production application code has been committed yet.
