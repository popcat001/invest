import type { AiResearchResult } from "./ai-research";

export function parseAiResearchJson(text: string): AiResearchResult {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const candidate = fenced?.[1] ?? trimmed.slice(trimmed.indexOf("{"), trimmed.lastIndexOf("}") + 1);
  if (!candidate.trim()) throw new Error("Local AI did not return a JSON object.");
  return JSON.parse(candidate) as AiResearchResult;
}
