// WCAG 2.1 contrast audit for Relay's text palette.
// AA: 4.5:1 normal text, 3:1 large text (>=18.66px, or >=14px bold). AAA: 7:1 / 4.5:1.
const hex = (h) => h.replace("#", "").match(/.{2}/g).map((x) => parseInt(x, 16));
const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const L = (h) => { const [r, g, b] = hex(h); return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b); };
const ratio = (a, b) => { const [x, y] = [L(a), L(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };

const pairs = [
  ["ink",            "#1c1917", "#ffffff", "body / headings on surface"],
  ["ink on canvas",  "#1c1917", "#f7f7f6", "body on app canvas"],
  ["muted",          "#5f5a55", "#ffffff", "secondary text (dates, captions)"],
  ["faint",          "#6f6962", "#ffffff", "tertiary text (micro-labels)"],
  ["accent",         "#6e56cf", "#ffffff", "kickers, links, small accent text"],
  ["white on accent","#ffffff", "#6e56cf", "primary button label"],
  ["positive",       "#15803d", "#ecfdf3", "approved pill"],
  ["warn",           "#b45309", "#fef3e2", "at-risk pill"],
];

const pad = (s, n) => s.padEnd(n);
console.log(pad("token", 18), pad("ratio", 9), "AA-normal  AA-large  use");
for (const [name, fg, bg, use] of pairs) {
  const r = ratio(fg, bg);
  const aaN = r >= 4.5 ? "PASS" : "FAIL";
  const aaL = r >= 3 ? "PASS" : "FAIL";
  console.log(pad(name, 18), pad(r.toFixed(2) + ":1", 9), pad(aaN, 10), pad(aaL, 9), use);
}
