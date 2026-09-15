import { NextResponse } from 'next/server';
import { sendPasswordResetEmail } from '@/lib/email/sendPasswordResetEmail';
import { getClientByEmail } from '@/lib/tenants/clients';
import { createPasswordResetToken } from '@/lib/tenants/password-reset';

export const runtime = 'nodejs';

const GENERIC_MESSAGE =
  'Als dit e-mailadres bij ons bekend is, ontvang je binnen enkele minuten een reset-link.';

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string };
  if (!body.email?.trim()) {
    return NextResponse.json({ error: 'E-mailadres is verplicht' }, { status: 400 });
  }

  const client = await getClientByEmail(body.email);
  if (client) {
    const token = await createPasswordResetToken(client.id, client.email);
    try {
      await sendPasswordResetEmail(client.email, token);
    } catch (error) {
      console.error('Password reset email failed:', error);
    }
  }

  return NextResponse.json({ success: true, message: GENERIC_MESSAGE });
}
