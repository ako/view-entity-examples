-- One data grid over Trends.MeterMonthRefVE, whose MeterRef column is an
-- association to Trends.Meter. Two columns of the grid are read over it.
-- Mendix 10.24.24.119653, ConnectionBus_Retrieve at TRACE, first page of 15.

-- 1. The view itself. Note what is NOT here: no join to trends$meter.
--    The association IS the reading's foreign key column, so the view
--    groups on it directly.
SELECT  "Trends.MeterMonthRefVE"."PeriodYear", "Trends.MeterMonthRefVE"."MonthNo", "Trends.MeterMonthRefVE"."TotalKwh", "Trends.MeterMonthRefVE"."MeterRef" FROM ( SELECT  "r"."trends$reading_meter" AS "MeterRef", (EXTRACT(YEAR FROM "r"."readat" AT TIME ZONE 'UTC' AT TIME ZONE 'UTC'))::integer AS "PeriodYear", (EXTRACT(MONTH FROM "r"."readat" AT TIME ZONE 'UTC' AT TIME ZONE 'UTC'))::integer AS "MonthNo", SUM("r"."kwh") AS "TotalKwh" FROM "trends$reading" "r" WHERE NOT "r"."trends$reading_meter" IS NULL GROUP BY "r"."trends$reading_meter", (EXTRACT(YEAR FROM "r"."readat" AT TIME ZONE 'UTC' AT TIME ZONE 'UTC'))::integer, (EXTRACT(MONTH FROM "r"."readat" AT TIME ZONE 'UTC' AT TIME ZONE 'UTC'))::integer ) "Trends.MeterMonthRefVE" WHERE ? != ? AND ? != ? LIMIT ?
-- runtime: Data table Trends.MeterMonthRefVE (15 row(s))

-- 2. A second statement fetches the meters for the rows on screen.
--    Fifteen placeholders for fifteen rows - the same id fifteen times,
--    because the first page is one meter. One row comes back.
SELECT  "trends$meter"."id", "trends$meter"."metercode", "trends$meter"."region" FROM "trends$meter" WHERE "trends$meter"."id" IN (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
-- Select params 1-15: 12103423998558336, 12103423998558336, 12103423998558336, 12103423998558336, 12103423998558336, 12103423998558336, 12103423998558336, 12103423998558336, 12103423998558336, 12103423998558336, 12103423998558336, 12103423998558336, 12103423998558336, 12103423998558336, 12103423998558336
-- runtime: Data table Trends.Meter (1 row(s))
SELECT COUNT(*) FROM ( SELECT  "r"."trends$reading_meter" AS "MeterRef", (EXTRACT(YEAR FROM "r"."readat" AT TIME ZONE 'UTC' AT TIME ZONE 'UTC'))::integer AS "PeriodYear", (EXTRACT(MONTH FROM "r"."readat" AT TIME ZONE 'UTC' AT TIME ZONE 'UTC'))::integer AS "MonthNo", SUM("r"."kwh") AS "TotalKwh" FROM "trends$reading" "r" WHERE NOT "r"."trends$reading_meter" IS NULL GROUP BY "r"."trends$reading_meter", (EXTRACT(YEAR FROM "r"."readat" AT TIME ZONE 'UTC' AT TIME ZONE 'UTC'))::integer, (EXTRACT(MONTH FROM "r"."readat" AT TIME ZONE 'UTC' AT TIME ZONE 'UTC'))::integer ) "Trends.MeterMonthRefVE" WHERE ? != ? AND ? != ?
-- runtime: Data table Trends.MeterMonthRefVE (1 row(s))
-- runtime: ConnectionBus_Retrieve: Data table Trends.MeterMonthRefVE (15 from 216 row(s))


-- ---------------------------------------------------------------------------
-- The alternative: the same reference carried as a string instead.
--
--   select cast(m.ID as string) as MeterId, m.MeterCode as MeterCode, ...
--
-- GET odata/ids/v1/MeterMonthId?$top=3   ->   one statement, no second retrieve
--   { "meterId": "12103423998558978", "periodYear": 2023,
--     "meterCode": "M-006", "totalKwh": 9116.0 }

SELECT  "Trends.MeterMonthIdVE"."MeterId", "Trends.MeterMonthIdVE"."MeterCode", "Trends.MeterMonthIdVE"."PeriodYear", "Trends.MeterMonthIdVE"."TotalKwh" FROM ( SELECT  CAST("m"."id" AS varchar) AS "MeterId", "m"."metercode" AS "MeterCode", (EXTRACT(YEAR FROM "r"."readat" AT TIME ZONE 'UTC' AT TIME ZONE 'UTC'))::integer AS "PeriodYear", SUM("r"."kwh") AS "TotalKwh" FROM "trends$reading" "r" INNER JOIN "trends$meter" "m" ON "m"."id" = "r"."trends$reading_meter" GROUP BY "m"."id", "m"."metercode", (EXTRACT(YEAR FROM "r"."readat" AT TIME ZONE 'UTC' AT TIME ZONE 'UTC'))::integer ) "Trends.MeterMonthIdVE" WHERE (NOT "Trends.MeterMonthIdVE"."MeterId" IS NULL) AND (NOT "Trends.MeterMonthIdVE"."PeriodYear" IS NULL) LIMIT ?
-- cast(id as string) is a plain SQL CAST to varchar. The id is Mendix's own
-- numeric object id, so the string is "12103423998558978" - still enough to
-- retrieve the real Meter later, and it is not an object in the client.
