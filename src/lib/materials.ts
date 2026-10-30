import onitCatalog from '@/data/onit-materials.json';

export type MaterialFamily = 'single-color' | 'wood' | 'stone' | 'metal';

export interface Material {
  id: string;
  name: string;
  code: string;
  type: 'solid' | 'wood' | 'stone' | 'metal' | 'texture';
  family: MaterialFamily;
  category: string;
  preview: string;
  image?: string;
  description?: string;
  supplier?: string;
  sku?: string;
  aiDescription: string;
  active?: boolean;
}

export const materials: Material[] = onitCatalog.materials as Material[];

export function getMaterialById(id: string): Material | undefined {
  return materials.find((m) => m.id === id && m.active !== false);
}

export function getActiveMaterials(): Material[] {
  return materials.filter((m) => m.active !== false);
}
