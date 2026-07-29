# Deployment Guide

## Deploy to Vercel (Recommended)

PolicyLens is optimized for Vercel deployment with zero configuration.

### Prerequisites

1. A [Vercel](https://vercel.com) account
2. A [Firecrawl](https://firecrawl.dev) API key
3. A [DeepSeek](https://platform.deepseek.com) API key
4. Your code pushed to a GitHub repository

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Manual Deployment

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Configure environment variables:

| Variable | Value | Secret |
|----------|-------|--------|
| `FIRECRAWL_API_KEY` | Your Firecrawl API key | ✅ |
| `DEEPSEEK_API_KEY` | Your DeepSeek API key | ✅ |

4. Click **Deploy**

### Post-Deployment

1. Vercel automatically generates a URL (e.g. `policylens.vercel.app`)
2. Configure a custom domain in Vercel dashboard if desired
3. Update Open Graph URLs in `src/app/layout.tsx` with your actual domain

---

## Environment Variables

```env
# Required
FIRECRAWL_API_KEY=fc_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
DEEPSEEK_API_KEY=sk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Optional - for custom deployment
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

---

## Build Configuration

The project uses Next.js 16 with Turbopack for development. The production build:

```bash
npm run build
# Creates .next/ folder optimized for production

npm start
# Starts production server on http://localhost:3000
```

### Build Settings (Vercel)

| Setting | Value |
|---------|-------|
| Framework | Next.js |
| Build Command | `npm run build` |
| Output Directory | `.next` |
| Node Version | 20.x (default) |

---

## Performance Notes

- The `/api/crawl` route has `maxDuration: 30` set
- The `/api/analyze` route has `maxDuration: 30` set
- Both require Node.js runtime (not Edge) for Firecrawl compatibility
- Crawl results are ephemeral — no caching layer in MVP
- Consider adding Redis/Vercel KV for production caching

---

## Monitoring

Add these for production:

1. **Vercel Analytics** — Built-in, enable in Vercel dashboard
2. **Error Tracking** — Add Sentry for API error monitoring
3. **Uptime Monitoring** — Vercel Status Pages or Better Uptime

---

## Custom Domain

1. Go to your Vercel project → **Domains**
2. Add your domain (e.g. `policylens.app`)
3. Configure DNS records as instructed by Vercel
4. Wait for SSL certificate provisioning (automatic)
5. Update Open Graph and metadata URLs in `layout.tsx`
