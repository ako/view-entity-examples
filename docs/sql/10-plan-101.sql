\echo '--- (a) no filter: every reading is aggregated'
EXPLAIN (ANALYZE, COSTS OFF, TIMING OFF) SELECT * FROM (
  SELECT "m"."metercode" AS "MeterCode", "m"."region" AS "Region",
         (EXTRACT(YEAR FROM "r"."readat"))::integer AS "PeriodYear",
         (EXTRACT(MONTH FROM "r"."readat"))::integer AS "MonthNo",
         SUM("r"."kwh") AS "TotalKwh", COUNT("r"."id") AS "ReadingCount"
  FROM "trends$reading" "r"
  INNER JOIN "trends$meter" "m" ON "m"."id" = "r"."trends$reading_meter"
  GROUP BY "m"."metercode", "m"."region",
           (EXTRACT(YEAR FROM "r"."readat"))::integer,
           (EXTRACT(MONTH FROM "r"."readat"))::integer ) "v"
LIMIT 3000;
\echo ''
\echo '--- (b) the same view, filtered on one meter and one year'
EXPLAIN (ANALYZE, COSTS OFF, TIMING OFF) SELECT * FROM (
  SELECT "m"."metercode" AS "MeterCode", "m"."region" AS "Region",
         (EXTRACT(YEAR FROM "r"."readat"))::integer AS "PeriodYear",
         (EXTRACT(MONTH FROM "r"."readat"))::integer AS "MonthNo",
         SUM("r"."kwh") AS "TotalKwh", COUNT("r"."id") AS "ReadingCount"
  FROM "trends$reading" "r"
  INNER JOIN "trends$meter" "m" ON "m"."id" = "r"."trends$reading_meter"
  GROUP BY "m"."metercode", "m"."region",
           (EXTRACT(YEAR FROM "r"."readat"))::integer,
           (EXTRACT(MONTH FROM "r"."readat"))::integer ) "v"
WHERE "v"."MeterCode" = 'M-004' AND "v"."PeriodYear" = 2025
ORDER BY "v"."MonthNo" ASC
LIMIT 3000;
