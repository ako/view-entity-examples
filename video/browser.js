// Where Chromium is. The container bakes one in at a fixed path; a laptop does
// not, so every launcher goes through here and CHROMIUM_PATH overrides it.
// Unset on a machine with Playwright's own download, leave executablePath off
// entirely and Playwright finds it.
const FALLBACK = '/opt/pw-browsers/chromium-1229/chrome-linux64/chrome';
function chromiumOpts() {
  const p = process.env.CHROMIUM_PATH || (require('fs').existsSync(FALLBACK) ? FALLBACK : null);
  return p ? { executablePath: p } : {};
}
module.exports = { chromiumOpts };
