# View entity examples

One Mendix app (10.24.24), two worked examples about publishing view entities
over OData. Every error message, payload, SQL statement and query plan in
`docs/` was captured from the running app.

| | |
|---|---|
| **1. The fan-out and the OData key** | A view entity that fans out has a compound key whose last part is an enumeration — which a published OData resource will not accept. What breaks if you route around it, and three workarounds. [docs 1–4](docs) |
| **2. Three groupings without parameters** | A chart that switches between week, month and quarter, built as one unioned view entity with a `Grain` column instead of a parameterised view. The database only executes the branch you filter for. [docs 5](docs/05-union-instead-of-parameters.md) |
| **3. What a view entity is** | The same machinery from zero: one view entity, a data grid on top of it, and what the database is asked as you sort, page and filter. For someone who has never written a query. [docs 6](docs/06-view-entities-101.md) |
| **4. A view entity that points at an entity** | Selecting a persistent entity's id under an alias gives the view entity an association. It works on 10.24 — but mxcli cannot write it, and the difference turns out to be one field. What the association costs at runtime, against carrying the id as a string. [docs 7](docs/07-view-entity-associations.md) |

---

## Example 1 — the fan-out and the OData key

The case: a profile has one submission per quarter (`QuarterSubmissionVE`), and
the same submission broken down per contract type
(`QuarterSubmissionPerTypeVE`). The first publishes fine. The second cannot be
published with `ContractType` in the key:

```
ERROR at Submissions, Published OData service 'BlockedApi', Published entity
'QuarterSubmissionPerTypeVE': Only stored attributes which are of type
(String, Integer, Long or AutoNumber) are supported as a key.
```

## Run it

```bash
cd app
./mxcli run --local --ensure-db -p ViewEntityExamples.mpr
```

Demo data is created at startup: 3 profiles with 1, 2 and 3 contract types,
two quarters each. Then, from another terminal:

```bash
curl 'http://localhost:8080/odata/submissions/v1/QuarterSubmissionPerType(profileNumber=300,periodYear=2025,quarterNo=1,contractTypeKey=%27Freelance%27)'
```

[`requests/submissions.http`](requests/submissions.http) has the full set —
open it in VS Code with the REST Client extension (or any JetBrains IDE, which
has an HTTP client built in) and click *Send Request*, or run the lot from a
terminal:

```bash
npm install -g httpyac
httpyac send requests/submissions.http --all --output short
```

App security is off, so no credentials are needed.

## The four resources

All four are in one service at `odata/submissions/v1/`, over the same data.

| Resource | Key | What it shows |
|---|---|---|
| `QuarterSubmission` | `profileNumber`, `periodYear`, `quarterNo` | the control — no fan-out, publishes without trouble |
| `QuarterSubmissionPerTypeBroken` | the same three | the fan-out with the enumeration dropped from the key: **builds, and is wrong** |
| `QuarterSubmissionPerType` | the same three + `contractTypeKey` | workaround A — a String copy of the enumeration carries the key |
| `QuarterSubmissionPerTypeById` | `id` | workaround C — one composite String id |

## What the demo establishes

1. **The restriction is broader than enumerations.** Only *stored* String,
   Integer, Long and AutoNumber attributes may carry a key, so Decimal,
   DateTime, Boolean and calculated attributes are excluded too.

2. **Dropping the enumeration from the key is not a workaround.** Mendix
   accepts the resource, three rows then share one key, and reading that key
   returns an arbitrary one of them with a `200`. In the demo data, profile 300
   in 2025 Q1 totals 3455.50 across three contract types and the key lookup
   answers `55.50`. Nothing in `$metadata` or the payload says the key is not
   unique. [Details.](docs/03-why-dropping-the-enum-is-not-a-workaround.md)

3. **The value is already a string on the wire.** An enumeration published as
   an ordinary attribute is `Edm.String` in `$metadata`, holds the enumeration
   value name in the payload, and can already be *filtered* with a string
   literal — `$filter=contractType eq 'Freelance'` works today. Workaround A's
   key predicate carries the identical literal. That is the argument for
   lifting the restriction: nothing in the protocol or the runtime is missing,
   and OData v4 permits an enumeration type as a key property.

## Layout

```
app/     the Mendix project
mdl/     the MDL that builds it, in order
         01-04  example 1: domain, view entities, service, demo data
         10-14  example 2: trends domain, unioned view, service, data, startup
         20-21  example 3: the plain view entity and the page that reads it
         30     example 4: the view entity with an association (see FINDINGS 1)
         99     the blocked key, applied on purpose to reproduce the error
docs/    the write-up, the captured build error, $metadata, responses, SQL
requests/ .http files against the running app
tools/   one-off model surgery mxcli cannot do yet
video/   the three explainer films and the pipeline that builds them
```

Every model change is in [`mdl/`](mdl); the app can be rebuilt from an empty
project by running those scripts in order with `mxcli exec`.

## Example 2 — three groupings, one view entity, no parameters

A chart that lets the user pick week, month or quarter is the case people
usually want view-entity parameters for. It does not need them: union the three
groupings and carry a `Grain` column saying which branch a row came from.

```
GET .../UsageTrend?$filter=grain eq 'Month' and meterCode eq 'M-001'
```

The interesting part is what PostgreSQL does with it. Mendix binds the branch
discriminators as parameters (`SELECT ? AS "Grain"`), so the pruning question is
about `$1 = $7`, not about folding string literals — and it prunes either way:

- on a **custom plan**, the unused branches collapse to `One-Time Filter: false`
- on a **generic plan** the comparison is evaluated once per execution instead,
  and every scan underneath reports `never executed`

Measured: 1.9 ms for one grain against 5.3 ms for all three, scanning 1095 rows
instead of 3285. Full write-up, plans and caveats in
[5. One view entity, three groupings](docs/05-union-instead-of-parameters.md);
requests in [`requests/trends.http`](requests/trends.http).

## The explainer films

[`video/`](video) builds a narrated walkthrough of each example:

- **`view-entities-101.mp4`** (5m28s) — what a view entity is, for someone who
  has never written a query: table/row/column, the three OQL clauses, the view
  under a data grid, and what the database is asked as you sort, page and
  filter. Ends on the plans and the three errors you meet first.
- **`view-entity-odata-key.mp4`** (5m40s) — domain model, the OQL and what the
  fan-out term does to it, the build error, the non-unique key, both
  workarounds, then the SQL and the query plan the OData call produces.
- **`view-entity-union-grains.mp4`** (3m55s) — the chart's three states, the unioned
  view, the bound-parameter subtlety, and the two query plans side by side.

Everything on screen comes from the captured artefacts in `docs/`. The pipeline
(narration first, picture timed to it, one deck per film) is documented in
[`video/README.md`](video/README.md).

## What broke on the way

[`FINDINGS.md`](FINDINGS.md) logs what was surprising or broken while building
this — mostly mxcli gaps, each with the version it was seen on and how it was
established. The largest is that a view entity's association to a persistent
entity cannot be written from the command line on either 10.24 or 11.14, and
that the difference turns out to be a single field in the model unit.

## Versions

The app is **Mendix 10.24.24.119653**, and every error message, `$metadata`
document and response captured under `docs/` came out of it.

The same MDL scripts were also replayed onto a **Mendix 11.14.0** project
first, and re-capturing `docs/metadata/` and `docs/responses/` from the
10.24.24 app produced the same documents — git recorded no change to any of
them. The build error is the same sentence too. The restriction is not
something 10.24 is behind on.

Mendix 10 publishes four-part versions on the CDN, so the version string is
`10.24.24.119653`, not `10.24.24`:

```bash
mxcli setup mxbuild --version 10.24.24.119653
mxcli new MyApp --version 10.24.24.119653
```

(`--theme none --layout none` on Mendix 10 — mxcli's generated layout uses
design properties Atlas 10 does not carry.)
