import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin/auth-server';
import {
  createClient,
  getEmbedSnippet,
  getEmbedUrl,
  listClients,
} from '@/lib/tenants/clients';
import type { CreateClientInput } from '@/lib/tenants/types';

export const runtime = 'nodejs';

function getBaseUrl(request: Request): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');
  }
  const url = new URL(request.url);
  return url.origin;
}

function withEmbedData<T extends { slug: string }>(client: T, baseUrl: string) {
  return {
    ...client,
    embedUrl: getEmbedUrl(client.slug, baseUrl),
    embedSnippet: getEmbedSnippet(client.slug, baseUrl),
  };
}

export async function GET(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 });
  }

  const clients = await listClients();
  const baseUrl = getBaseUrl(request);

  return NextResponse.json({
    clients: clients.map((client) => withEmbedData(client, baseUrl)),
    baseUrl,
  });
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 });
  }

  const body = (await request.json()) as CreateClientInput;

  try {
    const client = await createClient(body);
    const baseUrl = getBaseUrl(request);
    return NextResponse.json({ client: withEmbedData(client, baseUrl) }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Klant kon niet worden aangemaakt';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
