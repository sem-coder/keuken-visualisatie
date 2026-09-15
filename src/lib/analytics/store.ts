import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import { get, put } from '@vercel/blob';
import type {
  AnalyticsEvent,
  AnalyticsStoreData,
  AdminStats,
  SampleRequestAnalyticsEvent,
  VisualizationAnalyticsEvent,
} from '@/lib/analytics/types';

const MAX_EVENTS = 5000;
const BLOB_PATHNAME = 'analytics/events.json';

function getLocalStorePath(): string {
  if (process.env.ANALYTICS_STORE_PATH) {
    return process.env.ANALYTICS_STORE_PATH;
  }
  return path.join(process.cwd(), 'data', 'analytics.json');
}

function isBlobStorageEnabled(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

async function readLocalStore(): Promise<AnalyticsStoreData> {
  try {
    const raw = await readFile(getLocalStorePath(), 'utf8');
    const parsed = JSON.parse(raw) as AnalyticsStoreData;
    if (!Array.isArray(parsed.events)) {
      return { events: [], updatedAt: new Date().toISOString() };
    }
    return parsed;
  } catch {
    return { events: [], updatedAt: new Date().toISOString() };
  }
}

async function writeLocalStore(data: AnalyticsStoreData): Promise<void> {
  const storePath = getLocalStorePath();
  await mkdir(path.dirname(storePath), { recursive: true });
  await writeFile(storePath, JSON.stringify(data, null, 2), 'utf8');
}

async function readBlobStore(): Promise<AnalyticsStoreData> {
  try {
    const result = await get(BLOB_PATHNAME, { access: 'private', useCache: false });
    if (!result || result.statusCode === 304 || !result.stream) {
      return { events: [], updatedAt: new Date().toISOString() };
    }

    const raw = await new Response(result.stream).text();
    const parsed = JSON.parse(raw) as AnalyticsStoreData;
    if (!Array.isArray(parsed.events)) {
      return { events: [], updatedAt: new Date().toISOString() };
    }
    return parsed;
  } catch {
    return { events: [], updatedAt: new Date().toISOString() };
  }
}

async function writeBlobStore(data: AnalyticsStoreData): Promise<void> {
  await put(BLOB_PATHNAME, JSON.stringify(data, null, 2), {
    access: 'private',
    allowOverwrite: true,
    contentType: 'application/json',
  });
}

async function readStore(): Promise<AnalyticsStoreData> {
  if (isBlobStorageEnabled()) {
    return readBlobStore();
  }
  return readLocalStore();
}

async function writeStore(data: AnalyticsStoreData): Promise<void> {
  if (isBlobStorageEnabled()) {
    await writeBlobStore(data);
    return;
  }
  await writeLocalStore(data);
}

export async function appendAnalyticsEvent(event: AnalyticsEvent): Promise<void> {
  const store = await readStore();
  store.events.push(event);
  if (store.events.length > MAX_EVENTS) {
    store.events = store.events.slice(-MAX_EVENTS);
  }
  store.updatedAt = new Date().toISOString();
  await writeStore(store);
}

export async function logVisualizationEvent(
  input: Omit<VisualizationAnalyticsEvent, 'id' | 'type' | 'timestamp'>,
): Promise<void> {
  await appendAnalyticsEvent({
    id: randomUUID(),
    type: 'visualization',
    timestamp: new Date().toISOString(),
    ...input,
  });
}

export async function logSampleRequestEvent(
  input: Omit<SampleRequestAnalyticsEvent, 'id' | 'type' | 'timestamp'>,
): Promise<void> {
  await appendAnalyticsEvent({
    id: randomUUID(),
    type: 'sample_request',
    timestamp: new Date().toISOString(),
    ...input,
  });
}

export async function getAdminStats(): Promise<AdminStats> {
  const store = await readStore();
  const visualizations = store.events.filter(
    (event): event is VisualizationAnalyticsEvent => event.type === 'visualization',
  );
  const sampleRequests = store.events.filter(
    (event): event is SampleRequestAnalyticsEvent => event.type === 'sample_request',
  );

  const successful = visualizations.filter((event) => event.success);
  const totalTokens = visualizations.reduce((sum, event) => sum + event.totalTokens, 0);
  const totalInputTokens = visualizations.reduce((sum, event) => sum + event.inputTokens, 0);
  const totalOutputTokens = visualizations.reduce((sum, event) => sum + event.outputTokens, 0);
  const visualizationCost = visualizations.reduce(
    (sum, event) => sum + event.estimatedCostUsd,
    0,
  );
  const sampleCost = sampleRequests.reduce((sum, event) => sum + event.estimatedCostUsd, 0);

  const dailyMap = new Map<
    string,
    { visualizations: number; sampleRequests: number; tokens: number; estimatedCostUsd: number }
  >();

  for (const event of store.events) {
    const date = event.timestamp.slice(0, 10);
    const current = dailyMap.get(date) ?? {
      visualizations: 0,
      sampleRequests: 0,
      tokens: 0,
      estimatedCostUsd: 0,
    };

    if (event.type === 'visualization') {
      current.visualizations += 1;
      current.tokens += event.totalTokens;
      current.estimatedCostUsd += event.estimatedCostUsd;
    } else {
      current.sampleRequests += 1;
      current.estimatedCostUsd += event.estimatedCostUsd;
    }

    dailyMap.set(date, current);
  }

  const dailyStats = [...dailyMap.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, 14)
    .map(([date, stats]) => ({ date, ...stats }));

  return {
    summary: {
      totalVisualizations: visualizations.length,
      successfulVisualizations: successful.length,
      failedVisualizations: visualizations.length - successful.length,
      mockVisualizations: visualizations.filter((event) => event.mockMode).length,
      totalSampleRequests: sampleRequests.length,
      totalTokens,
      totalInputTokens,
      totalOutputTokens,
      totalEstimatedCostUsd: visualizationCost + sampleCost,
      avgCostPerVisualizationUsd:
        successful.length > 0 ? visualizationCost / successful.length : 0,
      avgCostPerSampleRequestUsd:
        sampleRequests.length > 0 ? sampleCost / sampleRequests.length : 0,
    },
    recentVisualizations: [...visualizations].reverse().slice(0, 20),
    recentSampleRequests: [...sampleRequests].reverse().slice(0, 20),
    dailyStats,
    storageBackend: isBlobStorageEnabled() ? 'blob' : 'local',
    updatedAt: store.updatedAt,
  };
}

export async function getRecentVisualizations(): Promise<VisualizationAnalyticsEvent[]> {
  const store = await readStore();
  return store.events
    .filter((event): event is VisualizationAnalyticsEvent => event.type === 'visualization')
    .slice(-100);
}
