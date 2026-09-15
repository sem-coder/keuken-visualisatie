import { getAppUrl, sendEmail } from '@/lib/email/transport';

function buildResetEmailHtml(resetUrl: string): string {
  return `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
      <h1 style="font-size:20px;color:#0f172a">Wachtwoord resetten</h1>
      <p style="color:#475569;line-height:1.6">
        Je hebt gevraagd om je wachtwoord te resetten. Klik op de knop hieronder om een nieuw wachtwoord in te stellen.
      </p>
      <a href="${resetUrl}" style="display:inline-block;margin:24px 0;padding:12px 24px;background:#d97706;color:white;text-decoration:none;border-radius:8px;font-weight:600">
        Nieuw wachtwoord instellen
      </a>
      <p style="color:#94a3b8;font-size:13px;line-height:1.5">
        Deze link is 1 uur geldig. Heb je dit niet aangevraagd? Negeer deze e-mail dan.
      </p>
    </div>
  `;
}

export { isEmailConfigured } from '@/lib/email/transport';

export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  const resetUrl = `${getAppUrl()}/portal?reset=${token}`;
  await sendEmail({
    to: email,
    subject: 'Wachtwoord resetten — Keuken Visualisatie',
    html: buildResetEmailHtml(resetUrl),
  });
}
