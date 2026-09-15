import { getMaterialById } from '@/lib/materials';
import type { SampleRequestPayload } from '@/types/visualizer';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatAddress(payload: SampleRequestPayload): string {
  const { address } = payload.customer;
  const line1 = `${address.street} ${address.houseNumber}${address.addition ? ` ${address.addition}` : ''}`;
  const line2 = `${address.postalCode} ${address.city}`;
  return `${line1}<br>${line2}`;
}

function buildSampleCards(samples: SampleRequestPayload['samples']): string {
  return samples
    .map((sample) => {
      const material = getMaterialById(sample.id);
      const swatchColor = material?.preview ?? '#e2e8f0';

      return `
        <td style="padding:0 8px 0 0;vertical-align:top;width:50%">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:separate;border-spacing:0;background:#ffffff;border:1px solid #e7e5e4;border-radius:14px;overflow:hidden">
            <tr>
              <td style="padding:14px 14px 12px">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="width:42px;height:42px;border-radius:10px;background:${swatchColor};border:1px solid rgba(15,23,42,0.08)"></td>
                    <td style="padding-left:12px;font-family:Arial,Helvetica,sans-serif">
                      <div style="font-size:15px;font-weight:700;color:#0f172a;line-height:1.3">${escapeHtml(sample.name)}</div>
                      <div style="font-size:12px;color:#78716c;margin-top:2px">${escapeHtml(sample.code)}</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      `;
    })
    .join('');
}

function buildAttributionBlock(attribution: SampleRequestPayload['attribution']): string {
  if (!attribution || Object.keys(attribution).length === 0) return '';

  const labels: Record<string, string> = {
    utm_source: 'Bron',
    utm_medium: 'Medium',
    utm_campaign: 'Campagne',
    utm_content: 'Content',
    utm_term: 'Term',
    gclid: 'Google Click ID',
    fbclid: 'Facebook Click ID',
  };

  const rows = Object.entries(attribution)
    .filter(([, value]) => value)
    .map(
      ([key, value]) => `
        <tr>
          <td style="padding:6px 0;font-size:13px;color:#78716c;width:120px;vertical-align:top">${escapeHtml(labels[key] ?? key)}</td>
          <td style="padding:6px 0;font-size:13px;color:#0f172a;font-weight:600">${escapeHtml(value ?? '')}</td>
        </tr>
      `,
    )
    .join('');

  if (!rows) return '';

  return `
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-top:16px;border-collapse:collapse">
      <tr>
        <td style="padding:18px 20px;background:#fafaf9;border:1px solid #e7e5e4;border-radius:16px">
          <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#78716c;margin-bottom:10px">
            Campagne
          </div>
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse">
            ${rows}
          </table>
        </td>
      </tr>
    </table>
  `;
}

export function buildLeadNotificationHtml(
  clientName: string,
  payload: SampleRequestPayload,
  portalUrl: string,
): string {
  const { customer, samples, message } = payload;
  const customerName = `${customer.firstName} ${customer.lastName}`.trim();
  const sampleRowCount = Math.ceil(samples.length / 2);
  const sampleRows = Array.from({ length: sampleRowCount }, (_, index) => {
    const slice = samples.slice(index * 2, index * 2 + 2);
    return `<tr>${buildSampleCards(slice)}</tr>`;
  }).join('');

  return `
<!DOCTYPE html>
<html lang="nl">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Nieuwe lead</title>
  </head>
  <body style="margin:0;padding:0;background:#f5f5f4;-webkit-font-smoothing:antialiased">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f5f5f4;border-collapse:collapse">
      <tr>
        <td align="center" style="padding:32px 16px">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:620px;border-collapse:collapse">
            <tr>
              <td style="padding:28px 32px;background:linear-gradient(135deg,#92400e 0%,#b45309 100%);border-radius:20px 20px 0 0;font-family:Arial,Helvetica,sans-serif">
                <div style="font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.82)">
                  Keuken Visualisatie
                </div>
                <div style="margin-top:10px;font-size:28px;line-height:1.2;font-weight:700;color:#ffffff">
                  Nieuwe sample-aanvraag
                </div>
                <div style="margin-top:8px;font-size:15px;line-height:1.5;color:rgba(255,255,255,0.88)">
                  Via <strong style="color:#ffffff">${escapeHtml(clientName)}</strong> is zojuist een lead binnengekomen.
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding:28px 32px;background:#ffffff;border-left:1px solid #e7e5e4;border-right:1px solid #e7e5e4;font-family:Arial,Helvetica,sans-serif">
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse">
                  <tr>
                    <td style="padding:18px 20px;background:#fffbeb;border:1px solid #fde68a;border-radius:16px">
                      <div style="font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#b45309;margin-bottom:8px">
                        Contactgegevens
                      </div>
                      <div style="font-size:20px;font-weight:700;color:#0f172a;line-height:1.3">${escapeHtml(customerName)}</div>
                      <div style="margin-top:10px;font-size:14px;line-height:1.6;color:#44403c">
                        <a href="mailto:${escapeHtml(customer.email)}" style="color:#b45309;text-decoration:none;font-weight:600">${escapeHtml(customer.email)}</a>
                        ${customer.phone ? `<br><span style="color:#57534e">${escapeHtml(customer.phone)}</span>` : ''}
                        <br><span style="color:#57534e">${formatAddress(payload)}</span>
                      </div>
                    </td>
                  </tr>
                </table>

                <div style="margin-top:22px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#78716c">
                  Gekozen samples (${samples.length})
                </div>
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-top:12px;border-collapse:collapse">
                  ${sampleRows}
                </table>

                ${
                  message
                    ? `
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-top:16px;border-collapse:collapse">
                  <tr>
                    <td style="padding:18px 20px;background:#fafaf9;border:1px solid #e7e5e4;border-radius:16px">
                      <div style="font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#78716c;margin-bottom:8px">
                        Bericht van klant
                      </div>
                      <div style="font-size:14px;line-height:1.6;color:#44403c;white-space:pre-wrap">${escapeHtml(message)}</div>
                    </td>
                  </tr>
                </table>`
                    : ''
                }

                ${buildAttributionBlock(payload.attribution)}

                <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-top:28px;border-collapse:collapse">
                  <tr>
                    <td align="center">
                      <a href="${portalUrl}" style="display:inline-block;padding:14px 28px;background:#b45309;color:#ffffff;text-decoration:none;border-radius:999px;font-size:15px;font-weight:700;font-family:Arial,Helvetica,sans-serif">
                        Bekijk in je dashboard
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:20px 32px 28px;background:#fafaf9;border:1px solid #e7e5e4;border-top:none;border-radius:0 0 20px 20px;font-family:Arial,Helvetica,sans-serif">
                <div style="font-size:12px;line-height:1.6;color:#78716c;text-align:center">
                  Je ontvangt deze mail omdat er een sample-aanvraag is ingediend via jouw keukenvisualisatie-embed.
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `.trim();
}
