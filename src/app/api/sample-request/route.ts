import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import type { SampleRequestPayload } from '@/types/visualizer';

export const runtime = 'nodejs';

function validatePayload(body: unknown): { valid: true; data: SampleRequestPayload } | { valid: false; error: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Ongeldige aanvraag' };
  }

  const data = body as SampleRequestPayload;

  if (!data.consent) {
    return { valid: false, error: 'Toestemming is verplicht' };
  }

  if (!data.customer?.firstName?.trim()) {
    return { valid: false, error: 'Voornaam is verplicht' };
  }
  if (!data.customer?.lastName?.trim()) {
    return { valid: false, error: 'Achternaam is verplicht' };
  }
  if (!data.customer?.email?.trim()) {
    return { valid: false, error: 'E-mailadres is verplicht' };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.customer.email)) {
    return { valid: false, error: 'Ongeldig e-mailadres' };
  }
  if (!data.customer?.address?.street?.trim()) {
    return { valid: false, error: 'Straat is verplicht' };
  }
  if (!data.customer?.address?.houseNumber?.trim()) {
    return { valid: false, error: 'Huisnummer is verplicht' };
  }
  if (!data.customer?.address?.postalCode?.trim()) {
    return { valid: false, error: 'Postcode is verplicht' };
  }
  if (!data.customer?.address?.city?.trim()) {
    return { valid: false, error: 'Plaats is verplicht' };
  }

  if (!Array.isArray(data.samples) || data.samples.length === 0) {
    return { valid: false, error: 'Selecteer minimaal één sample' };
  }

  if (data.samples.length > 2) {
    return { valid: false, error: 'Maximaal 2 samples toegestaan' };
  }

  return { valid: true, data };
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const validation = validatePayload(body);

    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { data } = validation;
    const requestId = randomUUID();

    const webhookUrl = process.env.SAMPLE_WEBHOOK_URL;
    if (webhookUrl) {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, requestId, submittedAt: new Date().toISOString() }),
      });
    } else {
      console.info('Sample request received:', { requestId, samples: data.samples.length });
    }

    return NextResponse.json({ requestId, success: true });
  } catch (error) {
    console.error('Sample request error:', error);
    return NextResponse.json(
      { error: 'Aanvraag kon niet worden verwerkt' },
      { status: 500 },
    );
  }
}
