"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Shield,
  Globe,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { ConsistencyReport, ReportMeta, Finding } from "@/lib/types";

interface ReportProps {
  report: ConsistencyReport;
  url: string;
  meta?: ReportMeta;
}

// ─── Helpers ──────────────────────────────────────────────────────────────

const SEVERITY_CONFIG: Record<string, { color: string; dot: string; label: string }> = {
  Critical: { color: "text-red-500", dot: "bg-red-500", label: "Critical" },
  High: { color: "text-red-400", dot: "bg-red-400", label: "High" },
  Medium: { color: "text-yellow-500", dot: "bg-yellow-500", label: "Medium" },
  Low: { color: "text-green-500", dot: "bg-green-500", label: "Low" },
};

function severityBorder(s: string): string {
  switch (s) {
    case "Critical": return "border-l-red-500/50";
    case "High": return "border-l-red-400/40";
    case "Medium": return "border-l-yellow-500/40";
    case "Low": return "border-l-green-500/40";
    default: return "border-l-white/10";
  }
}

// ─── Section Header ───────────────────────────────────────────────────────

function SectionHeader({ number, title }: { number: string; title: string }) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <span className="text-[10px] font-mono font-bold text-white/20">{number}</span>
      <h2 className="text-lg font-semibold tracking-tight text-white/90">{title}</h2>
      <div className="flex-1 h-px bg-white/[0.04]" />
    </div>
  );
}

// ─── Finding Card ─────────────────────────────────────────────────────────

function ReportFindingCard({ finding, index, animate }: { finding: Finding; index: number; animate: boolean }) {
  const [open, setOpen] = useState(false);
  const cfg = SEVERITY_CONFIG[finding.severity] || SEVERITY_CONFIG.Low;
  const confidencePct = Math.round(finding.confidence * 100);

  if (!animate) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.12 }}
      className={`border-l-2 ${severityBorder(finding.severity)} border-t border-r border-b border-white/[0.04] rounded-r-lg`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start gap-3 p-4 text-left"
      >
        <div className="shrink-0 mt-0.5">
          <span className={`block h-2 w-2 rounded-full ${cfg.dot}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-white/90">{finding.category}</span>
            <span className={`text-[10px] font-mono font-medium ${cfg.color}`}>{finding.severity}</span>
          </div>
          <p className="text-sm text-white/50 leading-relaxed line-clamp-2">{finding.explanation}</p>
        </div>
        <div className="shrink-0 mt-1">
          {open ? <ChevronUp className="h-3.5 w-3.5 text-white/30" /> : <ChevronDown className="h-3.5 w-3.5 text-white/30" />}
        </div>
      </button>

      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="overflow-hidden"
        >
          <div className="border-t border-white/[0.04] px-4 py-4 space-y-4">
            {/* Confidence */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-white/30 font-mono">confidence</span>
                <span className="text-white/40">{confidencePct}%</span>
              </div>
              <div className="h-1 bg-white/[0.04] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${confidencePct}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full bg-blue-500 rounded-full"
                />
              </div>
            </div>

            {/* Evidence */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="border border-white/[0.04] rounded-lg p-3">
                <p className="text-[10px] font-mono font-medium text-white/30 mb-1.5 uppercase tracking-wider">website</p>
                <p className="text-xs text-white/50 leading-relaxed">{finding.websiteEvidence}</p>
              </div>
              <div className="border border-white/[0.04] rounded-lg p-3">
                <p className="text-[10px] font-mono font-medium text-white/30 mb-1.5 uppercase tracking-wider">policy</p>
                <p className="text-xs text-white/50 leading-relaxed">{finding.policyEvidence}</p>
              </div>
            </div>

            {/* Recommendation */}
            <div className="border border-blue-500/10 bg-blue-500/[0.02] rounded-lg p-3">
              <p className="text-[10px] font-mono font-medium text-blue-400/50 mb-1.5 uppercase tracking-wider">recommendation</p>
              <p className="text-xs text-blue-300/70 leading-relaxed">{finding.recommendation}</p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function ConsistencyReportView({ report, url, meta }: ReportProps) {
  const [phase, setPhase] = useState(0);
  const [showFindings, setShowFindings] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);

  // Progressive reveal: 0 → 1 (score) → 2 (risk) → 3 (summary) → 4 (findings) → 5 (recs)
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 300);
    const t2 = setTimeout(() => setPhase(2), 700);
    const t3 = setTimeout(() => setPhase(3), 1200);
    const t4 = setTimeout(() => { setPhase(4); setShowFindings(true); }, 1800);
    const t5 = setTimeout(() => setPhase(5), 2600);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5); };
  }, []);

  const severityCounts = [
    { label: "Critical", count: report.statistics.critical, color: "text-red-500" },
    { label: "High", count: report.statistics.high, color: "text-red-400" },
    { label: "Medium", count: report.statistics.medium, color: "text-yellow-500" },
    { label: "Low", count: report.statistics.low, color: "text-green-500" },
  ];

  const topRecs = useMemo(() => {
    return [...new Set(report.findings.slice(0, 3).map((f) => f.recommendation))];
  }, [report.findings]);

  const safeName = url.replace(/https?:\/\//, "").replace(/[^a-z0-9]/gi, "-");

  // ─── Exports ───────────────────────────────────────────────────────────
  const copySummary = useCallback(async () => {
    const text = [
      `PolicyLens — Consistency Report`,
      `Score: ${report.score}/100 · Risk: ${report.riskLevel}`,
      `URL: ${url}`,
      ``,
      report.summary,
      ``,
      `Findings: ${report.findings.length} (${report.statistics.critical}c / ${report.statistics.high}h / ${report.statistics.medium}m / ${report.statistics.low}l)`,
    ].join("\n");
    await navigator.clipboard.writeText(text);
  }, [report, url]);

  const downloadJson = () => {
    const blob = new Blob(
      [JSON.stringify({ url, report, meta, generatedAt: new Date().toISOString() }, null, 2)],
      { type: "application/json" }
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `policylens-${safeName}.json`;
    a.click();
  };

  const downloadMarkdown = () => {
    const md = `# PolicyLens Report\n\n**URL:** ${url}\n**Score:** ${report.score}/100\n**Risk:** ${report.riskLevel}\n\n${report.summary}\n\n## Findings\n\n${report.findings.map((f, i) => `### ${i + 1}. [${f.severity}] ${f.category}\n\n${f.explanation}\n\n**Recommendation:** ${f.recommendation}\n`).join("\n")}`;
    const blob = new Blob([md], { type: "text/markdown" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `policylens-${safeName}.md`;
    a.click();
  };

  // ═══════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      {/* ═══ Header ═══ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="border-b border-white/[0.06] pb-4 mb-10"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <Globe className="h-4 w-4 shrink-0 text-white/40" />
            <span className="text-sm font-mono text-white/70 truncate">{url}</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={copySummary} className="text-[11px] font-mono text-white/30 hover:text-white/50 transition-colors">
              Copy
            </button>
            <button onClick={downloadMarkdown} className="text-[11px] font-mono text-white/30 hover:text-white/50 transition-colors">
              MD
            </button>
            <button onClick={downloadJson} className="text-[11px] font-mono text-white/30 hover:text-white/50 transition-colors">
              JSON
            </button>
          </div>
        </div>
      </motion.div>

      {/* ═══ Score Section ═══ */}
      {phase >= 1 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/30 mb-4">Score</p>
          <div className="flex items-baseline gap-3">
            <span className={`text-8xl font-bold tracking-tight tabular-nums ${
              report.score >= 80 ? "text-green-500" :
              report.score >= 60 ? "text-yellow-500" :
              report.score >= 40 ? "text-orange-500" : "text-red-500"
            }`}>
              {report.score}
            </span>
            <span className="text-lg font-light text-white/20">/ 100</span>
            {phase >= 2 && (
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                className={`ml-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border ${
                  report.riskLevel === "Critical" || report.riskLevel === "High"
                    ? "bg-red-500/10 text-red-400 border-red-500/20"
                    : report.riskLevel === "Medium"
                    ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                    : "bg-green-500/10 text-green-400 border-green-500/20"
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${
                  report.riskLevel === "Critical" || report.riskLevel === "High" ? "bg-red-500" :
                  report.riskLevel === "Medium" ? "bg-yellow-500" : "bg-green-500"
                }`} />
                {report.riskLevel}
              </motion.span>
            )}
          </div>

          {/* Severity chips */}
          <div className="flex gap-3 mt-4">
            {severityCounts.map((s) => (
              <span key={s.label} className="text-xs font-mono tabular-nums text-white/30">
                <span className={s.color}>{s.count}</span>
                <span className="text-white/20"> {s.label.toLowerCase()}</span>
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* ═══ Summary ═══ */}
      {phase >= 3 && (
        <motion.div
          ref={summaryRef}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-12"
        >
          <SectionHeader number="01" title="Summary" />
          <p className="text-sm leading-[1.8] text-white/60 max-w-2xl">{report.summary}</p>

          {/* Meta bar */}
          {meta && (
            <div className="flex flex-wrap gap-4 mt-4 text-[11px] font-mono text-white/25">
              <span>pages: {meta.pagesCrawled}</span>
              <span>docs: {meta.documentsFound}</span>
              <span>chars: {meta.charsExtracted.toLocaleString()}</span>
              <span>tokens: {meta.tokensProcessed.toLocaleString()}</span>
              <span>duration: {meta.totalDuration.toFixed(1)}s</span>
              <span>model: {meta.model}</span>
            </div>
          )}
        </motion.div>
      )}

      {/* ═══ Findings ═══ */}
      {phase >= 4 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="mb-12"
        >
          <SectionHeader number="02" title={`Findings (${report.findings.length})`} />

          {report.findings.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="border border-white/[0.06] rounded-lg p-8 text-center"
            >
              <Shield className="h-8 w-8 mx-auto mb-3 text-green-500/50" />
              <p className="text-sm font-medium text-white/60">No inconsistencies detected</p>
              <p className="text-xs text-white/30 mt-1">Website and documentation appear well-aligned.</p>
            </motion.div>
          ) : (
            <div className="space-y-2">
              {report.findings.map((finding, i) => (
                <ReportFindingCard key={i} finding={finding} index={i} animate={showFindings} />
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* ═══ Recommendations ═══ */}
      {phase >= 5 && topRecs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-12"
        >
          <SectionHeader number="03" title="Recommendations" />
          <div className="space-y-2">
            {topRecs.map((rec, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
                className="flex items-start gap-3 p-4 border border-blue-500/10 bg-blue-500/[0.02] rounded-lg"
              >
                <span className="shrink-0 text-xs font-mono font-bold text-blue-400/50 w-5">{i + 1}</span>
                <p className="text-sm text-blue-300/80 leading-relaxed">{rec}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ═══ Footer ═══ */}
      {phase >= 5 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="border-t border-white/[0.04] pt-6 mt-8"
        >
          <p className="text-[11px] text-white/20 text-center">
            PolicyLens provides AI-assisted analysis and is not a substitute for legal review.
          </p>
        </motion.div>
      )}
    </div>
  );
}
