# Food Recall Scanner — Codex Instructions

These instructions apply to the entire repository unless a more specific nested `AGENTS.md` is added later.

## Read first

Before implementation work, read:

- `README.md`
- `docs/V1-ARCHITECTURE.md`
- `docs/MVP-SCOPE.md`
- `docs/MILESTONES.md`
- `docs/SAFETY-AND-CONFIDENCE.md`
- `docs/DATA-SOURCES.md`
- `docs/CODEX-WORKFLOW.md`

## Core product boundary

Food Recall Scanner is a recall-triage product, not an AI recall authority.

- Vision AI observes products/package text.
- Government source records define recalls.
- Application code retrieves and scores recall candidates.
- Package identifiers determine verification when required.
- Never allow model memory or free-form AI prose to become recall source truth.

## Development rules

- Implement only the requested milestone/slice.
- Prefer small, reviewable diffs over speculative abstractions.
- Keep deterministic recall matching and verification logic outside AI prompts.
- Preserve strict TypeScript.
- Validate external/provider data at boundaries.
- Add tests for new deterministic behavior.
- Use source fixtures/mocks for stable tests; distinguish them from live integration checks.
- Never claim a command/test/external check succeeded unless it actually ran successfully.
- Do not discard or overwrite unrelated working-tree changes.
- Do not commit secrets, API keys, credentials, private user media, or real private scan data.
- Avoid unnecessary dependencies and infrastructure.

## Safety invariants

A change is unacceptable if it permits any of the following:

- a vision-model response directly declaring a physical package recalled;
- a malformed/failed AI request silently becoming a successful "no recalls found" result;
- a weak brand-only similarity becoming `VERIFIED_MATCH`;
- fabricated UPC, lot, date, establishment number, recall status, or source URL;
- a negative scan being described as proof that all visible products are safe;
- loss of authoritative recall-source provenance;
- raw user images or sensitive extracted text being written to normal application logs.

## Architecture constraints for V1

Use the modular-monolith-plus-worker architecture in `docs/V1-ARCHITECTURE.md`.

Do not introduce, without an explicit architecture decision:

- Kubernetes;
- service mesh;
- Kafka/event bus;
- vector database;
- native mobile apps;
- additional deployable microservices;
- custom-trained vision models;
- user accounts/persistent pantry features;
- additional recall agencies beyond the current milestone scope.

## Required completion report

At the end of a coding task report:

1. files changed;
2. key implementation choices;
3. tests/checks run and exact results;
4. migrations/environment changes;
5. known limitations or unresolved issues;
6. manual acceptance steps where applicable.

If architecture or documented behavior changes, update the relevant docs in the same change.
