# MVP Scope

## Product statement

Food Recall Scanner is a mobile-first browser application that helps consumers quickly triage groups of packaged foods and beverages for possible U.S. recall matches using a photo or short video.

The MVP succeeds if it can reduce the number of individual packages a user needs to inspect or barcode-scan while clearly distinguishing **possible matches** from **verified recalled packages**.

---

## Primary user story

> As a consumer, I want to photograph or briefly scan several products at once so the service can identify which items are worth checking against current recall information, instead of forcing me to scan every barcode individually.

---

## MVP happy path

1. User opens the site on a smartphone.
2. User chooses **Take Photo** or **Scan with Short Video**.
3. User captures several visible packaged foods/beverages.
4. App uploads the media and shows processing progress.
5. AI identifies visible products and package text.
6. Recall matcher checks those observations against normalized FDA and USDA FSIS records.
7. App returns the original image/frame with product overlays.
8. Most products show no plausible current recall candidate.
9. Potential matches are highlighted and prioritized.
10. User taps a highlighted product.
11. App explains why it was flagged and links the authoritative recall source.
12. If package-specific verification is needed, user scans barcode or captures the lot/date area.
13. App returns one of:
    - verified match;
    - verified non-match;
    - still insufficient evidence.

---

## MVP screens

### 1. Landing / scan start

Primary actions:

- `Take a Photo`
- `Record Short Video`
- `How It Works`

Required copy:

- scanning does not prove every visible item is safe;
- possible matches must be verified when package identifiers are required.

### 2. Capture guidance

Show short instructions:

- keep package fronts visible;
- avoid glare where practical;
- get reasonably close;
- for video, pan slowly rather than waving the camera;
- multiple angles can improve identification.

### 3. Processing

Show deterministic stages instead of an indefinite spinner where possible:

- uploading;
- finding products;
- checking recalls;
- preparing results.

### 4. Scan results

Display captured image/key frame with overlays.

Suggested visual states:

- neutral: product detected, no plausible recall candidate;
- amber: possible recall candidate / verify;
- red only after strong or verified evidence, with wording appropriate to verification state;
- gray/dashed: product could not be identified confidently.

Also provide a list view for accessibility and small screens.

### 5. Candidate detail

Display:

- observed brand/product;
- identification confidence band;
- authoritative agency;
- recall title/product description;
- recall reason;
- date;
- evidence that caused the match;
- source link;
- verification requirements.

Primary action: `Verify This Item`.

### 6. Verification capture

Support:

- barcode scan;
- barcode manual entry;
- close-up lot/date image;
- manual correction of extracted text.

### 7. Verification result

Possible outcomes:

- **Verified recall match**
- **Package identifiers do not match this recall**
- **Unable to verify from the information provided**

Always keep a direct authoritative source link available.

---

## In-scope product categories

V1 targets common packaged food and beverage products regulated through FDA or USDA FSIS recall systems.

Examples:

- shelf-stable foods;
- refrigerated packaged foods;
- frozen packaged foods;
- canned/bottled beverages;
- snacks;
- packaged meat/poultry products covered by FSIS.

Products without enough visible packaging information may remain unidentified rather than being guessed.

---

## Functional requirements

### Capture

- mobile camera photo capture;
- photo library upload;
- short browser-recorded video;
- file type/size/duration validation;
- image orientation handling;
- upload progress and retry.

### Recognition

- detect multiple packaged products in one image/frame;
- output approximate bounding boxes;
- identify brand when visible;
- identify product/variant when visible;
- extract relevant visible package text;
- extract package size when visible;
- capture UPC/lot/date only when actually visible;
- return structured confidence values.

### Recall ingestion

- periodically ingest FDA food enforcement records;
- periodically ingest USDA FSIS recall/public-health-alert records;
- normalize records without discarding raw source data;
- idempotently update existing records;
- retain source provenance and last-seen timestamps;
- alert operationally when ingestion becomes stale.

### Matching

- broad candidate retrieval;
- deterministic evidence scoring;
- explainable evidence breakdown;
- configurable thresholds;
- never convert match score into a literal probability of physical-package recall.

### Verification

- barcode capture/manual entry;
- lot/date evidence capture;
- package-specific comparison;
- authoritative source link;
- explicit unresolved state when evidence is insufficient.

### Media lifecycle

- private upload;
- processing access only;
- automatic expiry/deletion;
- deletion failure monitoring.

---

## MVP quality targets

Exact production thresholds will be established through the evaluation set, but the product should optimize for **recall-sensitive triage**.

Initial release gates should include:

- recall candidate false-negative testing against known recall/product fixtures;
- no package-specific "verified" result without required matching evidence;
- zero uncaught schema-invalid AI responses in the evaluation suite;
- source freshness visible to operations;
- end-to-end mobile scan tested on current Safari/iOS and Chrome/Android;
- media expiration verified automatically.

A numerical vision-accuracy target should be set only after an initial labeled evaluation set exists. Establishing an arbitrary percentage before measuring the problem would create a misleading success criterion.

---

## MVP analytics

Measure events without retaining unnecessary private media:

- scan started;
- capture method;
- upload success/failure;
- scan processing success/failure;
- product count detected;
- candidate count;
- candidate detail opened;
- verification started;
- verification completed;
- verification outcome;
- scan abandoned stage.

Do not put raw UPCs, lot codes, extracted private text, or user images into general-purpose analytics events.

---

## MVP non-goals

The following are deliberately excluded from the first release:

- native mobile apps;
- user accounts unless needed for abuse prevention;
- persistent pantry inventory;
- recurring recall notifications;
- family accounts;
- retailer receipt/import integrations;
- OCR of every piece of text in a kitchen;
- live continuous augmented-reality recall overlays;
- recalls outside the United States;
- CPSC household-goods recall scanning;
- medical diagnosis or food-safety advice beyond authoritative recall information.

---

## Definition of MVP success

The MVP is successful when a user can place a meaningful group of packaged products in view, complete one photo/video scan, and reliably receive a **small prioritized list of items worth verifying**, with each flag traceable to an authoritative recall source and with package-level claims constrained by available evidence.
