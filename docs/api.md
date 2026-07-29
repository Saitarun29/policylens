# API Reference

## POST /api/crawl

Scrapes a website via Firecrawl. Returns raw markdown content for AI extraction.

### Request

```json
{
  "url": "https://example.com"
}
```

### Validation

| Field | Rule |
|-------|------|
| url | Required. Must be a valid URL starting with `http://` or `https://`. Max 2048 chars. |

### Response (200)

```json
{
  "url": "https://example.com",
  "homepageContent": "# Example Domain\n\nThis domain is for use in illustrative examples...",
  "privacyContent": "# Privacy Policy\n\n... (or null if not found)",
  "termsContent": "# Terms of Service\n\n... (or null if not found)",
  "cookiesContent": null,
  "documents": {
    "privacyPolicy": { "found": true, "url": "https://example.com/privacy" },
    "termsOfService": { "found": true, "url": "https://example.com/terms" },
    "cookiePolicy": { "found": false, "url": null }
  },
  "metrics": {
    "pagesCrawled": 3,
    "tokensProcessed": 12500,
    "duration": 2.4,
    "documentsFound": 3
  }
}
```

### Errors

| Status | Message |
|--------|---------|
| 400 | "Please provide a valid URL starting with http:// or https://" |
| 500 | "Firecrawl API key is not configured" |
| 502 | "Failed to crawl the website. The site may be unreachable." |

---

## POST /api/analyze

Multi-step AI pipeline that extracts facts from raw content, compares them, and returns a consistency report.

### Request

```json
{
  "url": "https://example.com",
  "homepageContent": "# Example Domain...",
  "privacyContent": "# Privacy Policy...",
  "termsContent": "# Terms of Service...",
  "cookiesContent": null,
  "documents": { ... },
  "metrics": { ... }
}
```

Accepts the full `CrawlResult` object from `/api/crawl`.

### Response (200)

```json
{
  "report": {
    "score": 72,
    "riskLevel": "Medium",
    "summary": "2-3 sentence summary of the consistency posture",
    "statistics": {
      "critical": 0,
      "high": 1,
      "medium": 3,
      "low": 2
    },
    "findings": [
      {
        "category": "Analytics Disclosure",
        "severity": "High",
        "websiteEvidence": "Google Analytics detected via gtag.js script tag",
        "policyEvidence": "No mention of analytics tools in Privacy Policy",
        "explanation": "The website uses Google Analytics but the Privacy Policy does not disclose this",
        "recommendation": "Update the Privacy Policy to list all analytics tools used",
        "confidence": 0.92
      }
    ]
  }
}
```

### Errors

| Status | Message |
|--------|---------|
| 400 | "Invalid crawl data provided" |
| 500 | "DeepSeek API key is not configured" |
| 502 | "AI analysis failed. Please try again." / "AI returned an unexpected response format" |

### AI Pipeline Steps

1. Extract structured Website Facts from homepage markdown
2. Extract structured Policy Facts from legal documents
3. Compare facts (never raw text)
4. Detect inconsistencies with severity and confidence
5. Calculate overall score and generate summary

---

## TypeScript Types

See `src/lib/types.ts` for the complete TypeScript interface definitions.
