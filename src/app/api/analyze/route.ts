import { NextRequest, NextResponse } from "next/server";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { z } from "zod";
import type { CrawlResult, ConsistencyReport } from "@/lib/types";

const bodySchema = z.object({
  url: z.string(),
  homepageContent: z.string().min(50),
  privacyContent: z.string().nullable().optional(),
  termsContent: z.string().nullable().optional(),
  cookiesContent: z.string().nullable().optional(),
  documents: z.any(),
  metrics: z.any(),
});

// ── Structured Logger ──────────────────────────────────────────────────────
const LOG_PREFIX = "[Analyze API]";

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

// ── AI Provider Resolution ─────────────────────────────────────────────────
function getAIProvider(): {
  baseURL: string;
  apiKey: string;
  provider: "deepseek" | "mistral";
  modelName: string;
} | null {
  const deepseekKey = process.env.DEEPSEEK_API_KEY;
  if (deepseekKey && deepseekKey.length > 10) {
    const modelName = process.env.DEEPSEEK_MODEL || "deepseek-chat";
    log("CONFIG", `✅ Using DeepSeek provider, model: ${modelName}`);
    return {
      baseURL: "https://api.deepseek.com",
      apiKey: deepseekKey,
      provider: "deepseek",
      modelName,
    };
  }

  const mistralKey = process.env.MISTRAL_API_KEY;
  if (mistralKey && mistralKey.length > 10) {
    const modelName = process.env.MISTRAL_MODEL || "mistral-large-latest";
    log("CONFIG", `✅ Using Mistral provider, model: ${modelName}`);
    return {
      baseURL: "https://api.mistral.ai/v1",
      apiKey: mistralKey,
      provider: "mistral",
      modelName,
    };
  }

  log("CONFIG", "❌ No AI API key configured");
  return null;
}

// ── JSON Parsing with Debug ────────────────────────────────────────────────
function parseAIResponse(text: string): ConsistencyReport | null {
  log("PARSE", `Raw AI response length: ${text.length} chars`);
  log("PARSE", `Raw AI response preview: ${text.slice(0, 500)}`);

  // Try direct parse first
  try {
    const parsed = JSON.parse(text);
    log("PARSE", "✅ Direct JSON parse successful");
    return parsed;
  } catch (e) {
    log("PARSE", `⚠️ Direct JSON parse failed: ${e instanceof Error ? e.message : "unknown"}`);
  }

  // Try extracting from markdown code blocks
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch) {
    log("PARSE", "Found markdown code block, trying to extract JSON");
    try {
      const parsed = JSON.parse(codeBlockMatch[1]);
      log("PARSE", "✅ Extracted from code block successfully");
      return parsed;
    } catch (e) {
      log("PARSE", `⚠️ Code block parse failed: ${e instanceof Error ? e.message : "unknown"}`);
    }
  }

  // Try to find JSON object by scanning
  log("PARSE", "⚠️ Attempting regex-based JSON extraction...");
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      log("PARSE", "✅ Regex extraction successful");
      return parsed;
    } catch (e) {
      log("PARSE", `⚠️ Regex extraction failed: ${e instanceof Error ? e.message : "unknown"}`);
    }
  }

  log("PARSE", "❌ All JSON parsing attempts failed");
  log("PARSE", `Full raw response:\n${text}`);
  return null;
}

// ── Error Categorization (preserves original message) ─────────────────────
function categorizeAIError(err: unknown): { status: number; message: string; code: string } {
  const msg = err instanceof Error ? err.message : String(err);
  log("ERROR_CATEGORY", `Categorizing error: "${msg}"`);

  // Rate limiting
  if (
    msg.toLowerCase().includes("rate limit") ||
    msg.toLowerCase().includes("rate_limit") ||
    msg.toLowerCase().includes("too many requests") ||
    msg.toLowerCase().includes("429")
  ) {
    return { status: 429, message: msg, code: "RATE_LIMITED" };
  }

  // Invalid/unauthorized API key
  if (
    msg.toLowerCase().includes("401") ||
    msg.toLowerCase().includes("unauthorized") ||
    msg.toLowerCase().includes("invalid api key") ||
    msg.toLowerCase().includes("invalid_api_key") ||
    msg.toLowerCase().includes("authentication") ||
    msg.toLowerCase().includes("403") ||
    msg.toLowerCase().includes("forbidden") ||
    msg.toLowerCase().includes("unauthorized_access") ||
    msg.toLowerCase().includes("no org") ||
    msg.toLowerCase().includes("org_id")
  ) {
    return { status: 401, message: msg, code: "AUTH_ERROR" };
  }

  // Model not found
  if (
    msg.toLowerCase().includes("model") &&
    (msg.toLowerCase().includes("not found") ||
     msg.toLowerCase().includes("does not exist") ||
     msg.toLowerCase().includes("not a valid model") ||
     msg.toLowerCase().includes("model not available") ||
     msg.toLowerCase().includes("model_not_found"))
  ) {
    log("ERROR_CATEGORY", "🧑‍🔬 Matched MODEL_NOT_FOUND");
    return { status: 404, message: "Model not found", code: "MODEL_NOT_FOUND" };
  }

  // HTTP 404 Not Found (catch-all — case INSENSITIVE)
  if (msg.toLowerCase().includes("404") || msg.toLowerCase().includes("not found")) {
    log("ERROR_CATEGORY", "🧑‍🔬 Matched 404 NOT_FOUND");
    return { status: 404, message: msg, code: "NOT_FOUND" };
  }

  // Insufficient quota / billing
  if (
    msg.toLowerCase().includes("quota") ||
    msg.toLowerCase().includes("insufficient") ||
    msg.toLowerCase().includes("billing") ||
    msg.toLowerCase().includes("payment") ||
    msg.toLowerCase().includes("402") ||
    msg.toLowerCase().includes("insufficient_quota") ||
    msg.toLowerCase().includes("exceeded")
  ) {
    return { status: 402, message: msg, code: "QUOTA_EXCEEDED" };
  }

  // Network / timeout
  if (
    msg.toLowerCase().includes("timeout") ||
    msg.toLowerCase().includes("timed out") ||
    msg.toLowerCase().includes("econnrefused") ||
    msg.toLowerCase().includes("network") ||
    msg.toLowerCase().includes("fetch failed") ||
    msg.toLowerCase().includes("enotfound") ||
    msg.toLowerCase().includes("econnreset") ||
    msg.toLowerCase().includes("eai_again") ||
    msg.toLowerCase().includes("socket") ||
    msg.toLowerCase().includes("dns")
  ) {
    return { status: 503, message: msg, code: "NETWORK_ERROR" };
  }

  // JSON parse errors from AI response
  if (
    msg.toLowerCase().includes("json") ||
    msg.toLowerCase().includes("parse") ||
    msg.toLowerCase().includes("syntaxerror") ||
    msg.toLowerCase().includes("unexpected token") ||
    msg.toLowerCase().includes("unexpected end")
  ) {
    return { status: 502, message: msg, code: "AI_RESPONSE_PARSE_ERROR" };
  }

  return { status: 502, message: msg, code: "UNKNOWN_ERROR" };
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
      log("STEP_1", `❌ Body validation failed: ${parsed.error.message}`);
      return NextResponse.json(
        { error: "Invalid crawl data provided", detail: parsed.error.message },
        { status: 400 }
      );
    }
    log("STEP_1", `✅ Body valid. URL: ${parsed.data.url}`);

    // ── Step 2: Resolve AI Provider ─────────────────────────────────────
    log("STEP_2", "Resolving AI provider...");
    const aiConfig = getAIProvider();
    if (!aiConfig) {
      log("STEP_2", "❌ No AI provider configured");
      return NextResponse.json(
        {
          error: "No AI API key is configured. Please set DEEPSEEK_API_KEY or MISTRAL_API_KEY in your environment.",
          missingKey: true,
          code: "MISSING_API_KEY",
        },
        { status: 500 }
      );
    }
    log("STEP_2", `✅ Provider: ${aiConfig.provider}, BaseURL: ${aiConfig.baseURL}`);

    // ── Step 3: Initialize AI Client ────────────────────────────────────
    log("STEP_3", "Initializing AI client...");

    // Pre-flight validation
    log("STEP_3", `🔍 Provider: ${aiConfig.provider}`);
    log("STEP_3", `🔍 Base URL: ${aiConfig.baseURL}`);
    log("STEP_3", `🔍 Model: ${aiConfig.modelName}`);
    log("STEP_3", `🔍 API Key: ${aiConfig.apiKey.slice(0, 4)}...${aiConfig.apiKey.slice(-4)}`);

    const model = createOpenAI({
      baseURL: aiConfig.baseURL,
      apiKey: aiConfig.apiKey,
    });
    const modelName = aiConfig.modelName;
    log("STEP_3", `✅ AI client initialized with model: ${modelName}`);

    const crawlData = parsed.data as CrawlResult;

    // ── Step 4: Build prompts ───────────────────────────────────────────
    log("STEP_4", "Building prompts...");
    const legalDocs = [
      crawlData.privacyContent ? `--- PRIVACY POLICY ---\n${crawlData.privacyContent}` : null,
      crawlData.termsContent ? `--- TERMS OF SERVICE ---\n${crawlData.termsContent}` : null,
      crawlData.cookiesContent ? `--- COOKIE POLICY ---\n${crawlData.cookiesContent}` : null,
    ]
      .filter(Boolean)
      .join("\n\n");

    const hasPrivacy = crawlData.documents.privacyPolicy.found;
    const hasTerms = crawlData.documents.termsOfService.found;
    const hasCookies = crawlData.documents.cookiePolicy.found;
    const docsFound = [hasPrivacy, hasTerms, hasCookies].filter(Boolean).length;

    log("STEP_4", `Homepage content: ${crawlData.homepageContent.length} chars`);
    log("STEP_4", `Legal docs found: ${docsFound} (privacy:${hasPrivacy}, terms:${hasTerms}, cookies:${hasCookies})`);

    const systemPrompt = `You are PolicyLens AI, a policy consistency analyzer powered by ${aiConfig.provider === "deepseek" ? "DeepSeek" : "Mistral"}. Your job is to reason over structured facts extracted from websites and their legal documents.

Follow these steps in order:

## STEP 1 — Extract Website Facts
Analyze the HOMEPAGE content and return structured facts about what the website actually implements.

## STEP 2 — Extract Policy Facts
Analyze the LEGAL DOCUMENTS (Privacy Policy, Terms of Service, Cookie Policy) and extract what they disclose.

## STEP 3 — Compare
Compare the website facts against the policy facts. Never compare raw text. Compare structured facts only.

## STEP 4 — Detect Inconsistencies
Find concrete mismatches:
- Website uses Google Analytics but policy has no analytics disclosure
- Website has newsletter signup but policy doesn't mention data processing
- Website has AI chatbot but policy has no AI disclosure
- Website uses Stripe/PayPal but policy doesn't mention payment processors
- Website collects personal data but policy doesn't list data types

## STEP 5 — Assign Severity
- Critical: Direct legal risk (no privacy policy, no consent mechanism)
- High: Significant gap (analytics without disclosure, data collection without notice)
- Medium: Moderate gap (cookies without cookie policy, missing third-party disclosures)
- Low: Minor gap (improvement suggestion, vague language)

## STEP 6 — Generate Report
Return ONLY valid JSON. No markdown. No explanation. No code blocks. No backticks.

{
  "score": number (0-100, where 100 = fully consistent),
  "riskLevel": "Critical" | "High" | "Medium" | "Low",
  "summary": "2-3 sentence summary of the overall consistency posture",
  "statistics": {
    "critical": number,
    "high": number,
    "medium": number,
    "low": number
  },
  "findings": [
    {
      "category": "Short category name (e.g. Analytics Disclosure, Cookie Consent)",
      "severity": "Critical" | "High" | "Medium" | "Low",
      "websiteEvidence": "Specific evidence of what was detected on the website",
      "policyEvidence": "Specific evidence of what was found or missing in legal docs",
      "explanation": "Clear explanation of why this is an inconsistency",
      "recommendation": "Actionable recommendation to resolve the inconsistency",
      "confidence": number (0.0 to 1.0)
    }
  ]
}

CONSTRAINTS:
- Generate 0-6 findings based on actual data only
- If no issues found: score 100, riskLevel "Low", empty findings, statistics all 0
- Never fabricate issues
- Base everything strictly on the provided content
- score must be 0-100 integer
- confidence must be 0.0-1.0
- Use "Potential inconsistencies" framing — never claim legal compliance
- This is NOT a legal compliance checker`;

    const userPrompt = `Analyze the following website for policy consistency.

URL: ${crawlData.url}

Documents found: Homepage (always), Privacy Policy (${hasPrivacy ? "yes" : "no"}), Terms of Service (${hasTerms ? "yes" : "no"}), Cookie Policy (${hasCookies ? "yes" : "no"})
Total legal documents: ${docsFound}

--- HOMEPAGE ---
${crawlData.homepageContent.slice(0, 15000)}

${legalDocs ? `\n${legalDocs.slice(0, 30000)}` : "\nNo legal documents were found on this website."}

Instructions:
1. Extract structured facts from the homepage about what the website actually does
2. Extract structured facts from the legal documents about what they disclose
3. Compare the two sets of facts
4. Identify specific inconsistencies
5. Assign severity and confidence to each finding
6. Generate an overall consistency score

Remember: Frame findings as "potential inconsistencies" — never state legal compliance or non-compliance.`;

    log("STEP_4", `✅ Prompts built. System prompt: ${systemPrompt.length} chars, User prompt: ${userPrompt.length} chars`);

    // ── Step 5: Call AI API ─────────────────────────────────────────────
    log("STEP_5", `📤 Sending request to ${aiConfig.provider} (model: ${modelName})...`);
    const aiStartTime = Date.now();

    let text: string;
    try {
      // Use .chat() to force /v1/chat/completions (not /v1/responses)
      const chatModel = model.chat(modelName);
      const result = await generateText({
        model: chatModel,
        system: systemPrompt,
        prompt: userPrompt,
        temperature: 0.2,
      });
      text = result.text;
    } catch (err) {
      const aiDuration = ((Date.now() - aiStartTime) / 1000).toFixed(1);
      logError("STEP_5", err);
      log("STEP_5", `⏱️ AI call failed after ${aiDuration}s`);

      // Print detailed debug info before throwing
      const errMsg = err instanceof Error ? err.message : String(err);
      log("STEP_5_DEBUG", `Provider: ${aiConfig.provider}`);
      log("STEP_5_DEBUG", `Base URL: ${aiConfig.baseURL}`);
      log("STEP_5_DEBUG", `Model: ${modelName}`);
      log("STEP_5_DEBUG", `Duration: ${aiDuration}s`);
      log("STEP_5_DEBUG", `Error message: ${errMsg}`);
      
      // Log the full error object (status, response, etc.)
      if (err instanceof Error) {
        log("STEP_5_DEBUG", `Error name: ${err.name}`);
        const errObj = err as unknown as Record<string, unknown>;
        log("STEP_5_DEBUG", `Error cause: ${String(errObj.cause ?? 'none')}`);
        // Check for status/statusCode on the error object
        const errAny = errObj;
        if (errAny.status) log("STEP_5_DEBUG", `err.status: ${errAny.status}`);
        if (errAny.statusCode) log("STEP_5_DEBUG", `err.statusCode: ${errAny.statusCode}`);
        if (errAny.responseBody) log("STEP_5_DEBUG", `err.responseBody: ${String(errAny.responseBody).slice(0, 500)}`);
        if (errAny.url) log("STEP_5_DEBUG", `Request URL: ${errAny.url}`);
      }

      // Categorize and return with real error message
      const categorized = categorizeAIError(err);
      return NextResponse.json({
        error: categorized.message,
        code: categorized.code,
        provider: aiConfig.provider,
        model: modelName,
        duration: parseFloat(aiDuration),
      }, { status: categorized.status });
    }

    const aiDuration = ((Date.now() - aiStartTime) / 1000).toFixed(1);
    log("STEP_5", `✅ AI response received in ${aiDuration}s`);
    log("STEP_5", `Response length: ${text.length} chars`);
    log("STEP_5", `Response preview: ${text.slice(0, 200)}`);

    // ── Step 6: Parse AI Response ───────────────────────────────────────
    log("STEP_6", "Parsing AI response JSON...");
    const report = parseAIResponse(text);

    if (!report) {
      log("STEP_6", "❌ Failed to parse AI response as JSON");
      // Save the raw response to console for debugging
      log("STEP_6_FULL", `Full raw response:\n${text}`);
      return NextResponse.json({
        error: `Failed to parse AI response as JSON. Response preview: ${text.slice(0, 300)}...`,
        code: "JSON_PARSE_ERROR",
        rawPreview: text.slice(0, 500),
        provider: aiConfig.provider,
        model: modelName,
      }, { status: 502 });
    }

    log("STEP_6", `✅ JSON parsed. Score: ${report.score}, Findings: ${report.findings.length}`);

    // ── Step 7: Validate Report Structure ───────────────────────────────
    log("STEP_7", "Validating report structure...");
    if (typeof report.score !== "number" || report.score < 0 || report.score > 100) {
      log("STEP_7", `❌ Invalid score: ${report.score}`);
      return NextResponse.json({
        error: `AI returned invalid score: ${report.score}. Expected 0-100.`,
        code: "INVALID_SCORE",
        rawPreview: text.slice(0, 500),
      }, { status: 502 });
    }

    if (!["Critical", "High", "Medium", "Low"].includes(report.riskLevel)) {
      log("STEP_7", `❌ Invalid riskLevel: ${report.riskLevel}`);
      return NextResponse.json({
        error: `AI returned invalid riskLevel: ${report.riskLevel}. Expected Critical/High/Medium/Low.`,
        code: "INVALID_RISK_LEVEL",
        rawPreview: text.slice(0, 500),
      }, { status: 502 });
    }

    if (!Array.isArray(report.findings)) {
      log("STEP_7", `❌ Findings is not an array: ${typeof report.findings}`);
      return NextResponse.json({
        error: `AI returned invalid findings type: ${typeof report.findings}. Expected array.`,
        code: "INVALID_FINDINGS",
        rawPreview: text.slice(0, 500),
      }, { status: 502 });
    }

    log("STEP_7", "✅ Report structure valid");

    // ── Success ──────────────────────────────────────────────────────────
    const totalDuration = ((Date.now() - startTime) / 1000).toFixed(1);
    log("SUCCESS", `✅ Analysis complete in ${totalDuration}s`);
    return NextResponse.json({ report, provider: aiConfig.provider, model: modelName });

  } catch (err) {
    // Catch unexpected errors (not from the AI call itself)
    const totalDuration = ((Date.now() - startTime) / 1000).toFixed(1);
    logError("UNEXPECTED", err);
    log("UNEXPECTED", `⏱️ Failed after ${totalDuration}s`);

    const categorized = categorizeAIError(err);
    return NextResponse.json(
      {
        error: categorized.message,
        code: categorized.code,
        duration: parseFloat(totalDuration),
      },
      { status: categorized.status }
    );
  }
}
