-- Typing M-004 into the Meter column's text filter on Trends.MeterMonths.
-- Captured with ConnectionBus_Retrieve at TRACE, Mendix 10.24.24.119653.
-- The filter is a Data Grid 2 text filter, Contains, in the column itself.

SELECT  "Trends.MeterMonthVE"."MeterCode", "Trends.MeterMonthVE"."Region", "Trends.MeterMonthVE"."PeriodYear", "Trends.MeterMonthVE"."MonthNo", "Trends.MeterMonthVE"."TotalKwh", "Trends.MeterMonthVE"."ReadingCount" FROM ( SELECT  "m"."metercode" AS "MeterCode", "m"."region" AS "Region", (EXTRACT(YEAR FROM "r"."readat" AT TIME ZONE 'UTC' AT TIME ZONE 'UTC'))::integer AS "PeriodYear", (EXTRACT(MONTH FROM "r"."readat" AT TIME ZONE 'UTC' AT TIME ZONE 'UTC'))::integer AS "MonthNo", SUM("r"."kwh") AS "TotalKwh", COUNT("r"."id") AS "ReadingCount" FROM "trends$reading" "r" INNER JOIN "trends$meter" "m" ON "m"."id" = "r"."trends$reading_meter" GROUP BY "m"."metercode", "m"."region", (EXTRACT(YEAR FROM "r"."readat" AT TIME ZONE 'UTC' AT TIME ZONE 'UTC'))::integer, (EXTRACT(MONTH FROM "r"."readat" AT TIME ZONE 'UTC' AT TIME ZONE 'UTC'))::integer ) "Trends.MeterMonthVE" WHERE ? != ? AND "Trends.MeterMonthVE"."MeterCode" ILIKE ? ESCAPE '\' AND ? != ? LIMIT ?
-- Select params 1-6: [6,[0]], #, %M-004%, [1,[]], #, 15
-- Select params 1-5: [6,[0]], #, %M-004%, [1,[]], #
-- runtime: Data table Trends.MeterMonthVE (15 from 36 row(s))
