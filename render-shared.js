import crypto from 'node:crypto';
import { Marked } from 'marked';
import { renderMermaidSVG } from '@ktrysmt/beautiful-mermaid';
import { createHighlighterCoreSync } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';
import { bundledThemes } from 'shiki/themes';
import { bundledLanguages } from 'shiki/langs';
import { escapeHtml, resolveThemeColors } from './render-utils.js';

const SHIKI_THEME_IDS = [
  'nord', 'dracula', 'one-dark-pro',
  'github-dark', 'github-light',
  'solarized-dark', 'solarized-light',
  'catppuccin-mocha', 'catppuccin-latte',
  'tokyo-night', 'one-light',
  'everforest-light', 'min-dark', 'min-light',
];

const SHIKI_LANG_IDS = [
  'javascript', 'typescript', 'python', 'shellscript',
  'go', 'rust', 'java', 'c', 'cpp',
  'ruby', 'php', 'html', 'css', 'json',
  'yaml', 'toml', 'sql', 'markdown', 'diff',
];

let _hl = null;

export async function initHighlighter() {
  if (_hl) return;
  const [themes, langs] = await Promise.all([
    Promise.all(SHIKI_THEME_IDS.map(id => bundledThemes[id]().then(m => m.default))),
    Promise.all(SHIKI_LANG_IDS.map(id => bundledLanguages[id]().then(m => m.default))),
  ]);
  _hl = createHighlighterCoreSync({
    themes,
    langs,
    engine: createJavaScriptRegexEngine(),
  });
}

export const WIDTH_TOGGLE_SCRIPT = "(function(){var b=document.body,g=document.querySelector('.memd-width-toggle');if(!g)return;var sb=document.querySelector('.memd-sidebar');if(sb){sb.insertBefore(g,sb.firstChild);g.style.position='static';g.style.margin='0 0 0.5rem 0';g.style.width='auto'}var btns=g.querySelectorAll('.memd-wt-btn');function u(){var f=b.classList.contains('memd-full-width');btns.forEach(function(n){n.classList.toggle('active',n.dataset.mode===(f?'full':'smart'))})}if(localStorage.getItem('memd-width')==='full')b.classList.add('memd-full-width');u();btns.forEach(function(n){n.onclick=function(){if(n.dataset.mode==='full'){b.classList.add('memd-full-width');localStorage.setItem('memd-width','full')}else{b.classList.remove('memd-full-width');localStorage.setItem('memd-width','smart')}u()}})})();";

export const MERMAID_MODAL_SCRIPT = [
  "document.addEventListener('click',function(e){var d=e.target.closest('.mermaid-diagram');if(d){var o=document.createElement('div');o.className='mermaid-modal';o.innerHTML=d.querySelector('svg').outerHTML;o.onclick=function(){o.remove()};document.body.appendChild(o)}});",
  "document.addEventListener('keydown',function(e){if(e.key==='Escape'){var m=document.querySelector('.mermaid-modal');if(m)m.remove()}});",
].join('');

export function convertMermaidToSVG(markdown, diagramTheme) {
  const mermaidRegex = /```mermaid\s+([\s\S]+?)```/g;
  let svgIndex = 0;
  return markdown.replace(mermaidRegex, (_, code) => {
    try {
      const prefix = `m${svgIndex++}`;
      let svg = renderMermaidSVG(code.trim(), diagramTheme);
      svg = svg.replace(/@import url\([^)]+\);\s*/g, '');
      // Prefix all id="..." and url(#...) to avoid cross-SVG collisions
      // Note: regex uses ` id=` (with leading space) to avoid matching `data-id`
      svg = svg.replace(/ id="([^"]+)"/g, ` id="${prefix}-$1"`);
      svg = svg.replace(/url\(#([^)]+)\)/g, `url(#${prefix}-$1)`);
      return svg;
    } catch (e) {
      return `<pre class="mermaid-error">${escapeHtml(e.message)}\n\n${escapeHtml(code.trim())}</pre>`;
    }
  });
}

const htmlMarked = new Marked();

// NOTE: Raw HTML in markdown (CSS, HTML tags) is passed through unsanitized.
// JavaScript in markdown IS executable via inline HTML. This is intentional for a
// development-only tool; CSS/HTML authoring in markdown is a useful feature.
// The serve path mitigates XSS via CSP nonce-based script-src.
export function renderToHTML(markdown, diagramColors, shikiTheme) {
  const processed = convertMermaidToSVG(markdown, diagramColors);
  // Protect trusted SVGs/error blocks from HTML sanitization by replacing with placeholders
  const nonce = crypto.randomUUID();
  const svgStore = [];
  const withPlaceholders = processed.replace(/<svg[\s\S]*?<\/svg>|<pre class="mermaid-error">[\s\S]*?<\/pre>/g, (match) => {
    const id = svgStore.length;
    svgStore.push(match);
    return `MEMD_SVG_${nonce}_${id}`;
  });
  let markedInstance = htmlMarked;
  if (shikiTheme && _hl) {
    markedInstance = new Marked();
    markedInstance.use({
      renderer: {
        code({ text, lang }) {
          const loadedLangs = _hl.getLoadedLanguages();
          const effectiveLang = (lang && loadedLangs.includes(lang)) ? lang : null;
          if (effectiveLang) {
            return _hl.codeToHtml(text, { lang: effectiveLang, theme: shikiTheme });
          }
          return `<pre><code class="language-${escapeHtml(lang || '')}">${escapeHtml(text)}</code></pre>`;
        }
      }
    });
  }
  let body = markedInstance.parse(withPlaceholders);
  // Restore SVGs and wrap Mermaid diagrams in scrollable containers
  for (let i = 0; i < svgStore.length; i++) {
    const stored = svgStore[i];
    const wrapped = stored.startsWith('<svg')
      ? `<div class="mermaid-diagram">${stored}</div>`
      : stored;
    body = body.replace(`MEMD_SVG_${nonce}_${i}`, wrapped);
  }
  // Unwrap <p> tags around block-level mermaid containers
  body = body.replace(/<p>\s*(<div class="mermaid-diagram">[\s\S]*?<\/div>)\s*<\/p>/g, '$1');
  const t = resolveThemeColors(diagramColors);

  const titleMatch = markdown.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${title ? `<title>${escapeHtml(title)}</title>` : ''}
<style>
body { background: ${t.bg}; color: ${t.fg}; font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; max-width: 70%; margin: 0 auto; padding: 2rem 1rem; }
@media (max-width: 1024px) { body { max-width: 85%; } }
@media (max-width: 768px) { body { max-width: 100%; } }
body.memd-full-width { max-width: none; margin: 0; }
.memd-width-toggle { position: fixed; top: 0.5rem; left: 0.5rem; z-index: 11; display: inline-flex; border-radius: 6px; overflow: hidden; border: 1px solid ${t.line}; font-size: 0; }
.memd-wt-btn { background: color-mix(in srgb, ${t.fg} 5%, ${t.bg}); border: none; color: ${t.muted}; padding: 0.25rem 0.5rem; cursor: pointer; font-size: 0.7rem; display: inline-flex; align-items: center; gap: 0.25rem; line-height: 1; }
.memd-wt-btn + .memd-wt-btn { border-left: 1px solid ${t.line}; }
.memd-wt-btn:hover { background: color-mix(in srgb, ${t.fg} 12%, ${t.bg}); }
.memd-wt-btn.active { background: color-mix(in srgb, ${t.accent} 18%, ${t.bg}); color: ${t.accent}; }
.memd-wt-btn svg { width: 12px; height: 12px; flex-shrink: 0; }
a { color: ${t.accent}; }
hr { border-color: ${t.line}; }
blockquote { border-left: 3px solid ${t.line}; color: ${t.muted}; padding-left: 1rem; }
svg { max-width: 100%; height: auto; }
.mermaid-diagram { cursor: zoom-in; text-align: center; }
.mermaid-modal { position: fixed; inset: 0; background: rgba(0,0,0,.5); z-index: 9999; display: flex; align-items: center; justify-content: center; cursor: zoom-out; padding: 2rem; }
.mermaid-modal svg { max-width: calc(100vw - 4rem); max-height: calc(100vh - 4rem); }
pre { background: color-mix(in srgb, ${t.fg} 8%, ${t.bg}); padding: 1rem; border-radius: 6px; overflow-x: auto; border: 1px solid ${t.line}; }
code { font-family: ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas, monospace; font-size: 0.95rem; color: ${t.accent}; background: color-mix(in srgb, ${t.fg} 8%, ${t.bg}); padding: 0.15em 0.35em; border-radius: 3px; }
pre code { color: inherit; background: none; padding: 0; border-radius: 0; font-size: 0.95rem; }
pre.shiki { padding: 1rem; border-radius: 6px; overflow-x: auto; border: 1px solid ${t.line}; }
pre.shiki code { font-size: 0.95rem; }
table { border-collapse: collapse; }
th, td { border: 1px solid ${t.line}; padding: 0.4rem 0.8rem; }
th { background: color-mix(in srgb, ${t.fg} 5%, ${t.bg}); }
.mermaid-error { background: color-mix(in srgb, ${t.accent} 10%, ${t.bg}); border: 1px solid color-mix(in srgb, ${t.accent} 40%, ${t.bg}); color: ${t.fg}; padding: 1rem; border-radius: 6px; overflow-x: auto; white-space: pre-wrap; }
</style>
<!--memd:head-->
</head>
<body>
<div class="memd-width-toggle" role="group" aria-label="Width toggle"><button class="memd-wt-btn" data-mode="smart"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 8h5m4 0h5"/><path d="M4 5l3 3-3 3m8-6l-3 3 3 3"/></svg>Smart</button><button class="memd-wt-btn" data-mode="full"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 8h14"/><path d="M4 5L1 8l3 3m8-6l3 3-3 3"/></svg>Full</button></div>
<!--memd:content-->
${body.trimEnd()}
<!--/memd:content-->
<!--memd:scripts-->
</body>
</html>
`;
}
