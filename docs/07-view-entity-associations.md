# 7. A view entity that points at a persistent entity

Selecting a persistent entity's **id** under an alias gives a view entity an
**association** to that entity. The alias becomes the association's name, and
the id column is *not* one of the view entity's attributes:

```sql
create or modify view entity ViewAssociations.OrdersVE (
  order_date: DateTime            -- one attribute
) as (
  from Mappings."Order" as o
  select
    o.ID       as persistent_order -- ...but two columns
  , o.OrderDate as order_date
);
```

```
| ViewAssociations.persistent_order | OrdersVE -> Mappings.Order | Reference | Default | Column |
```

That example is `ako/TestApp`, built in Studio Pro 11.14. Everything below is
what happened trying to reproduce it from the command line.

## mxcli cannot write one, on either version

Measured on **10.24.24.119653** and **11.14.0**, mxcli nightly-20260909.
Transcript in [`view-entity-association-attempt.txt`](view-entity-association-attempt.txt).

| step | what happens |
|---|---|
| `mxcli check` | mis-aligns the columns: with the id first, `attribute 'TotalKwh': declared as Decimal but OQL expression returns Integer`; with it last, `OQL select has 4 columns but 3 attributes declared`. It does not skip the id column. |
| `mxcli exec --no-check` | writes the view entity. No association member is created. |
| build | 11.14: `The selected association 'ViewAssociations.a_product' no longer exists.` 10.24: `View Entity is out of sync with the OQL Query.` |
| add it with `create association` | writes, and the build then says `It is not possible to create associations to/from View Entities.` |

So the OQL is not the problem, and neither is the Mendix version. **10.24
supports this fully.**

## The difference is one field

Both associations are a `DomainModels$CrossAssociation` with the same Name,
Child, Type, Owner, StorageFormat and DeleteBehavior. They differ in `Source`:

```jsonc
// Studio Pro
"Source": {
  "$Type": "DomainModels$OqlViewAssociationSource",
  "Reference": "persistent_order"        // the alias in the OQL
}

// mxcli's `create association`
"Source": null
```

[`tools/add-oql-view-association.py`](../tools/add-oql-view-association.py)
adds exactly that subdocument to a model unit, resizing the enclosing BSON
documents and nothing else. With it:

```
$ mxcli exec mdl/30-view-entity-association.mdl -p ViewEntityExamples.mpr --no-check
Created view entity: Trends.MeterMonthRefVE
Created association: Trends.MeterRef

$ python3 tools/add-oql-view-association.py \
      app/mprcontents/9b/40/9b40...686.mxunit MeterRef
MeterRef: added OqlViewAssociationSource, +104 bytes, 3 enclosing documents resized

$ mxbuild --target=deploy ViewEntityExamples.mpr      # 10.24.24.119653
BUILD SUCCEEDED
```

Same recipe, same result on TestApp under 11.14. mxbuild does not re-check the
`ContentsHash` the `.mpr` holds for the unit, so nothing else needs touching —
but the patch is lost the moment mxcli rewrites that domain model unit, which
is why it is a tool in this repo and not a committed model change.

One name rule, found the hard way: the alias may not collide with an entity
name in the same module, case-insensitively. `as meter` next to `Trends.Meter`
gives *"Duplicate name 'Meter' in module 'Trends'. Entities, associations and
enumerations cannot share names."*

## What it costs at runtime

A data grid over `Trends.MeterMonthRefVE` with two columns read over the
association — `MeterRef/MeterCode` and `MeterRef/Region`:

![a grid reading over a view entity's association](shots/meter-ref-grid.png)

It works, on 10.24. And it costs a second statement
([`sql/11-association-retrieve.sql`](sql/11-association-retrieve.sql)):

```sql
-- 1. the view. Note what is NOT here: no join to trends$meter.
SELECT ..., "Trends.MeterMonthRefVE"."MeterRef"
FROM ( SELECT "r"."trends$reading_meter" AS "MeterRef", ...
       FROM "trends$reading" "r"
       WHERE NOT "r"."trends$reading_meter" IS NULL
       GROUP BY "r"."trends$reading_meter", ... ) "Trends.MeterMonthRefVE"

-- 2. and then the meters, for the rows on screen
SELECT "trends$meter"."id", "metercode", "region" FROM "trends$meter"
WHERE "trends$meter"."id" IN (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
-- Select params 1-15: 12103423998558336, 12103423998558336, ... (the same id, 15 times)
-- runtime: Data table Trends.Meter (1 row(s))
```

Three things to read off that:

- **The association is the foreign key.** `m.ID` compiled to
  `r."trends$reading_meter"`, the column already on the reading, so the view
  does not join `trends$meter` at all. The version with `m.MeterCode` in the
  select list ([`sql/08`](sql/08-grid-retrieve.sql)) does join it.
- **It is a second round trip, batched per page.** Not one query per row: the
  runtime collects the page's references into one `IN (...)`. But the list is
  not deduplicated — fifteen rows of the same meter passed the same id fifteen
  times to fetch one row.
- **It materialises objects.** Those are real `Trends.Meter` objects in the
  client's state, with the lifetime and the garbage-collection behaviour of
  objects; the view entity's own rows are not.

Which is the case for the alternative: select a **string copy** of the id, or
of a natural key, as a plain attribute —

```sql
select cast(m.ID as string) as MeterId, m.MeterCode as MeterCode, ...
```

— one statement, one join, no second retrieve, no objects in the client, and
the id is still there to look the real object up with when something actually
needs it. Measured on the same app
([`sql/11`](sql/11-association-retrieve.sql), second half): the cast compiles
to `CAST("m"."id" AS varchar)`, and the value that comes out is Mendix's own
object id as text:

```json
{ "meterId": "12103423998558978", "periodYear": 2023,
  "meterCode": "M-006", "totalKwh": 9116.0 }
```
