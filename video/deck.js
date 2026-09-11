// Which film is being built. Every script takes --deck <name>; a deck is a
// directory under decks/ holding deck.json (title + output file) and scenes.js
// (what is said and shown). Everything else - the overlay, the stylesheet, the
// timing rules - is shared, which is the point of splitting them out.
const fs = require('fs');
const path = require('path');

function deck(argv) {
  const i = argv.indexOf('--deck');
  const name = i >= 0 ? argv[i + 1] : 'odata-key';
  const dir = path.join('decks', name);
  if (!fs.existsSync(dir)) {
    console.error(`no such deck: ${name}\navailable: ${fs.readdirSync('decks').join(', ')}`);
    process.exit(1);
  }
  const meta = JSON.parse(fs.readFileSync(path.join(dir, 'deck.json'), 'utf8'));
  return {
    name, dir, meta,
    scenes: require(path.resolve(dir, 'scenes.js')),
    audioDir: path.join('audio', name),
    rawDir: path.join('capture', name, 'raw'),
    clipDir: path.join('capture', name, 'clips'),
    outDir: path.join('capture', name, 'out'),
    previewDir: path.join('capture', name, 'preview'),
    sheet: path.join('capture', name, 'contact-sheet.png'),
    clipsJson: path.join('capture', name, 'clips.json'),
    manifest: path.join('audio', name, 'manifest.json'),
    output: meta.output,
  };
}
module.exports = { deck };
