const { chromium } = require('playwright');
const { chromiumOpts } = require('./browser.js');
const fs = require('fs');
const LOG = '/home/user/view-entity-examples/app/.mxcli/runtime.log';
const mark = () => fs.statSync(LOG).size;
const marks = {};
(async () => {
  const b = await chromium.launch({ ...chromiumOpts() });
  const p = await b.newPage({ viewport: { width: 1400, height: 820 }, deviceScaleFactor: 2 });
  marks.a = mark();
  await p.goto('http://127.0.0.1:8080/p/meter-ref', { waitUntil: 'networkidle' });
  await p.waitForTimeout(5000);
  marks.b = mark();
  await p.screenshot({ path: 'capture/shots/assoc-grid.png' });
  console.log('alerts', await p.locator('.alert').count());
  console.log((await p.locator('body').innerText()).split('\n').slice(0,12).join(' | '));
  fs.writeFileSync('/tmp/amarks.json', JSON.stringify(marks));
  await b.close();
})();
