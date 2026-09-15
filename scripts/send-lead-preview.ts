import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { buildLeadNotificationHtml } from '../src/lib/email/leadNotificationTemplate';
import { sendEmail } from '../src/lib/email/transport';
import type { SampleRequestPayload } from '../src/types/visualizer';

function loadEnvFile(filename: string): void {
  const path = resolve(process.cwd(), filename);
  if (!existsSync(path)) return;

  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const separator = trimmed.indexOf('=');
    if (separator === -1) continue;
    const key = trimmed.slice(0, separator);
    let value = trimmed.slice(separator + 1);
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnvFile('.env.local');
loadEnvFile('.env.vercel.local');

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
    {
      id: 'donkergroen',
      name: 'Donkergroen',
      code: 'KM-202',
      sku: 'KM-202',
    },
    {
      id: 'taupe',
      name: 'Warm taupe',
      code: 'KM-108',
      sku: 'KM-108',
    },
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

async function main() {
  const to = process.argv[2] ?? 'sem@woeler.nl';
  const portalUrl = `${(process.env.NEXT_PUBLIC_APP_URL ?? 'https://keuken-visualisatie-tool.vercel.app').replace(/\/$/, '')}/portal`;
  const html = buildLeadNotificationHtml('Woeler Demo', previewPayload, portalUrl);

  await sendEmail({
    to,
    subject: 'Voorbeeld: Nieuwe lead — Anna de Vries',
    html,
  });

  console.log(`Voorbeeldmail verstuurd naar ${to}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
