import OpenAI, { toFile } from 'openai';
import { buildKitchenVisualizationPrompt } from '@/lib/ai/buildKitchenVisualizationPrompt';
import {
  getImageDimensions,
  normalizeToInputSize,
  pickOpenAiSize,
} from '@/lib/ai/matchImageSize';
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
    const model = config.openAiModel;
    const quality = config.openAiImageQuality;
    const inputFidelity = config.openAiInputFidelity;

    const { width, height } = await getImageDimensions(buffer);
    const size = pickOpenAiSize(width, height);

    const file = await toFile(buffer, 'kitchen.jpg', { type: mimeType });

    const response = await this.client.images.edit({
      model,
      image: file,
      prompt,
      input_fidelity: inputFidelity,
      quality,
      size,
      output_format: 'jpeg',
    });

    const b64 = response.data?.[0]?.b64_json;
    if (!b64) {
      throw new Error('OpenAI returned no image data');
    }

    const rawBuffer = Buffer.from(b64, 'base64');
    const normalizedBuffer = await normalizeToInputSize(rawBuffer, width, height);
    const normalizedBase64 = normalizedBuffer.toString('base64');
    const usage = response.usage;

    return {
      imageUrl: '',
      storageKey: '',
      imageBase64: normalizedBase64,
      mimeType: 'image/jpeg',
      mockMode: false,
      model,
      quality,
      usage: {
        inputTokens: usage?.input_tokens ?? 0,
        outputTokens: usage?.output_tokens ?? 0,
        totalTokens: usage?.total_tokens ?? 0,
      },
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
      imageBase64: buffer.toString('base64'),
      mimeType,
      mockMode: true,
      model: 'mock',
      quality: 'mock',
      usage: {
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
      },
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
