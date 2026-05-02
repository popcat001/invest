import { describe, expect, it } from "vitest";
import { companyMarkdown, monthlyReviewMarkdown } from "../lib/markdown";
import type { CompanyWithNote, MonthlyReview } from "../lib/types";

describe("markdown exports", () => {
  it("exports company research in the framework shape", () => {
    const company: CompanyWithNote = {
      id: 1,
      ticker: "AMD",
      name: "Advanced Micro Devices",
      primaryLayer: "L2",
      secondaryLayer: "",
      tier: "T2",
      signal: "Yellow",
      action: "Hold",
      thesis: "AI compute share gain candidate.",
      riskSummary: "Execution and valuation risk.",
      nextReviewDate: "2026-06-01",
      trigger: "Earnings and data-center GPU traction.",
      createdAt: "",
      updatedAt: "",
      position: null,
      research: {
        companyId: 1,
        analyst: "Xiang",
        scores: {
          "Layer clarity": 5,
          "Value capture": 4,
          "Data quality": 4,
          Moat: 4,
          "AI cycle health": 4,
          "Valuation discipline": 3
        },
        businessBreakdown: {},
        valuation: {},
        signals: {},
        risks: {},
        positionPlan: {},
        decisionReason: "Hold pending confirmation.",
        updatedAt: ""
      }
    };

    const markdown = companyMarkdown(company);
    expect(markdown).toContain("## L/T Classification");
    expect(markdown).toContain("- Primary L layer: L2");
    expect(markdown).toContain("| Total | 24 | Watch, stage in, or hold with defined triggers |");
    expect(markdown).toContain("> Research support only. This is not financial advice.");
  });

  it("exports monthly review snapshots", () => {
    const review: MonthlyReview = {
      id: 1,
      month: "2026-05",
      reviewer: "Xiang",
      portfolioValue: 100000,
      cashPercentage: 10,
      netExposure: 90,
      majorEvents: "Earnings season.",
      snapshot: { holdings: [{ name: "AMD", ticker: "AMD", weight: 5, primaryLayer: "L2", tier: "T2", signal: "Yellow", action: "Hold" }] },
      layerAllocation: { L1: 0, L2: 5, L3: 0, L4: 0, L5: 0, Cash: 10 },
      signalChanges: [],
      thesisChanges: {},
      actionLog: [],
      nextFocus: {},
      createdAt: ""
    };

    const markdown = monthlyReviewMarkdown(review);
    expect(markdown).toContain("# Monthly Portfolio Review");
    expect(markdown).toContain("| AMD | AMD | 5% | L2 | T2 | Yellow | Hold |");
    expect(markdown).toContain("| Cash Cash | 10% | 5-20% | |");
  });
});

