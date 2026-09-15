import { NextResponse } from 'next/server';
import { getClientBySlug, getPublicClient } from '@/lib/tenants/clients';

export const runtime = 'nodejs';

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const client = await getClientBySlug(slug);

  if (!client) {
    return NextResponse.json({ error: 'Klant niet gevonden' }, { status: 404 });
  }

  return NextResponse.json(getPublicClient(client));
}
