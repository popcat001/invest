import type { Action, LayerId, Signal, TTier } from "./constants";

export type JsonRecord = Record<string, unknown>;

export type Company = {
  id: number;
  ticker: string;
  name: string;
  primaryLayer: LayerId;
  secondaryLayer: LayerId | "";
  tier: TTier;
  signal: Signal;
  action: Action;
  thesis: string;
  riskSummary: string;
  nextReviewDate: string;
  trigger: string;
  createdAt: string;
  updatedAt: string;
};

export type ResearchNote = {
  companyId: number;
  analyst: string;
  scores: Record<string, number>;
  businessBreakdown: JsonRecord;
  valuation: JsonRecord;
  signals: JsonRecord;
  risks: JsonRecord;
  positionPlan: JsonRecord;
  decisionReason: string;
  updatedAt: string;
};

export type Position = {
  id: number;
  companyId: number | null;
  ticker: string;
  holding: string;
  weight: number;
  targetSize: number;
  maxSize: number;
  isCash: boolean;
  updatedAt: string;
};

export type CompanyWithNote = Company & {
  research: ResearchNote | null;
  position: Position | null;
};

export type MonthlyReview = {
  id: number;
  month: string;
  reviewer: string;
  portfolioValue: number;
  cashPercentage: number;
  netExposure: number;
  majorEvents: string;
  snapshot: JsonRecord;
  layerAllocation: Record<string, number>;
  signalChanges: JsonRecord[];
  thesisChanges: JsonRecord;
  actionLog: JsonRecord[];
  nextFocus: JsonRecord;
  createdAt: string;
};

