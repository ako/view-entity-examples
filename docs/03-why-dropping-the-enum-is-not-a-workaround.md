# 3. Why dropping the enum from the key is not a workaround

The obvious response to the build error is to un-tick `key` on the enumeration
and leave the rest of the key as it was. Mendix accepts that without a word,
and the result is a resource whose key does not identify a row.

`QuarterSubmissionPerTypeBroken` in this demo is exactly that: the fan-out view
keyed on `profileNumber`, `periodYear`, `quarterNo`, with `contractType`
published as an ordinary attribute.

Profile 300 has three contract types, so three rows share one key:

```
GET /odata/submissions/v1/QuarterSubmissionPerTypeBroken?$filter=profileNumber eq 300 and quarterNo eq 1

{ "profileNumber": 300, "periodYear": 2025, "quarterNo": 1, "contractType": "Freelance", "totalAmount": 55.5,   "lineCount": 1 }
{ "profileNumber": 300, "periodYear": 2025, "quarterNo": 1, "contractType": "Permanent", "totalAmount": 3000.0, "lineCount": 1 }
{ "profileNumber": 300, "periodYear": 2025, "quarterNo": 1, "contractType": "Temporary", "totalAmount": 400.0,  "lineCount": 1 }
```

Ask for that key and one of the three comes back, with a `200`:

```
GET /odata/submissions/v1/QuarterSubmissionPerTypeBroken(profileNumber=300,periodYear=2025,quarterNo=1)

{ "profileNumber": 300, "periodYear": 2025, "quarterNo": 1,
  "contractType": "Freelance", "totalAmount": 55.50000000, "lineCount": 1 }
```

`55.50` out of a quarter that totals `3455.50`. No error, no duplicate-key
complaint, no hint in `$metadata` that the key is not unique — the response
is indistinguishable from a correct one.

This is worse than the build error, and it is what the build error is pushing
people towards. A consumer that holds a row and re-reads it by key — which is
what a Mendix OData client, a Data Hub external entity, or any client with a
detail page does — silently reads a different row. Sorting decides which one,
so it can be stable for months and then change when the data does.

Captured in [`responses/03-broken-three-rows-one-key.json`](responses/03-broken-three-rows-one-key.json)
and [`responses/04-broken-key-lookup.json`](responses/04-broken-key-lookup.json).

## The same request, one attribute later

Workaround A publishes the identical data with `contractTypeKey` in the key:

```
GET /odata/submissions/v1/QuarterSubmissionPerType(profileNumber=300,periodYear=2025,quarterNo=1,contractTypeKey='Freelance')
```

The literal in that URL — `'Freelance'` — is the same string Mendix puts in
the `contractType` property of every payload, and the same string it already
accepts in a filter on the enumeration itself:

```
GET /odata/submissions/v1/QuarterSubmissionPerTypeBroken?$filter=contractType eq 'Freelance'
```

That filter works today, against the enumeration, unmodified. ([`responses/08-filter-on-the-enumeration.json`](responses/08-filter-on-the-enumeration.json).)
Mendix parses an enumeration value from a query string, matches it, and
serialises it back — everything a key predicate needs. The restriction is on
one flag in the modeller, not on anything the protocol or the runtime cannot do.
