# Safety and Confidence Model

## Purpose

Food Recall Scanner is a consumer safety triage tool. The product must therefore be designed around uncertainty, provenance, and verification rather than around producing confident-looking AI answers.

The central safety rule is:

> **The vision model observes products. Authoritative government data defines recalls. Application code determines match evidence. Package-specific identifiers determine verification where required.**

---

## 1. Claims the Product May Make

### Observation claim

Example:

> "This appears to be Brand X Product Y."

This is probabilistic and must be represented as an identification confidence band.

### Recall-record claim

Example:

> "FDA has a recall record that includes Brand X Product Y."

This claim must come from an ingested authoritative source record and retain provenance.

### Candidate claim

Example:

> "This item may match that recall. Verify the package."

This comes from deterministic matching between a product observation and a recall product record.

### Verified package claim

Example:

> "The identifiers you provided match the affected product information in this recall."

This requires sufficient package-specific evidence. The required evidence varies by recall.

---

## 2. Claims the Product Must Not Make

Do not show:

- "87% chance your food is recalled";
- "this item is safe" merely because no candidate was found;
- "no recalls exist" if data freshness is degraded;
- fabricated lot numbers, UPCs, dates, brands, or source URLs;
- a package-level confirmation based only on visual similarity;
- a model-generated recall summary that is not traceable to the source record.

A negative scan means:

> **No plausible recall match was found from the products and information the system could identify in this scan.**

It does not mean every item was identified or that every item is safe.

---

## 3. Three Independent Confidence Dimensions

### A. Identification confidence

How confident are we that the observed package has been identified correctly?

Inputs may include:

- visible brand text;
- product title;
- logo/packaging appearance;
- visible size;
- visible variant/flavor;
- agreement across multiple video frames.

UI bands:

- **High identification confidence**
- **Moderate identification confidence**
- **Low / uncertain identification**

Do not imply mathematical calibration until evaluation demonstrates calibration.

### B. Recall match strength

How strongly does the observed product overlap an authoritative recall product description?

This score is calculated by application code using evidence weights.

UI bands:

- **No plausible match found**
- **Possible match — review recommended**
- **Strong product match — package verification needed**

### C. Verification state

This is categorical rather than probabilistic:

- `NOT_ATTEMPTED`
- `NEEDS_MORE_EVIDENCE`
- `IDENTIFIERS_DO_NOT_MATCH`
- `IDENTIFIERS_MATCH`
- `SOURCE_RECORD_NOT_SPECIFIC_ENOUGH`

---

## 4. Evidence Hierarchy

Evidence should be ranked by specificity.

### Highest specificity

- exact UPC/GTIN explicitly included in source information;
- exact lot/batch code;
- exact date-code range;
- USDA establishment number where applicable;
- another explicit package identifier defined by the recall.

### Strong descriptive evidence

- exact brand;
- exact product title;
- exact variety/flavor;
- exact package size;
- manufacturer/recalling-firm agreement.

### Weak descriptive evidence

- brand only;
- broad product type only;
- visually similar packaging;
- category-level association.

Weak evidence may retrieve a candidate for review but may not confirm a package.

---

## 5. Candidate Scoring

Candidate scoring should be transparent and configurable.

Example initial configuration (illustrative, not calibrated probability):

```text
exact UPC match                  +100
explicit lot/date match          +100
USDA establishment match         +90
exact normalized brand           +30
exact/near product name          +35
variant/flavor match             +15
package size match               +15
recalling firm match             +10
brand contradiction              -60
product contradiction            -50
size contradiction               -20
explicit UPC contradiction       -> exclude candidate
explicit lot/date contradiction  -> exclude candidate when source defines bounds
```

Thresholds should be tuned from evaluation results, not intuition.

Store the individual evidence terms that produced each score.

---

## 6. AI Output Safety

The AI provider must return data conforming to a strict application schema.

### Required behavior

- use `null`/missing values when text is not visible;
- distinguish observed text from inferred normalized product identity;
- return bounding boxes in normalized coordinates;
- expose per-field confidence;
- never make recall determinations;
- never invent source information;
- never fill a barcode/lot/date from product knowledge when it is not visible.

### Validation

Every provider response is validated server-side.

If validation fails:

1. do not pass partially malformed data into recall matching;
2. optionally perform one bounded retry with a repair/schema instruction;
3. otherwise mark the observation job safely unresolved.

Provider failures must never become a false "no recalls found" result.

---

## 7. Data-Freshness Safety

Recall results are only as reliable as source freshness.

Track for each source:

- last successful fetch;
- source's own update timestamp where available;
- last normalization completion;
- number of records added/changed;
- ingestion error state.

If a critical source becomes stale beyond an operational threshold:

- surface an operations alert;
- consider degrading/pausing consumer scan conclusions;
- avoid displaying absolute negative language.

---

## 8. Source Provenance

Every recall candidate shown to a user must be traceable to:

- agency;
- source event/recall identifier;
- source URL;
- source product description;
- source retrieval timestamp;
- normalized record version/hash.

The UI may simplify the language, but the underlying evidence must remain available for diagnostics and dispute resolution.

---

## 9. Failure Modes and Safe Behavior

| Failure | Safe user behavior |
|---|---|
| Image too blurry | Ask for another image; do not infer products |
| Product partially hidden | Mark uncertain; suggest targeted close-up |
| AI provider unavailable | Report scan-processing failure; do not return fake negative result |
| Recall source ingestion stale | Warn/degrade service; avoid absolute negative result |
| Brand recognized, product unknown | Candidate retrieval may use brand, but flag weak evidence |
| Product matches recall description but no lot visible | Prompt verification |
| UPC explicitly conflicts with recall | Exclude that product/recall candidate if source data supports comparison |
| Recall source has no package identifiers | State that the source record cannot support package-level automated verification |
| Multiple recalled variants plausible | Present the relevant candidates and request evidence |

---

## 10. Evaluation Requirements

Safety evaluation must include both false negatives and false positives.

### Recall-sensitive cases

- obvious recalled product in clear image;
- affected product with old/new packaging;
- correct brand but wrong variant;
- correct product but unaffected size;
- affected lot vs unaffected lot;
- product appearing in multiple video frames;
- partially occluded brand/product text.

### Negative-control cases

- brand with historical unrelated recall;
- visually similar competitor package;
- product category with many recalls but no brand/product overlap;
- unrecalled variant of recalled brand;
- generic/private-label packaging.

### Critical test invariant

A model/provider update must not be promoted solely because average recognition accuracy improves. It must also be evaluated on recall-candidate false negatives and unsafe overconfidence.

---

## 11. User Copy Principles

Prefer:

- "Possible recall match"
- "Verify this package"
- "We could not identify this item confidently"
- "No plausible match found for the products we could identify"
- "The package information you provided matches the identifiers listed in the recall"

Avoid:

- "Safe"
- "Guaranteed"
- "Definitely not recalled"
- "AI verified"
- an unexplained percentage next to a recall warning.

---

## 12. Product Boundary

Food Recall Scanner should provide official recall information and evidence-driven matching. It should not independently advise users that food is medically safe to consume.

When a verified/strong recall match is presented, the service should display the authoritative agency's instructions or link the user directly to them rather than inventing disposal, treatment, or medical guidance.
