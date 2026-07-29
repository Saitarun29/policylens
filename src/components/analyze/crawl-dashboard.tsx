"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Globe,
  Check,
  Clock,
  ChevronRight,
  Loader2,
  AlertCircle,
  XCircle,
  Zap,
  Cpu,
} from "lucide-react";
import type {
  AppStage,
  CrawlResult,
  ConsistencyReport,
  ReportMeta,
} from "@/lib/types";
import {
  PIPELINE_STEPS,
  AI_THINKING_MESSAGES,
} from "@/lib/constants";
import { Button } from "@/components/ui/button";
import ConsistencyReportView from "./consistency-report";

// ─── Types ────────────────────────────────────────────────────────────────

interface CrawlDashboardProps {
  url: string;
}

type StepStatus = "pending" | "in-progress" | "completed" | "not-found" | "error";

type PipelineStep = (typeof PIPELINE_STEPS)[number] & {
  status: StepStatus;
  duration: number;
};

// ─── Helpers ──────────────────────────────────────────────────────────────

const ERROR_STAGE_CODES: Record<string, { label: string; suggestion: string }> = {
  MISSING_API_KEY: { label: "Configuration Error", suggestion: "Check your .env.local file and restart the server." },
  AUTH_ERROR: { label: "API Key Error", suggestion: "Your API key is invalid or unauthorized. Generate a new one." },
  MODEL_NOT_FOUND: { label: "Model Not Found", suggestion: "Check the MISTRAL_MODEL environment variable." },
  RATE_LIMITED: { label: "Rate Limit", suggestion: "Too many requests. Wait a moment and try again." },
  QUOTA_EXCEEDED: { label: "Quota Exceeded", suggestion: "API quota is exhausted. Check your billing plan." },
  NETWORK_ERROR: { label: "Network Error", suggestion: "Unable to reach the API. Check your connection." },
  CRAWL_FAILED: { label: "Crawl Error", suggestion: "The website couldn't be crawled. It may be blocking requests." },
};

function formatError(msg: string, code?: string) {
  const entry = ERROR_STAGE_CODES[code || ""];
  if (entry) return entry;
  const lower = msg.toLowerCase();
  if (lower.includes("api key") || lower.includes("unauthorized") || lower.includes("401"))
    return { label: "API Key Error", suggestion: "Your API key is invalid. Generate a new one." };
  if (lower.includes("model not found") || lower.includes("404"))
    return { label: "Model Not Found", suggestion: "Check the MISTRAL_MODEL env var." };
  if (lower.includes("rate limit") || lower.includes("429"))
    return { label: "Rate Limit", suggestion: "Too many requests. Wait and try again." };
  if (lower.includes("quota") || lower.includes("billing"))
    return { label: "Quota Exceeded", suggestion: "API quota exhausted. Check billing." };
  if (lower.includes("network") || lower.includes("timeout") || lower.includes("econnrefused"))
    return { label: "Network Error", suggestion: "Unable to reach the API. Check your connection." };
  if (lower.includes("crawl"))
    return { label: "Crawl Error", suggestion: "Website blocked the crawler." };
  return { label: "Analysis Failed", suggestion: "An unexpected error occurred. Try again." };
}

function formatDuration(seconds: number): string {
  if (seconds < 1) return `${Math.round(seconds * 100)}ms`;
  if (seconds < 10) return `${seconds.toFixed(1)}s`;
  return `${Math.round(seconds)}s`;
}

// ─── Sidebar Metric ────────────────────────────────────────────────────────

function SidebarMetric({
  label,
  value,
  pulse = false,
}: {
  label: string;
  value: string | number;
  pulse?: boolean;
}) {
  return (
    <div className="border-b border-white/[0.04] py-3 last:border-0">
      <p className="text-[11px] font-medium uppercase tracking-widest text-white/30 mb-1">
        {label}
      </p>
      <p className={`font-mono text-sm tabular-nums text-white/80 ${pulse ? "text-blue-300" : ""}`}>
        {value}
        {pulse && <span className="inline-block w-[2px] h-4 bg-blue-400 ml-1 animate-pulse" />}
      </p>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════

export default function CrawlDashboard({ url }: CrawlDashboardProps) {
  const [stage, setStage] = useState<AppStage>("scanning");
  const [pipelineSteps, setPipelineSteps] = useState<PipelineStep[]>(
    PIPELINE_STEPS.map((s) => ({ ...s, status: "pending" as const, duration: 0 }))
  );
  const [metrics, setMetrics] = useState({
    pagesCrawled: 0,
    documentsFound: 0,
    charsExtracted: 0,
    tokensProcessed: 0,
    duration: 0,
    currentStage: "Initializing...",
    aiProvider: "Mistral AI",
    model: "mistral-large-latest",
  });
  const [report, setReport] = useState<ConsistencyReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string>("");
  const [showReport, setShowReport] = useState(false);
  const [reportPhase, setReportPhase] = useState(0);
  const crawlAttempted = useRef(false);
  const stepTimers = useRef<Record<string, number>>({});
  const [aiThinkingIdx, setAiThinkingIdx] = useState(0);
  const cachedResult = useRef<{ url: string; report: ConsistencyReport; meta: ReportMeta } | null>(null);

  // ─── AI thinking rotation ──────────────────────────────────────────────
  useEffect(() => {
    if (stage !== "analyzing") return;
    const t = setInterval(() => setAiThinkingIdx((i) => (i + 1) % AI_THINKING_MESSAGES.length), 2500);
    return () => clearInterval(t);
  }, [stage]);

  // ─── Step helpers ──────────────────────────────────────────────────────
  const startStep = useCallback((id: string) => {
    stepTimers.current[id] = Date.now();
    setPipelineSteps((prev) => prev.map((s) => (s.id === id ? { ...s, status: "in-progress" as const } : s)));
  }, []);

  const completeStep = useCallback((id: string, status: StepStatus = "completed") => {
    const elapsed = stepTimers.current[id] ? Date.now() - stepTimers.current[id] : 0;
    setPipelineSteps((prev) => prev.map((s) => (s.id === id ? { ...s, status, duration: elapsed } : s)));
  }, []);

  // ─── Progress ──────────────────────────────────────────────────────────
  const progressPercent = useMemo(() => {
    const done = pipelineSteps.filter((s) => s.status === "completed" || s.status === "not-found").length;
    const active = pipelineSteps.some((s) => s.status === "in-progress") ? 1 : 0;
    return Math.round(((done + active) / pipelineSteps.length) * 100);
  }, [pipelineSteps]);

  // ─── Timer ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (stage === "scanning" || stage === "extracting" || stage === "analyzing") {
      const t = setInterval(() => setMetrics((m) => ({ ...m, duration: Math.round((m.duration + 0.1) * 10) / 10 })), 100);
      return () => clearInterval(t);
    }
  }, [stage]);

  // ─── Elapsed time display ──────────────────────────────────────────────
  const elapsedDisplay = useMemo(() => {
    const d = metrics.duration;
    if (d < 1) return `${Math.round(d * 100)}ms`;
    if (d < 60) return `${d.toFixed(1)}s`;
    return `${Math.floor(d / 60)}m ${Math.round(d % 60)}s`;
  }, [metrics.duration]);

  // ─── Status label ──────────────────────────────────────────────────────
  const statusLabel = useMemo(() => {
    switch (stage) {
      case "scanning": return "Scanning";
      case "extracting": return "Extracting";
      case "analyzing": return "Analyzing";
      case "complete": return "Complete";
      case "error": return "Error";
      default: return "Idle";
    }
  }, [stage]);

  const statusColor = useMemo(() => {
    switch (stage) {
      case "scanning": return "text-blue-400";
      case "extracting": return "text-violet-400";
      case "analyzing": return "text-amber-400";
      case "complete": return "text-green-500";
      case "error": return "text-red-500";
      default: return "text-white/30";
    }
  }, [stage]);

  // ══════════════════════════════════════════════════════════════════════
  // MAIN PIPELINE
  // ══════════════════════════════════════════════════════════════════════
  const handleCrawl = useCallback(async () => {
    if (cachedResult.current && cachedResult.current.url === url) {
      setReport(cachedResult.current.report);
      setStage("complete");
      setTimeout(() => setReportPhase(1), 100);
      setTimeout(() => setReportPhase(2), 600);
      setTimeout(() => setReportPhase(3), 1200);
      setTimeout(() => setReportPhase(4), 2000);
      setTimeout(() => setShowReport(true), 2800);
      return;
    }
    if (crawlAttempted.current) return;
    crawlAttempted.current = true;

    setStage("scanning");
    setError(null);
    setErrorCode("");
    setReport(null);
    setShowReport(false);
    setReportPhase(0);
    stepTimers.current = {};
    setPipelineSteps(PIPELINE_STEPS.map((s) => ({ ...s, status: "pending" as const, duration: 0 })));
    setMetrics({
      pagesCrawled: 0, documentsFound: 0, charsExtracted: 0, tokensProcessed: 0,
      duration: 0, currentStage: "Initializing...", aiProvider: "Mistral AI", model: "mistral-large-latest",
    });

    // Validate
    startStep("validate-url");
    await new Promise((r) => setTimeout(r, 400));
    completeStep("validate-url");
    setMetrics((m) => ({ ...m, currentStage: "Connecting to Firecrawl" }));
    startStep("connect-firecrawl");
    await new Promise((r) => setTimeout(r, 300));
    completeStep("connect-firecrawl");

    // Crawl
    setMetrics((m) => ({ ...m, currentStage: "Crawling website..." }));
    startStep("crawl-homepage");
    try {
      const crawlRes = await fetch("/api/crawl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (!crawlRes.ok) {
        const errData = await crawlRes.json().catch(() => ({ error: "Crawl failed", code: "CRAWL_FAILED" }));
        completeStep("crawl-homepage", "error");
        throw new Error(errData.error || "Crawl failed");
      }
      const crawlResult: CrawlResult = await crawlRes.json();
      completeStep("crawl-homepage");

      const docSteps = [
        { id: "find-privacy", found: crawlResult.documents.privacyPolicy.found },
        { id: "find-terms", found: crawlResult.documents.termsOfService.found },
        { id: "find-cookies", found: crawlResult.documents.cookiePolicy.found },
      ];
      for (const ds of docSteps) {
        startStep(ds.id);
        await new Promise((r) => setTimeout(r, 200));
        completeStep(ds.id, ds.found ? "completed" : "not-found");
      }

      const charsExtracted =
        crawlResult.homepageContent.length +
        (crawlResult.privacyContent?.length || 0) +
        (crawlResult.termsContent?.length || 0) +
        (crawlResult.cookiesContent?.length || 0);

      setMetrics({
        pagesCrawled: crawlResult.metrics.pagesCrawled,
        documentsFound: crawlResult.metrics.documentsFound,
        charsExtracted,
        tokensProcessed: crawlResult.metrics.tokensProcessed,
        duration: crawlResult.metrics.duration,
        currentStage: "Extracting facts...",
        aiProvider: "Mistral AI",
        model: "mistral-large-latest",
      });

      // Extract
      setStage("extracting");
      setMetrics((m) => ({ ...m, currentStage: "Extracting website facts..." }));
      startStep("extract-facts");
      await new Promise((r) => setTimeout(r, 600));
      completeStep("extract-facts");

      // AI Analysis
      setStage("analyzing");
      setMetrics((m) => ({ ...m, currentStage: "Building AI prompt..." }));
      startStep("build-prompt");
      await new Promise((r) => setTimeout(r, 400));
      completeStep("build-prompt");

      setMetrics((m) => ({ ...m, currentStage: "Sending to Mistral..." }));
      startStep("send-to-ai");
      const analysisStart = Date.now();
      const analysisRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(crawlResult),
      });
      const analysisDuration = (Date.now() - analysisStart) / 1000;

      if (!analysisRes.ok) {
        const errData = await analysisRes.json().catch(() => ({ error: "Analysis failed", code: "" }));
        completeStep("send-to-ai", "error");
        throw new Error(JSON.stringify({ message: errData.error || "AI analysis failed", code: errData.code || "" }));
      }
      completeStep("send-to-ai");

      setMetrics((m) => ({ ...m, currentStage: "Comparing documents..." }));
      startStep("compare-docs");
      await new Promise((r) => setTimeout(r, 1500));
      completeStep("compare-docs");
      const analysisResult = await analysisRes.json();

      // Report
      setStage("complete");
      setMetrics((m) => ({ ...m, currentStage: "Report ready", duration: m.duration + analysisDuration }));
      startStep("generate-report");
      await new Promise((r) => setTimeout(r, 500));
      completeStep("generate-report");
      setReport(analysisResult.report);

      const currentMeta: ReportMeta = {
        pagesCrawled: metrics.pagesCrawled,
        documentsFound: metrics.documentsFound,
        charsExtracted: metrics.charsExtracted,
        tokensProcessed: metrics.tokensProcessed,
        analysisDuration: metrics.duration,
        totalDuration: metrics.duration,
        aiProvider: metrics.aiProvider,
        model: metrics.model,
      };
      cachedResult.current = { url, report: analysisResult.report, meta: currentMeta };
      setTimeout(() => setReportPhase(1), 300);
      setTimeout(() => setReportPhase(2), 900);
      setTimeout(() => setReportPhase(3), 1500);
      setTimeout(() => setReportPhase(4), 2200);
      setTimeout(() => setShowReport(true), 3000);
    } catch (err) {
      let msg = "An unexpected error occurred";
      let code = "";
      if (err instanceof Error) {
        try {
          const p = JSON.parse(err.message);
          msg = p.message || err.message;
          code = p.code || "";
        } catch {
          msg = err.message;
        }
      }
      setError(msg);
      setErrorCode(code);
      setStage("error");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  useEffect(() => { handleCrawl(); }, []);

  // ════════════════════════════════════════════════════════════════════════
  // RENDER: REPORT VIEW
  // ════════════════════════════════════════════════════════════════════════
  // ─── Report meta ────────────────────────────────────────────────────────
  const reportMeta: ReportMeta = {
    pagesCrawled: metrics.pagesCrawled,
    documentsFound: metrics.documentsFound,
    charsExtracted: metrics.charsExtracted,
    tokensProcessed: metrics.tokensProcessed,
    analysisDuration: metrics.duration,
    totalDuration: metrics.duration,
    aiProvider: metrics.aiProvider,
    model: metrics.model,
  };

  if (showReport && report) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <ConsistencyReportView report={report} url={url} meta={reportMeta} />
      </motion.div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  // RENDER: STAGED REPORT REVEAL
  // ════════════════════════════════════════════════════════════════════════
  if (stage === "complete" && report && reportPhase > 0 && !showReport) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20">
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.5, delay: 2 }}
          className="flex flex-col items-center gap-8"
        >
          {reportPhase >= 1 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/30 mb-4">
                Consistency Score
              </p>
              <div className="flex items-baseline justify-center gap-2">
                <span className={`text-7xl font-bold tabular-nums tracking-tight ${
                  report.score >= 80 ? "text-green-500" :
                  report.score >= 60 ? "text-yellow-500" :
                  report.score >= 40 ? "text-orange-500" : "text-red-500"
                }`}>
                  {report.score}
                </span>
                <span className="text-2xl font-light text-white/20">/100</span>
              </div>
            </motion.div>
          )}

          {reportPhase >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-center"
            >
              <span className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium ${
                report.riskLevel === "Critical" || report.riskLevel === "High"
                  ? "bg-red-500/10 text-red-400"
                  : report.riskLevel === "Medium"
                  ? "bg-yellow-500/10 text-yellow-400"
                  : "bg-green-500/10 text-green-400"
              }`}>
                <span className={`h-1.5 w-1.5 rounded-full ${
                  report.riskLevel === "Critical" || report.riskLevel === "High"
                    ? "bg-red-500"
                    : report.riskLevel === "Medium"
                    ? "bg-yellow-500"
                    : "bg-green-500"
                }`} />
                {report.riskLevel} Risk
              </span>
            </motion.div>
          )}

          {reportPhase >= 3 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-xl text-center"
            >
              <p className="text-sm leading-relaxed text-white/60">{report.summary}</p>
            </motion.div>
          )}

          {reportPhase >= 4 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-2 text-sm text-white/40">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Preparing full report...
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  // RENDER: ERROR STATE
  // ════════════════════════════════════════════════════════════════════════
  if (stage === "error") {
    const err = formatError(error || "", errorCode);
    return (
      <div className="mx-auto max-w-xl px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mb-8">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-red-500/60 mb-1">Error</p>
            <h1 className="text-2xl font-semibold tracking-tight text-white/90">{err.label}</h1>
          </div>

          <div className="space-y-4">
            <div className="border border-white/[0.06] rounded-lg p-4">
              <p className="text-[11px] font-medium uppercase tracking-widest text-white/30 mb-2">Details</p>
              <p className="text-sm text-white/60 leading-relaxed">{err.suggestion}</p>
            </div>

            {(process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") && (
              <details className="border border-white/[0.06] rounded-lg p-4">
                <summary className="text-[11px] font-medium uppercase tracking-widest text-white/30 cursor-pointer">
                  Technical Details
                </summary>
                <pre className="mt-3 text-xs font-mono text-white/30 bg-black/40 rounded p-3 max-h-32 overflow-auto">
                  {error}{errorCode ? `\nCode: ${errorCode}` : ""}
                </pre>
              </details>
            )}

            <Button
              onClick={() => { crawlAttempted.current = false; handleCrawl(); }}
              className="w-full bg-white/5 text-white/80 hover:bg-white/10 border border-white/[0.08]"
            >
              Retry Analysis
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  // RENDER: MISSION CONTROL WORKSPACE
  // ════════════════════════════════════════════════════════════════════════
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      {/* ═══ Top Header ═══ */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="border-b border-white/[0.06] pb-4 mb-8"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <Globe className="h-4 w-4 shrink-0 text-white/40" />
              <span className="text-sm font-mono text-white/80 truncate">{url}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className={`h-1.5 w-1.5 rounded-full ${
                stage === "analyzing" ? "bg-amber-400 animate-pulse" :
                stage === "scanning" || stage === "extracting" ? "bg-blue-400 animate-pulse" :
                "bg-green-500"
              }`} />
              <span className={`font-mono ${statusColor}`}>{statusLabel}</span>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-6">
            <div className="flex items-center gap-2 text-xs">
              <Clock className="h-3 w-3 text-white/30" />
              <span className="font-mono text-white/60 tabular-nums">{elapsedDisplay}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Zap className="h-3 w-3 text-white/30" />
              <span className="text-white/50">{metrics.aiProvider}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Cpu className="h-3 w-3 text-white/30" />
              <span className="text-white/50 font-mono">{metrics.model}</span>
            </div>
            <span className="text-[11px] font-mono tabular-nums text-white/30">{progressPercent}%</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-[2px] bg-white/[0.04] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-blue-500"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </motion.div>

      {/* ═══ Main Layout ═══ */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* ═══ Timeline ═══ */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-6">
            <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-white/40">Execution</h2>
            <span className="text-[11px] font-mono text-white/20 ml-auto">
              {pipelineSteps.filter((s) => s.status === "completed" || s.status === "not-found").length}/{pipelineSteps.length}
            </span>
          </div>

          <div className="space-y-1">
            {pipelineSteps.map((step) => {
              const isActive = step.status === "in-progress";
              const isDone = step.status === "completed";
              const isNotFound = step.status === "not-found";
              const isError = step.status === "error";
              const isPending = step.status === "pending";
              const visible = isDone || isNotFound || isActive || isError;

              return (
                <motion.div
                  key={step.id}
                  initial={visible ? { opacity: 0, y: -4 } : false}
                  animate={visible ? { opacity: 1, y: 0 } : { opacity: isPending ? 0.25 : 1 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-4 py-2.5 border-b border-white/[0.02] last:border-0"
                >
                  {/* Status icon */}
                  <div className="shrink-0 w-5 flex justify-center">
                    {isDone && <Check className="h-4 w-4 text-green-500" />}
                    {isActive && <Loader2 className="h-4 w-4 animate-spin text-blue-400" />}
                    {isNotFound && <AlertCircle className="h-4 w-4 text-yellow-500" />}
                    {isError && <XCircle className="h-4 w-4 text-red-500" />}
                    {isPending && <span className="block h-4 w-4 rounded-full border border-white/[0.06]" />}
                  </div>

                  {/* Label */}
                  <div className="flex-1 min-w-0">
                    <span className={`text-sm transition-colors ${
                      isDone ? "text-white/80" :
                      isNotFound ? "text-yellow-400/70" :
                      isActive ? "text-blue-300" :
                      isError ? "text-red-400" :
                      "text-white/20"
                    }`}>
                      {step.label}
                    </span>
                    {isNotFound && (
                      <span className="ml-2 text-[10px] font-mono text-yellow-500/50">not found</span>
                    )}
                    {isError && (
                      <span className="ml-2 text-[10px] font-mono text-red-500/50">failed</span>
                    )}
                  </div>

                  {/* Duration / thinking message */}
                  <div className="shrink-0 flex items-center gap-2">
                    {isDone && step.duration > 0 && (
                      <span className="text-[10px] font-mono text-green-500/40 tabular-nums">
                        {formatDuration(step.duration)}
                      </span>
                    )}
                    {isActive && stage === "analyzing" && (
                      <span className="text-[10px] font-mono text-amber-400/60 animate-pulse whitespace-nowrap hidden sm:inline">
                        {AI_THINKING_MESSAGES[aiThinkingIdx]}
                      </span>
                    )}
                    {isActive && (
                      <ChevronRight className="h-3 w-3 text-blue-400/40" />
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ═══ Sidebar Metrics ═══ */}
        <div className="lg:w-56 shrink-0">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.3 }}
          >
            <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-white/40 mb-6">Metrics</h2>
            <div className="border border-white/[0.06] rounded-lg px-4 divide-y divide-white/[0.04]">
              <SidebarMetric label="Pages Found" value={metrics.pagesCrawled} />
              <SidebarMetric label="Documents" value={metrics.documentsFound} />
              <SidebarMetric label="Characters" value={metrics.charsExtracted.toLocaleString()} />
              <SidebarMetric label="Tokens" value={metrics.tokensProcessed.toLocaleString()} />
              <SidebarMetric label="Stage" value={metrics.currentStage} pulse={stage !== "complete"} />
              <SidebarMetric label="Duration" value={elapsedDisplay} pulse={stage !== "complete"} />
            </div>

            {/* Provider info */}
            <div className="mt-4 border border-white/[0.06] rounded-lg px-4 py-3">
              <div className="flex items-center gap-2 text-xs">
                <Zap className="h-3 w-3 text-white/30" />
                <span className="text-white/40">{metrics.aiProvider}</span>
              </div>
              <div className="flex items-center gap-2 text-xs mt-1.5">
                <Cpu className="h-3 w-3 text-white/30" />
                <span className="text-white/40 font-mono">{metrics.model}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
