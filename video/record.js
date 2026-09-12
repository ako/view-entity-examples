//
// The picture, timed from the audio that already exists.
//
// No burned-in captions (DESIGN-LANGUAGE.md §3): the bottom 17% is a keep-out
// band and stays clear. What the caption bar used to provide besides text was
// continuous motion - Playwright records the frames the compositor produces, so
// a still reading tail can collapse to almost no video and the linear map in
// assemble.js then stretches the wrong way. That job moved to the chrome
// hairline, which draws across the scene's own duration inside the chrome band.
//
// One context per scene, so each clip is its own file and a frame-rate wobble
// in scene 9 cannot push scene 12 out of sync. The alternative - one long take
// cut afterwards - needs the recorder's clock mapped onto the video's, and that
// clock is wrong in two ways at once (a start offset, and a scale, because the
// capture drops frames while the page is busy).
//
// viewport === recordVideo.size deliberately: size PADS a smaller viewport into
// the canvas, it does not scale it.
//
const { chromium } = require('playwright');
const { deck } = require('./deck.js');
const fs = require('fs');
const path = require('path');

const SIZE = { width: 1920, height: 1080 };
// Tails are the type's, not a single global number (TONE-AND-SPEED.md, Type C):
// a command frame holds 1.5s after its line because the viewer is watching
// typing; a result frame holds 3.5s because they are reading a table.
const TAIL = { result: 3.5, command: 1.5, declarative: 1.5 };
const DECK = deck(process.argv);
const RAW = DECK.rawDir;
const CLIPS = DECK.clipDir;

// Reveals are cued per scene, in decks/<name>/scenes.js: { step, s: sentence
// index, d: seconds after that sentence starts }. Authored, not derived - a
// step that lands one sentence early shows the viewer the answer before the
// question.

(async () => {
  const manifest = JSON.parse(fs.readFileSync(DECK.manifest, 'utf8'));
  const scene = process.argv.find((a, i) => /^\d+$/.test(a) && process.argv[i - 1] !== '--deck');
  const only = scene !== undefined ? Number(scene) : null;
  fs.mkdirSync(RAW, { recursive: true });
  fs.mkdirSync(CLIPS, { recursive: true });

  // The container ships its own Chromium; this playwright build wants a
  // different revision. Point at what is here rather than downloading one.
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH ||
      '/opt/pw-browsers/chromium-1229/chrome-linux64/chrome',
  });
  const url = 'file://' + path.resolve('shell.html');
  const report = [];

  for (const sc of manifest) {
    if (only !== null && sc.index !== only) continue;

    // Build the timeline before opening the camera: captions at sentence
    // boundaries, reveals at their authored cue, everything in seconds from the
    // first frame of this scene.
    const events = [];
    let t = 0;
    const starts = [];
    sc.clips.forEach((c, j) => {
      starts[j] = t;
      events.push({ t, kind: 'caption', text: c.text });
      t += c.sec + (j < sc.clips.length - 1 ? sc.gap : 0);
    });
    for (const cue of (DECK.scenes[sc.index].cues || [])) {
      const at = starts[Math.min(cue.s, starts.length - 1)] + (cue.d || 0);
      events.push({ t: Math.min(at, t - 0.2), kind: 'step', step: cue.step });
    }
    events.sort((a, b) => a.t - b.t);
    // No reveal may be cut short by the narration ending: a frame whose last
    // reveal is a query plan must not advance 1.5s after the sentence stops.
    const tail = sc.tail || TAIL[sc.kind] || 1.5;
    const lastCue = events.filter(e => e.kind === 'step').map(e => e.t).pop() || 0;
    const total = Math.max(t + tail, lastCue + tail);

    // ANCHOR 1 of 2. Recording starts when the context is created - before the
    // navigation is even issued. Everything before the first caption is
    // pre-roll that the cut has to remove.
    const tContext = Date.now();
    const context = await browser.newContext({
      viewport: SIZE,
      recordVideo: { dir: RAW, size: SIZE },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    await page.goto(`${url}?deck=${DECK.name}&scene=${sc.index}&rule=${total.toFixed(2)}`);
    await page.waitForTimeout(500);          // let the scene's fade-in finish

    const t0 = Date.now();   // ANCHOR 2 of 2: the timeline starts here
    for (const ev of events) {
      const wait = ev.t * 1000 - (Date.now() - t0);
      if (wait > 0) await page.waitForTimeout(wait);
      // Captions are not burned in: the system keeps the bottom 17% clear and
      // the caption band stays empty even when captions are off. The sentence
      // boundaries still drive the timeline - they are what the reveals are
      // cued to - they just no longer draw anything.
      if (ev.kind === 'step') await page.evaluate(k => window.showStep(k), ev.step);
    }
    const left = total * 1000 - (Date.now() - t0);
    if (left > 0) await page.waitForTimeout(left);

    const video = page.video();
    const tClose = Date.now();
    await context.close();                    // the file is only final after this
    const dst = path.join(CLIPS, `scene-${String(sc.index).padStart(2, '0')}.webm`);
    fs.renameSync(await video.path(), dst);

    // The recorder's clock is not the video's. Read the file back rather than
    // trusting the script's wall clock - a clip that is SHORTER than its audio
    // is the failure that silently desyncs everything downstream.
    const dur = Number(require('child_process').execFileSync('ffprobe',
      ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', dst],
      { encoding: 'utf8' }).trim());
    // The recorder's clock is not the video's, in two ways at once: a start
    // OFFSET (the pre-roll above) and a SCALE (frames drop while the page is
    // busy, so the file plays back longer than the session it recorded).
    // Record both anchors; assemble.js maps linearly. Correcting only the
    // offset leaves the last seconds of every clip wrong.
    const wall = (tClose - tContext) / 1000;
    const preroll = (t0 - tContext) / 1000;
    const row = { index: sc.index, id: sc.id, kind: sc.kind, tail,
                  planned: Number(total.toFixed(2)),
                  audio: sc.sec, video: Number(dur.toFixed(2)),
                  wall: Number(wall.toFixed(2)), preroll: Number(preroll.toFixed(2)),
                  scale: Number((dur / wall).toFixed(4)),
                  drift: Number((dur - total).toFixed(2)) };
    report.push(row);
    console.log(`  ${String(sc.index).padStart(2)} ${sc.id.padEnd(11)} ` +
      `audio ${row.audio.toFixed(1)}s  planned ${row.planned.toFixed(1)}s  ` +
      `tail ${tail.toFixed(1)}s  video ${row.video.toFixed(1)}s  preroll ${row.preroll.toFixed(2)}s  ` +
      `scale ${row.scale.toFixed(3)}` +
      (dur < sc.sec ? '   << SHORTER THAN ITS AUDIO' : ''));
  }

  await browser.close();
  fs.writeFileSync(DECK.clipsJson, JSON.stringify(report, null, 2));
  const bad = report.filter(r => r.video < r.audio);
  if (bad.length) {
    console.error(`\n${bad.length} clip(s) shorter than their narration: ` +
      bad.map(b => b.id).join(', '));
    process.exit(1);
  }
  console.log(`\n${report.length} clips, ` +
    `${(report.reduce((a, r) => a + r.video, 0) / 60).toFixed(2)} min`);
})();
