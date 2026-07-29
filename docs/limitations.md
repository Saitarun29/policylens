# Limitations & Known Constraints

## Current Limitations

### Crawling

- **Single-page crawl** — Only crawls the homepage and direct links to /privacy, /terms, /cookies. Does not follow internal links or parse sitemaps.
- **Firecrawl dependency** — Requires a Firecrawl API key. Free tier has rate limits (typically 500 credits/month).
- **JavaScript-heavy sites** — Sites that require JavaScript rendering may not be fully captured. Firecrawl supports JS rendering but it's slower and more expensive.
- **Authentication** — Cannot crawl sites behind login walls or authentication gates.

### AI Analysis

- **Content limits** — The AI prompt is limited to ~45K tokens. Very large legal documents may be truncated.
- **Structured extraction** — The AI extracts facts from raw markdown. Complex legal language or poorly structured pages may produce lower quality extractions.
- **Confidence scores** — AI confidence is a heuristic, not a statistically validated metric.
- **Single AI call** — All steps (extraction, comparison, scoring) happen in one API call. This is efficient but limits the ability to debug intermediate steps.

### Legal Disclaimer

- **Not legal advice** — PolicyLens provides AI-assisted analysis only. It does not provide legal advice.
- **No guarantee** — The analysis may miss inconsistencies or produce false positives.
- **Jurisdiction-specific** — Does not account for jurisdiction-specific legal requirements (GDPR, CCPA, LGPD, etc.) in depth.

### Technical

- **No persistent storage** — Reports are held in browser state only. Refreshing the page loses results.
- **No authentication** — No user accounts. Anyone with the URL can trigger an analysis.
- **No rate limiting** — No built-in rate limiting. Public deployment should add API protection.
- **Dark mode only** — No light mode toggle currently.

## Known Constraints

| Constraint | Impact | Workaround |
|------------|--------|------------|
| Single-page crawl | May miss legal pages not at standard paths | Add more paths to the crawl route |
| Token limits | Large docs may be truncated | Focus prompt on most relevant sections |
| No caching | Repeated analysis of same URL costs API credits | Add Redis/Vercel KV caching |
| No streaming | User waits for full analysis to complete | Implement SSE for real-time progress |

## Browser Support

| Browser | Support |
|---------|---------|
| Chrome 90+ | ✅ Full |
| Firefox 90+ | ✅ Full |
| Safari 15+ | ✅ Full |
| Edge 90+ | ✅ Full |
| IE 11 | ❌ Not supported |

## Future Improvements

See [roadmap.md](./roadmap.md) for planned improvements addressing these limitations.
