# The explainer film

A ~5 minute narrated walkthrough of why a fan-out view entity cannot carry an
enumeration in its OData key, what breaks if you route around it carelessly, and
what the database actually does with the fix.

Output: **`view-entity-odata-key.mp4`** (1920×1080, AAC narration).

Everything on screen is copied from this repo's captured artefacts —
`docs/build-error.txt`, `docs/responses/`, `docs/metadata/`, `docs/sql/` — not
retyped from memory. The SQL and the query plan are what the running 10.24.24 app
and its PostgreSQL actually produced.

## Rebuild it

```bash
cd video
npm install                 # playwright (the browser itself is already in the image)
node build-audio.js         # narration first — every hold downstream is a measured duration
node record.js              # one clip per scene, timed from that audio
node assemble.js            # mux, join, and write the contact sheet
```

`node preview.js` renders every scene as a still with all reveals shown — the
cheap way to catch text overflowing 1080p before recording five minutes of it.
`node record.js 8` re-records one scene.

## Why it is built this way

The approach is the one in mxcli's `record-narrated-demo` skill, pointed at a
purpose-built deck instead of at the app's UI. Three of its rules are doing real
work here and are worth keeping if you adapt this:

- **The narration is built first and the picture is timed to it.** A pre-rendered
  voice track against estimated holds drifts, and drift is not fixable in the cut.
  `build-audio.js` synthesises per *sentence* and records each clip's real
  duration with `ffprobe`; `record.js` holds each caption for exactly that long.
- **Something animates the whole time.** Playwright captures the frames the
  compositor produces, so a genuinely still screen during a reading pause can
  collapse to almost no video — the pause disappears and the narration desyncs.
  The spinning ring in `narrate.js`'s caption bar is what prevents that. It is
  not a loading indicator and removing it silently breaks the timing.
- **Look at every clip, not two of them.** `assemble.js` writes
  `capture/contact-sheet.png` — one frame from the middle of all twelve — because
  a reveal that fires one sentence early looks fine in isolation.

One deliberate difference from the skill: it records a single take and cuts it
afterwards, which needs the recorder's clock mapped onto the video's (that clock
is wrong twice over — a start offset *and* a scale, because frames drop while the
page is busy). Here each scene is its own browser context and its own file, so
there is no cumulative drift to model and a re-record costs one scene.

`loudnorm` is two-pass, as the skill requires: raw Piper output measures about
−17 LUFS at a 0 dBTP peak and crunches the moment it is encoded to AAC.

## Files

| | |
|---|---|
| `scenes.js` | what is on screen and what is said, one entry per scene |
| `shell.html`, `style.css` | the deck — `?scene=N`, `showStep(k)` |
| `narrate.js` | the caption bar, copied from the mxcli skill, unmodified |
| `build-audio.js` | Piper → two-pass loudnorm → `audio/manifest.json` |
| `record.js` | one clip per scene; the cue table lives here |
| `assemble.js` | mux, concat, contact sheet |
| `preview.js` | stills, for layout |
