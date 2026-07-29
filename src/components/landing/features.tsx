"use client";

import { motion } from "framer-motion";
import { Search, Brain, FileJson, GitBranch, BarChart3, FileText, Sparkles } from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Real Website Crawling",
    description:
      "Actually crawls public web pages, discovers legal documents, and extracts meaningful structural data from your site.",
    gradient: "from-blue-600 to-indigo-600",
    tag: "Firecrawl",
  },
  {
    icon: Brain,
    title: "AI Policy Analysis",
    description:
      "DeepSeek-powered comparison between your website implementation and legal documentation. Finds gaps and inconsistencies instantly.",
    gradient: "from-indigo-600 to-violet-600",
    tag: "DeepSeek V4 Flash",
  },
  {
    icon: FileJson,
    title: "Structured Fact Extraction",
    description:
      "Extracts technologies, authentication methods, analytics, third-party services, forms, and AI widgets into structured JSON facts.",
    gradient: "from-violet-600 to-purple-600",
    tag: "Schema Validated",
  },
  {
    icon: GitBranch,
    title: "Drift Detection",
    description:
      "Identifies where your website behavior diverges from what your legal documents disclose — analytics, cookies, payments, and more.",
    gradient: "from-blue-600 to-indigo-600",
    tag: "Gap Analysis",
  },
  {
    icon: BarChart3,
    title: "Risk Scoring",
    description:
      "Visual 0-100 consistency score with categorized severity levels. Instantly understand your compliance posture at a glance.",
    gradient: "from-indigo-600 to-violet-600",
    tag: "Score Gauge",
  },
  {
    icon: FileText,
    title: "Professional Reports",
    description:
      "Clear, actionable findings with evidence, severity ratings, and specific recommendations. Export as Markdown or JSON.",
    gradient: "from-violet-600 to-purple-600",
    tag: "Exportable",
  },
];

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Features() {
  return (
    <section className="relative border-t border-white/5 px-4 py-24 sm:py-32 overflow-hidden">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-px w-1/2 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-indigo-500/5 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/5 bg-white/[0.02] px-4 py-1.5 text-xs text-muted-foreground">
            <Sparkles className="h-3 w-3" />
            Features
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Everything you need to{" "}
            <span className="gradient-text">stay consistent</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-lg mx-auto leading-relaxed">
            From crawling to reporting — PolicyLens gives you full visibility into
            how your website aligns with its legal documentation.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature) => (
            <motion.div key={feature.title} variants={item} className="group relative">
              <div className="relative h-full glass rounded-xl p-6 transition-all duration-300 hover:bg-white/[0.08] hover:border-white/20 hover:shadow-lg hover:shadow-blue-500/5 hover:-translate-y-0.5">
                {/* Icon */}
                <div
                  className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} text-white shadow-lg transition-transform duration-300 group-hover:scale-110`}
                >
                  <feature.icon className="h-5 w-5" />
                </div>

                <h3 className="mb-3 text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>

                {/* Bottom tag */}
                <div className="mt-5 pt-4 border-t border-white/5">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-400/80">
                    <span className="h-1 w-1 rounded-full bg-blue-400" />
                    {feature.tag}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
