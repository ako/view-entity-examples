# Film 5 — "Why workflows exist" (proposed)

For someone who has never built a process in Mendix, and may not have built a
microflow either. Same contract as films 3 and 4: **nothing on screen is
invented** — every diagram, log line, OQL result and error is captured from a
running app and named on the frame. So the script below is written against
captures that have to exist first; the capture list is at the bottom.

## What the film argues

One sentence: **a microflow finishes, and a process waits — and the waiting is
the whole reason workflows exist.**

The film earns that in two demonstrations rather than asserting it:

1. A microflow is one transaction. It runs to completion in milliseconds and
   rolls back whole. There is no microflow that waits three days for a manager.
2. So the waiting has to live somewhere. Built by hand it lives in a `Status`
   attribute and a scattering of microflows that move it — and nobody can say
   what the process *is*. Built as a workflow it lives in rows the engine keeps:
   stop the app, start it again, the task is still open on the same step.

Frames 13 and 14 are the film. Everything before them sets up why a row in
`System.WorkflowUserTask` is worth caring about; everything after is how to
write the thing that produces it.

## The case

Not an expense claim. The app already has six meters and 6570 daily readings,
and one reading is three times its neighbours. **No query can decide whether
that is a broken meter or a cold week — a person has to.** That is exactly the
line between what the previous two films covered and what this one does, and it
gives the film a first frame made of real data.

Process: a flagged reading goes to a reviewer, who accepts it, rejects it, or
asks for a re-read; over a threshold it goes to a supervisor instead; after
three days with no answer it escalates on its own.

## Frames

Type C: 240–330s, 22–30 frames, 70–75% voice density. **26 frames, 677 words**
of narration. Film 3's 24 frames / 659 words planned at 330.9s, so this lands
at roughly 338s — just over the ceiling, and the first audio build will want
about fifteen words back out of frames 24 and 25, which are the two densest.

| # | id | kind | narration | on screen | source |
|---|---|---|---|---|---|
| 1 | `title` | declarative | "Some work finishes before you let go of the mouse. Some waits three days for a manager on holiday. Mendix has a tool for each. This is the second." | title, tag `Mendix 10.24.24 · workflows · from zero` | — |
| 2 | `microflow` | command | "First, what you already have. A microflow is one transaction: it starts, works, commits, and is gone. Eleven milliseconds. All of it happens, or none of it." | a small captured microflow + the runtime line timing it | `analyze-runtime` |
| 3 | `wait` | result | "Now put a person in the middle. You cannot hold a transaction open until they are back from lunch. The microflow stops, and something has to remember where." | the same flow cut in half, the gap marked | drawn from the captured flow |
| 4 | `by-hand` | command | "Here is what everyone builds first. A status attribute, a page filtered on it, a microflow for each move. It works. Thousands of Mendix apps run on this." | domain model with `Status` enum + the three microflows | `describe` output |
| 5 | `by-hand-cost` | result | "Until it is asked something it cannot answer. Who has this one. How long has it sat there. And what is the process? Only whatever microflows touch that attribute." | the four questions against the model; nothing to point at | — |
| 6 | `what-is` | declarative | "A workflow is that process drawn once, and run by an engine that keeps its place. The drawing is the definition. Each thing going through it is an instance." | definition / instance side by side | — |
| 7 | `case` | result | "Six meters, three years of readings, and this one is three times its neighbours. No query knows if that is a broken meter or a cold week. A person looks." | the anomalous row with its neighbours | OQL against the running app |
| 8 | `context` | command | "So it is about something: one flagged reading, one instance. That is the context entity, and it must be persistent — the instance outlives the request that started it." | `parameter $Context: Trends.ReadingCheck` + the entity | `mdl/40-*.mdl` |
| 9 | `first` | command | "The smallest workflow that does anything: one user task, one page. Thirteen lines, and mxcli writes it into the model." | the MDL + captured `exec` output | `mxcli exec` |
| 10 | `usertask` | result | "A user task is a page plus outcomes. The outcomes are the branches — accept, reject, ask for a re-read — each one a button, and a path out." | the three outcomes, the diagram branching | `describe workflow` |
| 11 | `page` | command | "The page binds to `System.WorkflowUserTask`, the platform's own entity for a step somebody has to do. You did not make it. Every workflow uses it." | the task page running | screenshot |
| 12 | `start` | command | "Instances do not start themselves. A microflow calls the workflow with the object it is about, and returns immediately. That is the last it sees of it." | `call workflow` in a microflow + the log | runtime log |
| 13 | `state` | result | "So where did it go? Into the database. One row for which step the instance is on, one for the open task. Its place is a row." | OQL result, both tables | `preview_execute_oql` |
| 14 | `restart` | result | "Which is the point. Stop the app. Start it again. Same instance, same step, same open task. That is what the status attribute was pretending to be." | shutdown log, startup log, the same OQL returning the same row | runtime log + OQL |
| 15 | `targeting` | command | "Who sees it. Targeting takes an XPath or a microflow, and decides who the task shows up for. Reviewers here, supervisors on the escalation." | the `targeting` clause + two inboxes | `describe workflow` |
| 16 | `claim` | result | "Now the one that costs everybody an afternoon. Targeting decides who can see a task. It does not assign it. Complete an unclaimed task and the button does nothing." | the captured `ERROR - Client: You can't complete this user task, it is not assigned to you.` | runtime log |
| 17 | `outcome` | command | "Claiming is a plain write to Assignees. Then `set task outcome` finishes the task with the name of a branch. Three statements, in that order." | the microflow, three lines | `mdl/41-*.mdl` |
| 18 | `decision` | command | "Branching on the object. A decision is an expression over WorkflowContext — whatever you named the parameter, the engine calls it that, and it is case-sensitive." | the decision + its two paths | `describe workflow` |
| 19 | `timer` | result | "Now the frame this has been walking towards. Three days, no answer, escalate. Attach a timer to the task and the engine wakes it. No microflow does this." | boundary event on the user task | `describe workflow` |
| 20 | `timer-fired` | result | "Filmed at thirty seconds rather than three days, and the frame says so. Nobody was logged in. The instance moved on its own." | log lines either side of the timer + OQL before/after | runtime log + OQL |
| 21 | `parallel` | command | "Two at once. A parallel split runs both paths and carries on when both finish: notify the owner while the supervisor reads it." | the split, two paths | `describe workflow` |
| 22 | `jump` | command | "And a loop. Ask for a re-read jumps back to the review task. The same statement rescues an instance stuck in the wrong place." | `jump to Review` in the diagram | `describe workflow` |
| 23 | `whole` | result | "That is the whole process. Thirty-one lines of MDL, and what Studio Pro draws from them. The process is one thing now, that can be read and changed." | MDL and the workflow editor side by side | `exec` + screenshot |
| 24 | `edges` | command | "Three that bite on day one. Create or replace drops boundary events you did not restate — use alter. An enum outcome must be fully qualified, or the project will not open." | four lines, each with its error — the fourth being that a task's `Name` is its caption, not the activity's | `FINDINGS` / skill |
| 25 | `when-not` | result | "Most of your logic still is not this. No person, no waiting, nothing to watch — that is a microflow. Use a workflow when the process must survive somebody going home." | the two-column test | — |
| 26 | `lockup` | declarative | (catalogue lockup) | | — |

**Every number in the narration is a placeholder.** "Eleven milliseconds",
"three times its neighbours", "thirteen lines", "thirty-one lines", "thirty
seconds" — each is written to the shape of the frame and gets replaced by what
the capture actually says, the way film 3's 6570 and film 4's 1.664 ms were.
Nothing goes on a frame that the app did not print.

Foldable if the first audio build comes in over 330s: 20 into 19, and 21 into
22. That takes it to 24 frames and about 45 words off.

## What has to be built and captured first

The film needs a real process in a real app. Roughly a day's work before any
frame can be recorded.

**Model** — two new MDL scripts, numbered after the existing ones:

- `mdl/40-review-process.mdl` — `Trends.ReadingCheck` (persistent, context
  entity, association to `Trends.Reading`), the enum, the task page, and
  `create workflow Trends.CheckReading` with the user task, decision, boundary
  timer, parallel split and jump.
- `mdl/41-review-microflows.mdl` — the starter (`call workflow`), the claim +
  `set task outcome` microflow, and the escalation.

**Captures** — all from the running app, into `docs/`:

| capture | how |
|---|---|
| the anomalous reading and its neighbours | OQL |
| `System.Workflow` / `System.WorkflowUserTask` rows | OQL, before and after each step |
| the same rows after a restart | stop, start, re-run the OQL |
| the unclaimed-task ERROR line | run it wrong once, on purpose |
| the timer firing with nobody logged in | `.mxcli/runtime.log` |
| the task page, and the workflow in the editor | screenshots |

And one **error file**, `docs/errors-workflow.txt`, in the shape of the other
two: the failures collected on the way, with the message each one actually
printed.

## One decision that changes the work

**This app has security switched off.** The README says so, and the OData
examples depend on it — no credentials in any of the curl lines. A workflow film
cannot avoid users: targeting, claiming and the two inboxes are the middle third
of the script, and none of it is demonstrable without at least a reviewer and a
supervisor to log in as.

Three ways out, in the order I would pick them:

1. **A second app** in this repo (`app-workflow/`), security on, its own two
   users. Costs a second `.mpr` and a second `mxcli run`; keeps example 1–5 and
   their published URLs exactly as they are.
2. **Security on in this app**, and every OData request in `requests/` and the
   README grows a credential. Cheapest to build, and it quietly invalidates the
   thing four docs pages tell readers to paste into a terminal.
3. **Skip users**: one anonymous role, no targeting frames. Cheaper and dishonest
   — frames 15 and 16 are where the beginner is actually saved an afternoon.

I would build it as (1). It also makes the film portable if it later belongs in
a repo of its own rather than in one called `view-entity-examples`.
