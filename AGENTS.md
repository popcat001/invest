# Agent Instructions

Use this repository as a personal AI public stocks strategy framework. The goal is to analyze companies, portfolios, and market signals consistently with the methodology documented here.

## Source Priority

When working in this repo, use sources in this order:

1. `strategy/` docs are the active operating framework.
2. `ref/` PNG files are the primary source methodology.
3. `ref/1.md` is a side reference only.
4. `docs/plan_dashboard.md` explains the Phase 2 dashboard plan, implementation record, UX direction, data model, constraints, and next steps.
5. `README.md` explains the repo structure and dashboard usage.

Do not replace the framework with generic investing advice. Adapt every analysis to the L/T model, five-layer allocation, and signal-light rules.

## Default Strategy Context

- Universe: AI-related public equities.
- Style: long-term structural core with tactical entry and exit overlay.
- Concentration: moderate, usually 8-15 holdings.
- Review cadence: monthly, plus event-driven reviews.
- Tactical signals affect sizing and timing, but do not replace the structural thesis.
- This is research support, not financial advice.

## Analysis Workflow

For company research:

1. Classify the company across L1-L5 using `strategy/core-methodology.md`.
2. Assign a T tier using the tactical posture rules.
3. Score structural fit using the six scoring categories.
4. Evaluate signal state using `strategy/signals.md`.
5. Produce a concrete action: Add, Hold, Trim, Pause, Exit, or Watchlist.
6. Use `strategy/templates/company-research.md` when creating a reusable company note.

For portfolio reviews:

1. Use `strategy/templates/monthly-review.md`.
2. Check layer weights against `strategy/portfolio-construction.md`.
3. Re-score holdings after earnings, product launches, regulation, macro shocks, or large price moves.
4. Separate noise from structural changes before recommending any action.

## Dashboard Workflow

The local dashboard is part of the project, not a separate product concept.

- App code lives in `app/`; shared strategy, database, and Markdown export logic lives in `lib/`.
- Structured dashboard data is stored in repo-local SQLite at `data/invest.sqlite`.
- Company research can be exported to `research/companies/<ticker>.md`.
- Monthly review snapshots can be exported to `research/monthly/<YYYY-MM>.md`.
- Keep the dashboard aligned with the L/T model, five-layer allocation, signal-light rules, structural score categories, and action vocabulary from `strategy/`.
- The UI direction is an analyst workstation: dense, calm, table-first, compact forms, signal chips, allocation bars, and no marketing-style landing page.
- The `Reference` tab is the in-app explanation of the strategy logic. Keep it aligned with `ref/l-dimension-five-layer-capital-allocation.png`, `ref/lxt-strategy-model-layer-tier-map.png`, and `ref/rewired-signal-rules-traffic-lights.png`.
- AI research is triggered from `Research` -> `AI research`. The only research input is a company name or ticker; the user chooses OpenAI API, Codex CLI, or Claude Code. The server saves structured output into SQLite and redirects to the company detail page.
- OpenAI research requires `OPENAI_API_KEY`; `OPENAI_RESEARCH_MODEL` is optional and defaults to `gpt-5`.
- Local AI research runs configured commands without a shell. Defaults are `codex` and `claude`, overridable with `CODEX_COMMAND` and `CLAUDE_COMMAND`.
- V1 uses manual market data fields plus AI research. Do not add deterministic live prices, financials, news, or earnings data without explicit provider selection and current-source attribution.

When changing dashboard behavior, run the most relevant checks:

```bash
npm run typecheck
npm test
npm run build
```

## Output Rules

Every investment analysis should include:

- L layer and T tier.
- Current signal color.
- Structural thesis.
- Valuation discipline note.
- Key risks.
- Action and trigger that would change the action.

Prefer concise Markdown. Use tables when comparing holdings, layers, scores, or signals.

## Research Guardrails

- For current market prices, financials, analyst estimates, earnings dates, laws, or news, verify with current sources before making claims.
- Clearly distinguish facts, assumptions, and interpretation.
- Do not present predictions as certainty.
- Do not recommend leverage, options, shorts, crypto, or private investments unless the framework is explicitly expanded to include them.
- Do not treat chart signals as a thesis. Charts are timing tools only.

## Editing Rules

- Keep docs in Markdown.
- Preserve the existing strategy defaults unless the user explicitly changes them.
- Update `README.md` when adding major new framework sections.
- Update `docs/plan_dashboard.md` when changing dashboard scope, UX direction, data model, workflow, constraints, or next-phase plan.
- Keep generated SQLite files out of version control; preserve Markdown exports when they are intentional research records.
