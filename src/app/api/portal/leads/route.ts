import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/lib/portal/auth-server';
import { countLeadsByStatus, listLeadsForClient } from '@/lib/tenants/leads';
import { getEmbedUrl, getPublicClient } from '@/lib/tenants/clients';

export const runtime = 'nodejs';

function getBaseUrl(request: Request): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');
  }
  return new URL(request.url).origin;
}

function countLeadsThisWeek(leads: { submittedAt: string }[]): number {
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return leads.filter((lead) => new Date(lead.submittedAt).getTime() >= weekAgo).length;
}

export async function GET(request: Request) {
  const client = await getAuthenticatedClient();
  if (!client) {
    return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 });
  }

  const [leads, statusCounts] = await Promise.all([
    listLeadsForClient(client.id),
    countLeadsByStatus(client.id),
  ]);

  const baseUrl = getBaseUrl(request);

  return NextResponse.json({
    client: getPublicClient(client),
    embedUrl: getEmbedUrl(client.slug, baseUrl),
    summary: {
      total: leads.length,
      thisWeek: countLeadsThisWeek(leads),
      ...statusCounts,
    },
    leads,
  });
}
