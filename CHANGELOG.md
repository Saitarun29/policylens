# Changelog

All notable changes to PolicyLens are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.0.0] — 2026-07-30

### Added
- **Mission Control Workspace** — Complete redesign of the analysis experience:
  - Top header bar: URL, live status dot, elapsed time, AI provider, model
  - Live execution timeline with persistent steps and "thinking" messages
  - Compact sidebar with real-time metrics (pages, chars, tokens, stage, duration)
  - Thin 2px progress bar under header
- **Progressive Report Revelation** — Report sections animate in independently:
  - Phase 1: Score fades in with count-up animation (8xl typography)
  - Phase 2: Risk badge slides in with severity counts
  - Phase 3: Summary section with editorial spacing and meta bar
  - Phase 4: Findings animate in one-by-one with staggered delays
  - Phase 5: Numbered recommendations
- **Editorial Typography System** — Large type, monospace metrics, developer-tool aesthetic
- **Demo Data** — `public/demo/example-report.json` with realistic findings for Vercel

### Changed
- **Design System** — Replaced glassmorphism with developer-tool aesthetics:
  - Removed: `finding-card.tsx`, `risk-badge.tsx`, `score-gauge.tsx` (replaced by inline components)
  - Whitespace-driven layout with editorial spacing
  - Monospace typography for data/metrics
  - Subtle animations (fade, slide, counter, timeline) — no flashy motion

### Documentation
- **README** — Complete rewrite as product landing page with architecture diagrams, feature table, project philosophy
- **`docs/architecture.md`** — System architecture with 6 Mermaid diagrams
- **`docs/environment.md`** — Comprehensive environment variables reference
- **`docs/troubleshooting.md`** — Common issues, solutions, and debugging guide
- **`docs/ai-workflow.md`** — Expanded AI pipeline documentation with prompt design
- **`docs/deployment.md`** — Updated with Vercel one-click deploy button
- **`PORTFOLIO.md`** — Expanded with engineering challenges, technical decisions, key learnings
- **`SCREENSHOT_GUIDE.md`** — Added (supersedes `public/demo/capture-guide.md`)
- **`DEMO_SCRIPT.md`** — Added 60–90 second recording script
- **`RELEASE_NOTES.md`** — Added Product Hunt-ready launch notes

### Infrastructure
- **`vercel.json`** — Added with explicit framework configuration
- **`.github/workflows/ci.yml`** — GitHub Actions workflow for lint + typecheck + build
- **`.github/dependabot.yml`** — Automated weekly dependency updates
- **`.github/CODEOWNERS`** — Repository code ownership assignment
- **`.env.example`** — Cleaned up with Vercel deployment section
- **`RELEASE_CHECKLIST.md`** — Added with 9.2/10 audit scoring

### Code Quality
- Removed all `console.log` statements from production client code
- Fixed `setState-in-effect` warnings in 3 components (used `setTimeout` pattern)
- Cleaned unused imports across 5 files
- Fixed `as any` type assertions in `analyze/route.ts`
- Fixed `reportMeta` hoisting in `crawl-dashboard.tsx`
- ESLint passing with 0 errors (1 pre-existing warning)
- TypeScript strict mode with 0 compilation errors

### Fixed
- Build producing 0 errors, 0 warnings
- Lint producing 0 errors, 1 pre-existing warning

---

## [1.0.0] — 2026-07-29

### Added
- **Landing Page** — Premium hero with animated gradient, terminal-style typewriter badge, URL input with glow effects, feature cards, and 3-step workflow section
- **Scanner Pipeline** — Animated scanning dashboard with STEP indicators, live metrics, progress steps with status icons, and skeleton loading states
- **AI Analysis Engine** — Multi-step DeepSeek V4 Flash pipeline with structured website fact extraction, policy fact extraction, fact comparison, inconsistency detection, and confidence scoring
- **Consistency Report** — Premium report dashboard with animated SVG score gauge, executive summary, finding cards with confidence bars and evidence sections, and MD/JSON export
- **Error Handling** — Custom error states for crawl failure, AI failure, missing documents, and invalid URLs with retry buttons
- **Security Model** — API keys server-side only, boolean status endpoint
- **SEO** — Open Graph, Twitter cards, viewport, manifest, favicon links, keywords
- **Documentation** — README with badges, architecture diagram, tech stack, installation guide, API reference, folder structure
- **Community Files** — License, Code of Conduct, Contributing Guide, Security Policy, Issue/PR templates

### Architecture
- Next.js 16 App Router with Turbopack
- TypeScript strict mode throughout
- API routes: `POST /api/crawl` (Firecrawl), `POST /api/analyze` (DeepSeek), `GET /api/keys` (status)
- Zod validation on all API inputs
- Framer Motion animations (staggered, fade, slide, count-up)
- Tailwind CSS v4 + shadcn/ui component library

---

## [0.1.0] — 2026-07-28

### Added
- Project scaffold — Next.js 16 with App Router, TypeScript, Tailwind CSS v4
- Basic crawling functionality via Firecrawl API
- Basic AI analysis via DeepSeek API
- Minimal report rendering
- Project structure and configuration files
