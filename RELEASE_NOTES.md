# PolicyLens — Release Notes

## v1.0.0 — Initial Release

**Tagline:** AI-powered website vs. policy documentation analysis in minutes.

**URL:** [policylens.app](https://policylens.app)

---

### 🚀 What is PolicyLens?

PolicyLens crawls any public website, extracts structured facts using AI, and compares them against the site's Privacy Policy, Terms of Service, and Cookie Policy. It detects inconsistencies, missing disclosures, and documentation drift — then generates a professional report with actionable recommendations.

---

### ✨ Key Features

| Feature | Description |
|---------|-------------|
| **Mission Control Workspace** | Real-time execution timeline with live metrics — like watching an AI inspect a website |
| **AI-Powered Analysis** | DeepSeek V4 Flash / Mistral Large extracts website facts, compares against policies, and scores consistency |
| **Progressive Report** | Score → Summary → Findings → Recommendations — each section animates in independently |
| **Drift Detection** | Identifies analytics, payment processors, data collection, and AI tools running without policy disclosure |
| **Confidence Scoring** | Every finding includes a confidence percentage — no black-box decisions |
| **Multi-Provider AI** | Supports DeepSeek and Mistral — bring your own API key |
| **Export** | Copy summary, download Markdown or JSON |

---

### 🏗️ Architecture

```
User → Next.js 16 Frontend → POST /api/crawl → Firecrawl API
                           → POST /api/analyze → DeepSeek / Mistral
                           → Progressive Report with staggered animation
```

- **Frontend:** Next.js 16 (App Router, Turbopack), TypeScript, Tailwind CSS v4
- **Backend:** Next.js API Routes (serverless functions)
- **AI:** OpenAI-compatible SDK with DeepSeek or Mistral providers
- **Crawling:** Firecrawl API v4 with markdown output
- **Deployment:** Vercel (zero-config)

---

### 🎨 Design

Developer-tool aesthetic inspired by Vercel, Linear, and GitHub. Dark theme with editorial typography (Geist), subtle animations, and clean borders. No glassmorphism, no decorative gradients.

---

### 🔧 Getting Started

```bash
git clone <repo-url>
cd driftguard
npm install
# Add API keys to .env.local
npm run dev
```

Required environment variables:
- `FIRECRAWL_API_KEY` — Get at [firecrawl.dev](https://firecrawl.dev)
- `DEEPSEEK_API_KEY` or `MISTRAL_API_KEY` — Get at [platform.deepseek.com](https://platform.deepseek.com) or [console.mistral.ai](https://console.mistral.ai)

---

### 🧪 Compatible Websites

- **Vercel** — `https://vercel.com` (demo report available at `public/demo/example-report.json`)
- **GitHub** — `https://github.com`
- **Stripe** — `https://stripe.com`
- **OpenAI** — `https://openai.com`

---

### 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion 12 |
| AI SDK | Vercel AI SDK |
| Crawling | Firecrawl API |
| Icons | Lucide React |
| Font | Geist (Vercel) |

---

### 📄 License

MIT — see [LICENSE](./LICENSE)

---

### 🙏 Acknowledgements

- [Firecrawl](https://firecrawl.dev) for reliable web scraping
- [DeepSeek](https://deepseek.com) for cost-effective AI
- [Vercel](https://vercel.com) for the AI SDK and deployment platform
- [shadcn/ui](https://ui.shadcn.com) for component primitives
