import { NextResponse } from "next/server";

export interface KeysStatus {
  firecrawl: { configured: boolean };
  ai: {
    configured: boolean;
    provider: "deepseek" | "mistral" | null;
    missing: boolean;
  };
  allConfigured: boolean;
  missingKeys: string[];
}

export async function GET() {
  const firecrawlKey = process.env.FIRECRAWL_API_KEY;
  const deepseekKey = process.env.DEEPSEEK_API_KEY;
  const mistralKey = process.env.MISTRAL_API_KEY;
  const isFirecrawlConfigured = !!firecrawlKey && firecrawlKey.length > 10;
  const isDeepseekConfigured = !!deepseekKey && deepseekKey.length > 10;
  const isMistralConfigured = !!mistralKey && mistralKey.length > 10;
  const aiConfigured = isDeepseekConfigured || isMistralConfigured;
  const aiProvider = isDeepseekConfigured ? "deepseek" : isMistralConfigured ? "mistral" : null;

  const missingKeys: string[] = [];
  if (!isFirecrawlConfigured) missingKeys.push("FIRECRAWL_API_KEY");
  if (!isDeepseekConfigured && !isMistralConfigured) {
    missingKeys.push("DEEPSEEK_API_KEY or MISTRAL_API_KEY");
  } else if (isDeepseekConfigured && isMistralConfigured) {
    // Both configured — note that DeepSeek takes priority
  }

  const status: KeysStatus = {
    firecrawl: { configured: isFirecrawlConfigured },
    ai: {
      configured: aiConfigured,
      provider: aiProvider,
      missing: !aiConfigured,
    },
    allConfigured: isFirecrawlConfigured && aiConfigured,
    missingKeys,
  };

  return NextResponse.json(status);
}
