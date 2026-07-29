"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Globe, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import CrawlDashboard from "@/components/analyze/crawl-dashboard";
import SetupRequired from "@/components/analyze/setup-required";
import type { KeysStatus } from "@/app/api/keys/route";

export default function AnalyzeClient() {
  const searchParams = useSearchParams();
  const url = searchParams.get("url");

  const [keysStatus, setKeysStatus] = useState<KeysStatus | null>(null);
  const [checkingKeys, setCheckingKeys] = useState(true);
  const [entered, setEntered] = useState(false);

  const checkKeys = async () => {
    setCheckingKeys(true);
    try {
      const res = await fetch("/api/keys");
      if (res.ok) {
        const data: KeysStatus = await res.json();
        setKeysStatus(data);
      } else {
        setKeysStatus({
          firecrawl: { configured: false },
          ai: { configured: false, provider: null, missing: true },
          allConfigured: false,
          missingKeys: ["FIRECRAWL_API_KEY", "DEEPSEEK_API_KEY or MISTRAL_API_KEY"],
        });
      }
    } catch {
      setKeysStatus({
        firecrawl: { configured: false },
        ai: { configured: false, provider: null, missing: true },
        allConfigured: false,
        missingKeys: ["FIRECRAWL_API_KEY", "DEEPSEEK_API_KEY or MISTRAL_API_KEY"],
      });
    } finally {
      setCheckingKeys(false);
      // Trigger entrance animation after keys check
      setTimeout(() => setEntered(true), 100);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => checkKeys(), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!url) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center py-24 px-4"
      >
        <div className="glass-strong rounded-2xl p-10 text-center max-w-md w-full">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/10">
            <Globe className="h-7 w-7 text-blue-400" />
          </div>

          <h2 className="mb-2 text-xl font-semibold">No URL Provided</h2>
          <p className="mb-2 text-sm text-muted-foreground leading-relaxed">
            Enter a website URL on the home page to start a consistency analysis.
          </p>
          <p className="mb-8 text-xs text-muted-foreground/50">
            PolicyLens will crawl your site and compare it against its legal documentation.
          </p>

          <Link href="/">
            <Button className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </motion.div>
    );
  }

  // Loading state while checking keys (with smooth transition)
  if (!entered) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center justify-center py-32 px-4"
      >
        <div className="flex flex-col items-center gap-5">
          <div className="relative">
            {/* Animated ring */}
            <div className="absolute inset-0 rounded-full border-2 border-blue-500/20 animate-ping opacity-30" />
            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/10">
              <Search className="h-6 w-6 text-blue-400" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-white/60">Preparing analysis workspace</p>
            <p className="mt-1 text-xs text-muted-foreground/40">{url}</p>
          </div>
          <Loader2 className="h-4 w-4 animate-spin text-blue-400/60" />
        </div>
      </motion.div>
    );
  }

  // Setup required screen
  if (keysStatus && !keysStatus.allConfigured) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <SetupRequired
          missingKeys={keysStatus.missingKeys}
          onRetry={checkKeys}
          checking={checkingKeys}
        />
      </motion.div>
    );
  }

  // Main analysis workspace with entrance animation
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="workspace"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="mx-auto w-full max-w-6xl px-4 pt-6">
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground group"
            >
              <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
              Back
            </Link>
          </motion.div>
        </div>
        <CrawlDashboard url={url} />
      </motion.div>
    </AnimatePresence>
  );
}
