# AI Workflow

## Overview

PolicyLens uses a single DeepSeek V4 Flash API call that performs a structured multi-step reasoning process. The AI never reads raw text for comparison — it first extracts structured facts, then compares those facts.

## Pipeline Steps

### Step 1: Extract Website Facts

The AI analyzes the homepage markdown content and extracts structured facts about what the website actually implements.

```json
{
  "companyName": "Example Corp",
  "authentication": true,
  "newsletter": true,
  "analytics": ["Google Analytics", "Meta Pixel"],
  "cookies": ["analytics", "marketing"],
  "paymentProviders": ["Stripe"],
  "aiFeatures": ["chatbot"],
  "contactForms": ["contact form"],
  "chatWidgets": ["Intercom"],
  "trackingScripts": ["gtag.js", "fbevents.js"],
  "thirdPartyServices": ["Google", "Facebook", "Stripe"],
  "dataCollected": ["email", "name", "usage data"],
  "countriesMentioned": ["US", "EU"]
}
```

### Step 2: Extract Policy Facts

The AI analyzes Privacy Policy, Terms of Service, and Cookie Policy (when available) and extracts what these documents disclose.

```json
{
  "mentionsAnalytics": ["Google Analytics"],
  "mentionsCookies": ["essential cookies"],
  "mentionsPayments": ["third-party processors"],
  "mentionsAI": [],
  "mentionsRetention": true,
  "mentionsNewsletter": false,
  "mentionsThirdParties": ["Google"],
  "mentionsUserRights": ["access", "deletion"],
  "mentionsInternationalTransfers": true
}
```

### Step 3: Compare Facts

The AI compares the website facts against the policy facts. This is a structured comparison — never raw text.

| Website Fact | Policy Disclosure | Status |
|-------------|------------------|--------|
| Google Analytics detected | Not mentioned | ❌ Gap |
| Newsletter signup found | Not mentioned | ❌ Gap |
| Stripe detected | "Third-party processors" | ✅ Partial |
| AI chatbot found | Not mentioned | ❌ Gap |

### Step 4: Detect Inconsistencies

Each gap becomes a finding with:
- **Category** — e.g. "Analytics Disclosure", "Cookie Consent"
- **Severity** — Critical / High / Medium / Low
- **Website Evidence** — Specific detection details
- **Policy Evidence** — What the policy says or doesn't say
- **Explanation** — Clear reasoning
- **Recommendation** — Actionable fix
- **Confidence** — 0.0 to 1.0 score

### Step 5: Severity Guide

| Severity | Criteria | Color |
|----------|----------|-------|
| **Critical** | Direct legal risk (no privacy policy, no consent mechanism) | Red |
| **High** | Significant gap (analytics without disclosure) | Red-400 |
| **Medium** | Moderate gap (cookies without cookie policy) | Amber |
| **Low** | Minor gap (improvement suggestion) | Green |

### Step 6: Scoring

The overall score is 0-100, calculated based on:
- Number and severity of findings
- Whether core documents exist
- The ratio of disclosed vs undisclosed features

### Step 7: JSON Response

```json
{
  "score": 72,
  "riskLevel": "Medium",
  "summary": "The website has several consistency gaps...",
  "statistics": { "critical": 0, "high": 2, "medium": 3, "low": 1 },
  "findings": [
    {
      "category": "Analytics Disclosure",
      "severity": "High",
      "websiteEvidence": "Google Analytics detected via gtag.js",
      "policyEvidence": "No analytics mention in Privacy Policy",
      "explanation": "Website uses analytics but policy doesn't disclose",
      "recommendation": "Add analytics disclosure to Privacy Policy",
      "confidence": 0.95
    }
  ]
}
```

## Prompt Engineering

The system prompt uses a multi-step instruction format that guides the AI through each stage sequentially. Key design choices:

- **Temperature 0.2** — Low temperature ensures consistent, deterministic outputs
- **Structured JSON only** — The prompt explicitly forbids markdown, explanations, or code blocks
- **Fallback parsing** — JSON extraction with regex fallback in case the AI wraps the response
- **Constraint enforcement** — The prompt specifies exact field names and value constraints

## Why DeepSeek V4 Flash?

- **Cost-effective** — Significantly cheaper than GPT-4 for equivalent reasoning quality
- **Fast** — Sub-second response times for structured extraction tasks
- **JSON mode** — Reliable structured JSON output with minimal formatting issues
- **OpenAI-compatible** — Integrates via the standard `@ai-sdk/openai` package
