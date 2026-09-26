/**
 * write-share-pages.mjs — gives every page its own "envelope" for link previews
 * ==========================================================================
 * (Session 51, 2026-09-26, task L1.) Runs automatically after `craco build`
 * (see "build" in package.json).
 *
 * THE PROBLEM
 *   This site is a single-page React app: every URL is served the SAME file,
 *   build/index.html, and React then paints the right page with JavaScript.
 *   Link-preview robots (WhatsApp, LinkedIn, Slack...) do NOT run JavaScript.
 *   They read only that plain file, whose <meta> tags describe the HOMEPAGE
 *   with the React logo. So every shared link previewed as the homepage.
 *
 *   Analogy: WhatsApp reads the envelope, never opens the letter — and every
 *   envelope we posted carried the homepage's address label.
 *
 * THE FIX
 *   For every page listed in src/config/seoConfig.js, write a COPY of
 *   build/index.html at build/<route>/index.html with that page's own title,
 *   description, canonical URL and og:image swapped in. The hosting (Vercel)
 *   serves a real file before falling back to the catch-all rewrite in
 *   vercel.json, so the robot now reads the right label. Real visitors get
 *   the same React app as before (the copy loads the very same JS/CSS), and
 *   react-helmet-async keeps managing the tags once React starts.
 *
 *   Example: /trading/investing-from-zero → build/trading/investing-from-zero/index.html
 *            with og:title "Investing, from zero | Srinidhi BS" and the notebook image.
 *
 * SAFETY RULES
 *   - Never overwrites a file that already exists in build/ — public/ogatu
 *     (the game) and public/learn (the lessons) have their own index.html.
 *   - Skips '/' (that IS build/index.html) and '/404' (not a real URL).
 *   - After writing, reads every file back and checks the new og:title and
 *     og:image are really in it; any mismatch fails the build loudly.
 *
 * Run by hand (after a build):   node scripts/write-share-pages.mjs
 *   Needs a FRESH build/ — a second run skips every page it already wrote
 *   (the never-overwrite rule can't tell its own files from real ones).
 *   `npm run build` always starts fresh: CRA empties build/ first.
 * ==========================================================================
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';

const BUILD = 'build';
const SEO_CONFIG = 'src/config/seoConfig.js';
const SKIP = new Set(['/', '/404']);

const log = (...a) => console.log('[share-pages]', ...a);
const fail = (msg) => {
  console.error('[share-pages] ERROR:', msg);
  process.exit(1);
};

/**
 * Load seoConfig.js. It is written as an ES module for the React app, but
 * Node would treat a plain .js file in this project as old-style CommonJS and
 * choke on `export`. The file has no imports of its own, so we hand Node its
 * text as an inline ("data:") module instead — same code, no copy to maintain.
 */
async function loadSeoConfig() {
  const src = readFileSync(SEO_CONFIG, 'utf8');
  const mod = await import('data:text/javascript;charset=utf-8,' + encodeURIComponent(src));
  return { seoConfig: mod.seoConfig, defaults: mod.defaults };
}

/** Make text safe inside an HTML attribute / element ("&" → "&amp;", etc.). */
const esc = (v) =>
  String(v).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * Replace one <meta name|property="key" ...> tag with a fresh one.
 * Matches the whole tag regardless of attribute order or a trailing "/".
 * Throws if the tag is missing — public/index.html is expected to carry the
 * full set, so a missing one means someone changed it and should know.
 */
function setMeta(html, attr, key, content) {
  const re = new RegExp(`<meta\\b[^>]*\\b(?:name|property)="${key}"[^>]*>`);
  if (!re.test(html)) throw new Error(`index.html has no <meta ${attr}="${key}"> tag`);
  // A function replacer, so a "$" in the text is never read as a regex "$&" code
  return html.replace(re, () => `<meta ${attr}="${key}" content="${esc(content)}"/>`);
}

/** Build one page's HTML from the homepage's, following SEO.js's fallbacks. */
function pageHtml(baseHtml, route, page, defaults) {
  // Same fallback rules as src/components/common/SEO.js, so the envelope
  // matches what the page itself shows once React runs.
  const title = page.title || defaults.title;
  const description = page.description || defaults.description;
  const canonical = page.canonical || `${defaults.siteUrl}${route}`;
  const ogImage = page.ogImage || defaults.ogImage;
  const ogType = page.ogType || 'website';

  let html = baseHtml;
  html = setMeta(html, 'name', 'description', description);
  html = setMeta(html, 'property', 'og:type', ogType);
  html = setMeta(html, 'property', 'og:url', canonical);
  html = setMeta(html, 'property', 'og:title', title);
  html = setMeta(html, 'property', 'og:description', description);
  html = setMeta(html, 'property', 'og:image', ogImage);
  html = setMeta(html, 'name', 'twitter:title', title);
  html = setMeta(html, 'name', 'twitter:description', description);
  html = setMeta(html, 'name', 'twitter:image', ogImage);

  // Canonical link
  const canonRe = /<link\b[^>]*\brel="canonical"[^>]*>/;
  if (!canonRe.test(html)) throw new Error('index.html has no <link rel="canonical">');
  html = html.replace(canonRe, () => `<link rel="canonical" href="${esc(canonical)}"/>`);

  // <title>: public/index.html has none (Helmet sets it in the browser), so
  // add one for robots — replace it instead if a future index.html gains one.
  const titleTag = `<title>${esc(title)}</title>`;
  html = /<title>[\s\S]*?<\/title>/.test(html)
    ? html.replace(/<title>[\s\S]*?<\/title>/, () => titleTag)
    : html.replace('</head>', () => `${titleTag}</head>`);

  return { html, title, ogImage };
}

async function main() {
  const indexPath = join(BUILD, 'index.html');
  if (!existsSync(indexPath)) fail(`${indexPath} not found — run the React build first.`);
  const baseHtml = readFileSync(indexPath, 'utf8');
  const { seoConfig, defaults } = await loadSeoConfig();

  const routes = Object.keys(seoConfig);
  log(`${routes.length} routes in seoConfig.js`);
  let written = 0;

  for (const route of routes) {
    if (SKIP.has(route)) {
      log(`skip ${route} (not a separate page file)`);
      continue;
    }
    const outPath = join(BUILD, route, 'index.html');
    if (existsSync(outPath)) {
      // Something real already lives here (e.g. a copied static folder) — never clobber it
      log(`skip ${route} — ${outPath} already exists`);
      continue;
    }

    let result;
    try {
      result = pageHtml(baseHtml, route, seoConfig[route], defaults);
    } catch (e) {
      fail(`${route}: ${e.message}`);
    }
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, result.html);

    // Self-check: read it back and make sure the new label really landed
    const back = readFileSync(outPath, 'utf8');
    const want = [
      `property="og:title" content="${esc(result.title)}"`,
      `property="og:image" content="${esc(result.ogImage)}"`,
    ];
    for (const w of want) if (!back.includes(w)) fail(`${outPath} is missing: ${w}`);

    written += 1;
    log(`wrote ${outPath}  (og:image ${result.ogImage.replace(defaults.siteUrl, '')})`);
  }

  log(`done — ${written} page envelopes written`);
}

main();
