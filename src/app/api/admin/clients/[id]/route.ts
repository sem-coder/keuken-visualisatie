import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin/auth-server';
import {
  getEmbedSnippet,
  getEmbedUrl,
  updateClient,
} from '@/lib/tenants/clients';

export const runtime = 'nodejs';

function getBaseUrl(request: Request): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');
  }
  const url = new URL(request.url);
  return url.origin;
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 });
  }

  const { id } = await context.params;
  const body = (await request.json()) as {
    name?: string;
    email?: string;
    slug?: string;
    websiteUrl?: string;
    password?: string;
    active?: boolean;
  };

  try {
    const client = await updateClient(id, body);
    if (!client) {
      return NextResponse.json({ error: 'Klant niet gevonden' }, { status: 404 });
    }

    const baseUrl = getBaseUrl(request);
    return NextResponse.json({
      client: {
        ...client,
        embedUrl: getEmbedUrl(client.slug, baseUrl),
        embedSnippet: getEmbedSnippet(client.slug, baseUrl),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Klant kon niet worden bijgewerkt';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
