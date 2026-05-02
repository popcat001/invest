import { describe, expect, it } from "vitest";
import { allocationState, positionWarning, scoreInterpretation, scoreTotal } from "../lib/strategy";

describe("strategy helpers", () => {
  it("totals structural scores and maps interpretation bands", () => {
    const total = scoreTotal({
      "Layer clarity": 5,
      "Value capture": 5,
      "Data quality": 5,
      Moat: 5,
      "AI cycle health": 5,
      "Valuation discipline": 4
    });
    expect(total).toBe(29);
    expect(scoreInterpretation(total)).toBe("Core candidate");
    expect(scoreInterpretation(20)).toContain("Watch");
    expect(scoreInterpretation(15)).toContain("Tactical");
    expect(scoreInterpretation(8)).toContain("Avoid");
  });

  it("flags layer range and tier max warnings", () => {
    expect(allocationState(12, "L1")).toBe("In range");
    expect(allocationState(8, "L1")).toBe("Below target");
    expect(allocationState(22, "L1")).toBe("Above target");
    expect(positionWarning(6, "T3")).toBe("Above T3 max (5%)");
    expect(positionWarning(4, "T3")).toBeNull();
  });
});

