import nodemailer from 'nodemailer';

function getGmailCredentials(): { user: string; pass: string } | null {
  const user = process.env.GMAIL_WORKSPACE_USER?.trim();
  const pass = process.env.GMAIL_WORKSPACE_APP_PASSWORD?.replace(/\s/g, '');
  if (!user || !pass) return null;
  return { user, pass };
}

export function getAppUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000').replace(/\/$/, '');
}

export function isEmailConfigured(): boolean {
  return getGmailCredentials() !== null;
}

function createTransporter(): nodemailer.Transporter | null {
  const gmail = getGmailCredentials();
  if (!gmail) return null;

  return nodemailer.createTransport({
    service: 'gmail',
    auth: gmail,
  });
}

export class EmailSendError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EmailSendError';
  }
}

export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  const gmail = getGmailCredentials();
  const transporter = createTransporter();

  if (!gmail || !transporter) {
    throw new EmailSendError(
      'Gmail is niet geconfigureerd. Stel GMAIL_WORKSPACE_USER en GMAIL_WORKSPACE_APP_PASSWORD in.',
    );
  }

  try {
    await transporter.verify();
    await transporter.sendMail({
      from: `Keuken Visualisatie <${gmail.user}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Onbekende e-mailfout';
    console.error('[email] Versturen mislukt:', message);
    throw new EmailSendError(`E-mail kon niet worden verstuurd: ${message}`);
  }
}
