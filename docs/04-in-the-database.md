# 4. What the database actually runs

Captured from the running 10.24.24 app with `ConnectionBus_Retrieve` at TRACE
(`mxcli log set ConnectionBus_Retrieve=TRACE`), then re-planned in psql. Raw
material in [`sql/`](sql/).

## The view entity becomes a derived table

One `GET` on the published view entity produces one statement. The view's OQL is
inlined as a subquery, and the OData query options become the outer `WHERE`,
`ORDER BY` and `LIMIT`:

```sql
SELECT "v"."ProfileNumber", ... , "v"."ContractTypeKey", "v"."TotalAmount"
FROM ( SELECT "p"."profilenumber"                    AS "ProfileNumber",
              "sl"."submissionyear"                  AS "PeriodYear",
              "sl"."quarterno"                       AS "QuarterNo",
              "c"."contracttype"                     AS "ContractType",
              CAST("c"."contracttype" AS varchar)    AS "ContractTypeKey",
              SUM("sl"."amount")                     AS "TotalAmount",
              COUNT("sl"."id")                       AS "LineCount"
       FROM "submissions$submissionline" "sl"
       INNER JOIN "submissions$contract" "c" ON "c"."id" = "sl"."submissions$submissionline_contract"
       INNER JOIN "submissions$profile"  "p" ON "p"."id" = "c"."submissions$contract_profile"
       GROUP BY "p"."profilenumber", "sl"."submissionyear", "sl"."quarterno", "c"."contracttype" ) "v"
WHERE (NOT "v"."ProfileNumber" IS NULL) AND ... AND "v"."ContractTypeKey" = ?
LIMIT ?
-- params: Freelance, 3000
```

Three things worth reading off it:

- **`cast(... as string)` is a plain SQL `CAST`.** Workaround A costs one
  expression in the select list. No extra join, no extra scan, no stored column.
- **`$filter` is pushed down**, as a bound parameter, not applied in the runtime
  after fetching. `$top=3` becomes `LIMIT 3`; `$orderby=totalAmount desc` becomes
  `ORDER BY ... DESC`. The `LIMIT 3000` on an unpaged call is the service's page
  cap, not a filter.
- **Every key column gets a `NOT ... IS NULL` guard**, because a null key could
  not be addressed. Mendix enforces that in SQL — one more sign that the key is
  a contract the runtime takes seriously.

## PostgreSQL pushes the filter further than Mendix did

Mendix filters the derived table. PostgreSQL then pushes that predicate *through*
the `GROUP BY` down onto the base table scan ([`sql/02-plan-with-filter.txt`](sql/02-plan-with-filter.txt)):

```
Limit                                            (actual rows=4)
  -> GroupAggregate                              (actual rows=4)
       Group Key: p.profilenumber, sl.submissionyear, sl.quarterno
       -> Sort
            -> Hash Join                         (actual rows=4)
                 -> Seq Scan on submissions$profile p       (actual rows=3)
                 -> Hash
                      -> Hash Join               (actual rows=4)
                           -> Seq Scan on submissions$submissionline sl  (actual rows=12)
                           -> Hash
                                -> Seq Scan on submissions$contract c   (actual rows=2)
                                     Filter: ((contracttype)::text = 'Freelance'::text)
                                     Rows Removed by Filter: 4
Execution Time: 0.241 ms
```

The contracts are cut from 6 to 2 **before** the join and before the aggregate,
so only 4 rows are ever grouped. Note also that `contracttype` has dropped out of
the `Group Key`: the planner knows an equality filter pinned it to one value.

Without the filter ([`sql/03-plan-without-filter.txt`](sql/03-plan-without-filter.txt))
the same view aggregates all 12 rows through a `HashAggregate`. That is the
comparison that matters when someone asks whether a view entity "materialises" —
it does not. It is a query, planned per call, with the caller's filter in it.

## And the non-unique key, in the database

The `QuarterSubmissionPerTypeBroken` key lookup — a request that must answer with
exactly one object — runs:

```sql
WHERE "v"."ProfileNumber" = ? AND "v"."PeriodYear" = ? AND "v"."QuarterNo" = ?
LIMIT ?          -- params: 300, 2025, 1, 3000
```

Run it and the database returns **3 rows**. The runtime serialises the first one
and answers `200`. There is no `LIMIT 1`, no error, and nothing at any layer that
notices the key matched more than one row.
