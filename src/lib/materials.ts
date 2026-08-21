export interface Material {
  id: string;
  name: string;
  code: string;
  type: 'solid' | 'wood' | 'stone' | 'texture';
  category: string;
  preview: string;
  image?: string;
  description?: string;
  supplier?: string;
  sku?: string;
  aiDescription: string;
  active?: boolean;
}

export const materials: Material[] = [
  {
    id: 'warm-wit',
    name: 'Warm wit',
    code: 'KM-101',
    type: 'solid',
    category: 'Licht',
    preview: '#F5F2EB',
    sku: 'KM-101',
    aiDescription:
      'a smooth warm white matte kitchen wrap with a uniform finish, without visible grain or pattern',
    active: true,
  },
  {
    id: 'creme',
    name: 'Crème',
    code: 'KM-102',
    type: 'solid',
    category: 'Licht',
    preview: '#EDE4D3',
    sku: 'KM-102',
    aiDescription:
      'a smooth warm cream matte kitchen wrap with a uniform finish, soft ivory undertone, without visible grain',
    active: true,
  },
  {
    id: 'kasjmier',
    name: 'Kasjmier',
    code: 'KM-103',
    type: 'solid',
    category: 'Neutraal',
    preview: '#D9CFC0',
    sku: 'KM-103',
    aiDescription:
      'a smooth cashmere beige matte kitchen wrap with a uniform finish, without visible grain or pattern',
    active: true,
  },
  {
    id: 'zand',
    name: 'Zand',
    code: 'KM-104',
    type: 'solid',
    category: 'Neutraal',
    preview: '#C8B89A',
    sku: 'KM-104',
    aiDescription:
      'a smooth sandy beige matte kitchen wrap with a uniform finish, warm neutral undertone',
    active: true,
  },
  {
    id: 'greige',
    name: 'Greige',
    code: 'KM-105',
    type: 'solid',
    category: 'Neutraal',
    preview: '#B5ADA3',
    sku: 'KM-105',
    aiDescription:
      'a smooth greige matte kitchen wrap with a uniform finish, balanced grey-beige tone',
    active: true,
  },
  {
    id: 'taupe',
    name: 'Warm taupe',
    code: 'KM-108',
    type: 'solid',
    category: 'Neutraal',
    preview: '#9B8D80',
    sku: 'KM-108',
    aiDescription:
      'a smooth warm taupe matte kitchen wrap with a uniform finish, without visible grain or pattern',
    active: true,
  },
  {
    id: 'olijfgroen',
    name: 'Olijfgroen',
    code: 'KM-201',
    type: 'solid',
    category: 'Groen',
    preview: '#6B705C',
    sku: 'KM-201',
    aiDescription:
      'a smooth olive green matte kitchen wrap with a uniform finish, muted earthy green tone',
    active: true,
  },
  {
    id: 'donkergroen',
    name: 'Donkergroen',
    code: 'KM-202',
    type: 'solid',
    category: 'Groen',
    preview: '#3D4A3A',
    sku: 'KM-202',
    aiDescription:
      'a smooth dark forest green matte kitchen wrap with a uniform finish, deep muted green tone',
    active: true,
  },
  {
    id: 'lichtgrijs',
    name: 'Lichtgrijs',
    code: 'KM-301',
    type: 'solid',
    category: 'Licht',
    preview: '#C5C5C0',
    sku: 'KM-301',
    aiDescription:
      'a smooth light grey matte kitchen wrap with a uniform finish, cool neutral undertone',
    active: true,
  },
  {
    id: 'antraciet',
    name: 'Antraciet',
    code: 'KM-302',
    type: 'solid',
    category: 'Donker',
    preview: '#4A4A48',
    sku: 'KM-302',
    aiDescription:
      'a smooth anthracite dark grey matte kitchen wrap with a uniform finish, charcoal undertone',
    active: true,
  },
  {
    id: 'zwart-mat',
    name: 'Zwart mat',
    code: 'KM-303',
    type: 'solid',
    category: 'Donker',
    preview: '#2A2A2A',
    sku: 'KM-303',
    aiDescription:
      'a smooth matte black kitchen wrap with a uniform finish, deep non-reflective black',
    active: true,
  },
  {
    id: 'licht-eiken',
    name: 'Licht eiken',
    code: 'KM-401',
    type: 'wood',
    category: 'Houtlook',
    preview: '#D4B896',
    sku: 'KM-401',
    aiDescription:
      'natural light oak kitchen wrap with subtle vertical wood grain, warm beige undertone and matte finish',
    active: true,
  },
  {
    id: 'naturel-eiken',
    name: 'Naturel eiken',
    code: 'KM-402',
    type: 'wood',
    category: 'Houtlook',
    preview: '#B8956A',
    sku: 'KM-402',
    aiDescription:
      'natural oak kitchen wrap with visible vertical wood grain, warm honey undertone and matte finish',
    active: true,
  },
  {
    id: 'donker-eiken',
    name: 'Donker eiken',
    code: 'KM-403',
    type: 'wood',
    category: 'Houtlook',
    preview: '#7A5C3E',
    sku: 'KM-403',
    aiDescription:
      'dark oak kitchen wrap with pronounced vertical wood grain, rich brown undertone and matte finish',
    active: true,
  },
  {
    id: 'walnoot',
    name: 'Walnoot',
    code: 'KM-404',
    type: 'wood',
    category: 'Houtlook',
    preview: '#5C4033',
    sku: 'KM-404',
    aiDescription:
      'walnut wood kitchen wrap with elegant vertical wood grain, deep chocolate brown undertone and matte finish',
    active: true,
  },
];

export function getMaterialById(id: string): Material | undefined {
  return materials.find((m) => m.id === id && m.active !== false);
}

export function getActiveMaterials(): Material[] {
  return materials.filter((m) => m.active !== false);
}
