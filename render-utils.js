export function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// Color mixing: blend hex1 into hex2 at pct% (sRGB linear interpolation)
// Equivalent to CSS color-mix(in srgb, hex1 pct%, hex2)
export function mixHex(hex1, hex2, pct) {
  const p = pct / 100;
  const parse = (h, o) => parseInt(h.slice(o, o + 2), 16);
  const mix = (c1, c2) => Math.round(c1 * p + c2 * (1 - p));
  const toHex = x => x.toString(16).padStart(2, '0');
  const r = mix(parse(hex1, 1), parse(hex2, 1));
  const g = mix(parse(hex1, 3), parse(hex2, 3));
  const b = mix(parse(hex1, 5), parse(hex2, 5));
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// MIX ratios from beautiful-mermaid theme.ts:64-87
export const MIX = { line: 50, arrow: 85, textSec: 60, nodeStroke: 20 };

// Resolve optional DiagramColors fields for HTML template CSS
export function resolveThemeColors(colors) {
  return {
    bg: colors.bg,
    fg: colors.fg,
    line: colors.line ?? mixHex(colors.fg, colors.bg, MIX.line),
    accent: colors.accent ?? mixHex(colors.fg, colors.bg, MIX.arrow),
    muted: colors.muted ?? mixHex(colors.fg, colors.bg, MIX.textSec),
    border: colors.border ?? mixHex(colors.fg, colors.bg, MIX.nodeStroke),
  };
}
