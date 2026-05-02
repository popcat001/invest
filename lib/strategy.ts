import { LAYERS, T_TIERS, type LayerId, type TTier } from "./constants";

export type ScoreMap = Record<string, number>;
export type LayerAllocation = Record<string, number>;

export function scoreTotal(scores: ScoreMap | null | undefined) {
  if (!scores) return 0;
  return Object.values(scores).reduce((sum, score) => sum + boundedScore(score), 0);
}

export function scoreInterpretation(total: number) {
  if (total >= 25) return "Core candidate";
  if (total >= 19) return "Watch, stage in, or hold with defined triggers";
  if (total >= 13) return "Tactical or theme-only exposure";
  return "Avoid unless clearly asymmetric";
}

export function boundedScore(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(5, Math.max(1, Math.round(value)));
}

export function layerRange(layer: LayerId | string) {
  return LAYERS.find((item) => item.id === layer)?.range ?? [0, 0];
}

export function tierMax(tier: TTier | string) {
  return T_TIERS.find((item) => item.id === tier)?.max ?? 0;
}

export function positionWarning(weight: number, tier: TTier | string) {
  const max = tierMax(tier);
  if (!max || weight <= max) return null;
  return `Above ${tier} max (${max}%)`;
}

export function allocationState(weight: number, layer: LayerId | string) {
  const [min, max] = layerRange(layer);
  if (weight < min) return "Below target";
  if (weight > max) return "Above target";
  return "In range";
}

export function emptyAllocation(): LayerAllocation {
  return Object.fromEntries(LAYERS.map((layer) => [layer.id, 0]));
}

