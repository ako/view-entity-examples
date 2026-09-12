// What the data grid on Trends.MeterMonths asks the database, captured while a
// browser drives it. Run the app first (app/mxcli run --local), turn the SQL
// log on (app/mxcli log set ConnectionBus_Retrieve=TRACE), then:
//
//   node scripts/capture-grid.js
//
// It records the runtime log's size before each interaction, so the statements
// belonging to a click can be cut out of the log afterwards; the offsets land
// in /tmp/marks.json and docs/sql/08-grid-retrieve.sql is built from them.
const { chromium } = require('playwright');
const fs = require('fs');
const LOG = require('path').resolve(__dirname, '../../app/.mxcli/runtime.log');
const mark = () => fs.statSync(LOG).size;
const marks = {};

(async () => {
  const b = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH ||
      '/opt/pw-browsers/chromium-1229/chrome-linux64/chrome',
  });
  const p = await b.newPage({ viewport: { width: 1400, height: 820 }, deviceScaleFactor: 2 });

  marks.load = mark();
  await p.goto('http://127.0.0.1:8080/', { waitUntil: 'networkidle' });
  await p.waitForTimeout(4000);
  await p.screenshot({ path: 'capture/shots/grid.png' });

  marks.sort = mark();
  const kwh = p.locator('[role="columnheader"]').filter({ hasText: 'Total kWh' }).first();
  await kwh.click(); await p.waitForTimeout(2000);   // ascending
  await kwh.click(); await p.waitForTimeout(2500);   // descending
  await p.screenshot({ path: 'capture/shots/grid-sorted.png' });

  marks.page = mark();
  const next = p.locator('button[aria-label*="next" i]').first();
  if (await next.count()) { await next.click(); await p.waitForTimeout(2500); }
  await p.screenshot({ path: 'capture/shots/grid-page2.png' });

  marks.end = mark();
  fs.writeFileSync('/tmp/marks.json', JSON.stringify(marks, null, 1));
  console.log(marks);
  await b.close();
})();
