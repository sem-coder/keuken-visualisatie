import sharp from 'sharp';

export type OpenAiImageSize = '1024x1024' | '1536x1024' | '1024x1536';

export async function getImageDimensions(
  buffer: Buffer,
): Promise<{ width: number; height: number }> {
  const meta = await sharp(buffer).metadata();
  if (!meta.width || !meta.height) {
    throw new Error('Afbeeldingafmetingen konden niet worden gelezen');
  }
  return { width: meta.width, height: meta.height };
}

export function pickOpenAiSize(width: number, height: number): OpenAiImageSize {
  const ratio = width / height;
  if (ratio > 1.1) return '1536x1024';
  if (ratio < 0.9) return '1024x1536';
  return '1024x1024';
}

/** Force AI output to exact input pixel dimensions for before/after alignment. */
export async function normalizeToInputSize(
  outputBuffer: Buffer,
  targetWidth: number,
  targetHeight: number,
): Promise<Buffer> {
  return sharp(outputBuffer)
    .resize(targetWidth, targetHeight, { fit: 'fill' })
    .jpeg({ quality: 90 })
    .toBuffer();
}
