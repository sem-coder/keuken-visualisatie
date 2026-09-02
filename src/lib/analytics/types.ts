export type AnalyticsEventType = 'visualization' | 'sample_request';

export interface VisualizationAnalyticsEvent {
  id: string;
  type: 'visualization';
  timestamp: string;
  materialId: string;
  materialCode: string;
  materialName: string;
  mockMode: boolean;
  model: string;
  quality: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCostUsd: number;
  success: boolean;
  errorMessage?: string;
}

export interface SampleRequestAnalyticsEvent {
  id: string;
  type: 'sample_request';
  timestamp: string;
  requestId: string;
  sampleCount: number;
  sampleIds: string[];
  sampleCodes: string[];
  customerEmail: string;
  visualizationCount: number;
  estimatedCostUsd: number;
}

export type AnalyticsEvent = VisualizationAnalyticsEvent | SampleRequestAnalyticsEvent;

export interface AnalyticsStoreData {
  events: AnalyticsEvent[];
  updatedAt: string;
}

export interface AdminStats {
  summary: {
    totalVisualizations: number;
    successfulVisualizations: number;
    failedVisualizations: number;
    mockVisualizations: number;
    totalSampleRequests: number;
    totalTokens: number;
    totalInputTokens: number;
    totalOutputTokens: number;
    totalEstimatedCostUsd: number;
    avgCostPerVisualizationUsd: number;
    avgCostPerSampleRequestUsd: number;
  };
  recentVisualizations: VisualizationAnalyticsEvent[];
  recentSampleRequests: SampleRequestAnalyticsEvent[];
  dailyStats: {
    date: string;
    visualizations: number;
    sampleRequests: number;
    tokens: number;
    estimatedCostUsd: number;
  }[];
}
