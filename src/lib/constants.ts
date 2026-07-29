export const SEVERITY_COLORS = {
  Critical: { bg: "bg-red-500/10", text: "text-red-500", border: "border-red-500/20", dot: "bg-red-500" },
  High: { bg: "bg-red-400/10", text: "text-red-400", border: "border-red-400/20", dot: "bg-red-400" },
  Medium: { bg: "bg-amber-500/10", text: "text-amber-500", border: "border-amber-500/20", dot: "bg-amber-500" },
  Low: { bg: "bg-green-500/10", text: "text-green-500", border: "border-green-500/20", dot: "bg-green-500" },
} as const;

export const RISK_LABELS = {
  Critical: "Critical Risk",
  High: "High Risk",
  Medium: "Medium Risk",
  Low: "Low Risk",
} as const;

export function getScoreColor(score: number): string {
  if (score >= 80) return "#22c55e";
  if (score >= 60) return "#eab308";
  if (score >= 40) return "#f97316";
  return "#ef4444";
}

export const PIPELINE_STEPS: { id: string; label: string; stage: "validate" | "crawl" | "extract" | "ai" | "report" }[] = [
  // Stage: Validate
  { id: "validate-url", label: "Validating URL", stage: "validate" },
  { id: "connect-firecrawl", label: "Connecting to Firecrawl", stage: "validate" },
  
  // Stage: Crawl
  { id: "crawl-homepage", label: "Crawling Homepage", stage: "crawl" },
  { id: "find-privacy", label: "Discovering Privacy Policy", stage: "crawl" },
  { id: "find-terms", label: "Discovering Terms of Service", stage: "crawl" },
  { id: "find-cookies", label: "Discovering Cookie Policy", stage: "crawl" },
  
  // Stage: Extract
  { id: "extract-facts", label: "Extracting Website Facts", stage: "extract" },
  
  // Stage: AI
  { id: "build-prompt", label: "Building AI Prompt", stage: "ai" },
  { id: "send-to-ai", label: "Sending to Mistral", stage: "ai" },
  { id: "compare-docs", label: "Comparing Documents", stage: "ai" },
  
  // Stage: Report
  { id: "generate-report", label: "Generating Report", stage: "report" },
];

export const AI_THINKING_MESSAGES = [
  "Analyzing privacy disclosures...",
  "Comparing website content...",
  "Evaluating documentation consistency...",
  "Cross-referencing legal terms...",
  "Detecting potential gaps...",
  "Generating recommendations...",
];

export const STAGE_LABELS: Record<string, { label: string; color: string }> = {
  validate: { label: "Validation", color: "text-blue-400" },
  crawl: { label: "Crawling", color: "text-indigo-400" },
  extract: { label: "Extraction", color: "text-violet-400" },
  ai: { label: "AI Analysis", color: "text-amber-400" },
  report: { label: "Report", color: "text-green-400" },
};