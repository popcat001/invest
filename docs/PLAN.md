# Plan: Personal AI Public Stocks Strategy Framework

## Summary

Create a reusable Markdown framework folder for an AI-assisted investing workflow based on the `ref/` methodology. The strategy targets AI-related public equities, uses the five-layer L dimension for structural allocation, uses T tiers for tactical timing, and operates as a long-term core strategy with entry and exit overlays.

## Key Changes

- Add a `strategy/` folder containing Markdown docs for:
  - Core methodology: L/T model, five-layer allocation, and structural-change filtering.
  - Portfolio construction: moderate concentration, target layer ranges, position caps, cash rules, and rebalance cadence.
  - Signal framework: green/yellow/orange/red states using hard data plus market sentiment.
  - Company research template: map any company across L1-L5 and T1-T4 with thesis, risks, catalysts, and valuation notes.
  - Monthly review template: position review, signal changes, thesis changes, and action log.
- Use `ref/1.md` as a side reference, but derive the core rules from the PNG methodology.
- Keep the public interface Markdown-only: no code APIs, no database schema, and no dashboard implementation in the first version.

## Strategy Defaults

- Universe: AI public stocks only.
- Style: long-term core plus tactical entry and exit overlay.
- Concentration: moderate, approximately 8-15 holdings.
- Review cadence: monthly, plus event-driven reviews after earnings, major product launches, macro shocks, or large price moves.
- Tactical signals influence sizing, entries, trims, and exits, but do not override the core structural thesis by themselves.

## Test Plan

- Validate that a new company can be scored using the company research template without needing extra decisions.
- Validate that a portfolio can be reviewed monthly using the review template.
- Check that each layer L1-L5 and tier T1-T4 has clear definitions, examples, and decision rules.
- Check that signal colors produce concrete actions: add, hold, trim, pause, exit, or watch.

## Assumptions

- No current holdings are required for v1; templates support adding them later.
- No options, crypto, private companies, or shorting rules are included in v1.
- The framework is practical for manual use with AI assistance, not an automated trading system.
