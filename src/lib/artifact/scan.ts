export interface ScanFix {
  id: string;
  label: string;
  severity: "fix" | "warning";
}

export interface ScanResult {
  fixes: ScanFix[];
  fixedCode: string;
}

type Check = (
  code: string,
  usesAi: boolean
) => { code: string; fix?: ScanFix };

// ── Check 1: Strip hardcoded API keys ──────────────────────────────

const stripApiKeys: Check = (code) => {
  // Anthropic keys: sk-ant-api03-..., sk-ant-...
  // OpenAI keys: sk-...
  // Generic long bearer tokens
  const keyPatterns = [
    /['"]sk-ant-[A-Za-z0-9_-]{20,}['"]/g,
    /['"]sk-[A-Za-z0-9_-]{40,}['"]/g,
  ];

  let fixed = code;
  let found = false;

  for (const pattern of keyPatterns) {
    if (pattern.test(fixed)) {
      found = true;
      fixed = fixed.replace(pattern, '""');
    }
  }

  if (!found) return { code };

  return {
    code: fixed,
    fix: {
      id: "strip-api-keys",
      label: "Removed API key for security",
      severity: "fix",
    },
  };
};

// ── Check 2: Detect hardcoded image format (actual fix is in wrap.ts AI proxy) ──

const fixImageFormat: Check = (code) => {
  // Detect any hardcoded image media type — the actual runtime fix happens
  // in the AI proxy script injected by wrap.ts, which sniffs base64 magic
  // bytes at fetch time. This check just reports it in the scan readout.
  const hasHardcodedFormat =
    /(?:media_type|mediaType)\s*:\s*['"]image\/(?:jpeg|png|gif|webp)['"]/.test(code);

  if (!hasHardcodedFormat) return { code };

  return {
    code, // don't modify — wrap.ts handles this at runtime
    fix: {
      id: "fix-image-format",
      label: "Image format will be auto-detected at runtime",
      severity: "fix",
    },
  };
};

// ── Check 3: AI error handling (handled by AI proxy in wrap.ts) ───

const addAiErrorHandling: Check = (code) => {
  // Error toasts are now handled by the AI proxy script in wrap.ts.
  // This check is a no-op.
  return { code };
};

// ── Check 4: Rate limit handling (handled by AI proxy in wrap.ts) ──

const addRateLimitHandling: Check = (code, usesAi) => {
  // Rate limit toasts and error display are now handled by the AI proxy
  // script in wrap.ts. This check is a no-op.
  return { code };
};

// ── Check 5: Remove process.env references ─────────────────────────

const removeProcessEnv: Check = (code) => {
  if (!/process\.env/.test(code)) return { code };

  const fixed = code.replace(/^.*process\.env.*$/gm, "// (removed server-only reference)");

  return {
    code: fixed,
    fix: {
      id: "remove-process-env",
      label: "Removed server-only references",
      severity: "warning",
    },
  };
};

// ── Check 6: Remove require() calls ────────────────────────────────

const removeRequire: Check = (code) => {
  if (!/\brequire\s*\(/.test(code)) return { code };

  // Only remove standalone require lines, not dynamic import patterns
  const fixed = code.replace(
    /^.*\brequire\s*\(['"][^'"]+['"]\).*$/gm,
    "// (removed Node.js import)"
  );

  return {
    code: fixed,
    fix: {
      id: "remove-require",
      label: "Removed Node.js imports",
      severity: "warning",
    },
  };
};

// ── Main scanner ───────────────────────────────────────────────────

const ALL_CHECKS: Check[] = [
  stripApiKeys,
  fixImageFormat,
  addAiErrorHandling,
  addRateLimitHandling,
  removeProcessEnv,
  removeRequire,
];

export function scanAndFix(code: string, usesAi: boolean): ScanResult {
  const fixes: ScanFix[] = [];
  let current = code;

  for (const check of ALL_CHECKS) {
    const result = check(current, usesAi);
    current = result.code;
    if (result.fix) {
      fixes.push(result.fix);
    }
  }

  return { fixes, fixedCode: current };
}
