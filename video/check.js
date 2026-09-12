//
// The check that catches the most (PRODUCTION.md §12). Runs on EVERY scene of a
// deck, not a sample, and exits non-zero so the build stops.
//
// Two of these are only enforceable in the rendered page rather than in the
// source - the computed font family, and whether anything actually extends past
// y880 - so the page is opened in the same browser the film is recorded with and
// the assertions are made against the computed style and real geometry.
//
const { chromium } = require('playwright');
const { deck } = require('./deck.js');
const fs = require('fs');
const path = require('path');

const SAFE_BOTTOM = 880, SAFE_TOP = 152, SAFE_L = 96, SAFE_R = 1824;

// Banned glyphs are derived from the shipped file's cmap, never inherited as a
// list. Regenerate with scripts/cmap.py after changing the font.
const CMAP = new Set(JSON.parse(fs.readFileSync('fonts/cmap.json', 'utf8')));

(async () => {
  const DECK = deck(process.argv);
  const fails = [];
  const note = (scene, msg) => fails.push(`${DECK.name}/${scene}: ${msg}`);

  // --- source-level checks -------------------------------------------------
  for (const sc of DECK.scenes) {
    const h = sc.html;

    if (/border-radius|box-shadow/.test(h)) note(sc.id, 'border-radius or box-shadow in scene markup');
    const light = h.match(/background:\s*#(?:[89a-f][0-9a-f]{5}|fff|f[0-9a-f]{5})/gi);
    if (light) note(sc.id, `light background ${light.join(', ')}`);
    if (/font-family/i.test(h)) note(sc.id, 'scene sets its own font-family');

    // every character must resolve in the shipped font
    const text = h.replace(/<[^>]*>/g, ' ')
      .replace(/&mdash;/g, '—').replace(/&middot;/g, '·')
      .replace(/&hellip;/g, '…').replace(/&ndash;/g, '–')
      .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ');
    const tofu = [...new Set([...text])].filter(c => c.charCodeAt(0) > 31 && !CMAP.has(c.codePointAt(0)));
    if (tofu.length) note(sc.id, `glyphs absent from the shipped cmap: ${tofu.map(c => JSON.stringify(c)).join(' ')}`);

    // an abbreviated capture must say so: a header naming N items, or an
    // ellipsis row, has to carry a "... N more" marker
    const counted = h.match(/\((\d+)\)\s*:/);
    const hasMore = /\.\.\.\s*\d+\s+more|--[^<\n]*\b\d+\b[^<\n]*(?:more|guards|joins|lines|attributes|columns|terms)|\d+ of \d+/.test(h);
    const ellipsisOutsidePaths = h.replace(/\.\.\.\//g, '').includes('...');
    if (ellipsisOutsidePaths && !hasMore) note(sc.id, 'output is abbreviated with no "... N more" marker');
    if (counted && !hasMore) note(sc.id, `header claims ${counted[1]} items with no truncation marker`);
  }

  // --- rendered checks -----------------------------------------------------
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium-1229/chrome-linux64/chrome',
  });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  const url = 'file://' + path.resolve('shell.html');

  for (let i = 0; i < DECK.scenes.length; i++) {
    const sc = DECK.scenes[i];
    await page.goto(`${url}?deck=${DECK.name}&scene=${i}`);
    await page.evaluate(() => { for (let k = 1; k <= 6; k++) window.showStep(k); });
    await page.waitForTimeout(700);   // let the reveal transitions settle

    const r = await page.evaluate(({ bottom, left, right, top }) => {
      const out = { fonts: new Set(), mono: [], over: [], ligatures: null, ground: null };
      out.ground = getComputedStyle(document.body).backgroundColor;
      out.ligatures = getComputedStyle(document.body).fontVariantLigatures;
      for (const el of document.querySelectorAll('#stage *, #stage')) {
        const cs = getComputedStyle(el);
        out.fonts.add(cs.fontFamily);
        // a mono role that does not set MONO 1 silently falls back and columns
        // stop lining up, so assert the axis rather than the keyword
        if (/monospace/.test(cs.fontFamily) && !/"MONO"\s*1/.test(cs.fontVariationSettings)) {
          out.mono.push(el.tagName + '.' + (el.className || ''));
        }
        const b = el.getBoundingClientRect();
        if (b.width && b.height &&
            (b.bottom > bottom + 0.5 || b.top < top - 0.5 || b.left < left - 0.5 || b.right > right + 0.5)) {
          out.over.push(`${el.tagName}.${String(el.className).slice(0, 24)} ` +
                        `[${Math.round(b.left)},${Math.round(b.top)} -> ${Math.round(b.right)},${Math.round(b.bottom)}]`);
        }
      }
      for (const id of ['chrome-l', 'chrome-r']) {
        const cs = getComputedStyle(document.getElementById(id));
        out.fonts.add(cs.fontFamily);
      }
      // "Exactly one accent event per frame" is a design rule enforceable as a
      // measurement, so measure it in the rendered page rather than trusting a
      // class name: count the elements that INTRODUCE the accent colour (a
      // child that merely inherits it is the same event).
      const ACCENT = 'rgb(63, 189, 184)';
      const introduces = (el) => {
        const cs = getComputedStyle(el);
        const p = el.parentElement ? getComputedStyle(el.parentElement) : null;
        if (cs.backgroundColor === ACCENT) return true;
        if (cs.borderLeftColor === ACCENT && parseFloat(cs.borderLeftWidth) > 0) return true;
        return cs.color === ACCENT && (!p || p.color !== ACCENT);
      };
      out.accent = [];
      for (const el of document.querySelectorAll('#stage, #stage *')) {
        if (introduces(el)) {
          // a run of sibling bars painted by one rule is one event
          const key = el.tagName === 'I' ? 'bars:' + el.parentElement.className : null;
          if (key && out.accent.includes(key)) continue;
          out.accent.push(key || el.tagName + '.' + String(el.className).slice(0, 20));
        }
      }
      const cl = document.getElementById('chrome-l').getBoundingClientRect();
      const rl = document.getElementById('chrome-rule').getBoundingClientRect();
      out.chrome = { top: Math.round(cl.top), ruleTop: Math.round(rl.top),
                     hidden: getComputedStyle(document.getElementById('chrome-l')).display === 'none' };
      out.fonts = [...out.fonts];
      return out;
    }, { bottom: SAFE_BOTTOM, left: SAFE_L, right: SAFE_R, top: sc.noChrome ? SAFE_TOP : SAFE_TOP });

    const bad = r.fonts.filter(f => !/^"?Recursive"?\s*,\s*(sans-serif|monospace)$/.test(f.trim()));
    if (bad.length) note(sc.id, `font-family other than Recursive: ${bad.join(' | ')}`);
    if (r.mono.length) note(sc.id, `mono role without "MONO" 1: ${r.mono.slice(0, 3).join(', ')}`);
    if (r.ligatures !== 'none') note(sc.id, `font-variant-ligatures is "${r.ligatures}", must be none`);
    if (r.ground !== 'rgb(14, 17, 22)') note(sc.id, `ground is ${r.ground}, must be #0e1116`);
    if (r.over.length) note(sc.id, `outside the safe area: ${r.over.slice(0, 3).join(' ; ')}`);
    if (r.accent.length !== 1) {
      note(sc.id, `${r.accent.length} accent events, must be exactly 1` +
        (r.accent.length ? `: ${r.accent.join(', ')}` : ''));
    }
    if (!sc.noChrome) {
      if (r.chrome.hidden) note(sc.id, 'chrome suppressed on a non-declarative frame');
      if (r.chrome.top !== 52) note(sc.id, `chrome label top ${r.chrome.top}, must be 52 (baseline y76)`);
      if (r.chrome.ruleTop !== 104) note(sc.id, `hairline at y${r.chrome.ruleTop}, must be y104`);
    } else if (!r.chrome.hidden) {
      note(sc.id, 'chrome drawn on a declarative frame');
    }
  }

  await browser.close();

  if (fails.length) {
    console.error(`\n${fails.length} conformance failure(s):`);
    for (const f of fails) console.error('  x ' + f);
    process.exit(1);
  }
  console.log(`${DECK.scenes.length} scenes: conformance OK ` +
    `(font, ligatures, MONO axis, one accent, flat plane, safe area, cmap, truncation markers)`);
})();
