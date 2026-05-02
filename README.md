# Invest Strategy Framework

This repository contains a personal AI public stocks strategy framework derived from the methodology in `ref/`.

The goal is to keep the investment process explicit enough that an AI assistant can use the same rules repeatedly for company research, portfolio reviews, and signal updates.

## Contents

- `requirement.md`: original request and project intent.
- `ref/`: source methodology screenshots and the NotebookLM side reference.
- `strategy/`: reusable strategy framework and templates.
- `app/`, `lib/`, and `data/`: local dashboard app, strategy helpers, and SQLite data store.
- `docs/plan_dashboard.md`: Phase 2 dashboard plan and implementation record.

## Start Here

Read `strategy/README.md` first. It explains how the framework is organized and how to use the documents.

The main workflow is:

1. Use `strategy/core-methodology.md` to classify a company by L layer and T tier.
2. Use `strategy/signals.md` to determine the current operating signal.
3. Use `strategy/portfolio-construction.md` to decide sizing, entry, trim, or exit.
4. Copy `strategy/templates/company-research.md` for individual company analysis.
5. Copy `strategy/templates/monthly-review.md` for recurring portfolio reviews.

## Dashboard

This repo includes a local full-stack research dashboard for managing company notes, L/T classification, signal state, positions, watchlist items, and monthly review snapshots.

The dashboard is designed as an analyst workstation: dense navigation, table-first research management, signal chips, allocation bars, and compact edit forms. It uses structured SQLite data for the app while preserving Markdown exports for durable research records.

Run it locally:

```bash
npm install
npm run dev
```

Then open the local URL printed by Next.js. The dashboard stores structured data in `data/invest.sqlite` and can export Markdown research notes to `research/companies/` and monthly reviews to `research/monthly/`.

For AI-generated research from the UI with OpenAI, create `.env.local` with:

```bash
OPENAI_API_KEY=your_api_key_here
OPENAI_RESEARCH_MODEL=gpt-5
```

The AI research flow is available under `Research` -> `AI research`. The only research input is a company name or ticker. You can choose the engine:

- `OpenAI API`: uses the OpenAI Responses API with web search and structured output.
- `Codex CLI`: runs local `codex exec --search` and expects JSON matching the dashboard schema.
- `Claude Code`: runs local `claude --print` with the dashboard JSON schema.

Local command paths can be overridden in `.env.local`:

```bash
CODEX_COMMAND=codex
CLAUDE_COMMAND=claude
```

All engines save the structured result into SQLite and open the generated company record.

Main workflows:

1. Create company research manually or with AI under `Research`.
2. Add holdings and cash under `Portfolio`.
3. Monitor layer allocation, signals, sizing warnings, and review queue on `Dashboard`.
4. Create monthly review snapshots under `Monthly Review`.
5. Export Markdown records when a repo-readable note is needed.

Use `Reference` when you need the logic behind the dashboard: it shows the five-layer allocation model, L/T map, signal-light rules, allowed actions, and the primary reference screenshots from `ref/`.

Useful checks:

```bash
npm run typecheck
npm test
npm run build
```

## Strategy Defaults

- Universe: AI-related public equities.
- Style: long-term structural core with tactical entry and exit overlay.
- Concentration: moderate, usually 8-15 holdings.
- Review cadence: monthly, plus event-driven reviews.
- Tactical signals affect sizing and timing, but do not replace the structural thesis.

## Reference Methodology

The PNG files in `ref/` are the primary source material:

- `lxt-strategy-model-layer-tier-map.png`
- `l-dimension-five-layer-capital-allocation.png`
- `rewired-signal-rules-traffic-lights.png`
- `tesla-five-layer-value-breakdown.png`
- `google-alphabet-lxt-model-breakdown.png`
- `deutsch-braudel-ai-optimus-scoring-matrix.png`

`ref/1.md` is a side reference summarizing the workflow idea.

## Disclaimer

This repository is for personal research and process documentation. It is not financial advice.
