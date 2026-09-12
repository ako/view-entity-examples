//
// Mux each clip against the narration it was timed to, then join them.
//
// Per clip rather than one long track on one long video: the capture's frame
// rate wobbles when the page is busy, so a single track drifts against the
// picture and the drift is cumulative. Here every clip is pinned to its own
// audio, and a clip that came out short is padded by holding its last frame -
// legitimate on a static screen, which is what these are.
//
const { execFileSync, spawnSync } = require('child_process');
const fs = require('fs');

const { deck } = require('./deck.js');
const DECK = deck(process.argv);
const OUT = DECK.outDir;
const BED = 'audio/bed.wav';
fs.mkdirSync(OUT, { recursive: true });

const manifest = JSON.parse(fs.readFileSync(DECK.manifest, 'utf8'));
const anchors = JSON.parse(fs.readFileSync(DECK.clipsJson, 'utf8'));
const dur = f => parseFloat(execFileSync('ffprobe',
  ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', f],
  { encoding: 'utf8' }).trim());

const parts = [];
for (const sc of manifest) {
  const n = String(sc.index).padStart(2, '0');
  const vin = `${DECK.clipDir}/scene-${n}.webm`;
  const ain = `${DECK.audioDir}/scene-${n}.wav`;
  const out = `${OUT}/scene-${n}.mp4`;
  const target = sc.sec + (sc.tail || 1.5);
  const have = dur(vin);
  const a = anchors.find(x => x.index === sc.index);

  // Map the recorded clip back onto real time before doing anything else.
  // video_t = preroll*scale + scale * timeline_t, so playing it at 1/scale and
  // starting at preroll*scale puts caption N back where the audio expects it.
  // Correcting the offset alone is the trap: it is right at the start and
  // seconds wrong by the end.
  const scale = a.scale;
  const head = a.preroll * scale;

  // The bed sits under the narration and drops to near-silence under result
  // frames - silence is a legitimate instruction to read (training-video.md).
  const bedDb = sc.kind === 'result' ? -16 : 0;   // relative to the -32 LUFS bed
  const bedAt = (sc.index * 7) % 60;              // a different stretch per scene
  const r = spawnSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error',
    '-ss', head.toFixed(3), '-i', vin, '-i', ain,
    '-ss', String(bedAt), '-t', target.toFixed(3), '-i', BED,
    // hold the last frame if the capture came up short, then cut both streams
    // at the same instant so nothing accumulates into the next clip
    '-vf', `setpts=PTS/${scale.toFixed(5)},tpad=stop_mode=clone:stop_duration=5,` +
           `fps=30,scale=1920:1080,format=yuv420p`,
    '-filter_complex',
      `[1:a]apad=pad_dur=5,atrim=0:${target.toFixed(3)}[v];` +
      `[2:a]volume=${bedDb}dB,afade=t=in:st=0:d=0.8,` +
        `afade=t=out:st=${Math.max(0, target - 1.0).toFixed(2)}:d=1.0[b];` +
      `[v][b]amix=inputs=2:duration=first:normalize=0[a]`,
    '-map', '0:v', '-map', '[a]',
    '-t', String(target.toFixed(3)),
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-profile:v', 'high',
    '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-ac', '2',
    '-movflags', '+faststart', out], { encoding: 'utf8' });
  if (r.status !== 0) { console.error(r.stderr); process.exit(1); }

  const got = dur(out);
  const mapped = (have - head) / scale;
  console.log(`  ${n} ${sc.id.padEnd(11)} audio ${sc.sec.toFixed(1)}s  raw ${have.toFixed(1)}s  ` +
    `-head ${head.toFixed(2)} /scale ${scale.toFixed(3)} = ${mapped.toFixed(1)}s  ->  ${got.toFixed(2)}s` +
    (mapped + 0.05 < target ? `   (held last frame ${(target - mapped).toFixed(1)}s)` : ''));
  parts.push(out);
}

fs.writeFileSync(`${OUT}/list.txt`, parts.map(p => `file '${require('path').basename(p)}'`).join('\n') + '\n');
execFileSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-f', 'concat', '-safe', '0',
  '-i', `${OUT}/list.txt`, '-c', 'copy', '-movflags', '+faststart',
  DECK.output]);

// Look at what was actually filmed. Spot-checking two clips is how a wrong
// offset survives three rounds of cuts; one frame from the middle of EVERY clip
// is cheap and catches a scene that recorded blank or landed on the wrong step.
const sheetDir = `capture/${DECK.name}/sheet`;
fs.mkdirSync(sheetDir, { recursive: true });
parts.forEach((p, i) => {
  const mid = dur(p) / 2;
  execFileSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-ss', String(mid),
    '-i', p, '-frames:v', '1', '-vf', 'scale=640:-1',
    `${sheetDir}/${String(i).padStart(2, '0')}.png`]);
});
execFileSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-pattern_type', 'glob',
  '-i', `${sheetDir}/*.png`, '-filter_complex', `tile=3x${Math.ceil(parts.length / 3)}`, DECK.sheet]);

const total = dur(DECK.output);
console.log(`\n${DECK.output}  ${Math.floor(total / 60)}m ${(total % 60).toFixed(0)}s  ` +
  `${(fs.statSync(DECK.output).size / 1e6).toFixed(1)} MB`);
console.log(`contact sheet: ${DECK.sheet}`);
