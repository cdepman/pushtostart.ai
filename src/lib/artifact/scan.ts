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

// ── Check 3: Add AI error handling ─────────────────────────────────

const addAiErrorHandling: Check = (code, usesAi) => {
  if (!usesAi) return { code };

  // Check if there's already reasonable error handling
  const hasCatch = /\.catch\s*\(/.test(code) || /catch\s*\(/.test(code);
  if (hasCatch) return { code };

  // Inject a global unhandled rejection handler for friendly error messages
  const handler = `
// [PushToStart] Friendly error handler for AI calls
window.addEventListener('unhandledrejection', function(e) {
  if (e.reason && typeof e.reason.message === 'string') {
    var msg = e.reason.message;
    if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
      alert('Having trouble connecting to AI. Please check your internet and try again.');
    } else if (msg.includes('400')) {
      alert('The AI request had an issue. Try again with a different input.');
    } else if (msg.includes('500') || msg.includes('503')) {
      alert('The AI service is temporarily unavailable. Please try again in a moment.');
    }
  }
});
`;

  return {
    code: handler + code,
    fix: {
      id: "ai-error-handling",
      label: "Added friendly error messages",
      severity: "fix",
    },
  };
};

// ── Check 4: Add rate limit handling ───────────────────────────────

const addRateLimitHandling: Check = (code, usesAi) => {
  if (!usesAi) return { code };

  // Check if 429 is already handled
  if (/429/.test(code) || /rate.?limit/i.test(code)) return { code };

  // Inject a fetch wrapper that handles 429s gracefully
  const handler = `
// [PushToStart] Rate limit handler
(function() {
  var _ptsFetch = window.fetch;
  window.fetch = function() {
    return _ptsFetch.apply(window, arguments).then(function(res) {
      if (res.status === 429) {
        var toast = document.createElement('div');
        toast.textContent = 'Slow down! Please wait a moment before trying again.';
        toast.style.cssText = 'position:fixed;top:16px;left:50%;transform:translateX(-50%);background:#ef4444;color:#fff;padding:12px 24px;border-radius:8px;z-index:99999;font-size:14px;';
        document.body.appendChild(toast);
        setTimeout(function() { toast.remove(); }, 4000);
      }
      return res;
    });
  };
})();
`;

  return {
    code: handler + code,
    fix: {
      id: "rate-limit-handling",
      label: "Added rate limit handling",
      severity: "fix",
    },
  };
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
