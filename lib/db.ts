import "server-only";

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { ACTIONS, LAYERS, SCORE_CATEGORIES, SIGNALS, T_TIERS, type Action, type LayerId, type Signal, type TTier } from "./constants";
import { companyMarkdown, monthlyReviewMarkdown } from "./markdown";
import { emptyAllocation } from "./strategy";
import type { AiResearchResult } from "./ai-research";
import type { Company, CompanyWithNote, JsonRecord, MonthlyReview, Position, ResearchNote } from "./types";

const dbPath = path.join(process.cwd(), "data", "invest.sqlite");
let db: DatabaseSync | null = null;

function database() {
  if (db) return db;
  mkdirSync(path.dirname(dbPath), { recursive: true });
  db = new DatabaseSync(dbPath);
  db.exec(`
    CREATE TABLE IF NOT EXISTS companies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticker TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      primary_layer TEXT NOT NULL,
      secondary_layer TEXT NOT NULL DEFAULT '',
      tier TEXT NOT NULL,
      signal TEXT NOT NULL,
      action TEXT NOT NULL,
      thesis TEXT NOT NULL DEFAULT '',
      risk_summary TEXT NOT NULL DEFAULT '',
      next_review_date TEXT NOT NULL DEFAULT '',
      trigger TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS research_notes (
      company_id INTEGER PRIMARY KEY,
      analyst TEXT NOT NULL DEFAULT '',
      scores TEXT NOT NULL,
      business_breakdown TEXT NOT NULL,
      valuation TEXT NOT NULL,
      signals TEXT NOT NULL,
      risks TEXT NOT NULL,
      position_plan TEXT NOT NULL,
      decision_reason TEXT NOT NULL DEFAULT '',
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS positions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER,
      ticker TEXT NOT NULL UNIQUE,
      holding TEXT NOT NULL DEFAULT 'Holding',
      weight REAL NOT NULL DEFAULT 0,
      target_size REAL NOT NULL DEFAULT 0,
      max_size REAL NOT NULL DEFAULT 0,
      is_cash INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS monthly_reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      month TEXT NOT NULL UNIQUE,
      reviewer TEXT NOT NULL DEFAULT '',
      portfolio_value REAL NOT NULL DEFAULT 0,
      cash_percentage REAL NOT NULL DEFAULT 0,
      net_exposure REAL NOT NULL DEFAULT 0,
      major_events TEXT NOT NULL DEFAULT '',
      snapshot TEXT NOT NULL,
      layer_allocation TEXT NOT NULL,
      signal_changes TEXT NOT NULL,
      thesis_changes TEXT NOT NULL,
      action_log TEXT NOT NULL,
      next_focus TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
  db.exec(`
    INSERT OR IGNORE INTO app_settings (key, value)
    VALUES ('marketDataProvider', '{"enabled":false,"provider":"","apiKeyEnv":""}');
  `);
  return db;
}

function parse<T>(value: unknown, fallback: T): T {
  if (typeof value !== "string" || !value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function normalizeEnum<T extends readonly string[]>(value: FormDataEntryValue | null, allowed: T, fallback: T[number]): T[number] {
  const candidate = String(value ?? fallback);
  return allowed.includes(candidate) ? candidate : fallback;
}

function normalizeLayer(value: FormDataEntryValue | null, fallback: LayerId): LayerId {
  const candidate = String(value ?? fallback);
  return LAYERS.some((layer) => layer.id === candidate) ? (candidate as LayerId) : fallback;
}

function normalizeTier(value: FormDataEntryValue | null, fallback: TTier): TTier {
  const candidate = String(value ?? fallback);
  return T_TIERS.some((tier) => tier.id === candidate) ? (candidate as TTier) : fallback;
}

function numberField(formData: FormData, key: string) {
  const value = Number(formData.get(key) ?? 0);
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

function textField(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function companyFromRow(row: Record<string, unknown>): Company {
  return {
    id: Number(row.id),
    ticker: String(row.ticker),
    name: String(row.name),
    primaryLayer: String(row.primary_layer) as LayerId,
    secondaryLayer: String(row.secondary_layer) as LayerId | "",
    tier: String(row.tier) as TTier,
    signal: String(row.signal) as Signal,
    action: String(row.action) as Action,
    thesis: String(row.thesis ?? ""),
    riskSummary: String(row.risk_summary ?? ""),
    nextReviewDate: String(row.next_review_date ?? ""),
    trigger: String(row.trigger ?? ""),
    createdAt: String(row.created_at ?? ""),
    updatedAt: String(row.updated_at ?? "")
  };
}

function researchFromRow(row: Record<string, unknown> | undefined): ResearchNote | null {
  if (!row) return null;
  return {
    companyId: Number(row.company_id),
    analyst: String(row.analyst ?? ""),
    scores: parse<Record<string, number>>(row.scores, {}),
    businessBreakdown: parse<JsonRecord>(row.business_breakdown, {}),
    valuation: parse<JsonRecord>(row.valuation, {}),
    signals: parse<JsonRecord>(row.signals, {}),
    risks: parse<JsonRecord>(row.risks, {}),
    positionPlan: parse<JsonRecord>(row.position_plan, {}),
    decisionReason: String(row.decision_reason ?? ""),
    updatedAt: String(row.updated_at ?? "")
  };
}

function positionFromRow(row: Record<string, unknown> | undefined): Position | null {
  if (!row) return null;
  return {
    id: Number(row.id),
    companyId: row.company_id === null ? null : Number(row.company_id),
    ticker: String(row.ticker),
    holding: String(row.holding ?? "Holding"),
    weight: Number(row.weight ?? 0),
    targetSize: Number(row.target_size ?? 0),
    maxSize: Number(row.max_size ?? 0),
    isCash: Number(row.is_cash ?? 0) === 1,
    updatedAt: String(row.updated_at ?? "")
  };
}

function reviewFromRow(row: Record<string, unknown>): MonthlyReview {
  return {
    id: Number(row.id),
    month: String(row.month),
    reviewer: String(row.reviewer ?? ""),
    portfolioValue: Number(row.portfolio_value ?? 0),
    cashPercentage: Number(row.cash_percentage ?? 0),
    netExposure: Number(row.net_exposure ?? 0),
    majorEvents: String(row.major_events ?? ""),
    snapshot: parse<JsonRecord>(row.snapshot, {}),
    layerAllocation: parse<Record<string, number>>(row.layer_allocation, {}),
    signalChanges: parse<JsonRecord[]>(row.signal_changes, []),
    thesisChanges: parse<JsonRecord>(row.thesis_changes, {}),
    actionLog: parse<JsonRecord[]>(row.action_log, []),
    nextFocus: parse<JsonRecord>(row.next_focus, {}),
    createdAt: String(row.created_at ?? "")
  };
}

export function listCompanies(): CompanyWithNote[] {
  const rows = database().prepare("SELECT * FROM companies ORDER BY updated_at DESC, ticker ASC").all() as Record<string, unknown>[];
  return rows.map((row) => getCompany(Number(row.id))).filter(Boolean) as CompanyWithNote[];
}

export function getCompany(id: number): CompanyWithNote | null {
  const row = database().prepare("SELECT * FROM companies WHERE id = ?").get(id) as Record<string, unknown> | undefined;
  if (!row) return null;
  const company = companyFromRow(row);
  const research = researchFromRow(database().prepare("SELECT * FROM research_notes WHERE company_id = ?").get(id) as Record<string, unknown> | undefined);
  const position = positionFromRow(database().prepare("SELECT * FROM positions WHERE company_id = ? OR ticker = ?").get(id, company.ticker) as Record<string, unknown> | undefined);
  return { ...company, research, position };
}

export function listPositions() {
  return database().prepare("SELECT * FROM positions ORDER BY is_cash DESC, weight DESC, ticker ASC").all().map((row) => positionFromRow(row as Record<string, unknown>)) as Position[];
}

export function listMonthlyReviews() {
  return (database().prepare("SELECT * FROM monthly_reviews ORDER BY month DESC").all() as Record<string, unknown>[]).map(reviewFromRow);
}

export function saveCompany(formData: FormData) {
  const id = Number(formData.get("id") ?? 0);
  const ticker = textField(formData, "ticker").toUpperCase();
  const name = textField(formData, "name");
  if (!ticker || !name) throw new Error("Ticker and company name are required.");
  const primaryLayer = normalizeLayer(formData.get("primaryLayer"), "L4");
  const secondaryLayer = textField(formData, "secondaryLayer");
  const tier = normalizeTier(formData.get("tier"), "T3");
  const signal = normalizeEnum(formData.get("signal"), SIGNALS, "Yellow");
  const action = normalizeEnum(formData.get("action"), ACTIONS, "Watchlist");
  const values = [
    ticker,
    name,
    primaryLayer,
    secondaryLayer,
    tier,
    signal,
    action,
    textField(formData, "thesis"),
    textField(formData, "riskSummary"),
    textField(formData, "nextReviewDate"),
    textField(formData, "trigger")
  ];

  if (id) {
    database().prepare(`
      UPDATE companies
      SET ticker = ?, name = ?, primary_layer = ?, secondary_layer = ?, tier = ?, signal = ?, action = ?,
          thesis = ?, risk_summary = ?, next_review_date = ?, trigger = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(...values, id);
    return id;
  }

  const result = database().prepare(`
    INSERT INTO companies (ticker, name, primary_layer, secondary_layer, tier, signal, action, thesis, risk_summary, next_review_date, trigger)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(...values);
  const companyId = Number(result.lastInsertRowid);
  seedResearchNote(companyId);
  return companyId;
}

function seedResearchNote(companyId: number) {
  const scores = Object.fromEntries(SCORE_CATEGORIES.map((category) => [category, 3]));
  database().prepare(`
    INSERT OR IGNORE INTO research_notes
      (company_id, scores, business_breakdown, valuation, signals, risks, position_plan)
    VALUES (?, ?, '{}', '{}', '{}', '{}', '{}')
  `).run(companyId, JSON.stringify(scores));
}

function recordFromKeys(formData: FormData, keys: string[]) {
  return Object.fromEntries(keys.map((key) => [key, textField(formData, key)]));
}

export function saveResearch(formData: FormData) {
  const companyId = Number(formData.get("companyId") ?? 0);
  if (!companyId) throw new Error("Company id is required.");
  const scores = Object.fromEntries(SCORE_CATEGORIES.map((category) => [category, Number(formData.get(`score:${category}`) ?? 3)]));
  const businessBreakdown = recordFromKeys(formData, [
    "Revenue drivers",
    "Margin drivers",
    "Capital intensity",
    "Customer adoption",
    "Competitive position",
    "Key dependencies"
  ]);
  const valuation = recordFromKeys(formData, [
    "Current valuation",
    "Growth expectation embedded in price",
    "What must go right",
    "What could make the stock cheap",
    "What could make the stock expensive"
  ]);
  const risks = recordFromKeys(formData, ["Thesis risk", "Valuation risk", "Competition risk", "Execution risk", "Macro or regulatory risk"]);
  const positionPlan = recordFromKeys(formData, ["Intended role", "Initial size", "Target size", "Max size", "Add triggers", "Trim triggers", "Exit triggers"]);
  const signals = recordFromKeys(formData, [
    "Hard data state",
    "Hard data evidence",
    "Market emotion state",
    "Market emotion evidence",
    "Valuation state",
    "Valuation evidence",
    "Structural evidence state",
    "Structural evidence evidence"
  ]);

  database().prepare(`
    INSERT INTO research_notes
      (company_id, analyst, scores, business_breakdown, valuation, signals, risks, position_plan, decision_reason, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(company_id) DO UPDATE SET
      analyst = excluded.analyst,
      scores = excluded.scores,
      business_breakdown = excluded.business_breakdown,
      valuation = excluded.valuation,
      signals = excluded.signals,
      risks = excluded.risks,
      position_plan = excluded.position_plan,
      decision_reason = excluded.decision_reason,
      updated_at = CURRENT_TIMESTAMP
  `).run(
    companyId,
    textField(formData, "analyst"),
    JSON.stringify(scores),
    JSON.stringify(businessBreakdown),
    JSON.stringify(valuation),
    JSON.stringify(signals),
    JSON.stringify(risks),
    JSON.stringify(positionPlan),
    textField(formData, "decisionReason")
  );
}

export function saveAiResearch(result: AiResearchResult) {
  const ticker = result.ticker.trim().toUpperCase();
  if (!ticker || !result.companyName.trim()) throw new Error("AI research result did not include a valid company name and ticker.");
  const existing = database().prepare("SELECT id FROM companies WHERE ticker = ?").get(ticker) as Record<string, unknown> | undefined;
  const values = [
    ticker,
    result.companyName.trim(),
    result.primaryLayer,
    result.secondaryLayer,
    result.tier,
    result.signal,
    result.action,
    result.thesis,
    result.riskSummary,
    result.nextReviewDate,
    result.trigger
  ];

  let companyId: number;
  if (existing) {
    companyId = Number(existing.id);
    database().prepare(`
      UPDATE companies
      SET ticker = ?, name = ?, primary_layer = ?, secondary_layer = ?, tier = ?, signal = ?, action = ?,
          thesis = ?, risk_summary = ?, next_review_date = ?, trigger = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(...values, companyId);
  } else {
    const insert = database().prepare(`
      INSERT INTO companies (ticker, name, primary_layer, secondary_layer, tier, signal, action, thesis, risk_summary, next_review_date, trigger)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(...values);
    companyId = Number(insert.lastInsertRowid);
  }

  const businessBreakdown = {
    ...result.businessBreakdown,
    "AI research source URLs": result.sourceUrls.join("\n"),
    "AI research generated at": new Date().toISOString()
  };

  database().prepare(`
    INSERT INTO research_notes
      (company_id, analyst, scores, business_breakdown, valuation, signals, risks, position_plan, decision_reason, updated_at)
    VALUES (?, 'OpenAI web research', ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(company_id) DO UPDATE SET
      analyst = excluded.analyst,
      scores = excluded.scores,
      business_breakdown = excluded.business_breakdown,
      valuation = excluded.valuation,
      signals = excluded.signals,
      risks = excluded.risks,
      position_plan = excluded.position_plan,
      decision_reason = excluded.decision_reason,
      updated_at = CURRENT_TIMESTAMP
  `).run(
    companyId,
    JSON.stringify(result.scores),
    JSON.stringify(businessBreakdown),
    JSON.stringify(result.valuation),
    JSON.stringify(result.signals),
    JSON.stringify(result.risks),
    JSON.stringify(result.positionPlan),
    result.decisionReason
  );

  return companyId;
}

export function savePosition(formData: FormData) {
  const companyId = Number(formData.get("companyId") || 0) || null;
  const ticker = textField(formData, "ticker").toUpperCase();
  if (!ticker) throw new Error("Ticker is required.");
  database().prepare(`
    INSERT INTO positions (company_id, ticker, holding, weight, target_size, max_size, is_cash, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(ticker) DO UPDATE SET
      company_id = excluded.company_id,
      holding = excluded.holding,
      weight = excluded.weight,
      target_size = excluded.target_size,
      max_size = excluded.max_size,
      is_cash = excluded.is_cash,
      updated_at = CURRENT_TIMESTAMP
  `).run(
    companyId,
    ticker,
    textField(formData, "holding") || "Holding",
    numberField(formData, "weight"),
    numberField(formData, "targetSize"),
    numberField(formData, "maxSize"),
    formData.get("isCash") ? 1 : 0
  );
}

export function layerAllocation() {
  const allocation = emptyAllocation();
  const companies = listCompanies();
  for (const position of listPositions()) {
    if (position.isCash) {
      allocation.Cash += position.weight;
      continue;
    }
    const company = companies.find((item) => item.ticker === position.ticker);
    if (company) allocation[company.primaryLayer] += position.weight;
  }
  return allocation;
}

export function createMonthlyReview(formData: FormData) {
  const allocation = layerAllocation();
  const companies = listCompanies();
  const holdings = companies
    .filter((company) => company.position && !company.position.isCash)
    .map((company) => ({
      name: company.name,
      ticker: company.ticker,
      weight: company.position?.weight ?? 0,
      primaryLayer: company.primaryLayer,
      tier: company.tier,
      signal: company.signal,
      action: company.action
    }));
  const month = textField(formData, "month") || new Date().toISOString().slice(0, 7);
  const cashPercentage = allocation.Cash ?? 0;
  const netExposure = Math.max(0, 100 - cashPercentage);
  database().prepare(`
    INSERT INTO monthly_reviews
      (month, reviewer, portfolio_value, cash_percentage, net_exposure, major_events, snapshot, layer_allocation, signal_changes, thesis_changes, action_log, next_focus)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, '[]', '{}', '[]', '{}')
    ON CONFLICT(month) DO UPDATE SET
      reviewer = excluded.reviewer,
      portfolio_value = excluded.portfolio_value,
      cash_percentage = excluded.cash_percentage,
      net_exposure = excluded.net_exposure,
      major_events = excluded.major_events,
      snapshot = excluded.snapshot,
      layer_allocation = excluded.layer_allocation
  `).run(
    month,
    textField(formData, "reviewer"),
    numberField(formData, "portfolioValue"),
    cashPercentage,
    netExposure,
    textField(formData, "majorEvents"),
    JSON.stringify({ holdings }),
    JSON.stringify(allocation)
  );
}

export function exportCompany(id: number) {
  const company = getCompany(id);
  if (!company) throw new Error("Company not found.");
  const dir = path.join(process.cwd(), "research", "companies");
  mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, `${company.ticker.toLowerCase()}.md`);
  writeFileSync(filePath, companyMarkdown(company), "utf8");
  return filePath;
}

export function exportMonthlyReview(id: number) {
  const row = database().prepare("SELECT * FROM monthly_reviews WHERE id = ?").get(id) as Record<string, unknown> | undefined;
  if (!row) throw new Error("Monthly review not found.");
  const review = reviewFromRow(row);
  const dir = path.join(process.cwd(), "research", "monthly");
  mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, `${review.month}.md`);
  writeFileSync(filePath, monthlyReviewMarkdown(review), "utf8");
  return filePath;
}
