import { getAppUrl, sendEmail } from '@/lib/email/transport';
import { buildLeadNotificationHtml } from '@/lib/email/leadNotificationTemplate';
import type { SampleRequestPayload } from '@/types/visualizer';

export async function sendLeadNotificationEmail(
  client: { name: string; email: string },
  payload: SampleRequestPayload,
): Promise<void> {
  const customerName = `${payload.customer.firstName} ${payload.customer.lastName}`.trim();
  const portalUrl = `${getAppUrl()}/portal`;

  await sendEmail({
    to: client.email,
    subject: `Nieuwe lead: ${customerName} — sample-aanvraag`,
    html: buildLeadNotificationHtml(client.name, payload, portalUrl),
  });
}
