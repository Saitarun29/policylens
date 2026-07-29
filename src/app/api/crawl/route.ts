import { NextRequest, NextResponse } from "next/server";
import { FirecrawlAppV1 } from "firecrawl";
import { z } from "zod";
import type { CrawlResult } from "@/lib/types";

const bodySchema = z.object({
  url: z.string().url().max(2048),
});

// ── Structured Logger ──────────────────────────────────────────────────────
const LOG_PREFIX = "[Crawl API]";

function log(step: string, msg: string, data?: unknown) {
  const ts = new Date().toISOString().slice(11, 23);
  if (data) {
    console.log(`${LOG_PREFIX} [${ts}] [${step}] ${msg}`, JSON.stringify(data, null, 2));
  } else {
    console.log(`${LOG_PREFIX} [${ts}] [${step}] ${msg}`);
  }
}

function logError(step: string, err: unknown) {
  const ts = new Date().toISOString().slice(11, 23);
  if (err instanceof Error) {
    console.error(`${LOG_PREFIX} [${ts}] [${step}] ❌ ERROR: ${err.message}`);
    console.error(`${LOG_PREFIX} [${ts}] [${step}] Stack: ${err.stack?.split("\n").slice(0, 4).join("\n")}`);
  } else {
    console.error(`${LOG_PREFIX} [${ts}] [${step}] ❌ ERROR:`, err);
  }
}

// ── Key Validation ─────────────────────────────────────────────────────────
function getFirecrawlKey(): string | null {
  const key = process.env.FIRECRAWL_API_KEY;
  if (key && key.length > 10) {
    log("CONFIG", `✅ Firecrawl key found (${key.slice(0, 8)}...${key.slice(-4)})`);
    return key;
  }
  log("CONFIG", "❌ Firecrawl key missing or too short");
  return null;
}

// ── Error Categorization (preserves original message) ─────────────────────
function categorizeCrawlError(err: unknown): { status: number; message: string; code: string } {
  const msg = err instanceof Error ? err.message : String(err);
  log("ERROR_CATEGORY", `Categorizing: "${msg}"`);

  if (
    msg.toLowerCase().includes("rate limit") ||
    msg.toLowerCase().includes("rate_limit") ||
    msg.toLowerCase().includes("too many requests") ||
    msg.toLowerCase().includes("429")
  ) {
    return { status: 429, message: msg, code: "RATE_LIMITED" };
  }

  if (
    msg.toLowerCase().includes("401") ||
    msg.toLowerCase().includes("unauthorized") ||
    msg.toLowerCase().includes("invalid api key") ||
    msg.toLowerCase().includes("authentication") ||
    msg.toLowerCase().includes("forbidden") ||
    msg.toLowerCase().includes("403")
  ) {
    return { status: 401, message: msg, code: "AUTH_ERROR" };
  }

  if (
    msg.toLowerCase().includes("quota") ||
    msg.toLowerCase().includes("insufficient") ||
    msg.toLowerCase().includes("billing") ||
    msg.toLowerCase().includes("payment") ||
    msg.toLowerCase().includes("credit") ||
    msg.toLowerCase().includes("402")
  ) {
    return { status: 402, message: msg, code: "QUOTA_EXCEEDED" };
  }

  if (
    msg.toLowerCase().includes("timeout") ||
    msg.toLowerCase().includes("timed out") ||
    msg.toLowerCase().includes("econnrefused") ||
    msg.toLowerCase().includes("network") ||
    msg.toLowerCase().includes("fetch failed") ||
    msg.toLowerCase().includes("enotfound") ||
    msg.toLowerCase().includes("econnreset")
  ) {
    return { status: 503, message: msg, code: "NETWORK_ERROR" };
  }

  return { status: 502, message: msg, code: "UNKNOWN_ERROR" };
}

// ── Scraping Functions ─────────────────────────────────────────────────────
async function scrapeUrl(app: FirecrawlAppV1, u: string, label: string): Promise<string | null> {
  log("SCRAPE", `📥 ${label}: ${u}`);
  const start = Date.now();
  try {
    const result = await app.scrapeUrl(u, { formats: ["markdown"] });
    const duration = ((Date.now() - start) / 1000).toFixed(1);
    if (result.success) {
      const mdLen = result.markdown?.length ?? 0;
      log("SCRAPE", `✅ ${label}: success (${mdLen} chars, ${duration}s)`);
      if (mdLen > 50) return result.markdown ?? null;
      log("SCRAPE", `⚠️ ${label}: content too short (${mdLen} chars), skipping`);
      return null;
    } else {
      log("SCRAPE", `❌ ${label}: Firecrawl returned success=false (${duration}s)`);
      return null;
    }
  } catch (err) {
    const duration = ((Date.now() - start) / 1000).toFixed(1);
    logError("SCRAPE", err);
    log("SCRAPE", `⏱️ ${label}: failed after ${duration}s`);
    return null;
  }
}

async function tryDocument(app: FirecrawlAppV1, baseUrl: string, paths: string[], label: string) {
  log("DOC_SEARCH", `🔍 Searching for ${label}...`);
  for (const path of paths) {
    const fullUrl = new URL(path, baseUrl).toString();
    log("DOC_SEARCH", `  Trying ${fullUrl}`);
    const md = await scrapeUrl(app, fullUrl, `${label} @ ${path}`);
    if (md) {
      log("DOC_SEARCH", `✅ ${label} found at ${fullUrl}`);
      return { found: true, url: fullUrl, markdown: md };
    }
  }
  log("DOC_SEARCH", `❌ ${label} not found after checking ${paths.length} paths`);
  return { found: false, url: null, markdown: null };
}

// ── POST Handler ───────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const startTime = Date.now();
  log("START", `Request received`);

  try {
    // ── Step 1: Parse Body ──────────────────────────────────────────────
    log("STEP_1", "Parsing request body...");
    const body = await req.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      log("STEP_1", `❌ Invalid URL: ${parsed.error.message}`);
      return NextResponse.json(
        { error: "Please provide a valid URL starting with http:// or https://", detail: parsed.error.message },
        { status: 400 }
      );
    }
    const { url } = parsed.data;
    log("STEP_1", `✅ URL valid: ${url}`);

    // ── Step 2: Validate Firecrawl Key ──────────────────────────────────
    log("STEP_2", "Validating Firecrawl API key...");
    const FIRECRAWL_API_KEY = getFirecrawlKey();
    if (!FIRECRAWL_API_KEY) {
      log("STEP_2", "❌ Firecrawl key not configured");
      return NextResponse.json(
        {
          error: "Firecrawl API key is not configured. Please set FIRECRAWL_API_KEY in your environment.",
          missingKey: true,
          code: "MISSING_API_KEY",
        },
        { status: 500 }
      );
    }
    log("STEP_2", "✅ Firecrawl key valid");

    // ── Step 3: Initialize Firecrawl ────────────────────────────────────
    log("STEP_3", "Initializing Firecrawl client...");
    const app = new FirecrawlAppV1({ apiKey: FIRECRAWL_API_KEY });
    const baseUrl = url.replace(/\/$/, "");
    log("STEP_3", `Base URL: ${baseUrl}`);

    // ── Step 4: Scrape Homepage ─────────────────────────────────────────
    log("STEP_4", "Scraping homepage...");
    const homepageContent = await scrapeUrl(app, url, "Homepage");
    if (!homepageContent) {
      log("STEP_4", "❌ Homepage scrape returned no content");
      return NextResponse.json(
        { error: "Failed to crawl the website. The site may be unreachable or blocking automated requests.", code: "CRAWL_FAILED" },
        { status: 502 }
      );
    }
    log("STEP_4", `✅ Homepage: ${homepageContent.length} chars`);

    // ── Step 5: Search for Legal Documents ──────────────────────────────
    log("STEP_5", "Searching for legal documents...");
    const docStartTime = Date.now();
    const [privacyResult, termsResult, cookiesResult] = await Promise.all([
      tryDocument(app, baseUrl, [
        "/privacy", "/privacy-policy", "/privacy_policy", "/privacy.html",
        "/privacy-policy.html", "/legal/privacy",
      ], "Privacy Policy"),
      tryDocument(app, baseUrl, [
        "/terms", "/terms-of-service", "/terms-and-conditions", "/terms.html",
        "/terms-of-service.html", "/legal/terms",
      ], "Terms of Service"),
      tryDocument(app, baseUrl, [
        "/cookies", "/cookie-policy", "/cookie-policy", "/cookies.html",
        "/cookie-policy.html", "/legal/cookies",
      ], "Cookie Policy"),
    ]);
    const docDuration = ((Date.now() - docStartTime) / 1000).toFixed(1);
    log("STEP_5", `✅ Legal doc search complete in ${docDuration}s`);
    log("STEP_5", `  Privacy: ${privacyResult.found ? `✅ (${(privacyResult.markdown?.length ?? 0)} chars)` : "❌ not found"}`);
    log("STEP_5", `  Terms: ${termsResult.found ? `✅ (${(termsResult.markdown?.length ?? 0)} chars)` : "❌ not found"}`);
    log("STEP_5", `  Cookies: ${cookiesResult.found ? `✅ (${(cookiesResult.markdown?.length ?? 0)} chars)` : "❌ not found"}`);

    // ── Step 6: Build Result ────────────────────────────────────────────
    log("STEP_6", "Building crawl result...");
    let pagesCrawled = 1;
    let tokensProcessed = homepageContent.length;

    if (privacyResult.markdown) {
      tokensProcessed += privacyResult.markdown.length;
      pagesCrawled++;
    }
    if (termsResult.markdown) {
      tokensProcessed += termsResult.markdown.length;
      pagesCrawled++;
    }
    if (cookiesResult.markdown) {
      tokensProcessed += cookiesResult.markdown.length;
      pagesCrawled++;
    }

    const result: CrawlResult = {
      url,
      homepageContent,
      privacyContent: privacyResult.markdown,
      termsContent: termsResult.markdown,
      cookiesContent: cookiesResult.markdown,
      documents: {
        privacyPolicy: { found: privacyResult.found, url: privacyResult.url },
        termsOfService: { found: termsResult.found, url: termsResult.url },
        cookiePolicy: { found: cookiesResult.found, url: cookiesResult.url },
      },
      metrics: {
        pagesCrawled,
        tokensProcessed: Math.round(tokensProcessed / 4),
        duration: (Date.now() - startTime) / 1000,
        documentsFound:
          [privacyResult, termsResult, cookiesResult].filter((r) => r.found).length + 1,
      },
    };

    const totalDuration = ((Date.now() - startTime) / 1000).toFixed(1);
    log("SUCCESS", `✅ Crawl complete in ${totalDuration}s`);
    log("SUCCESS", `  Pages: ${pagesCrawled}, Tokens: ${result.metrics.tokensProcessed}`);

    return NextResponse.json(result);
  } catch (err) {
    const totalDuration = ((Date.now() - startTime) / 1000).toFixed(1);
    logError("UNEXPECTED", err);
    log("UNEXPECTED", `⏱️ Failed after ${totalDuration}s`);

    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", detail: err.message, code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }
    const categorized = categorizeCrawlError(err);
    return NextResponse.json(
      { error: categorized.message, code: categorized.code },
      { status: categorized.status }
    );
  }
}
