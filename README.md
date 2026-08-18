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

## Project status

**Planning / architecture.** No production application code has been committed yet.
