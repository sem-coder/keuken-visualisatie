import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin/auth-server';
import { buildLeadNotificationHtml } from '@/lib/email/leadNotificationTemplate';
import { getAppUrl, sendEmail } from '@/lib/email/transport';
import type { SampleRequestPayload } from '@/types/visualizer';

export const runtime = 'nodejs';

const previewPayload: SampleRequestPayload = {
  customer: {
    firstName: 'Anna',
    lastName: 'de Vries',
    email: 'anna.devries@example.com',
    phone: '06 12345678',
    address: {
      street: 'Keukenstraat',
      houseNumber: '42',
      addition: 'A',
      postalCode: '1234 AB',
      city: 'Amsterdam',
    },
  },
  samples: [
    { id: 'donkergroen', name: 'Donkergroen', code: 'KM-202', sku: 'KM-202' },
    { id: 'taupe', name: 'Warm taupe', code: 'KM-108', sku: 'KM-108' },
  ],
  message:
    'Graag de samples ontvangen voor onze keukenrenovatie. We zijn vooral benieuwd naar hoe de donkergroene kleur uitpakt op onze houten vloer.',
  consent: true,
  attribution: {
    utm_source: 'google',
    utm_medium: 'cpc',
    utm_campaign: 'keukenwrap-voorjaar',
  },
};

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 });
  }

  const body = (await request.json()) as { to?: string };
  const to = body.to?.trim() || 'sem@woeler.nl';
  const portalUrl = `${getAppUrl()}/portal`;
  const html = buildLeadNotificationHtml('Woeler Demo', previewPayload, portalUrl);

  try {
    await sendEmail({
      to,
      subject: 'Voorbeeld: Nieuwe lead — Anna de Vries',
      html,
    });
    return NextResponse.json({ success: true, to });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'E-mail kon niet worden verstuurd';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
