import fs from 'fs';
import path from 'path';
import type { Material } from '@/lib/materials';

export function loadMaterialSwatchBuffer(material: Material): Buffer | null {
  if (!material.image?.startsWith('/')) return null;
  const relative = material.image.replace(/^\//, '');
  const filePath = path.join(process.cwd(), 'public', relative);
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath);
}

export function materialSwatchMimeType(material: Material): string {
  const ext = path.extname(material.image ?? '').toLowerCase();
  if (ext === '.png') return 'image/png';
  if (ext === '.webp') return 'image/webp';
  return 'image/jpeg';
}