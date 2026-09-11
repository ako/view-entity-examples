# 2. Workarounds

All of these keep the enumeration in the payload. None of them ask the consumer
to understand anything new — the difference is only which attribute carries the
`key` flag.

| | Key | Cost |
|---|---|---|
| **A. String shadow** | `profileNumber`, `periodYear`, `quarterNo`, `contractTypeKey` | one extra attribute on the view entity |
| **B. Reference entity** | `profileNumber`, `periodYear`, `quarterNo`, `contractTypeCode` | the enumeration becomes an entity — a domain-model change |
| **C. Composite id** | `id` | key parts are no longer addressable individually |

A is implemented as `QuarterSubmissionPerTypeApiVE`, C as
`QuarterSubmissionPerTypeIdVE`, both in
[`mdl/02-view-entities.mdl`](../mdl/02-view-entities.mdl). B is described below
but not built, because it changes the domain model rather than the view.

## A. String shadow of the enumeration — the one to reach for

`cast(<enum> as string)` in the view entity's OQL yields the enumeration
**value name** (`Permanent`, not the caption) as a `String(200)`. Select it
alongside the enumeration itself:

```sql
select p.ProfileNumber                as ProfileNumber
,      sl.SubmissionYear              as PeriodYear
,      sl.QuarterNo                   as QuarterNo
,      c.ContractType                 as ContractType       -- stays an enumeration
,      cast(c.ContractType as string) as ContractTypeKey    -- the key
,      sum(sl.Amount)                 as TotalAmount
from   ...
group by p.ProfileNumber, sl.SubmissionYear, sl.QuarterNo, c.ContractType
```

Grouping stays on the enumeration; the cast is an expression over a grouped
column, so no extra grouping is needed.

Publish `ContractTypeKey` as part of the key and `ContractType` as an ordinary
attribute:

```
GET /odata/submissions/v1/QuarterSubmissionPerType(profileNumber=300,periodYear=2025,quarterNo=1,contractTypeKey='Freelance')

{ "profileNumber": 300, "periodYear": 2025, "quarterNo": 1,
  "contractTypeKey": "Freelance", "contractType": "Freelance",
  "totalAmount": 55.50000000, "lineCount": 1 }
```

Both properties are `Edm.String` in `$metadata` and always hold the same value.
The duplication is the whole cost, and it is visible to consumers — which is
the honest argument for lifting the restriction: the workaround is a
copy of a value Mendix already serialises as a string.

If you would rather not show the duplicate, drop `ContractType` from the
published resource and expose only `ContractTypeKey`, renamed to
`contractType`. The consumer then sees exactly the API you wanted in the first
place. The demo keeps both so the two can be compared in one response.

## B. Make the enumeration a reference entity

If the fan-out dimension is reference data that changes — contract types,
categories, statuses that the business adds to — an entity is the better
model anyway, and the key problem disappears: key on its `Code` (a String).

The trade-off is real and not always worth it: validation moves from the
modeller to the data, microflows lose `CASE` over the enumeration, and every
query gains a join. Reach for this when the enumeration was already straining,
not to satisfy the OData key rule.

## C. One composite String id

Build the whole key into a single String in the OQL:

```sql
select cast(p.ProfileNumber as string) + '-'
       + cast(sl.SubmissionYear as string) + 'Q'
       + cast(sl.QuarterNo as string) + '-'
       + cast(c.ContractType as string)   as RowId
,      ...
```

```
GET /odata/submissions/v1/QuarterSubmissionPerTypeById('300-2025Q1-Temporary')
```

Worth it when the consumer wants one opaque identifier per row — a Data Hub
consumer, a client that stores row references, an ETL job keyed on a single
column. The parts stay published as ordinary filterable attributes, so
`$filter=profileNumber eq 300` still works; what you lose is the ability to
address a row by its parts, and the id format becomes a contract you have to
keep stable.

## What does not work

- **Dropping the enumeration from the key.** It builds, and it is wrong. See
  [3. Why dropping the enum is not a workaround](03-why-dropping-the-enum-is-not-a-workaround.md).
- **An Integer ordinal instead of the name** (`case when ... then 1 ... end`).
  Valid OQL and a valid key, but the consumer now has to carry a mapping table
  that the enumeration already encodes, and adding an enumeration value in the
  middle renumbers rows. If you need a numeric key, prefer C.
