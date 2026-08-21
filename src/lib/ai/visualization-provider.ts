import type { Material } from '@/lib/materials';

export interface VisualizationRequest {
  image: File | Buffer;
  mimeType?: string;
  material: Material;
}

export interface VisualizationResult {
  imageUrl: string;
  storageKey?: string;
}

export interface VisualizationProvider {
  generate(request: VisualizationRequest): Promise<VisualizationResult>;
}
