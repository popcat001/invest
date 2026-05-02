import { LAYERS, SCORE_CATEGORIES } from "./constants";
import { scoreInterpretation, scoreTotal } from "./strategy";
import type { CompanyWithNote, JsonRecord, MonthlyReview } from "./types";

function text(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function rowValue(record: JsonRecord | undefined | null, key: string) {
  return text(record?.[key]);
}

export function companyMarkdown(company: CompanyWithNote) {
  const research = company.research;
  const scores = research?.scores ?? {};
  const total = scoreTotal(scores);
  const date = new Date().toISOString().slice(0, 10);

  const scoreRows = SCORE_CATEGORIES.map((category) => {
    const score = scores[category] ?? "";
    return `| ${category} | ${score} | ${rowValue(research?.businessBreakdown, `${category} notes`)} |`;
  }).join("\n");

  const layerRows = LAYERS.filter((layer) => layer.id !== "Cash")
    .map((layer) => {
      const exposure = company.primaryLayer === layer.id || company.secondaryLayer === layer.id ? "Primary/secondary exposure" : "";
      return `| ${layer.id} ${layer.name} | ${exposure} | ${rowValue(research?.businessBreakdown, `${layer.id} evidence`)} | ${rowValue(research?.businessBreakdown, `${layer.id} importance`)} |`;
    })
    .join("\n");

  return `# Company Research Template

## Company

- Name: ${company.name}
- Ticker: ${company.ticker}
- Date: ${date}
- Analyst: ${research?.analyst ?? ""}
- Current action: ${company.action}

## One-Line Thesis

${company.thesis}

## L/T Classification

- Primary L layer: ${company.primaryLayer}
- Secondary L layer, if any: ${company.secondaryLayer}
- T tier: ${company.tier}
- Current signal: ${company.signal}

## Structural Fit Score

| Category | Score 1-5 | Notes |
| --- | ---: | --- |
${scoreRows}
| Total | ${total} | ${scoreInterpretation(total)} |

## Business Breakdown

- Revenue drivers: ${rowValue(research?.businessBreakdown, "Revenue drivers")}
- Margin drivers: ${rowValue(research?.businessBreakdown, "Margin drivers")}
- Capital intensity: ${rowValue(research?.businessBreakdown, "Capital intensity")}
- Customer adoption: ${rowValue(research?.businessBreakdown, "Customer adoption")}
- Competitive position: ${rowValue(research?.businessBreakdown, "Competitive position")}
- Key dependencies: ${rowValue(research?.businessBreakdown, "Key dependencies")}

## AI Layer Map

| Layer | Exposure | Evidence | Importance |
| --- | --- | --- | --- |
${layerRows}

## Valuation

- Current valuation: ${rowValue(research?.valuation, "Current valuation")}
- Growth expectation embedded in price: ${rowValue(research?.valuation, "Growth expectation embedded in price")}
- What must go right: ${rowValue(research?.valuation, "What must go right")}
- What could make the stock cheap: ${rowValue(research?.valuation, "What could make the stock cheap")}
- What could make the stock expensive: ${rowValue(research?.valuation, "What could make the stock expensive")}

## Signals

| Input | State | Evidence |
| --- | --- | --- |
| Hard data | ${rowValue(research?.signals, "Hard data state")} | ${rowValue(research?.signals, "Hard data evidence")} |
| Market emotion | ${rowValue(research?.signals, "Market emotion state")} | ${rowValue(research?.signals, "Market emotion evidence")} |
| Valuation | ${rowValue(research?.signals, "Valuation state")} | ${rowValue(research?.signals, "Valuation evidence")} |
| Structural evidence | ${rowValue(research?.signals, "Structural evidence state")} | ${rowValue(research?.signals, "Structural evidence evidence")} |
| Overall signal | ${company.signal} | ${company.trigger} |

## Risks

- Thesis risk: ${rowValue(research?.risks, "Thesis risk")}
- Valuation risk: ${rowValue(research?.risks, "Valuation risk")}
- Competition risk: ${rowValue(research?.risks, "Competition risk")}
- Execution risk: ${rowValue(research?.risks, "Execution risk")}
- Macro or regulatory risk: ${rowValue(research?.risks, "Macro or regulatory risk")}

## Position Plan

- Intended role: ${rowValue(research?.positionPlan, "Intended role")}
- Initial size: ${rowValue(research?.positionPlan, "Initial size")}
- Target size: ${rowValue(research?.positionPlan, "Target size")}
- Max size: ${rowValue(research?.positionPlan, "Max size")}
- Add triggers: ${rowValue(research?.positionPlan, "Add triggers")}
- Trim triggers: ${rowValue(research?.positionPlan, "Trim triggers")}
- Exit triggers: ${rowValue(research?.positionPlan, "Exit triggers")}

## Decision

- Action: ${company.action}
- Reason: ${research?.decisionReason ?? ""}
- Next review date: ${company.nextReviewDate}
- Trigger that changes this decision: ${company.trigger}

> Research support only. This is not financial advice.
`;
}

export function monthlyReviewMarkdown(review: MonthlyReview) {
  const allocationRows = LAYERS.map((layer) => {
    const current = review.layerAllocation[layer.id] ?? 0;
    return `| ${layer.id} ${layer.name} | ${current}% | ${layer.range[0]}-${layer.range[1]}% | |`;
  }).join("\n");

  const holdings = Array.isArray(review.snapshot.holdings) ? review.snapshot.holdings : [];
  const holdingRows = holdings.map((holding) => {
    const item = holding as JsonRecord;
    return `| ${text(item.name)} | ${text(item.ticker)} | ${item.weight ?? 0}% | ${text(item.primaryLayer)} | ${text(item.tier)} | ${text(item.signal)} | ${text(item.action)} |`;
  }).join("\n");

  return `# Monthly Portfolio Review

## Review Header

- Month: ${review.month}
- Reviewer: ${review.reviewer}
- Portfolio value: ${review.portfolioValue}
- Cash percentage: ${review.cashPercentage}%
- Net exposure: ${review.netExposure}%
- Major market events: ${review.majorEvents}

## Portfolio Snapshot

| Holding | Ticker | Weight | L layer | T tier | Signal | Action |
| --- | --- | ---: | --- | --- | --- | --- |
${holdingRows}

## Layer Allocation

| Layer | Current weight | Target range | Action |
| --- | ---: | ---: | --- |
${allocationRows}

## Signal Changes

| Holding | Previous signal | Current signal | Reason | Action |
| --- | --- | --- | --- | --- |

## Thesis Changes

- Structural upgrades:
- Structural downgrades:
- New catalysts:
- Thesis breaks:

## Watchlist

| Company | Ticker | L layer | T tier | Required trigger before action |
| --- | --- | --- | --- | --- |

## Action Log

| Action | Holding | Size change | Reason | Date |
| --- | --- | ---: | --- | --- |

## Next Month Focus

- Data to verify:
- Events to watch:
- Positions needing decision:
- Cash deployment plan:

> Research support only. This is not financial advice.
`;
}

