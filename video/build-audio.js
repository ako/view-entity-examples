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
const SCENES = require('./scenes.js');

const VOICE = process.env.PIPER_VOICE ||
  '/root/.local/share/piper-voices/en_GB-cori-high.onnx';
const LENGTH_SCALE = '1.0';   // verified by reading durations back, below
const GAP = 0.35;             // breath between sentences

const OUT = 'audio';
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
    'loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'],
    { encoding: 'utf8' }).stderr;
  const m = probe.match(/\{[\s\S]*?\}/);
  const j = JSON.parse(m[0]);
  execFileSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-i', src, '-af',
    `loudnorm=I=-16:TP=-1.5:LRA=11:measured_I=${j.input_i}:measured_TP=${j.input_tp}:` +
    `measured_LRA=${j.input_lra}:measured_thresh=${j.input_thresh}:` +
    `offset=${j.target_offset}:linear=true,aresample=48000`,
    '-ac', '2', '-ar', '48000', dst]);
}

const manifest = [];
for (let i = 0; i < SCENES.length; i++) {
  const sc = SCENES[i];
  const lines = sentences(sc.narration);
  const clips = [];
  for (let j = 0; j < lines.length; j++) {
    const base = `${OUT}/${String(i).padStart(2, '0')}-${String(j).padStart(2, '0')}`;
    execFileSync('piper', ['-m', VOICE, '-f', `${base}.raw.wav`,
      '--length-scale', LENGTH_SCALE, '--sentence-silence', '0'],
      { input: lines[j], stdio: ['pipe', 'pipe', 'pipe'] });
    normalize(`${base}.raw.wav`, `${base}.wav`);
    fs.unlinkSync(`${base}.raw.wav`);
    const d = duration(`${base}.wav`);
    clips.push({ text: lines[j], file: `${base}.wav`, sec: Number(d.toFixed(3)) });
    process.stdout.write(`  ${sc.id} [${j}] ${d.toFixed(2)}s  ${lines[j].slice(0, 58)}\n`);
  }
  manifest.push({ index: i, id: sc.id, label: sc.label, steps: sc.steps, clips });
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
  fs.writeFileSync(list, parts.map(p => `file '${p.replace(/^audio\//, '')}'`).join('\n') + '\n');
  const out = `${OUT}/scene-${String(sc.index).padStart(2, '0')}.wav`;
  execFileSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-f', 'concat',
    '-safe', '0', '-i', list, '-c', 'copy', out]);
  sc.audio = out;
  sc.sec = Number(duration(out).toFixed(3));
  sc.gap = GAP;
}

fs.writeFileSync('audio/manifest.json', JSON.stringify(manifest, null, 2));
const total = manifest.reduce((a, s) => a + s.sec, 0);
console.log(`\n${manifest.length} scenes, ${manifest.reduce((a,s)=>a+s.clips.length,0)} clips, ` +
            `${(total / 60).toFixed(2)} min of narration`);
