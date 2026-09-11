// Layout check: every scene, all reveals shown, as stills. Cheaper than a take,
// and the only way to notice text overflowing 1080p before recording 5 minutes.
const { chromium } = require('playwright');
const path = require('path'); const fs = require('fs');
const { deck } = require('./deck.js');
const DECK = deck(process.argv);
const SCENES = DECK.scenes;
(async () => {
  fs.mkdirSync(DECK.previewDir, { recursive: true });
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1229/chrome-linux64/chrome' });
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  for (let i = 0; i < SCENES.length; i++) {
    await p.goto('file://' + path.resolve('shell.html') + '?deck=' + DECK.name + '&scene=' + i);
    await p.evaluate(() => { for (let k = 1; k <= 6; k++) window.showStep(k); });
    await p.waitForTimeout(700);
    const f = `${DECK.previewDir}/${String(i).padStart(2, '0')}-${SCENES[i].id}.png`;
    await p.screenshot({ path: f });
    const over = await p.evaluate(() => {
      const s = document.getElementById('stage');
      return { h: s.scrollHeight, w: s.scrollWidth, ch: s.clientHeight, cw: s.clientWidth };
    });
    console.log(f, over.h > over.ch + 2 || over.w > over.cw + 2 ? `  OVERFLOW ${over.w}x${over.h} in ${over.cw}x${over.ch}` : '');
  }
  await b.close();
})();
