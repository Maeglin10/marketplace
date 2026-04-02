import { Resend } from 'resend';
import { render } from '@react-email/render';
import { createElement } from 'react';

const FROM = process.env.EMAIL_FROM || 'Marketplace <noreply@marketplace.com>';

interface SendEmailOptions {
  to: string;
  subject: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  template: React.ComponentType<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props: Record<string, any>;
}

export async function sendEmail({ to, subject, template, props }: SendEmailOptions): Promise<void> {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const html = await render(createElement(template, props));

  await resend.emails.send({
    from: FROM,
    to,
    subject,
    html,
  });
}
