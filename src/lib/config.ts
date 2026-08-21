export const config = {
  maxImageSizeBytes: 10 * 1024 * 1024,
  acceptedImageTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'] as const,
  maxSamples: 2,
  showFreeSamples: process.env.NEXT_PUBLIC_SHOW_FREE_SAMPLES === 'true',
  parentOrigin: process.env.NEXT_PUBLIC_PARENT_ORIGIN ?? '*',
  parentWebsiteUrl: process.env.NEXT_PUBLIC_PARENT_WEBSITE_URL ?? '',
  openAiModel: process.env.OPENAI_IMAGE_MODEL ?? 'gpt-image-1.5',
} as const;

export function isAcceptedImageType(type: string): type is (typeof config.acceptedImageTypes)[number] {
  return (config.acceptedImageTypes as readonly string[]).includes(type);
}
