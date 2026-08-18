# Codex Development Workflow

## Objective

Use Codex as the primary implementation agent once coding begins, while keeping changes narrow, testable, reviewable, and grounded in the architecture documents.

OpenAI documents Codex as a coding agent for understanding codebases, building/fixing features, running tests, reviewing changes, and preparing code to ship. The official Codex repository also supports repository-level `AGENTS.md` guidance, which this project uses to give Codex durable project instructions.

---

## 1. Development Model

Use one implementation branch per milestone or coherent sub-milestone.

Example:

```text
main
  ├── feat/m0-foundation
  ├── feat/m1-fda-ingestion
  ├── feat/m1-fsis-ingestion
  ├── feat/m2-recall-matcher
  ├── feat/m3-photo-scan
  └── ...
```

Do not ask Codex to build the entire application in one task.

The preferred loop is:

```text
1. Preflight repository state
2. Read architecture + milestone docs
3. Define the exact milestone slice
4. Codex implements the slice
5. Codex runs required checks
6. Review diff and test evidence
7. Fix issues within the same scope
8. Open PR
9. Merge only when acceptance criteria pass
10. Start next slice from updated main
```

---

## 2. Required Preflight

Before implementation, Codex should report:

```text
- current branch
- HEAD commit
- working tree status
- target milestone
- relevant architecture/docs read
- assumptions or blockers discovered
```

If the working tree contains unrelated changes, Codex should not overwrite or discard them.

---

## 3. Prompt Pattern

A milestone prompt should contain:

### Context

- repository name;
- target milestone;
- relevant documentation paths;
- existing implementation state.

### Scope

Explicitly list what Codex should implement.

### Non-goals

Explicitly list adjacent functionality that must not be implemented yet.

### Constraints

Examples:

- preserve strict TypeScript;
- no hard-coded secrets;
- no AI-generated recall decisions;
- follow existing package boundaries;
- do not add infrastructure unless required by the milestone;
- preserve privacy/media retention rules.

### Verification

Tell Codex exactly which tests/checks must pass and ask it to add tests for new behavior.

### Handoff

Require a concise completion report containing:

- files changed;
- key implementation choices;
- tests run + results;
- known limitations;
- migration/environment changes;
- recommended manual acceptance steps.

---

## 4. Milestone 0 Starter Prompt

Use this when development begins, after the architecture PR is merged:

```text
You are implementing Milestone 0 — Foundation and Guardrails for the Food Recall Scanner repository.

Before changing files:
1. Read AGENTS.md.
2. Read README.md.
3. Read docs/V1-ARCHITECTURE.md, docs/MVP-SCOPE.md, docs/MILESTONES.md, docs/SAFETY-AND-CONFIDENCE.md, and docs/DATA-SOURCES.md.
4. Report the current branch, HEAD SHA, and complete git status including untracked files.
5. Summarize the exact Milestone 0 acceptance criteria you will satisfy.

Implement ONLY Milestone 0 from docs/MILESTONES.md.

Required outcome:
- pnpm workspace / monorepo bootstrap;
- apps/web Next.js App Router application;
- apps/worker TypeScript worker shell;
- packages/db, domain, recall, vision, config, and testing;
- strict TypeScript configuration;
- lint/format/test/typecheck/build commands;
- environment validation;
- Docker Compose services for PostgreSQL, Redis, and MinIO;
- health endpoint(s);
- GitHub Actions CI for lint, typecheck, test, and build;
- .env.example with placeholders only;
- local-development instructions.

Do NOT implement recall ingestion, OpenAI API calls, image upload, user accounts, recall matching, or product scanning yet.

Security constraints:
- no secrets or credentials in the repository;
- use safe local defaults only;
- validate environment variables;
- do not expose MinIO/PostgreSQL/Redis as production architecture decisions through insecure defaults.

Testing/verification:
- run every repository check you add;
- start or validate the local dependency stack where the environment permits;
- add basic tests for configuration/health behavior where appropriate;
- if a check cannot be run, state exactly why rather than claiming success.

At completion report:
1. files changed;
2. architecture choices made;
3. commands/tests run and results;
4. any environment prerequisites;
5. unresolved issues;
6. exact manual acceptance steps.

Do not proceed into Milestone 1.
```

---

## 5. Codex Rules for This Project

### Small coherent diffs

Prefer a smaller complete slice over a giant "future-proof" abstraction.

### Tests are part of implementation

A feature is incomplete if its core deterministic behavior is not tested.

### Never fake external integration success

For FDA, USDA, OpenAI, object storage, and queue integrations:

- use fixtures/mocks for deterministic tests;
- clearly distinguish mocked tests from live verification;
- never report a live external call as successful if it was not actually executed.

### Preserve source truth

Codex must not move recall determination into AI prompts for convenience.

### Avoid dependency sprawl

Before adding a package, check whether the platform or an existing dependency already solves the problem adequately.

### No speculative infrastructure

Do not add Kubernetes, service meshes, event buses, vector databases, or multiple deployable services without a measured requirement.

### Migration discipline

Database changes require migrations committed with the change and appropriate migration/fixture tests.

---

## 6. Review Checklist for Every Codex PR

### Scope

- Does the PR implement only the intended milestone/slice?
- Did it silently introduce future features?

### Correctness

- Do tests cover deterministic domain logic?
- Are external API assumptions isolated behind adapters?
- Are error states explicit?

### Recall safety

- Can any AI output directly declare a recall?
- Can a malformed provider response become "no recalls found"?
- Can a weak brand-only match become verified?
- Is authoritative source provenance retained?

### Privacy/security

- Any secrets committed?
- Any public media URL/bucket introduced?
- Any raw image/private OCR data logged?
- Are uploads validated?
- Does new stored data have a retention rationale?

### Operability

- Is the failure observable?
- Is source/job freshness measurable where relevant?
- Are migrations/config changes documented?

### Developer experience

- Does a clean setup still work?
- Are README/env examples current?
- Are commands deterministic?

---

## 7. When to Use a Separate Planning Pass

For complex milestone work, use Codex first in an analysis/planning pass before allowing implementation.

Good candidates:

- recall reconciliation rules;
- video cross-frame merging;
- verification-state changes;
- authentication/account introduction;
- infrastructure migrations;
- large schema refactors.

The planning pass should identify impacted files, risks, tests, migration needs, and a smallest coherent implementation slice.

---

## 8. Model / Tool Selection

Do not hard-code a specific Codex model name into repository policy. Use the current Codex coding model available in the chosen Codex surface unless a milestone has a measured reason to pin something else.

This avoids making repository instructions obsolete as Codex models evolve.

---

## 9. Human Decision Points

Codex may propose, but should not autonomously redefine:

- product safety language;
- recall verification thresholds;
- authoritative source precedence;
- media retention duration;
- public-launch quality gates;
- major vendor/hosting changes;
- new categories/agencies in scope.

Those decisions should be reflected back into the architecture documentation before implementation diverges.

---

## 10. Documentation as Code

When implementation changes a documented architectural fact, the same PR should update the corresponding documentation.

Important documents:

- `docs/V1-ARCHITECTURE.md`
- `docs/MVP-SCOPE.md`
- `docs/MILESTONES.md`
- `docs/SAFETY-AND-CONFIDENCE.md`
- `docs/DATA-SOURCES.md`

Do not allow the docs to become an aspirational architecture that no longer matches the repository.
