"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Globe, Search, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SetupRequired from "@/components/analyze/setup-required";
import type { KeysStatus } from "@/app/api/keys/route";

// CLIENT HYDRATED flag to track when component has mounted
const useClientMounted = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);
  return mounted;
};

function AnimatedBadge() {
  const [text, setText] = useState("");
  const fullText = "AI-powered Website & Policy Consistency Analyzer";
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setText(fullText.slice(0, i));
      if (i >= fullText.length) clearInterval(timer);
    }, 30);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const cursor = setInterval(() => {
      setShowCursor((c) => !c);
    }, 530);
    return () => clearInterval(cursor);
  }, []);

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1.5 text-sm text-blue-400 font-mono">
      <Terminal className="h-3.5 w-3.5" />
      <span>
        {text}
        <span
          className={`inline-block w-[2px] h-4 bg-blue-400 ml-0.5 transition-opacity ${
            showCursor ? "opacity-100" : "opacity-0"
          }`}
        />
      </span>
    </span>
  );
}

export default function Hero() {
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [keysStatus, setKeysStatus] = useState<KeysStatus | null>(null);
const [checkingKeys, setCheckingKeys] = useState(true);
  const mounted = useClientMounted();
  const router = useRouter();

  const checkKeys = useCallback(async () => {
    if (!mounted) return false;
    setCheckingKeys(true);
    try {
      const res = await fetch("/api/keys");
      if (res.ok) {
        const data: KeysStatus = await res.json();
        setKeysStatus(data);
        setCheckingKeys(false);
        return true;
      } else {
        setKeysStatus({
          firecrawl: { configured: false },
          ai: { configured: false, provider: null, missing: true },
          allConfigured: false,
          missingKeys: ["FIRECRAWL_API_KEY", "DEEPSEEK_API_KEY or MISTRAL_API_KEY"],
        });
        setCheckingKeys(false);
        return true;
      }
    } catch {
      setKeysStatus({
        firecrawl: { configured: false },
        ai: { configured: false, provider: null, missing: true },
        allConfigured: false,
        missingKeys: ["FIRECRAWL_API_KEY", "DEEPSEEK_API_KEY or MISTRAL_API_KEY"],
      });
      setCheckingKeys(false);
      return true;
    }
  }, [mounted]);

  useEffect(() => {
    if (mounted) {
      const timer = setTimeout(() => checkKeys(), 0);
      return () => clearTimeout(timer);
    }
  }, [checkKeys, mounted]);

  const isValidUrl = (u: string) => {
    try {
      const parsed = new URL(u);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  };

  const handleSubmit = () => {
    const trimmed = url.trim();
    if (!trimmed) {
      setError("Please enter a website URL");
      return;
    }
    let normalized = trimmed;
    if (!/^https?:\/\//i.test(normalized)) {
      normalized = "https://" + normalized;
    }
    if (!isValidUrl(normalized)) {
      setError("Please enter a valid URL (e.g. https://example.com)");
      return;
    }
    setError(null);
    setLoading(true);
    router.push(`/analyze?url=${encodeURIComponent(normalized)}`);
  };

  const handleDemo = () => {
    setLoading(true);
    router.push(`/analyze?url=${encodeURIComponent("https://example.com")}`);
  };

  // Show loading state while checking keys
  if (checkingKeys) {
    return (
      <section className="relative flex flex-col items-center justify-center px-4 pt-28 pb-20 text-center sm:pt-40 sm:pb-28 overflow-hidden min-h-[90vh]">
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-[0.02]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-gradient-to-b from-blue-600/20 via-indigo-600/10 to-transparent blur-[120px]" />
        </div>
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-400/30 border-t-blue-400" />
          <p className="text-sm text-muted-foreground">Checking configuration...</p>
        </div>
      </section>
    );
  }

  // Show setup screen if keys are missing
  if (keysStatus && !keysStatus.allConfigured) {
    return (
      <SetupRequired
        missingKeys={keysStatus.missingKeys}
        onRetry={checkKeys}
        checking={checkingKeys}
      />
    );
  }

  return (
    <section
      className="relative flex flex-col items-center justify-center px-4 pt-28 pb-20 text-center sm:pt-40 sm:pb-28 overflow-hidden min-h-[90vh]"
    >
      {/* Animated background grid */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.02]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Gradient orbs */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-gradient-to-b from-blue-600/20 via-indigo-600/10 to-transparent blur-[120px]" />
        <motion.div
          className="absolute bottom-0 left-[10%] h-[300px] w-[300px] rounded-full bg-indigo-500/10 blur-[100px]"
          animate={{ y: [-20, 20, -20] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -right-20 top-1/3 h-[250px] w-[250px] rounded-full bg-violet-500/10 blur-[100px]"
          animate={{ y: [15, -15, 15] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-4xl relative z-10"
      >
        {/* Animated badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="mb-8 flex justify-center"
        >
          <AnimatedBadge />
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl leading-[0.95]"
        >
          <span className="gradient-text">PolicyLens</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="mt-6 text-2xl font-semibold text-white/90 sm:text-3xl md:text-4xl"
        >
          Keep Your Website and Policies in Sync.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-4 text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed"
        >
          Analyze your website against its Privacy Policy and Terms of Service
          using AI. Detect inconsistencies, missing disclosures, and
          documentation drift in minutes.
        </motion.p>

        {/* Input section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mx-auto mt-10 max-w-lg"
        >
          <div className="group relative">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-violet-500/20 opacity-0 blur-xl transition-all duration-500 group-hover:opacity-100 group-focus-within:opacity-80" />

            <div className="relative glass flex items-center gap-2 rounded-xl p-1.5 transition-all duration-300 group-hover:border-blue-500/30 group-focus-within:border-blue-500/40">
              <div className="flex flex-1 items-center gap-2 pl-3">
                <Globe className="h-4 w-4 shrink-0 text-muted-foreground" />
                <Input
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    if (error) setError(null);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  placeholder="https://example.com"
                  className="border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/40"
                  aria-label="Website URL to analyze"
                />
              </div>
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="shrink-0 gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/25 hover:shadow-blue-500/30 hover:from-blue-500 hover:to-indigo-500 transition-all duration-300 active:scale-[0.97]"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Analyzing
                  </>
                ) : (
                  <>
                    Analyze Website
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                  </>
                )}
              </Button>
            </div>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 text-left text-sm text-red-400"
              role="alert"
            >
              {error}
            </motion.p>
          )}

          {/* Secondary CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-4"
          >
            <Button
              variant="ghost"
              onClick={handleDemo}
              className="gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Search className="h-4 w-4" />
              View Demo
            </Button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.5 }}
            className="mt-8 text-xs text-muted-foreground/40 max-w-md mx-auto leading-relaxed"
          >
            PolicyLens provides AI-assisted analysis only.
            It does not provide legal advice.
            All findings should be reviewed by qualified legal professionals.
          </motion.p>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.5 }}
          className="mx-auto mt-16 grid max-w-lg grid-cols-3 gap-8 sm:gap-12"
        >
          {[
            { value: "10+", label: "Patterns Detected" },
            { value: "< 30s", label: "Average Analysis" },
            { value: "AI", label: `${keysStatus?.ai.provider === "mistral" ? "Mistral Large" : "DeepSeek V4 Flash"}` },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-xl font-bold text-white/80 sm:text-2xl">
                {stat.value}
              </div>
              <div className="mt-1 text-xs text-muted-foreground/50">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
