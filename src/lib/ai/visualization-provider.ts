import type { Material } from '@/lib/materials';

export interface VisualizationRequest {
  image: File | Buffer;
  mimeType?: string;
  material: Material;
}

export interface VisualizationResult {
  imageUrl: string;
  storageKey?: string;
  imageBase64: string;
  mimeType: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  mockMode?: boolean;
  model?: string;
  quality?: string;
}

export interface VisualizationProvider {
  generate(request: VisualizationRequest): Promise<VisualizationResult>;
}
