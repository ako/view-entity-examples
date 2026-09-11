//
// The picture, timed from the audio that already exists.
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
const narrate = require('./narrate.js');
const fs = require('fs');
const path = require('path');

const SIZE = { width: 1920, height: 1080 };
const TAIL = 0.9;          // let the last caption land before the cut
const RAW = 'capture/raw';
const CLIPS = 'capture/clips';

// Which reveal belongs to which sentence. Authored, not derived: a step that
// lands one sentence early shows the viewer the answer before the question.
// { step, s: sentence index, d: seconds after that sentence starts }
const CUES = {
  'title':      [{ step: 1, s: 2 }],
  'model':      [{ step: 1, s: 2 }, { step: 2, s: 4 }],
  'fanout':     [{ step: 1, s: 2 }, { step: 2, s: 3 }],
  'oql':        [{ step: 2, s: 1 }, { step: 1, s: 2 }],
  'block':      [{ step: 1, s: 0, d: 2.4 }, { step: 2, s: 1 }],
  'trap':       [{ step: 1, s: 2 }, { step: 2, s: 3, d: 3.0 }, { step: 3, s: 4 }],
  'cast':       [{ step: 1, s: 1 }, { step: 2, s: 3 }],
  'keyed':      [{ step: 1, s: 0, d: 2.2 }, { step: 3, s: 1 }, { step: 2, s: 2 }],
  'sql':        [{ step: 1, s: 2 }, { step: 3, s: 3 }, { step: 2, s: 4 }, { step: 4, s: 5 }],
  'plan':       [{ step: 1, s: 1, d: 1.6 }, { step: 2, s: 2 }, { step: 3, s: 3, d: 1.5 }],
  'broken-sql': [{ step: 1, s: 2 }, { step: 2, s: 3 }],
  'close':      [{ step: 1, s: 3 }, { step: 2, s: 3, d: 4.0 }, { step: 3, s: 3, d: 8.2 }],
};

(async () => {
  const manifest = JSON.parse(fs.readFileSync('audio/manifest.json', 'utf8'));
  const only = process.argv[2] ? Number(process.argv[2]) : null;
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
    for (const cue of (CUES[sc.id] || [])) {
      const at = starts[Math.min(cue.s, starts.length - 1)] + (cue.d || 0);
      events.push({ t: Math.min(at, t - 0.2), kind: 'step', step: cue.step });
    }
    events.sort((a, b) => a.t - b.t);
    const total = t + TAIL;

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
    await page.goto(`${url}?scene=${sc.index}`);
    await page.waitForTimeout(500);          // let the scene's fade-in finish
    await narrate.install(page);

    const t0 = Date.now();   // ANCHOR 2 of 2: the timeline starts here
    for (const ev of events) {
      const wait = ev.t * 1000 - (Date.now() - t0);
      if (wait > 0) await page.waitForTimeout(wait);
      if (ev.kind === 'caption') {
        await narrate.say(page, ev.text, sc.label, { holdMs: 1 });
      } else {
        await page.evaluate(k => window.showStep(k), ev.step);
      }
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
    const row = { index: sc.index, id: sc.id, planned: Number(total.toFixed(2)),
                  audio: sc.sec, video: Number(dur.toFixed(2)),
                  wall: Number(wall.toFixed(2)), preroll: Number(preroll.toFixed(2)),
                  scale: Number((dur / wall).toFixed(4)),
                  drift: Number((dur - total).toFixed(2)) };
    report.push(row);
    console.log(`  ${String(sc.index).padStart(2)} ${sc.id.padEnd(11)} ` +
      `audio ${row.audio.toFixed(1)}s  planned ${row.planned.toFixed(1)}s  ` +
      `video ${row.video.toFixed(1)}s  preroll ${row.preroll.toFixed(2)}s  ` +
      `scale ${row.scale.toFixed(3)}` +
      (dur < sc.sec ? '   << SHORTER THAN ITS AUDIO' : ''));
  }

  await browser.close();
  fs.writeFileSync('capture/clips.json', JSON.stringify(report, null, 2));
  const bad = report.filter(r => r.video < r.audio);
  if (bad.length) {
    console.error(`\n${bad.length} clip(s) shorter than their narration: ` +
      bad.map(b => b.id).join(', '));
    process.exit(1);
  }
  console.log(`\n${report.length} clips, ` +
    `${(report.reduce((a, r) => a + r.video, 0) / 60).toFixed(2)} min`);
})();
