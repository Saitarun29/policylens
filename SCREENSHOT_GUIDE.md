# PolicyLens — Screenshot Guide

**Purpose:** Capture high-quality screenshots for GitHub README, Product Hunt, LinkedIn, and portfolio.

**Settings:** Chrome DevTools at 1440×900 viewport, 2x device pixel ratio.

---

## Screen 1 — Landing Page

| Attribute | Value |
|-----------|-------|
| **URL** | `http://localhost:3000` |
| **Viewport** | 1440×900 |
| **Pre-condition** | API keys configured |
| **File** | `public/demo/hero.svg` |

**What to capture:**
- Full hero section with animated badge
- URL input with placeholder text
- "Analyze Website" button
- Stats row (Patterns, Analysis, AI Provider)

**How to capture:**
1. Open Chrome DevTools (F12)
2. Set viewport to 1440×900 (toggle device toolbar)
3. Wait for the badge typing animation to complete
4. Use Cmd+Shift+P → "Capture full-size screenshot"

---

## Screen 2 — Analysis Workspace (Timeline)

| Attribute | Value |
|-----------|-------|
| **URL** | `http://localhost:3000/analyze?url=https://vercel.com` |
| **Viewport** | 1440×900 |
| **Pre-condition** | API keys configured |
| **File** | `public/demo/scanner.svg` |

**What to capture:**
- Header bar with URL, status, elapsed time, provider, model
- Execution timeline with 4-5 completed steps visible
- Sidebar metrics updating

**How to capture:**
1. Enter `https://vercel.com` on landing and click Analyze
2. Wait until the crawling phase is half complete
3. Capture before the analysis completes

---

## Screen 3 — Report (Score + Summary)

| Attribute | Value |
|-----------|-------|
| **URL** | Wait for report to auto-reveal |
| **Viewport** | 1440×900 |
| **Pre-condition** | Analysis complete |
| **File** | `public/demo/report.svg` |

**What to capture:**
- Large score number with severity color
- Risk badge
- Severity counts (Critical/High/Medium/Low)
- Summary section with editorial typography
- Meta bar (pages, docs, chars, tokens, duration)

**How to capture:**
1. Let the analysis complete fully
2. Wait for the progressive reveal (Score → Summary → Findings)
3. Capture at the "Findings" phase — showing all sections visible

---

## Screen 4 — Report (Findings Section)

| Attribute | Value |
|-----------|-------|
| **Viewport** | 1440×900 |
| **File** | `public/demo/report.svg` (findings section at bottom) |

**What to capture:**
- 2-3 finding cards visible
- Scroll to the findings section of the report
- One card expanded to show confidence bar and evidence panels

**How to capture:**
1. After report loads, scroll to the findings section
2. Click the first finding to expand it
3. The confidence bar animation should be complete
4. Capture showing the split evidence view

---

## Screen 5 — Error State

| Attribute | Value |
|-----------|-------|
| **URL** | `http://localhost:3000` |
| **Pre-condition** | Remove API keys from `.env.local`, restart server |
| **File** | Screenshot capture from Chrome DevTools |

**What to capture:**
- Setup Required screen with missing keys listed
- Copy button for env template
- Links to get API keys

**How to capture:**
1. Comment out API keys in `.env.local`
2. Restart dev server
3. Enter a URL and click Analyze
4. Capture the setup required screen

---

## Screen 6 — Mobile View

| Attribute | Value |
|-----------|-------|
| **Viewport** | 390×844 (iPhone 14 Pro) |
| **File** | `public/demo/mobile.svg` |

**What to capture:**
- Mobile layout of the landing page
- Responsive URL input
- Stacked feature cards

**How to capture:**
1. Set viewport to iPhone 14 Pro (390×844)
2. Reload the landing page
3. Capture full page scroll

---

## Editing Guidelines

| Adjustment | Value |
|------------|-------|
| Format | SVG or PNG |
| Resolution | 2880×1800 (2x) |
| Compression | PNG-8 or SVG minified |
| Border | 1px solid `#ffffff10` (for dark backgrounds) |
| Shadow | Optional: drop-shadow for README embeds |

## Folder Structure

```
public/demo/
├── hero.svg              # Landing page hero
├── scanner.svg           # Analysis workspace with timeline
├── report.svg            # Full report score + summary
├── dashboard.svg         # Analysis pipeline in progress
├── mobile.svg            # Mobile responsive view
├── example-report.json   # Demo report data (Vercel example)
```
