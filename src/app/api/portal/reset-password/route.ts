import { NextResponse } from 'next/server';
import { updateClient } from '@/lib/tenants/clients';
import { consumePasswordResetToken } from '@/lib/tenants/password-reset';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const body = (await request.json()) as {
    token?: string;
    password?: string;
    confirmPassword?: string;
  };

  if (!body.token?.trim() || !body.password) {
    return NextResponse.json(
      { error: 'Token en wachtwoord zijn verplicht' },
      { status: 400 },
    );
  }

  if (body.password !== body.confirmPassword) {
    return NextResponse.json({ error: 'Wachtwoorden komen niet overeen' }, { status: 400 });
  }

  if (body.password.length < 8) {
    return NextResponse.json(
      { error: 'Wachtwoord moet minimaal 8 tekens zijn' },
      { status: 400 },
    );
  }

  const reset = await consumePasswordResetToken(body.token.trim());
  if (!reset) {
    return NextResponse.json(
      { error: 'Deze reset-link is ongeldig of verlopen. Vraag een nieuwe aan.' },
      { status: 400 },
    );
  }

  const updated = await updateClient(reset.clientId, { password: body.password });
  if (!updated) {
    return NextResponse.json({ error: 'Account niet gevonden' }, { status: 404 });
  }

  return NextResponse.json({ success: true, message: 'Je wachtwoord is bijgewerkt. Je kunt nu inloggen.' });
}
