# view-entity-examples

Two things live here: Mendix apps that the examples are built in, and a video
pipeline under [`video/`](video) that films them. The write-ups are in
[`docs/`](docs), and every model change is an MDL script in [`mdl/`](mdl),
numbered in execution order.

There are **two apps**, and a script belongs to exactly one of them:

| app | Mendix | security | scripts |
|---|---|---|---|
| [`app/`](app) `ViewEntityExamples.mpr` | 10.24.24.119653 | off | `mdl/*.mdl` |
| [`app-workflow/`](app-workflow) `WorkflowExample.mpr` | 11.14.0 | prototype | `mdl/workflow/*.mdl` |

The second app exists because the first one's OData examples depend on security
being off, and half of the workflow material is about who can see a task and who
has claimed it. Its demo users are `reviewer` / `ReviewThis123` and
`supervisor` / `SuperviseIt123`.

## Read the mxcli skills before touching the model

`mxcli init` installs 74 skills and 10 commands, and it anchors them to the
`.mpr`'s directory — so in this repo they are at **`app/.claude/skills/`**, one
level below the root a session usually opens. Nothing surfaces them
automatically from here. Running `mxcli init .` at the root does not help: it
resolves to the project and re-initialises `app/` again.

The workflow app has its own copy at `app-workflow/.claude/skills/` (and a
mirror under `.ai-context/skills/`). They are the same 74; read whichever is
next to the `.mpr` you are changing.

So read them as files. The ones this repo keeps needing:

| doing | read |
|---|---|
| a view entity, or any entity | `app/.claude/skills/mdl-entities/SKILL.md` |
| OQL | `write-oql-queries/`, `verify-with-oql/` |
| a page or a widget | `create-page/`, `alter-page/`, `widgets/` |
| publishing over OData | `odata-data-sharing/` |
| demo data | `demo-data/` |
| running it | `run-local/`, `analyze-runtime/` |
| a workflow, a user task, a timer | `write-workflows/`, `system-module/` |
| security, roles, demo users | `manage-security/` |
| an error you do not recognise | `cheatsheet-errors/`, `check-syntax/` |

They are worth the read: four of the things logged in
[`FINDINGS.md`](FINDINGS.md) as time sinks — the `Year` reserved word, `count()`
in an expression, the after-startup Boolean, `mxcli new` on Mendix 10 — are
documented there already.

## Working in the app

The binary is at `app/mxcli` (git-ignored; `app/.claude/bootstrap-mxcli.sh`
fetches it back). Always from `app/`:

```bash
./mxcli check ../mdl/20-basics-view.mdl -p ViewEntityExamples.mpr
./mxcli exec  ../mdl/20-basics-view.mdl -p ViewEntityExamples.mpr
./mxcli run --local --ensure-db -p ViewEntityExamples.mpr
```

and from `app-workflow/`, on its own ports so both can run at once:

```bash
./mxcli exec ../mdl/workflow/44-workflow.mdl -p WorkflowExample.mpr
./mxcli run  --local --ensure-db -p WorkflowExample.mpr --app-port 8200 --admin-port 8201
./mxcli oql  --port 8201 -p WorkflowExample.mpr "select ... from System.Workflow as w"
```

A model change is never made in Studio Pro and copied here: it goes into a
numbered script in `mdl/`, so the app can be rebuilt from empty. The one
exception is documented in FINDINGS 1 — a view entity's association, which mxcli
cannot write at all.

## Working on the films

`video/` is one pipeline and one deck per film. Narration is built first and the
picture is timed to it; nothing on screen is invented, all of it is captured
output named on the frame. Before recording anything:

```bash
cd video
node check.js   --deck <name>     # conformance gate; fails the build
node preview.js --deck <name>     # stills, to catch overflow
```

`video/README.md` has the pipeline, `video/NOTES.md` the design-system record.
