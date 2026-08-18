# Recall Data Sources

## Purpose

The recall database is a first-class product component. Food Recall Scanner must preserve source provenance and must not use AI model memory as the source of truth for recall status, affected products, codes, or consumer instructions.

V1 uses U.S. federal recall sources for packaged food and beverages.

---

## 1. FDA / openFDA Food Enforcement API

### Official endpoint

- Documentation: https://open.fda.gov/apis/food/enforcement/
- API: https://api.fda.gov/food/enforcement.json

### Role in V1

Primary machine-readable historical and current FDA food recall-enforcement dataset.

The openFDA documentation states that the Food Enforcement API is sourced from FDA's Recall Enterprise System (RES), contains publicly releasable records from 2004 to present, and is updated weekly.

Useful fields include:

- `event_id`
- `recall_number`
- `classification`
- `product_description`
- `product_quantity`
- `product_type`
- `reason_for_recall`
- `recalling_firm`
- `recall_initiation_date`
- `report_date`
- `distribution_pattern`
- `code_info`
- `more_code_info`
- `status`
- `termination_date`

### Important limitation

openFDA explicitly warns that the enforcement API should not be used by itself to issue public alerts or to track the lifecycle/status of a recall. It also states that the status exposed there is not updated after publication/classification in the Enforcement Reports.

Therefore:

- do **not** treat openFDA `status` as the sole source for whether a recall remains active;
- do not label an item "currently recalled" solely from this field;
- retain openFDA as authoritative source data while using current FDA recall/enforcement information for lifecycle enrichment where appropriate.

### Ingestion strategy

- Initial backfill: ingest the relevant historical window needed for candidate matching and evaluation. V1 does not need to load every historical recall on day one if doing so slows development.
- Incremental sync: query by recent `report_date` / relevant date window and upsert by stable source identifiers.
- Periodic reconciliation: re-fetch a broader trailing window to capture corrections/expansions.
- Store source payload/hash and retrieval timestamp.

---

## 2. FDA Enforcement Report / Current FDA Recall Information

### Official resources

- Enforcement Reports: https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/enforcement-reports
- Consumer recall page: https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts

FDA states that the Enforcement Report includes recalls monitored by FDA, including classified recalls and certain recalls pending classification. FDA also describes update/history behavior for fields such as classification, reason, code information, and product description.

### Role in V1

Use this source family to supplement openFDA where current lifecycle, expanded product information, or consumer-facing recall information is needed.

The ingestion implementation should prefer an official structured/API representation when available. Avoid brittle HTML scraping unless no suitable official structured source exists for a required field.

### Fields of particular interest

- current lifecycle/status information;
- recall classification;
- code information;
- product-description revisions/expansions;
- press-release URL when present;
- posted-to-internet date;
- termination information.

### Reconciliation rule

Do not silently overwrite contradictory source information.

If two official FDA representations differ:

1. preserve both source snapshots;
2. apply an explicitly documented precedence rule for the display field;
3. store the provenance of the selected normalized value;
4. surface unresolved conflicts to operations if they affect consumer-facing verification.

---

## 3. USDA Food Safety and Inspection Service Recall API

### Official resources

- Documentation: https://www.fsis.usda.gov/science-data/developer-resources/recall-api
- API base: https://www.fsis.usda.gov/fsis/api/recall/v/1

FSIS describes the Recall API as providing recall and public-health-alert data in JSON and supporting attribute-based queries.

### Role in V1

Provide authoritative recall coverage for products under FSIS jurisdiction, particularly meat, poultry, and relevant egg products.

### Why it must be included

Consumers should not have to understand whether a packaged food is regulated by FDA or USDA before scanning it. The service should route products to the appropriate recall data transparently.

### Important matching fields

Where exposed by the source, normalize:

- recall/public-health-alert identifier;
- title/product description;
- establishment/firm;
- establishment number;
- product labels;
- affected sizes/variants;
- production/date codes;
- reason;
- distribution information;
- recall date;
- source page/attachments.

USDA establishment numbers can be extremely strong verification evidence and should be modeled as first-class identifiers.

---

## 4. Normalized Source Model

All adapters should map into a common domain while retaining raw source-specific fields.

```ts
interface RecallEventSource {
  agency: "FDA" | "USDA_FSIS";
  sourceEventId: string;
  sourceRecallNumber?: string;
  sourceUrl: string;
  sourceRetrievedAt: Date;
  sourceLastModifiedAt?: Date;
  rawPayloadHash: string;
  rawPayload: unknown;
}

interface NormalizedRecallEvent {
  id: string;
  agency: "FDA" | "USDA_FSIS";
  sourceEventId: string;
  sourceStatus?: string;
  normalizedLifecycle?: RecallLifecycle;
  classification?: string;
  recallingFirm?: string;
  reason: string;
  initiationDate?: Date;
  reportDate?: Date;
  terminationDate?: Date;
  distributionText?: string;
}
```

A recall event may contain multiple affected product records.

---

## 5. Product Normalization

Government recall descriptions are often prose rather than clean catalog records. The normalizer should extract searchable fields while preserving the original text.

Possible normalized fields:

```text
brand_names[]
product_names[]
variants[]
package_sizes[]
upcs[]
gtins[]
lot_codes[]
date_code_text[]
establishment_numbers[]
raw_product_description
raw_code_information
normalized_search_text
```

### Rule

Normalization is allowed to make source text easier to search, but it must not manufacture identifiers that are not present in the source.

If an AI model is ever used to assist recall-record normalization, its extracted values must retain the exact source text span/evidence and be treated as derived metadata rather than as replacement source truth.

---

## 6. Freshness and Scheduling

Suggested V1 cadence:

### FDA/openFDA

- automated sync at least daily even though the documented openFDA dataset update cadence is weekly;
- trailing-window reconciliation to detect changes when new weekly data arrives;
- separate freshness tracking from job execution frequency.

### FDA current recall/enforcement source

- check more frequently than the openFDA bulk source where practical because public recall notices may appear before classification/enforcement publication;
- use official structured data/API where available.

### USDA FSIS

- check on a frequent scheduled basis suitable for a consumer safety service;
- store source retrieval timestamps and source item identifiers.

The application should not claim "real-time" recall coverage unless the end-to-end ingestion and monitoring system actually supports that claim.

---

## 7. Idempotency

Every ingestion job must be safely repeatable.

Use a stable key derived from agency/source IDs, and use content hashes/version records to determine whether normalized data changed.

```text
source fetch
    -> canonicalize raw record
    -> calculate source hash
    -> no change? record last-seen timestamp
    -> changed/new? version + normalize + reindex
```

This protects the system from duplicate recalls and provides an audit trail when official source data changes.

---

## 8. Operational Monitoring

At minimum monitor:

- last successful source fetch;
- last source item timestamp observed;
- records fetched;
- new records;
- changed records;
- parse failures;
- normalization failures;
- current ingestion lag;
- consecutive source failures.

A successful HTTP response with zero unexpected records should not automatically count as healthy. Basic anomaly detection should flag unexpectedly empty or drastically changed source responses.

---

## 9. Source Priority vs. Matching Priority

Source authority and product-match strength are separate concepts.

Both FDA and USDA FSIS records are authoritative within their jurisdictions. A candidate should rank according to identifier/product evidence, not because one agency is assigned a higher generic score than the other.

---

## 10. Future Sources

Not part of the V1 build, but the normalized model should allow future adapters for:

- CPSC household-product recalls;
- pet-food specific workflows where additional sources are useful;
- Health Canada or other countries;
- retailer/manufacturer recall feeds;
- GS1/catalog data to improve product identity resolution.

These should not be added until V1 FDA/FSIS ingestion and matching quality are demonstrated.
