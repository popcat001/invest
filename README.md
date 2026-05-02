# Invest Strategy Framework

This repository contains a personal AI public stocks strategy framework derived from the methodology in `ref/`.

The goal is to keep the investment process explicit enough that an AI assistant can use the same rules repeatedly for company research, portfolio reviews, and signal updates.

## Contents

- `requirement.md`: original request and project intent.
- `ref/`: source methodology screenshots and the NotebookLM side reference.
- `strategy/`: reusable strategy framework and templates.
- `PLAN.md`: implementation plan used to create the framework.

## Start Here

Read `strategy/README.md` first. It explains how the framework is organized and how to use the documents.

The main workflow is:

1. Use `strategy/core-methodology.md` to classify a company by L layer and T tier.
2. Use `strategy/signals.md` to determine the current operating signal.
3. Use `strategy/portfolio-construction.md` to decide sizing, entry, trim, or exit.
4. Copy `strategy/templates/company-research.md` for individual company analysis.
5. Copy `strategy/templates/monthly-review.md` for recurring portfolio reviews.

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
