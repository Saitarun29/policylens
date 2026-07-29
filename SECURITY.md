# Security Policy

## Supported Versions

The following versions of PolicyLens are currently supported with security updates:

| Version | Supported |
|---------|-----------|
| 2.x     | ✅ Active development |
| 1.x     | ⚠️ Security patches only |

---

## Reporting a Vulnerability

We take the security of PolicyLens seriously. If you discover a security vulnerability, please follow **responsible disclosure practices**.

### Do NOT open a public issue

Instead, report directly to us:- **Email:** [your-email@example.com]  
- **PGP Key:** Available on request

### What to include

- **Type of vulnerability** — XSS, CSRF, API key exposure, etc.
- **Steps to reproduce** — Minimal, complete, verifiable steps
- **Potential impact** — What an attacker could achieve
- **Suggested fix** — If you have one, include it
- **Your contact** — For follow-up questions

### What to expect

| Stage | Timeline |
|-------|----------|
| Acknowledgment | Within 48 hours |
| Initial assessment | Within 5 business days |
| Fix timeline | Depends on severity (typically 7–30 days) |
| Public disclosure | After fix is deployed |

---

## Security Architecture

### API Keys

```
┌─────────────────────────────────────────────┐
│                   Browser                     │
│  - Renders UI only                           │
│  - Never sees API keys                       │
│  - Receives only structured report data      │
└──────────────┬──────────────────────────────┘
               │ HTTPS (TLS 1.3)
               ▼
┌─────────────────────────────────────────────┐
│              Next.js Server                   │
│  - POST /api/crawl    → Firecrawl (API key)  │
│  - POST /api/analyze  → DeepSeek (API key)   │
│  - GET /api/keys      → Boolean check only   │
└──────────────┬──────────────────────────────┘
               │ TLS
               ▼
┌─────────────────────────────────────────────┐
│            External Services                  │
│  - Firecrawl API                              │
│  - DeepSeek API                               │
└─────────────────────────────────────────────┘
```

**Key design decisions:**

- All API keys are **server-side environment variables**
- The client only accesses a `GET /api/keys` endpoint that returns **booleans** — never actual credentials
- No API key data is included in the client-side JavaScript bundle
- All external service calls execute in Next.js serverless functions

### Data Privacy

| Data | Policy |
|------|--------|
| User-entered URLs | Used only for the active analysis |
| Crawled website content | Held in server memory during analysis, discarded after response |
| AI-generated reports | Stored only in browser state (client-side React state) |
| API keys | Environment variables, never transmitted to client |
| Usage analytics | None — PolicyLens does not collect telemetry or analytics |
| Cookies | None — no tracking, analytics, or session cookies |

### Dependencies

- All dependencies are regularly audited with `npm audit`
- Dependabot is configured for automated security updates
- Pin dependency versions in `package.json` for reproducible builds
- Run `npm audit` before production deployments

---

## Best Practices

### For Development

1. **Never commit `.env` files** — The `.gitignore` excludes these, but verify before pushing
2. **Use `.env.example` as a template** — Copy and fill in your actual keys
3. **Rotate keys regularly** — Especially if you suspect a breach
4. **Use Vercel Environment Variables** — For production deployments, set env vars in the Vercel dashboard
5. **Keep dependencies updated** — Dependabot PRs should be reviewed and merged promptly

### For Deployment

1. **Enable HTTPS** — Vercel provides automatic TLS/SSL
2. **Set `maxDuration`** — API routes have 30-second timeouts configured
3. **Add rate limiting** — If deploying publicly, add API rate limiting (not included in MVP)
4. **Monitor logs** — Vercel provides built-in logging for function invocations
5. **Use a custom domain** — Avoid sharing the auto-generated `.vercel.app` URL for sensitive use

### For Users

1. **Verify the URL** — Always check you're on the correct PolicyLens instance
2. **Assume no privacy** — While PolicyLens doesn't store data, use caution with sensitive URLs
3. **Understand limitations** — PolicyLens is an analysis tool, not a compliance guarantee

---

## Security Checklist

- [ ] API keys stored as environment variables, not in code
- [ ] `.env*` files in `.gitignore`
- [ ] No secrets in client-side bundle
- [ ] HTTPS enabled (Vercel default)
- [ ] Input validation on all API endpoints (Zod)
- [ ] Error messages don't leak server details in production
- [ ] Dependencies audited
- [ ] Dependabot configured

---

## Responsible Disclosure

We appreciate security researchers who follow responsible disclosure:

1. Report the vulnerability privately
2. Allow time for a fix
3. Disclose after the fix is deployed

We will acknowledge your contribution in our security advisories (with your permission).

---

## Questions?

For security-related questions, contact **security@policylens.app**.
