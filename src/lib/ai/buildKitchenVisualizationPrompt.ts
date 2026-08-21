import type { Material } from '@/lib/materials';

export function buildKitchenVisualizationPrompt(material: Material): string {
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
