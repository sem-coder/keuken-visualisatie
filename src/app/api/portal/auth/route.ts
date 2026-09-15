import { NextResponse } from 'next/server';
import { verifyPassword } from '@/lib/tenants/password';
import { getClientByEmail } from '@/lib/tenants/clients';
import {
  PORTAL_SESSION_COOKIE,
  createPortalSessionValue,
  isPortalAuthConfigured,
} from '@/lib/portal/auth';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  if (!isPortalAuthConfigured()) {
    return NextResponse.json(
      { error: 'Portal is niet geconfigureerd.' },
      { status: 503 },
    );
  }

  const body = (await request.json()) as { email?: string; password?: string };
  if (!body.email?.trim() || !body.password) {
    return NextResponse.json({ error: 'E-mail en wachtwoord zijn verplicht' }, { status: 400 });
  }

  const client = await getClientByEmail(body.email);
  if (!client || !verifyPassword(body.password, client.passwordHash)) {
    return NextResponse.json({ error: 'Onjuiste inloggegevens' }, { status: 401 });
  }

  const response = NextResponse.json({
    success: true,
    client: { id: client.id, slug: client.slug, name: client.name },
  });

  response.cookies.set(PORTAL_SESSION_COOKIE, createPortalSessionValue(client.id), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(PORTAL_SESSION_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
  return response;
}
