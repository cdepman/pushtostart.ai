export type ArtifactType = "jsx" | "html";

/**
 * Extract a likely title from artifact code.
 * Checks <title>, <h1>, component name, etc.
 */
function cleanTitle(raw: string): string {
  // Trim at common separator characters: — · | -
  // "La Cuenta — AI Bill Splitter · CDMX" → "La Cuenta"
  const cleaned = raw.split(/\s*[—·|]\s*/)[0].trim();
  // Also handle " - " (spaced dash, not hyphens inside words)
  const parts = cleaned.split(/\s+-\s+/);
  return parts[0].trim();
}

export function extractTitle(code: string): string | null {
  const trimmed = code.trim();

  // HTML <title> tag
  const titleTag = trimmed.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleTag && titleTag[1].trim()) return cleanTitle(titleTag[1].trim());

  // First <h1> text content (strip inner tags)
  const h1 = trimmed.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1) {
    const text = h1[1].replace(/<[^>]+>/g, "").trim();
    if (text) return cleanTitle(text);
  }

  // JSX: extract component name from "export default function ComponentName"
  const exportDefault = trimmed.match(
    /export\s+default\s+function\s+([A-Z]\w*)/
  );
  if (exportDefault) {
    // Convert PascalCase to spaced: "MyCoolApp" → "My Cool App"
    return exportDefault[1].replace(/([a-z])([A-Z])/g, "$1 $2");
  }

  // JSX: last PascalCase function/const
  const funcMatches = [
    ...trimmed.matchAll(/(?:function|const|let|var)\s+([A-Z]\w*)/g),
  ];
  if (funcMatches.length > 0) {
    const name = funcMatches[funcMatches.length - 1][1];
    return name.replace(/([a-z])([A-Z])/g, "$1 $2");
  }

  return null;
}

export function detectsAiUsage(code: string): boolean {
  const patterns = [
    /api\.anthropic\.com/i,
    /anthropic-dangerous-direct-browser-access/i,
  ];
  return patterns.some((p) => p.test(code));
}

export function detectArtifactType(code: string): ArtifactType {
  const trimmed = code.trim();

  const jsxIndicators = [
    /import\s+.*from\s+['"]react['"]/,
    /export\s+default\s+function/,
    /export\s+default\s+class/,
    /useState|useEffect|useRef|useMemo|useCallback|useContext/,
    /className=/,
    /onClick=\{/,
    /<\w+\s[^>]*\{[^}]+\}/,
    /React\./,
    /jsx/i,
  ];

  const htmlIndicators = [
    /^<!DOCTYPE\s+html/i,
    /^<html/i,
    /<script\b/i,
    /\bclass="/,
    /\bonclick="/i,
    /<\/html>/i,
    /<\/body>/i,
  ];

  const jsxScore = jsxIndicators.filter((r) => r.test(trimmed)).length;
  const htmlScore = htmlIndicators.filter((r) => r.test(trimmed)).length;

  return jsxScore > htmlScore ? "jsx" : "html";
}
