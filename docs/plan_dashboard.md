# Phase 2 Dashboard Plan And Implementation Record

## Summary

Build a local full-stack research dashboard for managing AI public-equity research, portfolio layer exposure, signal state, watchlist items, position sizing, and monthly reviews.

The implemented v1 uses Next.js, TypeScript, server actions, and repo-local SQLite. It preserves the repo's L/T model, signal-light rules, portfolio ranges, and Markdown workflow.

## Product Direction

- Audience: one primary user managing a personal AI public-equity research process.
- Interface tone: analyst workstation. Dense, calm, table-forward, and optimized for repeated research review rather than marketing-style presentation.
- Primary workflow: research manager first, portfolio and monthly review second.
- Source of truth: structured SQLite data for the app, with Markdown export for durable repo-readable notes.
- Market data: manual fields in v1, with a disabled provider placeholder for future prices, news, earnings, or financial-data integration.
- AI research: user enters only a company name or ticker, chooses OpenAI API, Codex CLI, or Claude Code, then the server generates a structured research note, saves it to SQLite, and visualizes it through the same dashboard surfaces as manual research.

## Implemented V1

- Add a Next.js app in the repo root using the App Router, React, TypeScript, SQLite, and server actions.
- Add structured data models for companies, research notes, positions, monthly reviews, and app settings.
- Store app data in `data/invest.sqlite`.
- Export company research notes to `research/companies/<ticker>.md`.
- Export monthly reviews to `research/monthly/<YYYY-MM>.md`.
- Add framework constants for L layers, T tiers, signal colors, allowed actions, and score categories.
- Add tests for score interpretation, layer allocation, T-tier sizing warnings, and Markdown export shape.
- Add AI-powered UI research trigger under `Research` -> `AI research`, supporting OpenAI API plus local Codex/Claude Code providers.

## Dashboard UX

- Persistent left navigation: Dashboard, Research, Portfolio, Monthly Review, Watchlist, Settings.
- Dashboard: company count, position count, cash, monthly reviews, research table, layer allocation, signal distribution, size warnings, and review queue.
- Research: dense table for company, L layer, T tier, signal, action, structural score, interpretation, and next review.
- AI research: one-input trigger for company name or ticker, provider selector, and source-aware structured output saved directly to the existing company/research tables.
- Company detail: classification edit form, thesis, trigger, score matrix, business breakdown, valuation notes, signal evidence, risks, position plan, and Markdown export.
- Portfolio: positions table, cash treatment, L-layer exposure bars, and T-tier max-size warnings.
- Monthly review: snapshot creation from current portfolio state and Markdown export.
- Watchlist: ideas waiting for a required trigger before action.
- Reference: in-app explanation of the strategy logic, using the L-dimension allocation, L/T map, and signal-light screenshots plus dashboard-native summaries.
- Settings: disabled market-data provider placeholder documenting future integration.

## Data Model

- `Company`: ticker, name, primary/secondary L layer, T tier, signal, action, thesis, risk summary, next review date, trigger.
- `ResearchNote`: analyst, structural scores, business breakdown, valuation, signal evidence, risks, position plan, decision reason.
- `Position`: ticker, holding label, weight, target size, max size, cash flag.
- `MonthlyReview`: month, reviewer, portfolio value, cash percentage, net exposure, major events, holdings snapshot, layer allocation, action log fields.
- `AppSettings`: currently stores a disabled market-data provider config.

## AI Research Flow

- Environment: OpenAI mode requires `OPENAI_API_KEY`; optional `OPENAI_RESEARCH_MODEL` defaults to `gpt-5`.
- Local providers: Codex mode runs `codex exec --search`; Claude Code mode runs `claude --print` with the same JSON schema. `CODEX_COMMAND` and `CLAUDE_COMMAND` can override command paths.
- API surface: server-side OpenAI Responses API request with web search and strict structured JSON output; local CLI providers must return JSON matching the same schema.
- Input: company name or ticker only.
- Output: `Company` plus `ResearchNote` fields, including L layer, T tier, signal color, action, structural scores, business breakdown, valuation, signal evidence, risks, position plan, decision reason, and source URLs.
- Persistence: existing ticker records are updated; new tickers are inserted.
- Guardrail: generated research is saved as research support, not financial advice; current market claims still need review before use.

## Operating Workflow

1. Create a company manually in `Research` or trigger AI research with only a company name or ticker.
2. Fill the company detail research note using the six structural score categories and signal evidence fields.
3. Add a portfolio position or cash row in `Portfolio`.
4. Use the dashboard to monitor signal distribution, layer allocation, review queue, and sizing warnings.
5. Create a monthly snapshot in `Monthly Review`.
6. Export company and monthly Markdown when a durable repo-readable record is needed.

## Test Plan

- `npm run typecheck`
- `npm test`
- `npm run build`
- Manual smoke test: open the dev server, create a company, update research, add a position, create a monthly review, and export Markdown.
- AI smoke test with `OPENAI_API_KEY` or a configured local CLI: run `Research` -> `AI research`, enter a ticker, choose a provider, confirm the generated company detail page opens and dashboard tables reflect the saved result.

## Known Constraints

- Node's built-in SQLite module currently prints an experimental warning on build/runtime.
- Authentication is intentionally out of scope because this is a local personal tool.
- AI research can use OpenAI or Codex web search for current source discovery when configured. Claude Code depends on local tool permissions. The app does not independently fetch or validate live prices, news, earnings dates, analyst estimates, or financial statements.
- Current market claims still require current-source verification before being written into research.

## Next Plan

- Add import from existing Markdown company notes into SQLite.
- Add richer monthly review editing for signal changes, thesis changes, watchlist table, action log, and next-month focus.
- Add filters and sorting on the research table.
- Add optional market-data adapter behind explicit provider settings for deterministic price/financial fields separate from AI research.
- Add Phase 3 opportunity discovery views for top companies by layer/tier after the dashboard data model stabilizes.

## Assumptions

- This is a personal local app, not multi-user SaaS.
- Authentication is out of scope for v1.
- Live market data, news, financials, and earnings dates are out of scope for v1 except for a disabled adapter placeholder.
- The dashboard supports research and process management only; it does not provide financial advice or automated trading.
