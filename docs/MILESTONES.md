# V1 Milestones

The project should be developed as small, reviewable milestones. Each milestone should leave `main` in a working state and should be independently testable before the next begins.

## Milestone 0 — Foundation and Guardrails

### Goal
Create the development environment, repository conventions, CI, shared configuration, and minimal application shells before product logic is added.

### Deliverables
- pnpm workspace / monorepo bootstrap;
- `apps/web` Next.js application;
- `apps/worker` TypeScript worker shell;
- shared `packages/*` structure;
- TypeScript strict mode;
- formatting/linting;
- test runner;
- environment validation;
- Docker Compose for PostgreSQL, Redis, and MinIO;
- health endpoints;
- GitHub Actions for lint, typecheck, test, and build;
- `.env.example` with no real secrets;
- security/development conventions documented.

### Acceptance criteria
- clean clone can be bootstrapped from documented commands;
- web and worker both start locally;
- database/Redis/object storage dependencies start locally;
- CI is green;
- no secret is committed;
- repository structure matches the architecture document.

---

## Milestone 1 — Recall Data Foundation

### Goal
Create a trustworthy local recall dataset before introducing AI.

### Deliverables
- PostgreSQL recall schema;
- FDA food-enforcement adapter;
- USDA FSIS adapter;
- raw-source snapshot/provenance fields;
- normalization pipeline;
- idempotent upsert logic;
- ingest command/job;
- ingestion freshness tracking;
- representative source fixtures;
- unit/contract tests.

### Acceptance criteria
- repeated ingestion does not duplicate records;
- normalized records retain authoritative source IDs/URLs;
- known fixture records normalize deterministically;
- failed source jobs are observable;
- data can be queried by brand/product text;
- raw source payload/hash is retained for audit/debug purposes.

---

## Milestone 2 — Deterministic Recall Matching Engine

### Goal
Build and test the candidate-retrieval/scoring engine independently from image recognition.

### Deliverables
- normalized text utilities;
- recall search index fields;
- candidate-retrieval service;
- configurable evidence scoring;
- explainable match evidence;
- verification-state domain model;
- test fixtures representing true and false matches.

### Acceptance criteria
- exact UPC matches rank above fuzzy text matches;
- brand-only matches cannot become verified recalls;
- package-specific verification rules are unit tested;
- returned candidates contain human-readable evidence;
- matching can be exercised entirely with typed product observations and no AI dependency.

---

## Milestone 3 — Photo Scan Vertical Slice

### Goal
Deliver the first end-to-end user workflow using a still image.

### Deliverables
- mobile capture/upload UI;
- private object-storage upload;
- scan record/status model;
- async scan queue;
- OpenAI image-analysis provider implementation;
- strict structured product-observation schema;
- worker scan pipeline;
- recall matching invocation;
- processing screen;
- results list;
- basic image overlay boxes;
- media expiration job.

### Acceptance criteria
- user can capture/upload a photo from a phone;
- processing happens asynchronously;
- multiple products can be returned from one photo;
- result overlays map correctly onto the image;
- possible recall matches are sourced from the local recall database, not model memory;
- no plausible match state is distinguishable from unidentified product state;
- media expires according to policy.

### Product milestone
At the end of Milestone 3, the concept is demonstrable to real users.

---

## Milestone 4 — Item Verification

### Goal
Turn flagged candidates into an evidence-driven verification workflow.

### Deliverables
- candidate detail screen;
- browser barcode scan integration;
- manual UPC fallback;
- guided close-up capture;
- structured extraction of lot/date/establishment fields;
- user correction UI;
- deterministic verification logic;
- verified/unverified outcome screens;
- authoritative recall source links.

### Acceptance criteria
- product candidate cannot silently become `VERIFIED_MATCH` without required evidence;
- exact identifiers can confirm or exclude a candidate where the source record supports doing so;
- uncertain extraction is shown to the user for correction;
- all verification results contain an evidence breakdown;
- source link is present in recall result details.

---

## Milestone 5 — Short Video Scan

### Goal
Allow a user to pan across a pantry/refrigerator/freezer and improve coverage without requiring native video AI.

### Deliverables
- short browser video capture/upload;
- duration and file-size limits;
- FFmpeg frame sampling;
- blur/duplicate frame filtering;
- per-frame image analysis;
- cross-frame observation merge;
- representative key-frame selection;
- results UI adapted for merged video observations.

### Acceptance criteria
- short mobile videos process without blocking web requests;
- duplicate products across frames are substantially collapsed;
- evidence from multiple frames can improve a product observation;
- video failures degrade cleanly with useful retry guidance;
- sampled frames and source video obey media-retention policy.

---

## Milestone 6 — Evaluation, Hardening, and Private Beta

### Goal
Measure quality and make the system safe/reliable enough for controlled external testing.

### Deliverables
- labeled golden scan dataset;
- evaluation runner;
- recall-candidate precision/recall reporting;
- product-identification quality reporting;
- confidence-threshold tuning;
- rate limiting / abuse controls;
- upload hardening;
- browser compatibility testing;
- accessibility pass;
- structured operational metrics;
- privacy/retention verification;
- production deployment documentation;
- incident/failure-mode checklist.

### Acceptance criteria
- evaluation metrics are reproducible from the repository;
- known recalled products in the evaluation set are not suppressed by UI thresholding without documented reason;
- schema/provider failures produce safe unresolved results rather than fabricated outcomes;
- stale recall ingestion is operationally visible;
- mobile Safari and Chrome happy paths pass;
- automated media deletion is verified;
- launch disclaimers and source attribution are reviewed.

---

## Milestone 7 — Public MVP

### Goal
Release the smallest consumer-facing product that reliably delivers the core value proposition.

### Deliverables
- production environment;
- public landing page;
- photo + short-video scanning;
- candidate overlays/list;
- item verification;
- FDA/USDA source attribution;
- privacy policy / terms / consumer disclaimer;
- basic product analytics;
- support/feedback path;
- operational runbook.

### Launch gate
Do not launch solely because features are complete. Launch requires acceptable evaluation performance, working recall-data freshness monitoring, functioning media deletion, and safe uncertainty behavior.

---

# Post-MVP Candidates

Prioritize only after observing real V1 usage:

1. persistent `My Pantry` inventory;
2. recall notifications for saved products;
3. accounts and household sharing;
4. CPSC recall ingestion for household products;
5. pet-product expansion;
6. supplement/OTC workflows;
7. receipt/retailer integrations;
8. native apps if browser limitations materially hurt capture quality;
9. custom detection/OCR models if economics or accuracy justify them.

---

# Development Rule

Each implementation milestone should normally follow this flow:

```text
architecture/docs -> Codex implementation branch -> automated tests -> manual acceptance check -> PR -> review -> merge -> next milestone
```

Avoid asking Codex to implement multiple milestones in one prompt. Narrow prompts produce more reviewable changes and make regressions easier to isolate.
