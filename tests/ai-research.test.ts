import { describe, expect, it } from "vitest";
import { parseAiResearchJson } from "../lib/ai-research-parse";

describe("AI research parsing", () => {
  it("parses fenced JSON from local CLI output", () => {
    const parsed = parseAiResearchJson(`Here is the result:\n\n\`\`\`json\n{"ticker":"NVDA","companyName":"NVIDIA"}\n\`\`\``);
    expect(parsed.ticker).toBe("NVDA");
    expect(parsed.companyName).toBe("NVIDIA");
  });
});
