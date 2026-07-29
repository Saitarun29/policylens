# Contributing to PolicyLens

Thank you for considering contributing to PolicyLens. This project aims to make website-policy consistency verification accessible to every team, and your contributions help achieve that.

---

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to uphold this code.

---

## How to Contribute

### Reporting Bugs

Before submitting a bug report, please check that:
1. The bug hasn't been [reported already](https://github.com/saitarun1999/policylens/issues)
2. You're running the latest version
3. Your environment matches the [prerequisites](#development-setup)

**Good bug reports include:**

- **Clear title** — Summarize the issue in one sentence
- **Environment** — OS, Node version, browser, app version
- **Steps to reproduce** — Minimal, complete, verifiable steps
- **Expected behavior** — What you expected to happen
- **Actual behavior** — What actually happened (including error messages)
- **Screenshots** — If applicable
- **Code snippet** — If relevant, include the smallest code that reproduces the issue

### Suggesting Features

We welcome feature ideas! When suggesting a feature:

1. **Explain the problem** — What can't you do with PolicyLens today?
2. **Describe the solution** — How should it work?
3. **Consider alternatives** — What else have you considered?
4. **Keep scope reasonable** — The best features are focused and well-defined

### Pull Requests

1. **Fork** the repository
2. **Create a branch** — `git checkout -b feat/amazing-feature` or `fix/issue-description`
3. **Make your changes** — Follow the [code style](#code-style)
4. **Commit** — Write clear [commit messages](#commit-guidelines)
5. **Push** — `git push origin feat/amazing-feature`
6. **Open a Pull Request** — Use the [PR template](.github/PULL_REQUEST_TEMPLATE.md)

### Pull Request Guidelines

- **One concern per PR** — Keep changes focused on a single issue
- **Write tests** — If adding a new feature, include tests
- **Update documentation** — README, docs/, and inline comments as appropriate
- **Pass CI** — Ensure build, lint, and typecheck pass
- **Link issues** — Reference related issues in the PR description
- **Request review** — Tag maintainers for review

---

## Development Setup

### Prerequisites

- [Node.js](https://nodejs.org) 18+ (20 recommended)
- [npm](https://nodejs.org) (or [pnpm](https://pnpm.io))
- [Firecrawl API key](https://firecrawl.dev)
- [DeepSeek API key](https://platform.deepseek.com)

### Quick Start

```bash
# Clone the repository
git clone https://github.com/saitarun1999/policylens.git
cd policylens

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your API keys

# Start development server
npm run dev
# → http://localhost:3000
```

### Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Create production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

---

## Code Style

### General

- **TypeScript strict mode** — All code must compile with no errors
- **Functional components** — Prefer functions over classes
- **Named exports** — Use named exports for components and utilities
- **import type** — Use `import type` for type-only imports

### Naming

| Convention | Example |
|-----------|---------|
| Components | `PascalCase` — `crawl-dashboard.tsx` → `CrawlDashboard` |
| Utilities | `camelCase` — `cn()`, `formatTime()` |
| Types/Interfaces | `PascalCase` — `CrawlResult`, `ConsistencyReport` |
| Constants | `UPPER_SNAKE_CASE` — `MAX_RETRIES`, `STAGE_DURATIONS` |
| Files | `kebab-case` — `consistency-report.tsx` |
| API routes | `route.ts` — `src/app/api/crawl/route.ts` |

### React Components

```typescript
// Good
export function CrawlDashboard({ url }: { url: string }) {
  return <div>{url}</div>;
}

// Avoid
const CrawlDashboard: React.FC<{ url: string }> = ({ url }) => {
  return <div>{url}</div>;
};
```

### TypeScript

```typescript
// Prefer interfaces for object types
export interface CrawlResult {
  url: string;
  homepageContent: string | null;
  // ...
}

// Use type for unions and mapped types
export type Severity = "Critical" | "High" | "Medium" | "Low";

// Use `satisfies` for const assertions
export const COLORS = {
  Critical: "red",
  High: "orange",
} satisfies Record<Severity, string>;
```

### Imports

```typescript
// Group imports: external → internal
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Crown } from "lucide-react";

import { cn } from "@/lib/utils";
import type { CrawlResult, ConsistencyReport } from "@/lib/types";

// Use `@/` path alias for internal imports
```

### CSS

- Use Tailwind utility classes — avoid custom CSS unless necessary
- Custom animations go in `globals.css`
- Use `cn()` utility for conditional class merging
- Follow the `shadcn/ui` pattern for component styling

---

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | Usage |
|------|-------|
| `feat` | A new feature |
| `fix` | A bug fix |
| `chore` | Tooling, config, dependencies |
| `docs` | Documentation only |
| `refactor` | Code change that neither fixes nor adds |
| `style` | Formatting, missing semicolons, etc. |
| `perf` | Performance improvement |
| `test` | Adding or fixing tests |
| `ci` | CI/CD changes |

### Examples

```
feat(crawl): add sitemap discovery for multi-page crawl
fix(analyze): handle empty homepage content gracefully
docs: add environment variables reference
chore(deps): update framer-motion to v12
refactor(report): extract findings list into separate component
```

---

## Project Structure

```
src/
├── app/              # Next.js App Router pages and API routes
├── components/       # React components
│   ├── analyze/      # Mission Control and Report components
│   ├── landing/      # Landing page sections
│   └── ui/           # shadcn/ui primitives
└── lib/              # Utilities, types, constants

docs/                 # Comprehensive documentation
.github/              # GitHub configuration
```

---

## Questions?

- **Open a Discussion** — [GitHub Discussions](https://github.com/saitarun1999/policylens/discussions)
- **File an Issue** — [Issue Tracker](https://github.com/saitarun1999/policylens/issues)
- **Reach out** — [@saitarun1999](https://github.com/saitarun1999)

Thank you for contributing to PolicyLens.
