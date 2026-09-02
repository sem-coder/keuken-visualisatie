import type { VisualizationAnalyticsEvent } from '@/lib/analytics/types';

/** Default USD pricing estimates for gpt-image-1.5 high quality (override via env). */
const DEFAULT_INPUT_COST_PER_1M = 0.005;
const DEFAULT_OUTPUT_COST_PER_1M = 0.04;
const DEFAULT_FLAT_MOCK_COST = 0;

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export function estimateVisualizationCostUsd(
  usage: TokenUsage,
  options: { mockMode: boolean; model?: string },
): number {
  if (options.mockMode) return DEFAULT_FLAT_MOCK_COST;

  const flatCost = parseEnvNumber(process.env.OPENAI_IMAGE_FLAT_COST_USD);
  if (flatCost !== null) return flatCost;

  const inputRate =
    parseEnvNumber(process.env.OPENAI_INPUT_COST_PER_1M_USD) ?? DEFAULT_INPUT_COST_PER_1M;
  const outputRate =
    parseEnvNumber(process.env.OPENAI_OUTPUT_COST_PER_1M_USD) ?? DEFAULT_OUTPUT_COST_PER_1M;

  if (usage.totalTokens > 0) {
    return (
      (usage.inputTokens / 1_000_000) * inputRate +
      (usage.outputTokens / 1_000_000) * outputRate
    );
  }

  return parseEnvNumber(process.env.OPENAI_IMAGE_FALLBACK_COST_USD) ?? 0.12;
}

export function estimateSampleRequestCostUsd(
  materialIds: string[],
  visualizations: VisualizationAnalyticsEvent[],
): number {
  let total = 0;
  for (const materialId of materialIds) {
    const match = [...visualizations]
      .reverse()
      .find((event) => event.materialId === materialId && event.success);
    if (match) total += match.estimatedCostUsd;
  }
  return total;
}

function parseEnvNumber(value: string | undefined): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function formatUsd(amount: number): string {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(amount);
}

export function formatEur(amount: number, rate = 0.92): string {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount * rate);
}
