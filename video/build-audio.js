//
// Narration, built BEFORE the picture. Every hold in record.js is taken from a
// measured clip duration here, never from a guess: a pre-rendered voice track
// timed against estimated holds drifts, and drift is not fixable in the cut.
//
// Per sentence rather than per scene, so the on-screen caption and the voice
// change at the same instant.
//
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { deck } = require('./deck.js');
const DECK = deck(process.argv);
const SCENES = DECK.scenes;
const KOKORO_PY = require('path').resolve('scripts/kokoro_say.py');

// One voice across the whole catalogue - Kokoro bm_george (DESIGN-LANGUAGE.md
// §7). Pace varies by type, the voice does not: a different narrator breaks the
// family harder than any visual difference.
const VOICE = process.env.KOKORO_VOICE || 'bm_george';
const SPEED = Number(process.env.KOKORO_SPEED || 0.97);  // Type C, ~150 wpm
const GAP = 0.35;             // breath between sentences
// Master target from the catalogue, not from this film: -18.6 LUFS / -1.5 dBTP.
const TARGET_I = -18.6, TARGET_TP = -1.5;

const OUT = DECK.audioDir;
fs.mkdirSync(OUT, { recursive: true });

const sh = (cmd, args) => execFileSync(cmd, args, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });

function sentences(text) {
  return text.split(/(?<=[.?!])\s+/).map(s => s.trim()).filter(Boolean);
}

function duration(file) {
  return parseFloat(sh('ffprobe', ['-v', 'error', '-show_entries', 'format=duration',
    '-of', 'default=nw=1:nk=1', file]).trim());
}

// Two-pass loudnorm. Raw Piper output sits at roughly -17 LUFS with a 0 dBTP
// peak, which crunches the moment it is encoded to AAC; measuring first and
// feeding the measurement back is what actually lands on target.
function normalize(src, dst) {
  // ffmpeg prints the measurement on STDERR, not stdout.
  const probe = require('child_process').spawnSync('ffmpeg', ['-hide_banner', '-i', src, '-af',
    `loudnorm=I=${TARGET_I}:TP=${TARGET_TP}:LRA=11:print_format=json`, '-f', 'null', '-'],
    { encoding: 'utf8' }).stderr;
  const m = probe.match(/\{[\s\S]*?\}/);
  const j = JSON.parse(m[0]);
  execFileSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-i', src, '-af',
    `loudnorm=I=${TARGET_I}:TP=${TARGET_TP}:LRA=11:measured_I=${j.input_i}:measured_TP=${j.input_tp}:` +
    `measured_LRA=${j.input_lra}:measured_thresh=${j.input_thresh}:` +
    `offset=${j.target_offset}:linear=true,aresample=48000`,
    '-ac', '2', '-ar', '48000', dst]);
}

// Synthesize every line first, in one process, then normalize each clip.
const jobs = [];
for (let i = 0; i < SCENES.length; i++) {
  sentences(SCENES[i].narration || '').forEach((text, j) => jobs.push({
    text, i, j, out: `${OUT}/${String(i).padStart(2, '0')}-${String(j).padStart(2, '0')}.raw.wav`,
  }));
}
console.log(`synthesizing ${jobs.length} lines with ${VOICE} at speed ${SPEED}...`);
execFileSync('python3', [KOKORO_PY, VOICE, String(SPEED)],
  { input: JSON.stringify(jobs), encoding: 'utf8', maxBuffer: 1 << 24 });

// PRODUCTION.md §2: assert per line, not by total duration. TTS has failed by
// producing 0 of 12 lines and by producing 10 of 12, and both pass a total check.
const missing = jobs.filter(j => !fs.existsSync(j.out) || fs.statSync(j.out).size < 2000);
if (missing.length) {
  console.error(`${missing.length} line(s) did not synthesize:`);
  for (const m of missing) console.error(`  ${m.i}/${m.j} ${m.text.slice(0, 60)}`);
  process.exit(1);
}

const manifest = [];
for (let i = 0; i < SCENES.length; i++) {
  const sc = SCENES[i];
  const lines = sentences(sc.narration || '');
  const clips = [];
  for (let j = 0; j < lines.length; j++) {
    const base = `${OUT}/${String(i).padStart(2, '0')}-${String(j).padStart(2, '0')}`;
    normalize(`${base}.raw.wav`, `${base}.wav`);
    fs.unlinkSync(`${base}.raw.wav`);
    const d = duration(`${base}.wav`);
    if (d < 0.5) { console.error(`line ${i}/${j} is ${d}s - too short to be speech`); process.exit(1); }
    clips.push({ text: lines[j], file: `${base}.wav`, sec: Number(d.toFixed(3)) });
    process.stdout.write(`  ${sc.id} [${j}] ${d.toFixed(2)}s  ${lines[j].slice(0, 58)}\n`);
  }
  // Type C tails (TONE-AND-SPEED.md): 1.5s on a command frame, 3.5s on a
  // result frame - the viewer is reading a table, not watching typing.
  // Type C tails. The floor is 3.5s on a result frame and the spec says "more
  // if the output is a table" - every result frame here is a table, a plan or a
  // captured statement, so they take 5.0s.
  const tail = sc.kind === 'lockup' ? 2.0
             : sc.kind === 'result' ? 5.0
             : 1.5;
  manifest.push({ index: i, id: sc.id, label: sc.label, kind: sc.kind,
                  steps: sc.steps, tail, clips });
}

// One wav per scene: the sentence clips with the breath between them, so the
// recorder holds exactly as long as the audio it will be muxed against.
for (const sc of manifest) {
  const list = `${OUT}/${String(sc.index).padStart(2, '0')}.txt`;
  const silence = `${OUT}/gap.wav`;
  if (!fs.existsSync(silence)) {
    execFileSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-f', 'lavfi',
      '-i', `anullsrc=r=48000:cl=stereo`, '-t', String(GAP), silence]);
  }
  const parts = [];
  sc.clips.forEach((c, k) => { if (k) parts.push(silence); parts.push(c.file); });
  if (!parts.length) {                       // a frame with no voice over it
    const q = `${OUT}/quiet-${String(sc.index).padStart(2, '0')}.wav`;
    execFileSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-f', 'lavfi',
      '-i', 'anullsrc=r=48000:cl=stereo', '-t', '0.30', q]);
    parts.push(q);
  }
  fs.writeFileSync(list, parts.map(p => `file '${path.basename(p)}'`).join('\n') + '\n');
  const out = `${OUT}/scene-${String(sc.index).padStart(2, '0')}.wav`;
  execFileSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-f', 'concat',
    '-safe', '0', '-i', list, '-c', 'copy', out]);
  sc.audio = out;
  sc.sec = Number(duration(out).toFixed(3));
  sc.gap = GAP;
}

fs.writeFileSync(DECK.manifest, JSON.stringify(manifest, null, 2));
const total = manifest.reduce((a, s) => a + s.sec, 0);
console.log(`\n${manifest.length} scenes, ${manifest.reduce((a,s)=>a+s.clips.length,0)} clips, ` +
            `${(total / 60).toFixed(2)} min of narration`);
