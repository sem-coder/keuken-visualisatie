import { KitchenVisualizer } from '@/components/visualizer/KitchenVisualizer';

export const dynamic = 'force-dynamic';

export default async function EmbedPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <KitchenVisualizer clientSlug={slug} initialCompact />;
}
