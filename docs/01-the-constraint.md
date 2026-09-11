# 1. The constraint

A published OData resource needs a key. Mendix restricts which attributes may
carry it, and the restriction is not about enumerations specifically:

> ERROR at Submissions, Published OData service 'BlockedApi', Published entity
> 'QuarterSubmissionPerTypeVE': Only stored attributes which are of type
> (String, Integer, Long or AutoNumber) are supported as a key.

Four types are allowed — String, Integer, Long, AutoNumber — and the attribute
has to be *stored* (a calculated attribute is out too). Everything else is
rejected, so Decimal, DateTime, Boolean and Enumeration all fail the same way.

Reproduce it:

```bash
cd app
./mxcli exec ../mdl/99-enum-key-blocked.mdl -p ViewEntityExamples.mpr
./mxcli run --local -p ViewEntityExamples.mpr        # fails at the build step
./mxcli -p ViewEntityExamples.mpr -c "DROP ODATA SERVICE Submissions.BlockedApi;"
```

The captured build output is in [`build-error.txt`](build-error.txt).

## Why it bites view entities in particular

A view entity with a fan-out has a compound natural key, and one part of that
key is very often an enumeration — a type, a status, a category. In this demo:

| View entity | One row per | Natural key |
|---|---|---|
| `QuarterSubmissionVE` | profile, quarter | `ProfileNumber`, `PeriodYear`, `QuarterNo` |
| `QuarterSubmissionPerTypeVE` | profile, quarter, **contract type** | the same three **+ `ContractType`** |

The first publishes without trouble: every part of its key is an Integer. The
second cannot be published as it stands, even though it is the same data at a
finer grain and its rows *are* unique — just not by any combination of the
three publishable attributes.

Nothing about the enumeration is unsuitable on its own. It is not unique, but
neither is `ProfileNumber` on its own, and Mendix is happy to use that as one
part of a compound key. Uniqueness is a property of the combination.

## What the wire format already does with an enumeration

The restriction is on the key, not on the value. Publish the same enumeration
as an ordinary attribute and it builds and serves fine — as `Edm.String`
carrying the enumeration value **name**:

```xml
<Property Name="contractType" Type="Edm.String" MaxLength="200" />
```

See [`metadata/submissions-v1.xml`](metadata/submissions-v1.xml) for the
generated document, and [`responses/`](responses/) for what comes back.

That is the crux of the feature request. `contractType` is already a string on
the wire, in both the payload and `$metadata`. A client that can read
`"contractType": "Freelance"` from the body can equally send
`contractType='Freelance'` in a key predicate. The workaround in
[2. Workarounds](02-workarounds.md) does not change one byte of what a consumer
sees — it adds a second attribute holding the identical string and marks *that*
one as the key.

OData v4 itself is not the obstacle either: the CSDL spec allows an enumeration
type as a key property.
