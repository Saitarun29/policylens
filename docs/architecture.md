# Architecture

## Overview

PolicyLens is a full-stack Next.js 16 application that crawls websites, extracts structured facts via AI, and produces consistency reports comparing website implementation against legal documentation.

The application follows a **server-centric architecture** — all API keys, AI calls, and crawling logic execute on the server. The client only receives and displays structured data.

---

## User Flow

```mermaid
graph TD
    subgraph "User Journey"
        A[Enter URL] --> B[View Mission Control]
        B --> C[Live Timeline]
        C --> D[Score Reveal]
        D --> E[Findings]
        E --> F[Recommendations]
        F --> G[Export]
    end

    style A fill:#1e293b,stroke:#3b82f6,color:#e2e8f0
    style G fill:#1e293b,stroke:#3b82f6,color:#e2e8f0
```

---

## Application Architecture

```mermaid
graph TD
    subgraph "Client (Browser)"
        Landing[Landing Page<br/>src/app/page.tsx] --> Analyze
        Analyze[Analyze Page<br/>src/app/analyze/client.tsx]
        Analyze --> CrawlDash[Crawl Dashboard<br/>crawl-dashboard.tsx]
        Analyze --> Report[Consistency Report<br/>consistency-report.tsx]
    end

    subgraph "Server (Next.js API Routes)"
        CrawlAPI[POST /api/crawl] --> Firecrawl[Firecrawl API]
        AnalyzeAPI[POST /api/analyze] --> DeepSeek[DeepSeek V4 Flash]
        KeysAPI[GET /api/keys]
    end

    subgraph "External Services"
        Firecrawl --> Homepage[Homepage Markdown]
        Firecrawl --> Privacy[Privacy Policy]
        Firecrawl --> Terms[Terms of Service]
        Firecrawl --> Cookies[Cookie Policy]
        DeepSeek --> JSON[Structured JSON Report]
    end

    CrawlDash --> CrawlAPI
    CrawlDash --> KeysAPI
    Report --> AnalyzeAPI

    style Client fill:#0f172a,stroke:#334155,color:#e2e8f0
    style Server fill:#1e293b,stroke:#3b82f6,color:#e2e8f0
    style External fill:#0c1929,stroke:#2563eb,color:#94a3b8
```

---

## Request Lifecycle

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant K as GET /api/keys
    participant C as POST /api/crawl
    participant F as Firecrawl
    participant A as POST /api/analyze
    participant DS as DeepSeek AI

    U->>FE: Enter URL
    U->>FE: Click "Analyze Website"

    %% Key check
    FE->>K: GET /api/keys
    K-->>FE: { hasFirecrawlKey, hasAiKey }

    alt Missing API Keys
        FE->>U: Show Setup Required screen
    end

    %% Phase 1: Crawl
    FE->>C: POST /api/crawl { url }
    Note over C: Validates URL (Zod)
    C->>F: scrapeUrl(homepage)
    F-->>C: Homepage markdown (~15K tokens)
    C->>F: scrapeUrl(/privacy)
    alt Found
        F-->>C: Privacy policy markdown
    else Not Found
        C->>F: scrapeUrl(/privacy-policy)
    end
    C->>F: scrapeUrl(/terms)
    C->>F: scrapeUrl(/cookies)
    F-->>C: Raw markdown content
    C-->>FE: CrawlResult { content, metrics }

    %% Phase 2: Analyze
    FE->>A: POST /api/analyze { crawlResult }
    Note over A: System prompt + markdown
    A->>DS: Extract website facts
    A->>DS: Extract policy facts
    A->>DS: Compare fact sets
    A->>DS: Detect inconsistencies
    A->>DS: Score + summarize
    DS-->>A: ConsistencyReport JSON
    A-->>FE: { report }

    %% Phase 3: Reveal
    Note over FE: Progressive reveal animation
    FE->>U: Score fades in
    FE->>U: Summary slides in
    FE->>U: Findings animate one-by-one
    FE->>U: Recommendations appear
```

---

## Analysis Pipeline

```mermaid
flowchart LR
    subgraph "Crawl Phase"
        A[Homepage] --> B[Extract<br/>Website Facts]
    end

    subgraph "Policy Phase"
        C[Privacy Policy] --> D[Extract<br/>Policy Facts]
        E[Terms of Service] --> D
        F[Cookie Policy] --> D
    end

    subgraph "Comparison Phase"
        B --> G[Compare<br/>Fact Sets]
        D --> G
    end

    subgraph "Output Phase"
        G --> H[Detect<br/>Inconsistencies]
        H --> I[Assign<br/>Severity]
        I --> J[Calculate<br/>Score]
        J --> K[Generate<br/>Report JSON]
    end

    style Crawl fill:#1e293b,stroke:#3b82f6,color:#e2e8f0
    style Policy fill:#1e293b,stroke:#3b82f6,color:#e2e8f0
    style Comparison fill:#312e81,stroke:#6366f1,color:#e2e8f0
    style Output fill:#1e293b,stroke:#10b981,color:#e2e8f0
```

---

## Component Tree

```mermaid
graph TD
    Root[Root Layout<br/>layout.tsx] --> Landing[Landing Page<br/>page.tsx]
    Root --> Analyze[Analyze Page<br/>page.tsx]

    Landing --> Hero[hero.tsx]
    Landing --> Features[features.tsx]
    Landing --> HowItWorks[how-it-works.tsx]

    Analyze --> Client[Client<br/>client.tsx]
    Client --> Setup[setup-required.tsx<br/>Missing API keys]
    Client --> CrawlDash[crawl-dashboard.tsx<br/>Mission Control]
    Client --> Report[consistency-report.tsx<br/>Progressive Report]

    CrawlDash --> Progress[Progress Bar]
    CrawlDash --> Timeline[Live Timeline]
    CrawlDash --> Sidebar[Metrics Sidebar]

    Report --> Score[Score Section]
    Report --> Summary[Summary Section]
    Report --> Findings[Findings Section]
    Report --> Recommendations[Recommendations Section]

    style Root fill:#0f172a,stroke:#334155,color:#e2e8f0
    style Landing fill:#0f172a,stroke:#334155,color:#e2e8f0
    style Analyze fill:#0f172a,stroke:#334155,color:#e2e8f0
```

---

## Key Design Decisions

| Decision | Rationale | Tradeoff |
|----------|-----------|----------|
| **Single AI call** vs multi-step | Lower latency, fewer API costs, simpler error handling | Harder to debug intermediate results |
| **Server-side API routes** vs client-side API calls | API keys never exposed to browser, CORS-free | Requires Vercel serverless functions |
| **Firecrawl** vs Puppeteer/Playwright | Markdown output ideal for LLM, handles JS rendering, no infrastructure | External dependency, rate limits |
| **DeepSeek** vs GPT-4 | 10x cheaper for equivalent reasoning, OpenAI-compatible SDK | Less known, fewer integrations |
| **Session-only state** vs database | Zero infrastructure for MVP, no auth complexity | Reports lost on page refresh |
| **Dark mode only** vs theme toggle | Consistent brand experience, faster development | Accessibility limitation |
| **Zod validation** vs manual checks | Runtime type safety, declarative schemas, auto-error messages | Added dependency (~15KB) |
| **Progressive reveal** vs full report render | Better perceived performance, cinematic experience | More complex animation coordination |

---

## Data Flow

### Crawl Data Flow

```
User URL → Zod Validation → Firecrawl API → Markdown Content → Metrics
                                 │
                                 ├── Homepage (~15K tokens)
                                 ├── Privacy Policy (~30K tokens)
                                 ├── Terms of Service (~30K tokens)
                                 └── Cookie Policy (~10K tokens)
```

### Analysis Data Flow

```
Raw Markdown → System Prompt → DeepSeek → Structured JSON
                                                  │
                    ┌──────────────────────────────┤
                    │               │              │
                    ▼               ▼              ▼
            WebsiteFacts    PolicyFacts    Consistencies
                    │               │              │
                    └───────┬───────┘              │
                            ▼                      ▼
                      Comparison           Severity Scoring
                            │                      │
                            └──────────┬───────────┘
                                       ▼
                              ConsistencyReport
```

---

## Error Boundaries

The application implements three layers of error handling:

1. **Component-level** — Each UI section has its own error/empty/loading state
2. **API-level** — Zod validation + try/catch with structured error responses
3. **Route-level** — Next.js error boundaries for unhandled exceptions

```mermaid
graph TD
    subgraph "Error Handling Layers"
        A[Zod Validation] --> B[API Error Response]
        B --> C[Client Error State]
        C --> D[Retry Button]
        D --> A
    end

    style A fill:#dc2626,stroke:#7f1d1d,color:#fecaca
    style B fill:#dc2626,stroke:#7f1d1d,color:#fecaca
    style C fill:#dc2626,stroke:#7f1d1d,color:#fecaca
    style D fill:#2563eb,stroke:#1e40af,color:#bfdbfe
```

---

## Security Model

```
┌─────────────────────────────────────────────────────┐
│                    Browser                            │
│  - Renders UI only                                   │
│  - Never sees API keys                               │
│  - Receives only structured report data              │
└──────────────┬──────────────────────────────────────┘
               │ HTTPS (encrypted)
               ▼
┌─────────────────────────────────────────────────────┐
│               Next.js Server                          │
│  - POST /api/crawl    → Firecrawl (API key here)     │
│  - POST /api/analyze  → DeepSeek (API key here)      │
│  - GET /api/keys      → Boolean check only           │
└──────────────┬──────────────────────────────────────┘
               │ TLS
               ▼
┌─────────────────────────────────────────────────────┐
│            External Services                          │
│  - Firecrawl API                                     │
│  - DeepSeek API                                      │
└─────────────────────────────────────────────────────┘
```

---

## Related Documentation

- [AI Workflow](ai-workflow.md) — Detailed AI pipeline design
- [API Reference](api.md) — Endpoint specifications
- [Deployment](deployment.md) — Vercel deployment guide
- [Environment Variables](environment.md) — Configuration reference
- [Limitations](limitations.md) — Known constraints
- [Troubleshooting](troubleshooting.md) — Common issues
