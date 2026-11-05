import { getAllVisualizationEvents } from '@/lib/analytics/store';
import type { VisualizationAnalyticsEvent } from '@/lib/analytics/types';
import { config } from '@/lib/config';
import type { TenantClient } from '@/lib/tenants/types';

export interface VisualizationQuotaStatus {
  used: number;
  limit: number | null;
  periodKey: string;
  allowed: boolean;
}

/** YYYY-MM in Europe/Amsterdam */
export function currentVisualizationMonthKey(date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Amsterdam',
    year: 'numeric',
    month: '2-digit',
  }).formatToParts(date);
  const year = parts.find((p) => p.type === 'year')?.value ?? '0000';
  const month = parts.find((p) => p.type === 'month')?.value ?? '01';
  return `${year}-${month}`;
}

export function visualizationMonthKeyFromTimestamp(timestamp: string): string {
  return currentVisualizationMonthKey(new Date(timestamp));
}

export function getClientVisualizationLimit(client: TenantClient): number | null {
  const limit = client.monthlyVisualizationLimit;
  if (limit === undefined || limit === null) {
    return config.defaultMonthlyVisualizationLimit;
  }
  if (limit <= 0) {
    return null;
  }
  return limit;
}

export function countVisualizationsInMonth(
  events: VisualizationAnalyticsEvent[],
  clientSlug: string,
  monthKey: string,
): number {
  return events.filter(
    (event) =>
      event.success &&
      event.clientSlug === clientSlug &&
      visualizationMonthKeyFromTimestamp(event.timestamp) === monthKey,
  ).length;
}

export async function getVisualizationQuotaStatus(
  client: TenantClient,
): Promise<VisualizationQuotaStatus> {
  const periodKey = currentVisualizationMonthKey();
  const limit = getClientVisualizationLimit(client);
  const events = await getAllVisualizationEvents();
  const used = countVisualizationsInMonth(events, client.slug, periodKey);

  return {
    used,
    limit,
    periodKey,
    allowed: limit === null || used < limit,
  };
}
