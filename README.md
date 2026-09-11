# View entities, fan-out, and the OData key

A small Mendix app that shows what happens when a view entity fans out and one
part of its natural key is an enumeration — and three ways to publish it as an
OData resource anyway.

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

[`requests/submissions.http`](requests/submissions.http) has the full set.
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
mdl/     the MDL that builds it, in order - 01 domain, 02 view entities,
         03 the published service, 04 demo data, 99 the blocked key
docs/    the write-up, the captured build error, $metadata and responses
requests/ .http files against the running app
```

Every model change is in [`mdl/`](mdl); the app can be rebuilt from an empty
project by running those scripts in order with `mxcli exec`.

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
