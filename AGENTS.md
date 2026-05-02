# Agent Instructions

Use this repository as a personal AI public stocks strategy framework. The goal is to analyze companies, portfolios, and market signals consistently with the methodology documented here.

## Source Priority

When working in this repo, use sources in this order:

1. `strategy/` docs are the active operating framework.
2. `ref/` PNG files are the primary source methodology.
3. `ref/1.md` is a side reference only.
4. `PLAN.md` explains the original implementation plan and defaults.
5. `README.md` explains the repo structure.

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
- Update `PLAN.md` only when the implementation plan itself changes.
