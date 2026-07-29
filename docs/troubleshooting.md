# Troubleshooting

This guide covers common issues you may encounter while developing, deploying, or using PolicyLens.

---

## Build Errors

### `Module not found: Can't resolve '...'`

**Cause:** Missing dependency or incorrect import path.

**Fix:**
```bash
npm install   # Ensure all dependencies are installed
```

**Prevention:** Run `npm run build` locally before pushing to GitHub. The CI pipeline will catch these errors.

### TypeScript compilation errors

**Cause:** Type mismatch, missing type definition, or strict mode violation.

**Common fixes:**
- Ensure all API responses match their TypeScript interfaces (`src/lib/types.ts`)
- Check that optional fields are handled with optional chaining (`?.`)
- Verify async function return types

### `'React' is declared but its value is never read`

This is a React 19 / Next.js 16 change — explicit React imports are no longer needed with the new JSX transform. The `eslint.config.mjs` already suppresses this warning.

---

## Runtime Errors

### "Setup Required" screen appears

**Cause:** API keys are missing or not configured.

**Fix:**

1. Check `.env.local` exists in the project root
2. Ensure `FIRECRAWL_API_KEY` and at least one AI provider key are set
3. Restart the dev server (`npm run dev`)
4. If on Vercel, verify environment variables in project settings

**Verification:**
```bash
# Check if keys are loaded (must restart server after changing .env.local)
curl http://localhost:3000/api/keys
# Expected: {"hasFirecrawlKey":true,"hasAiKey":true,"provider":"DeepSeek"}
```

### Crawl fails — "The site may be unreachable"

**Cause:** Firecrawl could not access the target URL.

**Possible reasons:**

| Reason | Check | Fix |
|--------|-------|-----|
| Site blocks bots | Try `curl -A "Mozilla/5.0" https://example.com` | Use a different URL |
| Invalid URL | URL format check | Ensure URL starts with `http://` or `https://` |
| Firecrawl outage | [status.firecrawl.dev](https://status.firecrawl.dev) | Wait and retry |
| Rate limited | Check Firecrawl dashboard | Wait for rate limit to reset |

### AI analysis fails — "AI analysis failed"

**Cause:** DeepSeek API returned an error or unexpected response.

**Steps:**

1. **Verify the API key** is valid and has credits
2. **Check the model** — `deepseek-chat` should work with any DeepSeek account
3. **Retry** — Transient network errors sometimes resolve on retry
4. **Check logs** — The server logs include the raw AI response for debugging (development mode only)

**If the AI returns malformed JSON:**

The application has a fallback parser that attempts to extract JSON from markdown-wrapped responses. If parsing still fails, the AI may have returned an unexpectedly structured response. The error message will indicate the stage of failure.

### "No documents found" warning

**Cause:** The target website doesn't have privacy policy, terms of service, or cookie policy at standard paths.

**Impact:** The analysis will proceed with only homepage content. Findings will be less comprehensive but the tool still works.

**Fix:** None needed — this is expected for some websites.

---

## Deployment Issues

### Vercel deployment fails

**Common causes:**

| Cause | Symptom | Fix |
|-------|---------|-----|
| Missing environment variables | Build succeeds but runtime 500s | Add env vars in Vercel dashboard |
| Node version mismatch | Build error in Vercel logs | Set Node.js 20.x in Vercel settings |
| Build timeout | Build exceeds 45s limit | Check for large dependency changes |
| API route timeout | `maxDuration` exceeded | Ensure `maxDuration: 30` is set in route config |

### API routes return 504 Gateway Timeout

**Cause:** The crawl or analysis exceeded the 30-second serverless function timeout.

**Fix:**
- Reduce content size by targeting smaller pages
- If consistently timing out, consider upgrading to Vercel Pro (60s timeout)
- The analysis typically completes in 5–15 seconds for most websites

### Custom domain not working

1. Verify DNS records match Vercel's configuration
2. Wait for SSL certificate provisioning (up to 5 minutes)
3. Check Vercel domain settings for the correct CNAME record

---

## Development Issues

### Hot reload not working

```bash
# Clear Next.js cache
rm -rf .next

# Restart dev server
npm run dev
```

### Changes not reflected in browser

1. Hard refresh (Cmd+Shift+R / Ctrl+Shift+R)
2. Clear browser cache (DevTools → Network → Disable cache while DevTools is open)
3. Restart the dev server

### Tailwind classes not applying

Tailwind CSS v4 uses a different configuration system than v3. Ensure:

- No `tailwind.config.js` (v4 uses CSS-first configuration)
- Utility classes are used directly in JSX
- The `postcss.config.mjs` correctly references `@tailwindcss/postcss`

---

## Performance Issues

### Analysis is slow

| Factor | Typical Duration | Notes |
|--------|-----------------|-------|
| Homepage crawl | 1–3 seconds | Depends on page size and JS rendering |
| Legal doc crawl | 2–5 seconds | Multiple pages, larger content |
| AI analysis | 3–8 seconds | Token count dependent, longer for large docs |
| **Total** | **8–20 seconds** | Normal range for most websites |

**If analysis takes >30 seconds:** The target website likely has very large pages (>100K tokens). Consider testing with a simpler website.

### High API costs

- **Firecrawl:** 1 analysis = ~4-8 credits (homepage + 3 legal docs)
- **DeepSeek:** 1 analysis = ~500-2000 tokens ($0.00035–$0.00140)
- At 500 credits/month (Firecrawl free tier): ~60–125 full analyses

To reduce costs:
1. Target smaller websites with fewer pages
2. Use DeepSeek (much cheaper than Mistral)
3. Cache results for repeated analyses of the same URL

---

## Getting Help

If you've tried the solutions above and still have issues:

1. **Check existing GitHub issues** — Your problem may already be reported
2. **Open a new issue** — Include:
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (OS, Node version, browser)
   - Console output or error logs
   - `.env.example` contents (without real keys)
3. **Search the docs** — All documentation is in the `docs/` folder

---

## Related

- [Environment Variables](environment.md) — Complete env reference
- [Limitations](limitations.md) — Known constraints and workarounds
- [Deployment](deployment.md) — Vercel deployment guide
