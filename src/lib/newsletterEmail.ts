import { sanitizeHtml } from '@/lib/sanitizeHtml';

export function buildEmailSafeNewsletterHtml(params: {
  subject: string;
  contentHtml: string;
}): string {
  const safeContent = sanitizeHtml(params.contentHtml || '');
  const safeSubject = sanitizeHtml(params.subject || '');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeSubject}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f1f5f9;padding:24px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="width:600px;max-width:600px;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="padding:20px 24px;background:#0f172a;color:#ffffff;">
              <div style="font-size:18px;font-weight:700;line-height:1.2;">${safeSubject}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:24px;">
              <div style="font-size:14px;line-height:1.7;color:#0f172a;">
                ${safeContent}
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 24px;background:#f8fafc;border-top:1px solid #e2e8f0;">
              <div style="font-size:12px;line-height:1.5;color:#475569;">
                Você está recebendo este email porque se inscreveu na newsletter.
              </div>
              <div style="font-size:12px;line-height:1.5;color:#475569;margin-top:8px;">
                <a href="#" style="color:#2563eb;text-decoration:underline;">Cancelar inscrição</a>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
