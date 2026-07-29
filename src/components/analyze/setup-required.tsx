"use client";

import { motion } from "framer-motion";
import {
  ShieldAlert,
  Settings,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Copy,
  FileCode,
  Terminal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface SetupRequiredProps {
  missingKeys: string[];
  onRetry: () => void;
  checking?: boolean;
}

function MissingKeyCard({
  envVar,
  setupUrl,
  docsUrl,
}: {
  envVar: string;
  setupUrl: string;
  docsUrl: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(`${envVar}=your_${envVar.toLowerCase()}_key`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-strong rounded-xl p-5 space-y-4"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-500/10 border border-red-500/20">
          <XCircle className="h-4 w-4 text-red-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-white/90">{envVar}</h4>
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
            This environment variable is required for PolicyLens to function.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 rounded-lg bg-white/[0.03] border border-white/[0.06] px-3 py-2">
          <FileCode className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <code className="flex-1 truncate text-xs font-mono text-muted-foreground/80">
            {envVar}=your_{envVar.toLowerCase()}_key
          </code>
          <button
            onClick={handleCopy}
            className="shrink-0 rounded-md p-1 text-muted-foreground/50 hover:text-foreground hover:bg-white/10 transition-colors"
            aria-label={`Copy ${envVar} template`}
          >
            {copied ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={setupUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 hover:border-blue-500/30 transition-all duration-200"
          >
            <ExternalLink className="h-3 w-3" />
            Get API Key
          </a>
          <a
            href={docsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/[0.1] transition-all duration-200"
          >
            <ExternalLink className="h-3 w-3" />
            Documentation
          </a>
        </div>
      </div>
    </motion.div>
  );
}

export default function SetupRequired({
  missingKeys,
  onRetry,
  checking = false,
}: SetupRequiredProps) {
  // Determine the key-specific links
  const isFirecrawlMissing = missingKeys.some((k) =>
    k.includes("FIRECRAWL")
  );
  const isAIMissing = missingKeys.some((k) =>
    k.includes("DEEPSEEK") || k.includes("MISTRAL")
  );

  return (
    <section className="relative flex flex-col items-center justify-center px-4 py-20 text-center overflow-hidden min-h-[80vh]">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-gradient-to-b from-amber-600/15 via-orange-600/10 to-transparent blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-xl w-full"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/15"
        >
          <ShieldAlert className="h-10 w-10 text-amber-400" />
        </motion.div>

        {/* Heading */}
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          <span className="gradient-text">Setup Required</span>
        </h2>

        <p className="mt-4 text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
          PolicyLens needs API keys to crawl websites and analyze policies.
          Configure the following environment variables to get started.
        </p>

        {/* Missing keys cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-10 space-y-3 text-left"
        >
          {isFirecrawlMissing && (
            <MissingKeyCard
              envVar="FIRECRAWL_API_KEY"
              setupUrl="https://firecrawl.dev"
              docsUrl="https://docs.firecrawl.dev"
            />
          )}

          {isAIMissing && (
            <>
              <MissingKeyCard
                envVar="DEEPSEEK_API_KEY"
                setupUrl="https://platform.deepseek.com"
                docsUrl="https://platform.deepseek.com/docs"
              />
              <div className="relative flex items-center gap-3 py-2">
                <div className="flex-1 h-px bg-white/[0.06]" />
                <span className="text-xs text-muted-foreground/40 font-medium">OR</span>
                <div className="flex-1 h-px bg-white/[0.06]" />
              </div>
              <MissingKeyCard
                envVar="MISTRAL_API_KEY"
                setupUrl="https://console.mistral.ai"
                docsUrl="https://docs.mistral.ai"
              />
            </>
          )}
        </motion.div>

        {/* .env setup instructions */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 glass rounded-xl p-5 text-left"
        >
          <div className="flex items-center gap-2 mb-3">
            <Terminal className="h-4 w-4 text-muted-foreground" />
            <h4 className="text-sm font-semibold text-white/80">Quick Setup</h4>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Create a <code className="text-blue-400 font-mono text-xs bg-blue-500/10 px-1 py-0.5 rounded">.env.local</code> file in the project root:
            </p>

            <pre className="rounded-lg bg-black/40 border border-white/[0.06] p-3 overflow-x-auto">
              <code className="text-xs font-mono text-muted-foreground/80 leading-loose block">
                {[
                  isFirecrawlMissing && "# 🔍 Firecrawl — for website crawling",
                  isFirecrawlMissing && "FIRECRAWL_API_KEY=fc_your_key_here",
                  "",
                  isAIMissing && "# 🧠 AI Provider — for policy analysis (choose one)",
                  isAIMissing && "# Option A: DeepSeek",
                  isAIMissing && "DEEPSEEK_API_KEY=sk_your_key_here",
                  isAIMissing && "# Option B: Mistral",
                  isAIMissing && "# MISTRAL_API_KEY=your_key_here",
                ]
                  .filter(Boolean)
                  .join("\n")}
              </code>
            </pre>

            <p className="text-xs text-muted-foreground/60 leading-relaxed">
              After adding the keys, restart the development server and refresh this page.
            </p>
          </div>
        </motion.div>

        {/* Retry button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <Button
            onClick={onRetry}
            disabled={checking}
            className="gap-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:from-amber-500 hover:to-orange-500 shadow-lg shadow-amber-600/25 hover:shadow-amber-500/30 transition-all duration-300 active:scale-[0.97]"
          >
            {checking ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Checking...
              </>
            ) : (
              <>
                <Settings className="h-4 w-4" />
                Check Again
              </>
            )}
          </Button>
        </motion.div>

        {/* Tip */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-xs text-muted-foreground/40 max-w-sm mx-auto leading-relaxed"
        >
          💡 API keys stay securely on the server. PolicyLens never exposes your keys to the browser.
        </motion.p>
      </motion.div>
    </section>
  );
}
