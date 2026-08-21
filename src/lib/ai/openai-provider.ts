import OpenAI, { toFile } from 'openai';
import { buildKitchenVisualizationPrompt } from '@/lib/ai/buildKitchenVisualizationPrompt';
import type {
  VisualizationProvider,
  VisualizationRequest,
  VisualizationResult,
} from '@/lib/ai/visualization-provider';
import { config } from '@/lib/config';
import { getMockStorage } from '@/lib/storage/mock-storage';

function bufferFromRequest(request: VisualizationRequest): Buffer {
  if (Buffer.isBuffer(request.image)) {
    return request.image;
  }
  throw new Error('OpenAI provider requires a Buffer on the server');
}

function mimeFromRequest(request: VisualizationRequest): string {
  return request.mimeType ?? 'image/jpeg';
}

export class OpenAIVisualizationProvider implements VisualizationProvider {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async generate(request: VisualizationRequest): Promise<VisualizationResult> {
    const buffer = bufferFromRequest(request);
    const mimeType = mimeFromRequest(request);
    const prompt = buildKitchenVisualizationPrompt(request.material);
    const storage = getMockStorage();

    const file = await toFile(buffer, 'kitchen.jpg', { type: mimeType });

    const response = await this.client.images.edit({
      model: config.openAiModel,
      image: file,
      prompt,
      input_fidelity: 'high',
      quality: 'high',
      size: 'auto',
      output_format: 'jpeg',
    });

    const b64 = response.data?.[0]?.b64_json;
    if (!b64) {
      throw new Error('OpenAI returned no image data');
    }

    const resultBuffer = Buffer.from(b64, 'base64');
    const stored = await storage.upload(resultBuffer, {
      mimeType: 'image/jpeg',
      prefix: 'visualizations',
    });

    return {
      imageUrl: stored.url,
      storageKey: stored.key,
    };
  }
}

export class MockVisualizationProvider implements VisualizationProvider {
  async generate(request: VisualizationRequest): Promise<VisualizationResult> {
    const buffer = bufferFromRequest(request);
    const mimeType = mimeFromRequest(request);
    const storage = getMockStorage();

    const stored = await storage.upload(buffer, {
      mimeType,
      prefix: 'visualizations-mock',
    });

    return {
      imageUrl: stored.url,
      storageKey: stored.key,
    };
  }
}

export function createVisualizationProvider(): VisualizationProvider {
  const apiKey = process.env.OPENAI_API_KEY;
  if (apiKey) {
    return new OpenAIVisualizationProvider(apiKey);
  }
  return new MockVisualizationProvider();
}
