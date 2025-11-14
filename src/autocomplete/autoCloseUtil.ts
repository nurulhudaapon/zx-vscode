const VOID_TAGS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

/**
 * Pure helper (no vscode imports) that decides whether to auto-close a tag.
 */
export function shouldAutoCloseTag(textUpToPos: string): string | null {
  const lastLt = textUpToPos.lastIndexOf("<");
  if (lastLt === -1) return null;

  const fragment = textUpToPos.slice(lastLt);
  // Avoid closing tags or comments
  if (fragment.startsWith("</") || fragment.startsWith("<!--")) return null;

  // If there are unmatched quotes inside the fragment, skip (we're likely inside an attribute)
  const sub = fragment;
  const doubleQuotes = (sub.match(/"/g) || []).length;
  const singleQuotes = (sub.match(/'/g) || []).length;
  if (doubleQuotes % 2 === 1 || singleQuotes % 2 === 1) return null;

  // Match a complete opening tag: <tag ...>
  const re = /^<([A-Za-z][\w:-]*)\b[^>]*>$/;
  const m = re.exec(fragment);
  if (!m) return null;

  const full = m[0];
  const tag = m[1];

  // Skip void tags
  if (VOID_TAGS.has(tag.toLowerCase())) return null;

  // Skip self-closing like <x />
  if (/\/>\s*$/.test(full)) return null;

  return tag;
}

export default shouldAutoCloseTag;
