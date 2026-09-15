import { NextResponse } from 'next/server';
import { registerClient } from '@/lib/tenants/clients';
import {
  PORTAL_SESSION_COOKIE,
  createPortalSessionValue,
  isPortalAuthConfigured,
} from '@/lib/portal/auth';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  if (!isPortalAuthConfigured()) {
    return NextResponse.json(
      { error: 'Registratie is niet beschikbaar.' },
      { status: 503 },
    );
  }

  try {
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
      websiteUrl?: string;
    };

    if (!body.name?.trim() || !body.email?.trim() || !body.password) {
      return NextResponse.json(
        { error: 'Bedrijfsnaam, e-mail en wachtwoord zijn verplicht' },
        { status: 400 },
      );
    }

    if (body.password !== body.confirmPassword) {
      return NextResponse.json({ error: 'Wachtwoorden komen niet overeen' }, { status: 400 });
    }

    const client = await registerClient({
      name: body.name,
      email: body.email,
      password: body.password,
      websiteUrl: body.websiteUrl,
    });

    const response = NextResponse.json({
      success: true,
      client: { id: client.id, slug: client.slug, name: client.name, email: client.email },
    });

    response.cookies.set(PORTAL_SESSION_COOKIE, createPortalSessionValue(client.id), {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Account kon niet worden aangemaakt';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
