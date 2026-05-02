export const LAYERS = [
  { id: "L1", name: "Physical infrastructure", range: [10, 20], role: "Power, grid, cooling, metals, fabs" },
  { id: "L2", name: "Digital infrastructure", range: [15, 25], role: "Compute, cloud, data centers, networking" },
  { id: "L3", name: "Core intelligence", range: [20, 30], role: "Models, training systems, AI engines" },
  { id: "L4", name: "AI applications", range: [20, 35], role: "Revenue-producing AI use cases" },
  { id: "L5", name: "Frontier exploration", range: [0, 10], role: "Optionality and experimental frontiers" },
  { id: "Cash", name: "Cash", range: [5, 20], role: "Dry powder and drawdown control" }
] as const;

export const T_TIERS = [
  { id: "T1", name: "Core pressure", initial: "4-8%", max: 15 },
  { id: "T2", name: "Growth engine", initial: "3-6%", max: 10 },
  { id: "T3", name: "Theme allocation", initial: "1-3%", max: 5 },
  { id: "T4", name: "Frontier option", initial: "0.5-2%", max: 3 }
] as const;

export const SIGNALS = ["Green", "Yellow", "Orange", "Red"] as const;
export const ACTIONS = ["Add", "Hold", "Trim", "Pause", "Exit", "Watchlist"] as const;
export const SCORE_CATEGORIES = [
  "Layer clarity",
  "Value capture",
  "Data quality",
  "Moat",
  "AI cycle health",
  "Valuation discipline"
] as const;

export type LayerId = (typeof LAYERS)[number]["id"];
export type TTier = (typeof T_TIERS)[number]["id"];
export type Signal = (typeof SIGNALS)[number];
export type Action = (typeof ACTIONS)[number];

