import { NextResponse } from 'next/server';
import { createVisualizationProvider } from '@/lib/ai/openai-provider';
import { logVisualizationEvent } from '@/lib/analytics/store';
import { estimateVisualizationCostUsd } from '@/lib/analytics/cost';
import { getMaterialById, type Material } from '@/lib/materials';
import { config, isAcceptedImageType } from '@/lib/config';

export const runtime = 'nodejs';
export const maxDuration = 120;

export async function POST(request: Request) {
  let materialId = 'unknown';
  let material: Material | undefined;

  try {
    const formData = await request.formData();
    const image = formData.get('image');
    const materialIdValue = formData.get('materialId');
    materialId = typeof materialIdValue === 'string' ? materialIdValue : 'unknown';
    material = getMaterialById(materialId);

    if (!(image instanceof File)) {
      return NextResponse.json({ error: 'Geen afbeelding ontvangen' }, { status: 400 });
    }

    if (typeof materialIdValue !== 'string') {
      return NextResponse.json({ error: 'Geen materiaal geselecteerd' }, { status: 400 });
    }

    if (!isAcceptedImageType(image.type)) {
      return NextResponse.json({ error: 'Ongeldig bestandstype' }, { status: 400 });
    }

    if (image.size > config.maxImageSizeBytes) {
      return NextResponse.json({ error: 'Bestand is te groot (max 10 MB)' }, { status: 400 });
    }

    if (!material) {
      return NextResponse.json({ error: 'Materiaal niet gevonden' }, { status: 404 });
    }

    const arrayBuffer = await image.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const provider = createVisualizationProvider();
    const result = await provider.generate({
      image: buffer,
      mimeType: image.type,
      material,
    });

    const usage = result.usage ?? { inputTokens: 0, outputTokens: 0, totalTokens: 0 };
    const mockMode = result.mockMode ?? !process.env.OPENAI_API_KEY;

    await logVisualizationEvent({
      materialId: material.id,
      materialCode: material.code,
      materialName: material.name,
      mockMode,
      model: result.model ?? config.openAiModel,
      quality: result.quality ?? config.openAiImageQuality,
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
      totalTokens: usage.totalTokens,
      estimatedCostUsd: estimateVisualizationCostUsd(usage, { mockMode, model: result.model }),
      success: true,
    });

    const imageDataUrl = `data:${result.mimeType};base64,${result.imageBase64}`;

    return NextResponse.json({
      imageUrl: imageDataUrl,
      storageKey: result.storageKey,
      mockMode,
    });
  } catch (error) {
    console.error('Visualization error:', error);

    await logVisualizationEvent({
      materialId: material?.id ?? materialId,
      materialCode: material?.code ?? '-',
      materialName: material?.name ?? 'Onbekend',
      mockMode: !process.env.OPENAI_API_KEY,
      model: config.openAiModel,
      quality: config.openAiImageQuality,
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      estimatedCostUsd: 0,
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Onbekende fout',
    });

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'De visualisatie kon niet worden gemaakt',
      },
      { status: 500 },
    );
  }
}
