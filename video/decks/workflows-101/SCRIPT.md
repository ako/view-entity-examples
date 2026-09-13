# Film 5 — "Why workflows exist"

The narration lives in [`scenes.js`](scenes.js), which is the script. This file
is what changed between the proposal and the film, and why — the proposal is in
the history of this file.

**Built:** 26 frames, 329.5s planned, 74% voice density, `workflows-101.mp4` at
5m30s. Inside Type C on all three counts, after two trim passes (344.7s on the
first audio build, then 332.4s).

## What the film argues, unchanged from the proposal

A microflow finishes; a process waits — and the waiting is the whole reason
workflows exist. Frames 13 and 14 are the film: an instance's place is a **row**,
and stopping and restarting the app leaves the same two ids on the same step.
Everything before them earns that; everything after is how to write the thing
that produces one.

## What changed, and why

**The app.** The proposal offered three ways round this repo's security being
off, and recommended a second app. That is what was built:
[`app-workflow/`](../../../app-workflow), Mendix 11.14.0, security at
`prototype`, two demo users (`reviewer`, `supervisor`). The view-entity app and
its credential-free OData examples are untouched.

**Frame 2's number is real.** The proposal wrote "eleven milliseconds" as a
placeholder. `MicroflowEngine` at TRACE says four: Start, one retrieve, End.
Every other placeholder number was replaced the same way.

**Frames 4 and 5 use this app's own enumeration.** The by-hand version does not
have to be imagined — `Trends.ReadingCheck` still carries a `Status` with five
values, beside the workflow. So the frame that says "this is what everyone
builds first" is captured model output, not a drawing.

**The parallel-split frame is gone, and an edges frame took its place.** A
parallel split written from MDL runs both paths empty — check passes, the build
passes, `describe workflow` reads the paths back exactly as written, and at
runtime each path goes from the split straight to its own end
([FINDINGS §6](../../../FINDINGS.md)). A beginner film cannot teach a construct
that does not work, and the honest alternative was not to draw one that does.
The process was designed with a parallel split (notify the owner *while* the
supervisor reads it) and is sequential because of this.

Frame 23 carries the finding instead, with two more that cost a day between
them: anything after a user task is unreachable, and a boundary path can only
end in a jump. All three build cleanly and do nothing.

**Two jumps, not one.** The proposal had `jump to Review` as a loop. The
boundary path needs one too, because CE0105 wants a jump or an end activity and
MDL cannot write an end activity.

## The frame that is still waiting

Frame 23 in the proposal was "the MDL and what Studio Pro draws from it, side by
side". It currently carries the model's own outline. **It is the slot for a
Studio Pro screenshot of the workflow editor** — the one thing this pipeline
cannot photograph, since mxcli writes the model but nobody opens the canvas.

When one lands, follow film 3's rules for a photographed frame
([`video/NOTES.md`](../../NOTES.md)): caption it with its own Studio Pro version
in the sub line, crop rather than upscale, and frame it with a hairline instead
of a card.

## Captures

Every frame names its source. They are all in
[`docs/workflow/`](../../../docs/workflow), and the write-up that walks the same
ground in prose is [`docs/09-workflows.md`](../../../docs/09-workflows.md).
