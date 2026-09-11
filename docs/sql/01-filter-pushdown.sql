SELECT  "v"."ProfileNumber", "v"."PeriodYear", "v"."QuarterNo", "v"."ContractType", "v"."ContractTypeKey", "v"."TotalAmount", "v"."LineCount" 
FROM (  SELECT  "p"."profilenumber" AS "ProfileNumber", "sl"."submissionyear" AS "PeriodYear", "sl"."quarterno" AS "QuarterNo", "c"."contracttype" AS "ContractType", CAST("c"."contracttype" AS varchar) AS "ContractTypeKey", SUM("sl"."amount") AS "TotalAmount", COUNT("sl"."id") AS "LineCount"
FROM "submissions$submissionline" "sl"
INNER JOIN "submissions$contract" "c" ON "c"."id" = "sl"."submissions$submissionline_contract"
INNER JOIN "submissions$profile" "p" ON "p"."id" = "c"."submissions$contract_profile"
GROUP BY "p"."profilenumber", "sl"."submissionyear", "sl"."quarterno", "c"."contracttype" ) "v"
WHERE (NOT "v"."ProfileNumber" IS NULL)
  AND (NOT "v"."PeriodYear" IS NULL)
  AND (NOT "v"."QuarterNo" IS NULL)
  AND (NOT "v"."ContractTypeKey" IS NULL)
  AND "v"."ContractTypeKey" = ?
LIMIT ?

-- Select params 1-2: Freelance, 3000
