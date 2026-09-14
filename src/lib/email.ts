import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  if (!resend) {
    console.log(`\n📧 [ИМЕЙЛ СИМУЛАЦИЯ] До: ${to} | Тема: ${subject}`);
    console.log(`Съдържание:\n${html.replace(/<[^>]*>?/gm, '')}\n`);
    return { success: true, simulated: true };
  }

  try {
    const data = await resend.emails.send({
      from: 'Booking SaaS <onboarding@resend.dev>',
      to,
      subject,
      html,
    });
    return { success: true, data };
  } catch (error) {
    console.error('Грешка при изпращане на имейл:', error);
    return { success: false, error };
  }
}