"use client";

import { motion } from "framer-motion";
import { Link2, Zap, Shield, CheckCircle2, ArrowRight, Sparkles } from "lucide-react";

const steps = [
  {
    icon: Link2,
    title: "Submit Your URL",
    description:
      "Enter any public website URL to begin. PolicyLens immediately starts crawling your homepage and searching for Privacy Policy, Terms of Service, and Cookie Policy pages.",
    gradient: "from-blue-600 to-indigo-600",
    badgeBg: "bg-blue-500/10",
    badgeBorder: "border-blue-500/20",
    iconColor: "text-blue-400",
  },
  {
    icon: Zap,
    title: "AI Extracts & Analyzes",
    description:
      "We extract structured facts about your site's technologies, forms, analytics, and third-party services. Then AI compares everything against your legal documentation.",
    gradient: "from-indigo-600 to-violet-600",
    badgeBg: "bg-indigo-500/10",
    badgeBorder: "border-indigo-500/20",
    iconColor: "text-indigo-400",
  },
  {
    icon: Shield,
    title: "Get Consistency Report",
    description:
      "Receive a detailed consistency report with scores, categorized findings, severity ratings, and actionable recommendations to close gaps.",
    gradient: "from-violet-600 to-purple-600",
    badgeBg: "bg-violet-500/10",
    badgeBorder: "border-violet-500/20",
    iconColor: "text-violet-400",
  },
];

export default function HowItWorks() {
  return (
    <section className="relative border-t border-white/5 px-4 py-24 sm:py-32 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-0 top-1/2 h-[400px] w-[400px] rounded-full bg-indigo-500/5 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/5 bg-white/[0.02] px-4 py-1.5 text-xs text-muted-foreground">
            <Sparkles className="h-3 w-3" />
            How it works
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Simple{" "}
            <span className="gradient-text">workflow</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-md mx-auto leading-relaxed">
            Get from a website URL to a comprehensive consistency report in under a minute.
          </p>
        </motion.div>

        <div className="relative">
          {/* Desktop connecting line */}
          <div className="absolute left-[31px] top-0 bottom-0 hidden w-px bg-gradient-to-b from-blue-500/30 via-indigo-500/20 to-transparent sm:block" />

          <div className="relative space-y-12 sm:space-y-16">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="relative flex items-start gap-5 sm:gap-8"
              >
                {/* Step circle */}
                <div className="relative z-10 flex-shrink-0">
                  <div
                    className={`flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl ${step.badgeBg} ${step.badgeBorder} border transition-all duration-300 hover:scale-105 hover:shadow-lg`}
                  >
                    <step.icon className={`h-6 w-6 sm:h-7 sm:w-7 ${step.iconColor}`} />
                  </div>
                  <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-[11px] font-bold text-white shadow-lg shadow-blue-500/20">
                    {i + 1}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 pt-2 sm:pt-3">
                  <h3 className="text-lg sm:text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>

                  {/* Step indicator */}
                  <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground/50">
                    {i < steps.length - 1 ? (
                      <>
                        <span>Next step</span>
                        <ArrowRight className="h-3 w-3" />
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-3 w-3 text-green-400" />
                        <span className="text-green-400/60">Complete</span>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
