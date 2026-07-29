# Environment Variables

## Overview

PolicyLens uses environment variables for all external service configuration. Secrets are never exposed to the client browser — API routes handle all external service calls server-side.

---

## Required Variables

### Firecrawl — Website Crawling

```env
FIRECRAWL_API_KEY=fc_your_api_key_here
```

| Detail | Value |
|--------|-------|
| **Required** | Yes |
| **Source** | [firecrawl.dev](https://firecrawl.dev) |
| **Free tier** | 500 credits/month |
| **Used by** | `POST /api/crawl` |
| **Exposed to client** | No (checked via `GET /api/keys` boolean) |

### DeepSeek — AI Analysis (Recommended)

```env
DEEPSEEK_API_KEY=sk_your_api_key_here
```

| Detail | Value |
|--------|-------|
| **Required** | One AI provider (DeepSeek or Mistral) |
| **Source** | [platform.deepseek.com](https://platform.deepseek.com) |
| **Pricing** | $0.07 / 1M input tokens, $0.28 / 1M output tokens |
| **Used by** | `POST /api/analyze` |
| **Model** | Default: `deepseek-chat` (can be overridden with `DEEPSEEK_MODEL`) |

### Mistral — AI Analysis (Alternative)

```env
MISTRAL_API_KEY=your_mistral_api_key_here
MISTRAL_MODEL=mistral-large-latest
```

| Detail | Value |
|--------|-------|
| **Required** | One AI provider (DeepSeek or Mistral) |
| **Source** | [console.mistral.ai](https://console.mistral.ai) |
| **Pricing** | $2 / 1M input tokens, $6 / 1M output tokens |
| **Used by** | `POST /api/analyze` |
| **Fallback order** | DeepSeek is preferred if both keys are set |

---

## Optional Variables

```env
# Customize AI model (optional)
DEEPSEEK_MODEL=deepseek-chat

# Override app URL (for custom domains)
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

---

## Provider Selection Logic

The API route (`src/app/api/analyze/route.ts`) selects the AI provider with this priority:

```
if DEEPSEEK_API_KEY exists → use DeepSeek
else if MISTRAL_API_KEY exists → use Mistral
else → return "MISSING_API_KEY" error
```

---

## Setup Instructions

### Local Development

1. Copy the template:

```bash
cp .env.example .env.local
```

2. Edit `.env.local` with your API keys:

```env
FIRECRAWL_API_KEY=fc_your_firecrawl_api_key_here
DEEPSEEK_API_KEY=sk_your_deepseek_api_key_here
```

3. Restart the dev server:

```bash
npm run dev
```

### Vercel Deployment

1. Go to your Vercel project dashboard → **Settings** → **Environment Variables**
2. Add each variable:

| Name | Value | Environments |
|------|-------|-------------|
| `FIRECRAWL_API_KEY` | `fc_...` | Production, Preview, Development |
| `DEEPSEEK_API_KEY` | `sk_...` | Production, Preview, Development |

3. Redeploy or wait for automatic deployment

> **⚠️ Security Note:** Never commit `.env` or `.env.local` files to version control. The `.gitignore` already excludes these files.

---

## Verification

To verify your environment is configured correctly:

1. Start the dev server
2. Open `http://localhost:3000`
3. The landing page will display a terminal-style badge showing configuration status
4. The `GET /api/keys` endpoint returns which keys are configured (boolean only — no actual key values)

```json
// GET /api/keys response
{
  "hasFirecrawlKey": true,
  "hasAiKey": true,
  "provider": "DeepSeek"
}
```

---

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| "Firecrawl API key is not configured" | `FIRECRAWL_API_KEY` missing | Add the key to `.env.local` or Vercel env vars |
| "DeepSeek API key is not configured" | No AI provider key set | Add `DEEPSEEK_API_KEY` or `MISTRAL_API_KEY` |
| "401 Unauthorized" | Invalid API key | Verify the key on the provider's dashboard |
| "Provider not available" | Provider outage | Switch to alternative AI provider or check service status |

---

## Security FAQ

**Q: Are API keys exposed to the browser?**

No. API keys are used exclusively in Next.js API routes (`src/app/api/`). The client only receives boolean status via `GET /api/keys`.

**Q: Can someone steal my API key from the client bundle?**

No. API keys are server-side environment variables. They never appear in the client-side JavaScript bundle.

**Q: Should I rotate my keys?**

Yes. If you suspect a key has been compromised, regenerate it on the provider dashboard and update your environment variables.
