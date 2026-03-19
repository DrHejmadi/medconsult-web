import { Resend } from 'resend';
import type { EmailTemplate } from './templates';

let resend: Resend | null = null;

function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

const FROM_EMAIL = 'MedConsult <noreply@medconsult.dk>';

export async function sendEmail(
  to: string,
  template: EmailTemplate
): Promise<{ success: boolean; error?: string }> {
  try {
    const client = getResendClient();
    if (!client) {
      console.log(`[Email] Would send to ${to}: ${template.subject}`);
      return { success: true }; // Silent success in dev
    }

    const { error } = await client.emails.send({
      from: FROM_EMAIL,
      to,
      subject: template.subject,
      html: template.html,
    });

    if (error) {
      console.error('[Email] Send failed:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('[Email] Exception:', err);
    return { success: false, error: 'Email send failed' };
  }
}
