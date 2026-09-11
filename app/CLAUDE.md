# Mendix Project: app

Built with mxcli and MDL (Mendix Definition Language).

## Project Brain — read this first

If `docs/brain/` exists, read `docs/brain/project.md` before doing anything
else. It holds the decisions this project has already made — things no command can
tell you, and that are cheap to contradict by accident.

Then, depending on what you are doing:

- **Building in a module** — also read `docs/brain/modules/<Module>.md` for the
  modules you are about to touch. Not the whole directory; only those.
- **Working a slice** — `./mxcli brain brief --slice <name> -p ViewEntityExamples.mpr` emits
  exactly that pack (project + the slice's modules + its plan) as one read.
- **Planning, or picking work up** — run `./mxcli brain plan -p ViewEntityExamples.mpr`.
  It reports what is built from the model itself, so it cannot be out of date.

Record what you learn with `./mxcli brain capture`. Read
`.ai-context/skills/project-brain/SKILL.md` for what belongs there and what does not —
the short version is that anything mxcli can answer must never be written down.

## Communication Style

- **Never show raw MDL in chat.** Describe changes in plain language as a numbered list.
- After the user approves, write the MDL to a script file, validate it, and execute it silently.
- Show MDL only if the user asks to see the script.
- Report results as plain language, not as a diff.

## Running mxcli

The binary is in the **root of this project**, not on `PATH` — always `./mxcli`.

```bash
./mxcli -p ViewEntityExamples.mpr -c "SHOW STRUCTURE"   # one command
./mxcli exec script.mdl -p ViewEntityExamples.mpr        # a script
./mxcli                                          # REPL
```

Scripts live in `mdlsource/`, one file per concern, re-runnable.

## The gates, in order

Run them cheapest-first; each is only worth paying for once the one above is clean.

```bash
./mxcli check script.mdl -p ViewEntityExamples.mpr --references   # syntax + references (~2s)
./mxcli exec script.mdl -p ViewEntityExamples.mpr                 # apply
./mxcli lint -p ViewEntityExamples.mpr                            # rules (~3s)
./mxcli report -p ViewEntityExamples.mpr                          # scored best practices
./mxcli docker check -p ViewEntityExamples.mpr                    # mxbuild, the slow one (~25s)
./mxcli run --local --watch -p ViewEntityExamples.mpr             # the app, hot-reloading
```

**`lint` printing no errors is not a pass** — read the warning count, and read
`report`'s score. A green `check` proves nothing about how a page renders:
anything visual or stateful needs the app actually running.

Set `mx` up once with `./mxcli setup mxbuild -p ViewEntityExamples.mpr`. To call it directly,
name the version — `~/.mxcli/mxbuild/<version>/modeler/mx` — because a `*` glob
breaks the moment two are cached.

## Syntax, rules and skills — ask the tool, not this file

These change every release. Nothing here restates them, because a copy that
disagrees with the tool is worse than no copy.

| To find out | Run |
|---|---|
| What MDL can say, and how | `./mxcli syntax` → `./mxcli syntax <topic> [sub]` (`--json` for bulk) |
| Which lint rules exist | `./mxcli lint -p ViewEntityExamples.mpr --list-rules` |
| What a command takes | `./mxcli help <command>` |
| What this project contains | `./mxcli -p ViewEntityExamples.mpr -c "SHOW STRUCTURE"` |
| Why it was built this way | `docs/brain/` (above) |

**Skills** are in `.ai-context/skills/<name>/SKILL.md` (and `.claude/skills/`, which is
the path Claude Code scans). Each one's frontmatter `description` says when to reach for
it — that IS the index, so list the directory rather than looking for a table. Read the
matching skill **before** writing microflows, pages, security, or anything touching data.

## Conventions no command will tell you

- **Quote every identifier** in MDL — `Module."Customer"`, `"Status": String(50)`.
  Quotes are stripped, so it is always safe, and it sidesteps every parser keyword.
  It does **not** exempt names Mendix itself reserves (`Type`, `ID`, `CreatedDate`) —
  those are rejected quoted or not.
- **A `/** ... */` comment before a statement sets that element's documentation.**
- **`@Position(x, y)` is optional** — mxcli places microflow activities, and
  `./mxcli layout` arranges the domain model.

