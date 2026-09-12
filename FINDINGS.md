# Findings

Things that were surprising or broken while building this repo, and how each
one was established. Kept per `.ai-context/skills/bootstrap-app/SKILL.md` — the
useful half of it is the part that can be handed back to whoever maintains
mxcli.

Unless a finding says otherwise:

| | |
|---|---|
| Mendix | 10.24.24.119653 (some findings re-run on 11.14.0, noted where so) |
| mxcli | nightly-20260909-ca9b90ed |
| | §1-§3 re-tested against [ako/mxcli#452](https://github.com/ako/mxcli/pull/452) (`a039e67`), built here |
| Database | PostgreSQL 16 |
| Host | Linux container, JDK 21 and 25 both present |

---

## 1. A view entity's association to a persistent entity cannot be written

**What it is.** Selecting a persistent entity's id under an alias gives a view
entity an association to that entity: the alias becomes the association name,
and the id column is not one of the view entity's attributes. Studio Pro
creates the association member when the column is added.

**What mxcli does.** Three separate problems, in order:

1. `mxcli check` aligns the select columns against the declared attributes
   **without skipping the id column**. With the id first it reports a bogus type
   error on the last attribute (`attribute 'TotalKwh': declared as Decimal but
   OQL expression returns Integer`); with the id last, `OQL select has 4 columns
   but 3 attributes declared`. Neither is the real state of the script.
2. `mxcli exec --no-check` writes the view entity and its OQL, but **creates no
   association member**. The build then names what is missing —
   11.14: `The selected association 'ViewAssociations.a_product' no longer
   exists`; 10.24: `View Entity is out of sync with the OQL Query`.
3. Creating it by hand with `create association` writes an association whose
   `Source` is `null`, and the build refuses that too: *"It is not possible to
   create associations to/from View Entities."*

**The difference is one field.** Decoding both model units, Studio Pro's
association and mxcli's are the same `DomainModels$CrossAssociation` in Name,
Child, Type, Owner, StorageFormat and DeleteBehavior:

```jsonc
"Source": { "$Type": "DomainModels$OqlViewAssociationSource",
            "Reference": "persistent_order" }   // Studio Pro — the OQL alias
"Source": null                                  // mxcli
```

**Verified.** On 10.24.24.119653 (this repo's app) and on 11.14.0 (a scratch
copy of `ako/TestApp`, which has a Studio-Pro-built example to compare against).
`tools/add-oql-view-association.py` adds that subdocument; both versions then
report `BUILD SUCCEEDED`, and on 10.24 a data grid renders columns over the
association at runtime. Full write-up in
[`docs/07-view-entity-associations.md`](docs/07-view-entity-associations.md),
transcript in
[`docs/view-entity-association-attempt.txt`](docs/view-entity-association-attempt.txt).

**Fix shape.** mxcli already knows how to create the association; it needs to
set `Source` to an `OqlViewAssociationSource` carrying the alias, and its
checker needs to treat an `<alias>.ID` select column as an association rather
than as an attribute.

**FIXED in [ako/mxcli#452](https://github.com/ako/mxcli/pull/452)**, verified by
building the PR head and re-running this repro:

```
$ mxcli check  r1.mdl -p ViewEntityExamples.mpr     ->  Check passed!
$ mxcli exec   r1.mdl -p ViewEntityExamples.mpr
Created view entity: Trends.MeterMonthRefVE
Created view association: Trends.MeterRef -> Trends.Meter
$ mxbuild --target=deploy ViewEntityExamples.mpr     ->  BUILD SUCCEEDED
```

The stored element carries exactly the field that was missing, and the PR
corrected something this report got wrong: same-module it is a
`DomainModels$Association` with a `ChildPointer`, not a `CrossAssociation` with
a `Child` — the cross-module shape is the one TestApp happened to have, so that
is the only one this report ever saw.

```jsonc
"$Type": "DomainModels$Association", "Name": "MeterRef",
"Source": { "$Type": "DomainModels$OqlViewAssociationSource",
            "Reference": "MeterRef" }
```

Also verified against the PR: `create or modify association` with a view entity
at either end is now refused at check **and** exec, with a message that names
the column form instead — so the read path that silently rewrote `Source` to
null is closed. And `cast(m.ID as string) as MeterId` is still a plain
attribute, no association created, which is the distinction the flat design
depends on.

**Two things that bite alongside it.** The alias may not collide with an entity
name in the module, case-insensitively (`as meter` next to `Trends.Meter` gives
*"Duplicate name 'Meter' in module 'Trends'"*). And mxbuild does not re-check
the `ContentsHash` the `.mpr` stores per unit, so a hand-patched `.mxunit`
builds without the database being updated.

---

## 2. The documented Data Grid 2 filter syntax is the gallery one, and is dropped

A Data Grid 2 filter **can** be written from MDL. It goes inside the column's
own braces, as a widget:

```mdl
COLUMN colMeter (Attribute: MeterCode, Caption: 'Meter') {
  textfilter tfMeter (attribute: MeterCode, filtertype: contains)
}
```

That persists, and it works: typing `M-004` into it produces
`WHERE ... "MeterCode" ILIKE ? ESCAPE '\'` with `%M-004%` bound as a parameter
([`docs/sql/12-grid-filter.sql`](docs/sql/12-grid-filter.sql)).

**The finding is what happens to the other two spellings**, both of which are
accepted and then lost:

- `mxcli syntax page widgets` documents `COLUMN c (Attribute: A) FILTER f {
  TEXTFILTER tf (Attribute: A) }`. That is the **GALLERY** form — correct for
  `gallery g { filter f { textfilter ... } }`, which is how
  `create-page/reference/widgets.md` shows it. Against a datagrid column it
  parses, reports no diagnostic, and is **dropped on write**, on the default
  engine and on `MXCLI_ENGINE=legacy` alike. `DESCRIBE PAGE` afterwards shows
  the column with no filter, which is the only way to notice.
- Putting the widget in the grid's filters placeholder (`controlbar`) writes it,
  but there it needs `linkedDs`, which is reported as *"recognized but not yet
  persisted by mxcli"* (MDL-WIDGET06). The result renders in the browser as
  **"Unable to get filter store. Check parent widget configuration."**

So the top-level syntax reference points at the one form that silently does
nothing, and the form that works is in a skill reference the session never sees
(§5). Two fixes, either of which would have saved this: make the datagrid
column reject the gallery `FILTER` block instead of swallowing it, and show the
column-braces form under `syntax page widgets`.

**Verified** on 10.24.24.119653: written, `DESCRIBE PAGE`d, built, run, and
driven with Playwright while `ConnectionBus_Retrieve` was at TRACE.

**FIXED in [ako/mxcli#452](https://github.com/ako/mxcli/pull/452)**, verified
here. The gallery form is now refused at exec with the message naming this
widget's own spelling of the slot, and nothing is written:

```
Error: failed to build page: failed to build widget: widget `g`: `filter` is
not a container or slot of `datagrid`, so it would be dropped on write — on
this widget that slot is spelled `controlbar` — it declares: column,
controlbar, emptyplaceholder
```

**One gap left, and it is small but worth naming.** MDL-WIDGET30 needs the
project's widget-definition registry, and `check` neither has it nor builds it
on a project whose `.mxcli/widgets` is cold — a fresh clone, or a copied app
directory. Measured on the PR binary: with `.mxcli/widgets` removed,
`check -p …` reports nothing and leaves `.mxcli` holding only `catalog.db`;
`exec` then prints *"updated widget definitions"* and refuses. So the first
check after a clone — the one most likely to be believed — is the one that
cannot see the rule. Once `exec` (or anything else that populates the registry)
has run, check and exec agree exactly, as the PR says.

**One more thing that is silently ignored**, and this one does warn:
`numberfilter nf (attributes: [...])` with the default `attrChoice: auto` gets
MDL-WIDGET10 — *"property `attributes` is hidden when `attrChoice` is 'auto'
— the value will be ignored"*. It still filters, on the column's own attribute.

## 3. `DESCRIBE ENTITY` output for a view entity does not round-trip

`mxcli -p TestApp.mpr -c "DESCRIBE ENTITY ViewAssociations.OrdersVE"` emits the
OQL as `from ... select ...`. Feeding that output straight back to
`mxcli check` fails:

```
statement 1: view entity 'ViewAssociations.OrdersVE' has type mismatches:
- could not parse select clause from OQL query
```

**Verified** on 11.14.0. Worth fixing because describe-edit-execute is the
obvious loop, and this is the one document type where it breaks.

**FIXED in [ako/mxcli#452](https://github.com/ako/mxcli/pull/452)**: the exact
`DESCRIBE ENTITY` output above now checks clean against TestApp. The half this
report missed is fixed too, and it was the more serious one — with the select
clause unreadable, every OQL rule behind it had been skipping silently. On the
PR binary a from-first view is now checked like any other:

```
-- from … group by … select … order by …, no limit
ORDER by without limit: view entity OQL queries that use ORDER by must also
specify a limit clause                                            [MDL030]

-- from … select o.OrderDate as Total, with Total: Integer
attribute 'Total': declared as Integer but OQL expression 'o.OrderDate'
returns DateTime. Fix: change to 'Total: DateTime'
```

---

## 4. Declaring an association attribute corrupts the .mpr

Writing the association column as a declared attribute — `MeterRef:
Trends.Meter` or `MeterRef: Trends.Meter.ID` — is accepted and **silently
stored as `Enumeration(...)`**. The resulting model fails to build with

```
System.InvalidOperationException: An error occurred when trying to set the
'Enumeration' property of a Enumeration in a Domain model with ID 9b4023c4-...
```

and the MPR rollback then failed too, leaving a stray `.mxunit` behind;
recovery was `git checkout -- app/mprcontents` plus deleting the orphan
directory.

Other spellings — `Association(...)`, `Reference(...)`, `Object(...)`,
`Entity(...)` — are rejected at parse time with `mismatched input`, which is the
correct behaviour. It is the silent coercion that does damage.

**Verified** on 10.24.24.119653, in an earlier session on this repo; not
re-run since, because it damages the project.

---

## 5. The skills are installed where a session does not look

`mxcli init` had been run in this repo — 74 skills and 10 commands are
committed — but it anchors them to the directory holding the `.mpr`, so they
are at **`app/.claude/skills/`**. A session opened at the repository root (the
normal thing to do here: the root holds `mdl/`, `docs/`, `video/` and the git
history) surfaces none of them, and nothing says they exist.

`mxcli init .` at the root does not fix it: it resolves to the project and
re-initialises `app/` again, rewriting `app/CLAUDE.md`, `app/AGENTS.md` and
`app/.devcontainer/devcontainer.json` with the new directory name and creating
nothing at the root.

**Verified** on nightly-20260909-ca9b90ed, in this repo. The cost is in §6:
four separate things were worked out the slow way that the skills document.

**Fix shape.** Either install a root-level pointer when the `.mpr` is not at the
repository root, or have `init <dir>` honour the directory it was given. A
`CLAUDE.md` at the root naming the path is the workaround this repo now
carries.

---

## 6. Smaller things

- **Mendix 10 CDN versions are four-part.** `10.24.24` does not resolve;
  `10.24.24.119653` does. The three-part number is the one a user has in their
  head, so the 404 reads as "this version is gone" rather than "name it in
  full" — worth saying in the error.
- **`mxcli oql` with no `--direct` talks to whichever runtime it discovers**,
  which is the wrong one as soon as two apps are up: it answered from a second
  app's older model with `Can't find entity by name '...' in domain model`,
  which reads as a model problem rather than a wrong-runtime problem.
  `--direct --host localhost --port <admin-port>` is the way to be explicit.
  The default admin port (8090) also collides with a second app started on
  `--app-port 8090`, and the collision is reported against the app port.
- **The Best Practice Recommender flags the seed microflow** (MXP005, *Commit
  inside Loop*, 1 occurrence), seen in Studio Pro 11.14 on this project. It is
  reading `Trends.ASu_CreateTrendData`, which commits one meter and one list of
  1095 readings per iteration of a six-iteration loop. Left as it is
  deliberately — the alternative is one commit of 6570 objects — but the
  recommender is right that the shape is a loop with commits in it, and the
  comment in `mdl/13-trends-data.mdl` says why.

Four more things cost time in this repo and turned out to be **already
documented in mxcli's own shipped skills** (see §5 for why they were not read),
so they are noted here as pointers rather than as findings: the `Year` reserved
word and MDL071
(`check-syntax`), `count()` not being a Mendix expression function and MDL044
(`write-microflows`), an after-startup microflow having to return Boolean and
CE0142 (`project-settings`, `demo-data`), and `mxcli new` needing
`--theme none --layout none` on Mendix 10. Reading the skills first would have
saved each of them.
