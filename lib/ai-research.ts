import "server-only";

import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { ACTIONS, LAYERS, SCORE_CATEGORIES, SIGNALS, T_TIERS, type Action, type LayerId, type Signal, type TTier } from "./constants";
import { parseAiResearchJson } from "./ai-research-parse";

const execFileAsync = promisify(execFile);

export type AiResearchProvider = "openai" | "codex" | "claude";

export type AiResearchResult = {
  companyName: string;
  ticker: string;
  primaryLayer: LayerId;
  secondaryLayer: LayerId | "";
  tier: TTier;
  signal: Signal;
  action: Action;
  thesis: string;
  riskSummary: string;
  nextReviewDate: string;
  trigger: string;
  scores: Record<string, number>;
  businessBreakdown: Record<string, string>;
  valuation: Record<string, string>;
  signals: Record<string, string>;
  risks: Record<string, string>;
  positionPlan: Record<string, string>;
  decisionReason: string;
  sourceUrls: string[];
};

export const researchJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "companyName",
    "ticker",
    "primaryLayer",
    "secondaryLayer",
    "tier",
    "signal",
    "action",
    "thesis",
    "riskSummary",
    "nextReviewDate",
    "trigger",
    "scores",
    "businessBreakdown",
    "valuation",
    "signals",
    "risks",
    "positionPlan",
    "decisionReason",
    "sourceUrls"
  ],
  properties: {
    companyName: { type: "string" },
    ticker: { type: "string" },
    primaryLayer: { type: "string", enum: LAYERS.filter((layer) => layer.id !== "Cash").map((layer) => layer.id) },
    secondaryLayer: { type: "string", enum: ["", ...LAYERS.filter((layer) => layer.id !== "Cash").map((layer) => layer.id)] },
    tier: { type: "string", enum: T_TIERS.map((tier) => tier.id) },
    signal: { type: "string", enum: SIGNALS },
    action: { type: "string", enum: ACTIONS },
    thesis: { type: "string" },
    riskSummary: { type: "string" },
    nextReviewDate: { type: "string" },
    trigger: { type: "string" },
    scores: {
      type: "object",
      additionalProperties: false,
      required: SCORE_CATEGORIES,
      properties: Object.fromEntries(SCORE_CATEGORIES.map((category) => [category, { type: "integer", minimum: 1, maximum: 5 }]))
    },
    businessBreakdown: {
      type: "object",
      additionalProperties: false,
      required: ["Revenue drivers", "Margin drivers", "Capital intensity", "Customer adoption", "Competitive position", "Key dependencies"],
      properties: {
        "Revenue drivers": { type: "string" },
        "Margin drivers": { type: "string" },
        "Capital intensity": { type: "string" },
        "Customer adoption": { type: "string" },
        "Competitive position": { type: "string" },
        "Key dependencies": { type: "string" }
      }
    },
    valuation: {
      type: "object",
      additionalProperties: false,
      required: [
        "Current valuation",
        "Growth expectation embedded in price",
        "What must go right",
        "What could make the stock cheap",
        "What could make the stock expensive"
      ],
      properties: {
        "Current valuation": { type: "string" },
        "Growth expectation embedded in price": { type: "string" },
        "What must go right": { type: "string" },
        "What could make the stock cheap": { type: "string" },
        "What could make the stock expensive": { type: "string" }
      }
    },
    signals: {
      type: "object",
      additionalProperties: false,
      required: [
        "Hard data state",
        "Hard data evidence",
        "Market emotion state",
        "Market emotion evidence",
        "Valuation state",
        "Valuation evidence",
        "Structural evidence state",
        "Structural evidence evidence"
      ],
      properties: {
        "Hard data state": { type: "string", enum: SIGNALS },
        "Hard data evidence": { type: "string" },
        "Market emotion state": { type: "string", enum: SIGNALS },
        "Market emotion evidence": { type: "string" },
        "Valuation state": { type: "string", enum: SIGNALS },
        "Valuation evidence": { type: "string" },
        "Structural evidence state": { type: "string", enum: SIGNALS },
        "Structural evidence evidence": { type: "string" }
      }
    },
    risks: {
      type: "object",
      additionalProperties: false,
      required: ["Thesis risk", "Valuation risk", "Competition risk", "Execution risk", "Macro or regulatory risk"],
      properties: {
        "Thesis risk": { type: "string" },
        "Valuation risk": { type: "string" },
        "Competition risk": { type: "string" },
        "Execution risk": { type: "string" },
        "Macro or regulatory risk": { type: "string" }
      }
    },
    positionPlan: {
      type: "object",
      additionalProperties: false,
      required: ["Intended role", "Initial size", "Target size", "Max size", "Add triggers", "Trim triggers", "Exit triggers"],
      properties: {
        "Intended role": { type: "string" },
        "Initial size": { type: "string" },
        "Target size": { type: "string" },
        "Max size": { type: "string" },
        "Add triggers": { type: "string" },
        "Trim triggers": { type: "string" },
        "Exit triggers": { type: "string" }
      }
    },
    decisionReason: { type: "string" },
    sourceUrls: { type: "array", items: { type: "string" } }
  }
} as const;

function researchPrompt(query: string) {
  const today = new Date().toISOString().slice(0, 10);
  return [
    `Research this public company or ticker for the dashboard: ${query}.`,
    `Today is ${today}.`,
    "Return exactly one JSON object and no prose outside JSON.",
    "Use current sources when your tool/runtime supports web research, and put source URLs in sourceUrls.",
    "If current facts are uncertain or your local runtime cannot browse, state that uncertainty in the evidence fields.",
    "Do not give financial advice. Produce research support only.",
    "Classify the company using the L1-L5 layer model and T1-T4 tactical posture.",
    "Use only these actions: Add, Hold, Trim, Pause, Exit, Watchlist.",
    "Charts are timing tools only; do not create a thesis from chart action.",
    `The JSON must satisfy this schema: ${JSON.stringify(researchJsonSchema)}`
  ].join("\n");
}

function extractOutputText(response: Record<string, unknown>) {
  if (typeof response.output_text === "string") return response.output_text;
  const output = Array.isArray(response.output) ? response.output : [];
  for (const item of output) {
    const record = item as Record<string, unknown>;
    const content = Array.isArray(record.content) ? record.content : [];
    for (const part of content) {
      const partRecord = part as Record<string, unknown>;
      if (typeof partRecord.text === "string") return partRecord.text;
    }
  }
  return "";
}

export async function researchCompanyWithOpenAI(query: string): Promise<AiResearchResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured. Add it to .env.local before running AI research.");
  }

  const model = process.env.OPENAI_RESEARCH_MODEL || "gpt-5";
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      tools: [{ type: "web_search" }],
      include: ["web_search_call.action.sources"],
      instructions: [
        "You are an investment research assistant for a personal AI public-equities strategy framework.",
        "Use web search for current facts and cite source URLs in sourceUrls.",
        "Do not give financial advice. Produce research support only.",
        "Classify the company using the L1-L5 layer model and T1-T4 tactical posture.",
        "Use only these actions: Add, Hold, Trim, Pause, Exit, Watchlist.",
        "Charts are timing tools only; do not create a thesis from chart action.",
        "If current facts are uncertain, state that uncertainty in the evidence fields instead of fabricating precision."
      ].join(" "),
      input: researchPrompt(query),
      text: {
        format: {
          type: "json_schema",
          name: "company_research",
          strict: true,
          schema: researchJsonSchema
        },
        verbosity: "medium"
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI research request failed (${response.status}): ${errorText.slice(0, 500)}`);
  }

  const json = (await response.json()) as Record<string, unknown>;
  const outputText = extractOutputText(json);
  if (!outputText) throw new Error("OpenAI response did not include structured output text.");
  return JSON.parse(outputText) as AiResearchResult;
}

async function runLocalCommand(command: string, args: string[], timeoutMs = 240000) {
  const timeout = setTimeout(() => undefined, timeoutMs);
  try {
    const result = await execFileAsync(command, args, {
      cwd: process.cwd(),
      timeout: timeoutMs,
      maxBuffer: 1024 * 1024 * 4,
      env: process.env
    });
    return [result.stdout, result.stderr].filter(Boolean).join("\n");
  } catch (error) {
    const details = error as Error & { stdout?: string; stderr?: string; code?: number | string };
    const output = [details.stderr, details.stdout].filter(Boolean).join("\n").trim();
    const message = details.message || "Local AI command failed.";
    const code = details.code ? `exit ${details.code}` : "unknown exit";
    throw new Error(`${message} (${code})${output ? `\n${output.slice(0, 2000)}` : ""}`);
  } finally {
    clearTimeout(timeout);
  }
}

export async function researchCompanyWithCodex(query: string): Promise<AiResearchResult> {
  const command = process.env.CODEX_COMMAND || "codex";
  const prompt = researchPrompt(query);
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "invest-codex-research-"));
  const schemaPath = path.join(tempDir, "schema.json");
  const outputPath = path.join(tempDir, "result.json");

  try {
    await writeFile(schemaPath, JSON.stringify(researchJsonSchema), "utf8");
    const output = await runLocalCommand(command, [
      "--search",
      "-a",
      "never",
      "exec",
      "--ephemeral",
      "--sandbox",
      "read-only",
      "--output-schema",
      schemaPath,
      "--output-last-message",
      outputPath,
      prompt
    ]);
    const lastMessage = await readFile(outputPath, "utf8").catch(() => "");
    return parseAiResearchJson(lastMessage || output);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

export async function researchCompanyWithClaude(query: string): Promise<AiResearchResult> {
  const command = process.env.CLAUDE_COMMAND || "claude";
  const prompt = researchPrompt(query);
  const output = await runLocalCommand(command, [
    "--print",
    "--output-format",
    "text",
    "--permission-mode",
    "dontAsk",
    "--json-schema",
    JSON.stringify(researchJsonSchema),
    prompt
  ]);
  return parseAiResearchJson(output);
}

export async function researchCompany(query: string, provider: AiResearchProvider): Promise<AiResearchResult> {
  if (provider === "codex") return researchCompanyWithCodex(query);
  if (provider === "claude") return researchCompanyWithClaude(query);
  return researchCompanyWithOpenAI(query);
}
