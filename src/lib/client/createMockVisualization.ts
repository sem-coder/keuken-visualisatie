import type { Material } from '@/lib/materials';

export async function createMockVisualization(
  photoUrl: string,
  material: Material,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext('2d');

      if (!context) {
        reject(new Error('Canvas niet beschikbaar'));
        return;
      }

      context.drawImage(image, 0, 0);

      const cabinetTop = image.naturalHeight * 0.28;
      context.save();
      context.globalAlpha = material.type === 'wood' ? 0.62 : 0.55;
      context.globalCompositeOperation =
        material.type === 'wood' ? 'multiply' : 'color';
      context.fillStyle = material.preview;
      context.fillRect(0, cabinetTop, image.naturalWidth, image.naturalHeight - cabinetTop);
      context.restore();

      context.save();
      context.globalAlpha = 0.25;
      const gradient = context.createLinearGradient(0, cabinetTop, 0, image.naturalHeight);
      gradient.addColorStop(0, 'transparent');
      gradient.addColorStop(1, material.preview);
      context.fillStyle = gradient;
      context.fillRect(0, cabinetTop, image.naturalWidth, image.naturalHeight - cabinetTop);
      context.restore();

      resolve(canvas.toDataURL('image/jpeg', 0.92));
    };
    image.onerror = () => reject(new Error('Foto kon niet worden geladen'));
    image.src = photoUrl;
  });
}
