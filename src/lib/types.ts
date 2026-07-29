export interface CrawlMetrics {
  pagesCrawled: number;
  tokensProcessed: number;
  duration: number;
  documentsFound: number;
}

export interface CrawlDocumentInfo {
  found: boolean;
  url: string | null;
}

export interface CrawlResult {
  url: string;
  homepageContent: string;
  privacyContent: string | null;
  termsContent: string | null;
  cookiesContent: string | null;
  documents: {
    privacyPolicy: CrawlDocumentInfo;
    termsOfService: CrawlDocumentInfo;
    cookiePolicy: CrawlDocumentInfo;
  };
  metrics: CrawlMetrics;
}

export interface Finding {
  category: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  websiteEvidence: string;
  policyEvidence: string;
  explanation: string;
  recommendation: string;
  confidence: number;
}

export interface ConsistencyReport {
  score: number;
  riskLevel: "Critical" | "High" | "Medium" | "Low";
  summary: string;
  statistics: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  findings: Finding[];
}

export type AppStage = "idle" | "scanning" | "extracting" | "analyzing" | "complete" | "error";

export interface CrawlStage {
  id: string;
  label: string;
  status: "pending" | "in-progress" | "completed" | "not-found" | "error";
}

export interface ReportMeta {
  pagesCrawled: number;
  documentsFound: number;
  charsExtracted: number;
  tokensProcessed: number;
  analysisDuration: number;
  totalDuration: number;
  aiProvider: string;
  model: string;
}
