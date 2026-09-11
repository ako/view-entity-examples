SELECT  "v"."Grain", "v"."MeterCode", "v"."PeriodYear", "v"."PeriodNo", "v"."Label", "v"."TotalKwh", "v"."ReadingCount" 
FROM (  ((SELECT  ? AS "Grain", "m"."metercode" AS "MeterCode", (EXTRACT(YEAR
FROM "r"."readat" AT TIME ZONE 'UTC' AT TIME ZONE 'UTC'))::integer AS "PeriodYear", (EXTRACT(WEEK
FROM "r"."readat" AT TIME ZONE 'UTC' AT TIME ZONE 'UTC'))::integer AS "PeriodNo", CONCAT(CONCAT(CAST((EXTRACT(YEAR
FROM "r"."readat" AT TIME ZONE 'UTC' AT TIME ZONE 'UTC'))::integer AS varchar), ?), CAST((EXTRACT(WEEK
FROM "r"."readat" AT TIME ZONE 'UTC' AT TIME ZONE 'UTC'))::integer AS varchar)) AS "Label", SUM("r"."kwh") AS "TotalKwh", COUNT("r"."id") AS "ReadingCount"
FROM "trends$reading" "r"
INNER JOIN "trends$meter" "m" ON "m"."id" = "r"."trends$reading_meter"
GROUP BY "m"."metercode", (EXTRACT(YEAR
FROM "r"."readat" AT TIME ZONE 'UTC' AT TIME ZONE 'UTC'))::integer, (EXTRACT(WEEK
FROM "r"."readat" AT TIME ZONE 'UTC' AT TIME ZONE 'UTC'))::integer))
UNION ALL ((SELECT  ? AS "Grain", "m"."metercode" AS "MeterCode", (EXTRACT(YEAR
FROM "r"."readat" AT TIME ZONE 'UTC' AT TIME ZONE 'UTC'))::integer AS "PeriodYear", (EXTRACT(MONTH
FROM "r"."readat" AT TIME ZONE 'UTC' AT TIME ZONE 'UTC'))::integer AS "PeriodNo", CONCAT(CONCAT(CAST((EXTRACT(YEAR
FROM "r"."readat" AT TIME ZONE 'UTC' AT TIME ZONE 'UTC'))::integer AS varchar), ?), CAST((EXTRACT(MONTH
FROM "r"."readat" AT TIME ZONE 'UTC' AT TIME ZONE 'UTC'))::integer AS varchar)) AS "Label", SUM("r"."kwh") AS "TotalKwh", COUNT("r"."id") AS "ReadingCount"
FROM "trends$reading" "r"
INNER JOIN "trends$meter" "m" ON "m"."id" = "r"."trends$reading_meter"
GROUP BY "m"."metercode", (EXTRACT(YEAR
FROM "r"."readat" AT TIME ZONE 'UTC' AT TIME ZONE 'UTC'))::integer, (EXTRACT(MONTH
FROM "r"."readat" AT TIME ZONE 'UTC' AT TIME ZONE 'UTC'))::integer))
UNION ALL ((SELECT  ? AS "Grain", "m"."metercode" AS "MeterCode", (EXTRACT(YEAR
FROM "r"."readat" AT TIME ZONE 'UTC' AT TIME ZONE 'UTC'))::integer AS "PeriodYear", (EXTRACT(QUARTER
FROM "r"."readat" AT TIME ZONE 'UTC' AT TIME ZONE 'UTC'))::integer AS "PeriodNo", CONCAT(CONCAT(CAST((EXTRACT(YEAR
FROM "r"."readat" AT TIME ZONE 'UTC' AT TIME ZONE 'UTC'))::integer AS varchar), ?), CAST((EXTRACT(QUARTER
FROM "r"."readat" AT TIME ZONE 'UTC' AT TIME ZONE 'UTC'))::integer AS varchar)) AS "Label", SUM("r"."kwh") AS "TotalKwh", COUNT("r"."id") AS "ReadingCount"
FROM "trends$reading" "r"
INNER JOIN "trends$meter" "m" ON "m"."id" = "r"."trends$reading_meter"
GROUP BY "m"."metercode", (EXTRACT(YEAR
FROM "r"."readat" AT TIME ZONE 'UTC' AT TIME ZONE 'UTC'))::integer, (EXTRACT(QUARTER
FROM "r"."readat" AT TIME ZONE 'UTC' AT TIME ZONE 'UTC'))::integer)) ) "v"
WHERE (NOT "v"."Grain" IS NULL)
  AND (NOT "v"."MeterCode" IS NULL)
  AND (NOT "v"."PeriodYear" IS NULL)
  AND (NOT "v"."PeriodNo" IS NULL)
  AND "v"."Grain" = ?
  AND "v"."MeterCode" = ?
ORDER BY "v"."PeriodYear" ASC, "v"."PeriodNo" ASC
LIMIT ?

-- Select params 1-9: Week, -W, Month, -M, Quarter, -Q, Month, M-001, 3000
