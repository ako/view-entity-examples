# 5. One view entity, three groupings — without parameters

A chart lets the user switch between **week**, **month** and **quarter**. The
reflex is to ask for a parameterised view entity: pass the grouping in, get the
right rows back.

You do not need one. Union the three groupings into a single view entity and
carry a column that says which branch a row came from. The consumer filters on
that column — and the database only executes the branch it asked for.

This example lives in the `Trends` module: 6 meters × 1095 daily readings =
**6570 rows**, published at `odata/trends/v1/UsageTrend`.

## The view

```sql
create or modify view entity Trends.UsageTrendVE (
  Grain: String(200), MeterCode: String(200), PeriodYear: Integer,
  PeriodNo: Integer, Label: String(200), TotalKwh: Decimal, ReadingCount: Integer
) as (
  select 'Week'  as Grain, ..., datepart(WEEK,  r.ReadAt) as PeriodNo, ...
  group by m.MeterCode, datepart(YEAR, r.ReadAt), datepart(WEEK, r.ReadAt)
  union all
  select 'Month' as Grain, ..., datepart(MONTH, r.ReadAt) as PeriodNo, ...
  group by m.MeterCode, datepart(YEAR, r.ReadAt), datepart(MONTH, r.ReadAt)
  union all
  select 'Quarter' as Grain, ..., datepart(QUARTER, r.ReadAt) as PeriodNo, ...
  group by m.MeterCode, datepart(YEAR, r.ReadAt), datepart(QUARTER, r.ReadAt)
);
```

Full text in [`mdl/11-trends-view.mdl`](../mdl/11-trends-view.mdl). `Grain` is a
String rather than an Enumeration for the reason
[example 1](01-the-constraint.md) is about: an enumeration cannot be part of a
published OData key, and `Grain` has to be in the key here.

The chart then asks for what it wants:

```
GET .../UsageTrend?$filter=grain eq 'Month' and meterCode eq 'M-001'
                  &$orderby=periodYear,periodNo
```

For meter M-001 over three years the view holds 156 week rows, 36 month rows and
12 quarter rows — 204 in total. Each call returns one of those three sets.

## What the database does with it

One `GET` still produces one statement. The three branches arrive as a
`UNION ALL` subquery and the `$filter` becomes the outer `WHERE`
([`sql/04-union-pushdown.sql`](sql/04-union-pushdown.sql)):

```sql
FROM ( (SELECT ? AS "Grain", ... GROUP BY ..., EXTRACT(WEEK ...))
       UNION ALL
       (SELECT ? AS "Grain", ... GROUP BY ..., EXTRACT(MONTH ...))
       UNION ALL
       (SELECT ? AS "Grain", ... GROUP BY ..., EXTRACT(QUARTER ...)) ) "v"
WHERE ... AND "v"."Grain" = ? AND "v"."MeterCode" = ?
ORDER BY "v"."PeriodYear" ASC, "v"."PeriodNo" ASC
LIMIT ?
-- params: Week, -W, Month, -M, Quarter, -Q, Month, M-001, 3000
```

Note the first thing that is easy to get wrong when reasoning about this:
**Mendix binds the branch discriminators too.** `'Week'`, `'Month'` and
`'Quarter'` are not constants in the SQL — they are parameters 1, 3 and 5, and
the filter value is parameter 7. So the question is not "will the planner fold
`'Week' = 'Month'`", it is "what does it do with `$1 = $7`".

### It prunes. Both ways.

**Custom plan** — the planner has the parameter values, folds the comparison and
removes the branch before execution
([`sql/05-plan-grain-filtered.txt`](sql/05-plan-grain-filtered.txt)):

```
Limit (actual rows=36)
  ->  Merge Append (actual rows=36)
        ->  GroupAggregate (actual rows=0)          <- Week
              ->  Result (actual rows=0)
                    One-Time Filter: false
        ->  GroupAggregate (actual rows=36)         <- Month: the only branch that runs
              ->  Sort (actual rows=1095)
                    ->  Nested Loop (actual rows=1095)
                          ->  Bitmap Index Scan on idx_trends$meter_metercode_asc
                          ->  Bitmap Heap Scan on trends$reading (actual rows=1095)
        ->  GroupAggregate (actual rows=0)          <- Quarter
              ->  Result (actual rows=0)
                    One-Time Filter: false
Execution Time: 2.101 ms
```

**Generic plan** — force it with `plan_cache_mode = force_generic_plan` and the
parameters stay symbolic, so the comparison cannot be folded at plan time. It is
evaluated **once per execution** instead, and the branch below it is still never
touched ([`sql/06-plan-generic.txt`](sql/06-plan-generic.txt)):

```
->  Result (actual rows=0)
      One-Time Filter: (($1 IS NOT NULL) AND (($1)::text = ($7)::text))
      ->  Nested Loop (never executed)
            ->  Bitmap Heap Scan on "trends$meter" m (never executed)
            ->  Bitmap Heap Scan on "trends$reading" r (never executed)
```

`never executed` is the whole answer. Whichever plan type the server picks, the
grains you did not ask for cost nothing but a few planner nodes.

### The comparison

Same statement with the grain predicate removed — what you would run if the
chart fetched the whole view and filtered client-side
([`sql/07-plan-no-grain-filter.txt`](sql/07-plan-no-grain-filter.txt)):

| | rows returned | readings scanned | execution time (5 runs, warm) |
|---|---|---|---|
| `$filter=grain eq 'Month'` | 36 | 1095, one branch | **1.88 / 1.88 / 1.96 / 1.96 / 2.85 ms** |
| no grain filter | 204 | 1095 × 3 branches | **5.24 / 5.33 / 5.33 / 5.41 / 5.43 ms** |

Roughly 2.7× here, on one meter and three branches. The ratio is set by how many
branches you union, so it grows with the number of grains, not with the data.

## Why this beats a parameter

- **No parameter to plumb.** The resource is one entity set; the grouping is a
  `$filter` term like any other. Any OData client, Data Hub consumer or chart
  widget can drive it without knowing the view is a union.
- **One statement text, reused.** Every call sends the same SQL with different
  bind values, so the server's plan cache and the driver's prepared statement
  both hit. A parameterised view that changes shape per call cannot do that.
- **The grains stay comparable.** Because they are rows in one result set, a
  consumer can ask for two at once (`grain in ('Month','Quarter')`) or count
  across them. A parameter gives you exactly one grouping per call.
- **It composes with everything else.** `$orderby`, `$top` and any other filter
  push down in the same statement, as in
  [4. What the database actually runs](04-in-the-database.md).

## Where it stops being the right answer

- **The branches must differ only in grouping, not in shape.** Every branch has
  to produce the same columns and types. That is the real constraint, not
  performance.
- **The discriminator has to be a constant per branch.** That constant is what
  the `One-Time Filter` collapses. A grain computed from a joined column would
  not prune.
- **Check your own plan.** This is measured on PostgreSQL 16. The mechanism
  (qual pushdown into set-operation branches) is standard, but the exact plan
  shape is the planner's business — run `EXPLAIN ANALYZE` before promising
  anybody a number.
- **If a consumer forgets the filter, it gets everything.** Every grain, in one
  response. Consider whether the resource should carry a default constraint.
