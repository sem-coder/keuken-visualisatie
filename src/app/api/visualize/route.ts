import { NextResponse } from 'next/server';
import { createVisualizationProvider } from '@/lib/ai/openai-provider';
import { getMaterialById } from '@/lib/materials';
import { config, isAcceptedImageType } from '@/lib/config';
import { getMockStorage } from '@/lib/storage/mock-storage';

export const runtime = 'nodejs';
export const maxDuration = 120;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const image = formData.get('image');
    const materialId = formData.get('materialId');

    if (!(image instanceof File)) {
      return NextResponse.json({ error: 'Geen afbeelding ontvangen' }, { status: 400 });
    }

    if (typeof materialId !== 'string') {
      return NextResponse.json({ error: 'Geen materiaal geselecteerd' }, { status: 400 });
    }

    if (!isAcceptedImageType(image.type)) {
      return NextResponse.json({ error: 'Ongeldig bestandstype' }, { status: 400 });
    }

    if (image.size > config.maxImageSizeBytes) {
      return NextResponse.json({ error: 'Bestand is te groot (max 10 MB)' }, { status: 400 });
    }

    const material = getMaterialById(materialId);
    if (!material) {
      return NextResponse.json({ error: 'Materiaal niet gevonden' }, { status: 404 });
    }

    const arrayBuffer = await image.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const storage = getMockStorage();

    const kitchenStored = await storage.upload(buffer, {
      mimeType: image.type,
      prefix: 'kitchens',
    });

    const provider = createVisualizationProvider();
    const result = await provider.generate({
      image: buffer,
      mimeType: image.type,
      material,
    });

    const imageDataUrl = `data:${result.mimeType};base64,${result.imageBase64}`;

    return NextResponse.json({
      imageUrl: imageDataUrl,
      storageKey: result.storageKey,
      kitchenImageKey: kitchenStored.key,
      mockMode: !process.env.OPENAI_API_KEY,
    });
  } catch (error) {
    console.error('Visualization error:', error);
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
