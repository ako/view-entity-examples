\echo '--- (a) the composed view, whole: 18 rows out of 6570 readings'
EXPLAIN (ANALYZE, COSTS OFF, TIMING OFF) SELECT * FROM (
  SELECT "v"."MeterCode", "v"."PeriodYear", SUM("v"."TotalKwh") AS "TotalKwh",
         COUNT("v"."MonthNo") AS "MonthsCovered", MAX("v"."TotalKwh") AS "BusiestMonthKwh"
  FROM ( SELECT "m"."metercode" AS "MeterCode",
                (EXTRACT(YEAR FROM "r"."readat"))::integer AS "PeriodYear",
                (EXTRACT(MONTH FROM "r"."readat"))::integer AS "MonthNo",
                SUM("r"."kwh") AS "TotalKwh"
         FROM "trends$reading" "r"
         INNER JOIN "trends$meter" "m" ON "m"."id" = "r"."trends$reading_meter"
         GROUP BY "m"."metercode",
                  (EXTRACT(YEAR FROM "r"."readat"))::integer,
                  (EXTRACT(MONTH FROM "r"."readat"))::integer ) "v"
  GROUP BY "v"."MeterCode", "v"."PeriodYear" ) "Trends.MeterYearVE"
LIMIT 3000;
\echo ''
\echo '--- (b) the same, filtered on the OUTER view: does it reach the base table?'
EXPLAIN (ANALYZE, COSTS OFF, TIMING OFF) SELECT * FROM (
  SELECT "v"."MeterCode", "v"."PeriodYear", SUM("v"."TotalKwh") AS "TotalKwh",
         COUNT("v"."MonthNo") AS "MonthsCovered", MAX("v"."TotalKwh") AS "BusiestMonthKwh"
  FROM ( SELECT "m"."metercode" AS "MeterCode",
                (EXTRACT(YEAR FROM "r"."readat"))::integer AS "PeriodYear",
                (EXTRACT(MONTH FROM "r"."readat"))::integer AS "MonthNo",
                SUM("r"."kwh") AS "TotalKwh"
         FROM "trends$reading" "r"
         INNER JOIN "trends$meter" "m" ON "m"."id" = "r"."trends$reading_meter"
         GROUP BY "m"."metercode",
                  (EXTRACT(YEAR FROM "r"."readat"))::integer,
                  (EXTRACT(MONTH FROM "r"."readat"))::integer ) "v"
  GROUP BY "v"."MeterCode", "v"."PeriodYear" ) "Trends.MeterYearVE"
WHERE "MeterCode" = 'M-004'
LIMIT 3000;
