export type KitchenFinish = {
  id: string;
  name: string;
  color: string;
  highlight: string;
  texture?: string;
};

/** Wrap-afwerkingen — uitbreidbaar met echte folie-catalogus. */
export const KITCHEN_FINISHES: KitchenFinish[] = [
  { id: 'mat-wit', name: 'Mat wit', color: '#f4f4f2', highlight: '#ffffff' },
  { id: 'hoogglans-wit', name: 'Hoogglans wit', color: '#fafafa', highlight: '#ffffff', texture: 'linear-gradient(135deg, #fff 0%, #e8e8e8 100%)' },
  { id: 'antraciet', name: 'Antraciet mat', color: '#3d4349', highlight: '#5c636a' },
  { id: 'zwart-mat', name: 'Zwart mat', color: '#1a1a1a', highlight: '#333' },
  { id: 'eiken', name: 'Eiken naturel', color: '#c4a574', highlight: '#d4b896', texture: 'linear-gradient(180deg, #d4b896 0%, #a08050 100%)' },
  { id: 'walnoot', name: 'Walnoot', color: '#5c3d2e', highlight: '#7a5240', texture: 'linear-gradient(180deg, #6b4423 0%, #4a2f1a 100%)' },
  { id: 'beton', name: 'Betonlook', color: '#9a9590', highlight: '#b5b0aa', texture: 'linear-gradient(135deg, #aaa 0%, #888 50%, #999 100%)' },
  { id: 'sage', name: 'Sage groen', color: '#8a9a86', highlight: '#a3b29f' },
  { id: 'sand', name: 'Zand / beige', color: '#d4c4b0', highlight: '#e8ddd0' },
  { id: 'navy', name: 'Donkerblauw', color: '#1e3a5f', highlight: '#2a5080' },
];

export function finishById(id: string): KitchenFinish {
  return KITCHEN_FINISHES.find((f) => f.id === id) ?? KITCHEN_FINISHES[0]!;
}
