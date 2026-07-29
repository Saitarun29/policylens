import Hero from "@/components/landing/hero";
import Features from "@/components/landing/features";
import HowItWorks from "@/components/landing/how-it-works";

export default function Home() {
  return (
    <main className="flex-1">
      <Hero />
      <Features />
      <HowItWorks />

      {/* Premium Footer */}
      <footer className="border-t border-white/5">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
            <div className="text-center sm:text-left">
              <p className="text-sm font-semibold text-white/60">
                <span className="gradient-text">PolicyLens</span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground/40">
                AI-powered Website &amp; Policy Consistency Analyzer
              </p>
            </div>
            <div className="flex items-center gap-6 text-xs text-muted-foreground/50">
              <a href="https://firecrawl.dev" target="_blank" rel="noopener noreferrer" className="hover:text-foreground/80 transition-colors">
                Firecrawl
              </a>
              <a href="https://deepseek.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground/80 transition-colors">
                DeepSeek
              </a>
              <span>Next.js</span>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/5">
            <p className="text-center text-xs text-muted-foreground/40 leading-relaxed">
              PolicyLens provides AI-assisted analysis only. It does not provide legal advice.
              All findings should be reviewed by qualified legal professionals.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
