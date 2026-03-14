interface RateLimiterResult {
  success: boolean;
}

interface RateLimiterBinding {
  limit(options: { key: string }): Promise<RateLimiterResult>;
}

export interface Env {
  SITE_BUCKET: R2Bucket;
  ANTHROPIC_API_KEY: string;
  AI_RATE_LIMITER: RateLimiterBinding;
}

const DOMAIN = "pushtostart.ai";

const RESERVED_SUBDOMAINS = [
  "api",
  "www",
  "app",
  "admin",
  "mail",
  "ftp",
  "cdn",
];

const MAX_TOKENS_CAP = 4096;
const ANTHROPIC_API_BASE = "https://api.anthropic.com";

const VALID_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
]);

/** Detect image format from base64 magic bytes */
function detectImageFormat(b64: string): string {
  const d = b64.replace(/^data:.*?,/, "");
  if (d.startsWith("/9j/")) return "image/jpeg";
  if (d.startsWith("iVBOR")) return "image/png";
  if (d.startsWith("R0lGOD")) return "image/gif";
  if (d.startsWith("UklGR")) return "image/webp";
  return "image/png"; // safe fallback
}

/** Walk the messages body and fix any invalid image media_types */
function fixImageMediaTypes(obj: unknown): void {
  if (!obj || typeof obj !== "object") return;
  if (Array.isArray(obj)) {
    obj.forEach(fixImageMediaTypes);
    return;
  }
  const rec = obj as Record<string, unknown>;
  // Match the Anthropic image source shape: { type: "base64", media_type: "...", data: "..." }
  if (
    rec.type === "base64" &&
    typeof rec.data === "string" &&
    typeof rec.media_type === "string" &&
    !VALID_IMAGE_TYPES.has(rec.media_type)
  ) {
    rec.media_type = detectImageFormat(rec.data);
  }
  for (const val of Object.values(rec)) {
    fixImageMediaTypes(val);
  }
}

async function handleAiProxy(
  request: Request,
  url: URL,
  slug: string,
  env: Env
): Promise<Response> {
  // Only allow POST
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, x-api-key, anthropic-version",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  // Rate limit by slug
  const { success } = await env.AI_RATE_LIMITER.limit({ key: slug });
  if (!success) {
    return new Response(
      JSON.stringify({ error: "Rate limit exceeded. Try again in a minute." }),
      { status: 429, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!env.ANTHROPIC_API_KEY) {
    return new Response(
      JSON.stringify({ error: "AI proxy not configured" }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }

  // Parse and cap max_tokens
  let body: string;
  try {
    const json = await request.json() as Record<string, unknown>;
    if (typeof json.max_tokens === "number" && json.max_tokens > MAX_TOKENS_CAP) {
      json.max_tokens = MAX_TOKENS_CAP;
    }
    // Fix invalid image media_types before forwarding
    if (json.messages) {
      fixImageMediaTypes(json.messages);
    }
    body = JSON.stringify(json);
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON body" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Forward to Anthropic
  const upstreamPath = url.pathname.replace(/^\/api\/ai/, "");
  const upstreamUrl = `${ANTHROPIC_API_BASE}${upstreamPath}`;

  const headers = new Headers();
  headers.set("Content-Type", "application/json");
  headers.set("x-api-key", env.ANTHROPIC_API_KEY);
  // Forward anthropic-version, default to latest if not provided
  const version = request.headers.get("anthropic-version") || "2023-06-01";
  headers.set("anthropic-version", version);

  const upstreamRes = await fetch(upstreamUrl, {
    method: "POST",
    headers,
    body,
  });

  // Stream the response back
  const responseHeaders = new Headers();
  responseHeaders.set("Content-Type", upstreamRes.headers.get("Content-Type") || "application/json");
  responseHeaders.set("Access-Control-Allow-Origin", "*");

  return new Response(upstreamRes.body, {
    status: upstreamRes.status,
    headers: responseHeaders,
  });
}

function notFoundPage(slug: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Not Found — PushToStart</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      background: #06080d;
      color: #e2e4e9;
    }
    .container { text-align: center; }
    h1 { font-size: 72px; font-weight: 700; color: #6366f1; }
    p { color: #6b7280; margin-top: 12px; font-size: 16px; }
    a { color: #6366f1; margin-top: 24px; display: inline-block; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="container">
    <h1>404</h1>
    <p>${slug}.${DOMAIN} does not exist yet.</p>
    <a href="https://${DOMAIN}">Create it on PushToStart &rarr;</a>
  </div>
</body>
</html>`;
}

export default {
  async fetch(
    request: Request,
    env: Env
  ): Promise<Response> {
    const url = new URL(request.url);
    const hostname = url.hostname;

    // Extract subdomain
    const parts = hostname.split(".");
    if (
      parts.length < 3 ||
      hostname === DOMAIN ||
      hostname === `www.${DOMAIN}`
    ) {
      // Root domain — redirect to main site on Vercel
      return Response.redirect(
        `https://${DOMAIN}${url.pathname}`,
        301
      );
    }

    const slug = parts[0];

    if (RESERVED_SUBDOMAINS.includes(slug)) {
      return new Response("Not Found", { status: 404 });
    }

    // AI proxy — intercept /api/ai/* requests
    if (url.pathname.startsWith("/api/ai/")) {
      return handleAiProxy(request, url, slug, env);
    }

    // Serve OG image if requested
    if (url.pathname === "/og.png") {
      const ogKey = `sites/${slug}/og.png`;
      const ogObject = await env.SITE_BUCKET.get(ogKey);
      if (ogObject) {
        return new Response(ogObject.body, {
          headers: {
            "Content-Type": "image/png",
            "Cache-Control": "public, max-age=3600, s-maxage=3600",
          },
        });
      }
      // Fall through to 404 if no OG image exists
      return new Response("Not Found", { status: 404 });
    }

    // Fetch from R2
    const key = `sites/${slug}/index.html`;
    const object = await env.SITE_BUCKET.get(key);

    if (!object) {
      return new Response(notFoundPage(slug), {
        status: 404,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    return new Response(object.body, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=60, s-maxage=60",
        "X-Powered-By": "PushToStart",
      },
    });
  },
};
