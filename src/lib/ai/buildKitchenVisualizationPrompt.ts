import type { Material } from '@/lib/materials';

function buildCabinetWrapPrompt(material: Material): string {
  return `Edit the provided photograph of the kitchen.

IMPORTANT:
Preserve the exact original kitchen and photograph.

Do not redesign the kitchen.

Keep exactly the same:
- camera position
- perspective
- kitchen layout
- cabinet geometry
- cabinet sizes
- appliances
- countertop
- backsplash
- walls
- flooring
- windows
- doors
- handles
- lighting
- shadows
- reflections
- surrounding furniture
- accessories
- objects
- image composition

Only modify the visible cabinet doors, drawer fronts and matching visible cabinet side panels.

Change these kitchen surfaces to:

${material.aiDescription}

Apply the material consistently and realistically to all relevant kitchen cabinet fronts.

Preserve all original edges, gaps, handles, seams and geometry.

Do not add, remove or move any kitchen elements.

Do not change the countertop.

Do not change the handles.

Do not modify the room.

The result should look like a professional photograph of the exact same kitchen after the cabinet fronts have been professionally wrapped in this material.

Maintain photorealistic:
- texture
- reflections
- shadows
- highlights
- perspective
- lighting

The final image must align as closely as possible with the original photograph so that it can be used in a before-and-after comparison.`;
}

function buildCountertopPrompt(material: Material): string {
  return `Edit the provided photograph of the kitchen.

IMPORTANT:
Preserve the exact original kitchen and photograph.

Do not redesign the kitchen.

Keep exactly the same:
- camera position
- perspective
- kitchen layout
- cabinet geometry
- cabinet sizes
- cabinet door colors and finishes
- drawer fronts
- appliances
- backsplash
- walls
- flooring
- windows
- doors
- handles
- lighting
- shadows
- reflections
- surrounding furniture
- accessories
- objects
- image composition

Only modify the visible kitchen countertop and worktop surfaces (including a kitchen island countertop if visible).

Do NOT change any cabinet doors, drawer fronts, or cabinet side panels.

Change the countertop to:

${material.aiDescription}

Apply the material consistently and realistically across the entire visible countertop edge profile and surface.

Preserve all original edges, seams, sink cutouts, hob areas, and geometry.

Do not add, remove or move any kitchen elements.

Do not change cabinet fronts or handles.

Do not modify the room.

The result should look like a professional photograph of the exact same kitchen after the countertop has been replaced or wrapped with this stone/surface material.

Maintain photorealistic:
- texture
- reflections
- shadows
- highlights
- perspective
- lighting

The final image must align as closely as possible with the original photograph so that it can be used in a before-and-after comparison.`;
}

export function buildKitchenVisualizationPrompt(material: Material): string {
  if (material.family === 'stone') {
    return buildCountertopPrompt(material);
  }
  return buildCabinetWrapPrompt(material);
}

export function isCountertopMaterial(material: Material): boolean {
  return material.family === 'stone';
}
