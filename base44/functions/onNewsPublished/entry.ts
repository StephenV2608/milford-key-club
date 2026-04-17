import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

function wrapEmail({ preheader = '', body }) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;">${preheader}</div>` : ''}
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f1f5f9;min-height:100vh;">
    <tr><td align="center" style="padding:32px 16px;">
      <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">
        <tr><td style="background:linear-gradient(135deg,#1d4ed8 0%,#4f46e5 100%);border-radius:16px 16px 0 0;padding:36px 40px;text-align:center;">
          <p style="margin:0 0 6px 0;font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:rgba(255,255,255,0.7);">Key Club International</p>
          <h1 style="margin:0;font-size:26px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">Milford Key Club</h1>
        </td></tr>
        <tr><td style="background:#ffffff;padding:36px 40px;">${body}</td></tr>
        <tr><td style="background:#f8fafc;border-radius:0 0 16px 16px;border-top:1px solid #e2e8f0;padding:24px 40px;text-align:center;">
          <p style="margin:0 0 4px 0;font-size:13px;font-weight:600;color:#64748b;">Milford Key Club</p>
          <p style="margin:0;font-size:12px;color:#94a3b8;">Building Leaders Through Service &nbsp;·&nbsp; Key Club International</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();
    const { data, old_data } = payload;

    const wasPublished = old_data?.published === true;
    if (!data?.published || wasPublished) return Response.json({ skipped: 'not a new publish' });

    const subscribers = await base44.asServiceRole.entities.NewsletterSubscriber.list();
    if (!subscribers.length) return Response.json({ skipped: 'no subscribers' });

    const formattedDate = data.date
      ? new Date(data.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      : '';

    const body = `
      <p style="margin:0 0 6px 0;font-size:12px;font-weight:700;color:#6366f1;text-transform:uppercase;letter-spacing:0.1em;">📰 Club News</p>
      <h2 style="margin:0 0 10px 0;font-size:24px;font-weight:800;color:#0f172a;line-height:1.3;">${data.headline}</h2>
      ${formattedDate ? `<p style="margin:0 0 24px 0;font-size:12px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;">${formattedDate}</p>` : '<div style="margin-bottom:24px;"></div>'}

      <div style="height:1px;background:#e2e8f0;margin:0 0 24px 0;"></div>

      <p style="margin:0 0 20px 0;font-size:16px;color:#334155;line-height:1.75;font-weight:500;">${data.snippet || ''}</p>

      ${data.content ? `
        <div style="background:#f8fafc;border-left:4px solid #6366f1;border-radius:0 8px 8px 0;padding:18px 22px;margin:0 0 24px 0;">
          <p style="margin:0;font-size:14px;color:#475569;line-height:1.8;">${data.content.replace(/\n/g, '<br/>')}</p>
        </div>
      ` : ''}

      <div style="height:1px;background:#e2e8f0;margin:0 0 20px 0;"></div>
      <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.6;">
        You're receiving this because you subscribed to Milford Key Club news updates. Stay connected and keep making a difference! 💙
      </p>
    `;

    let sent = 0;
    for (const sub of subscribers) {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: sub.email,
        subject: `📰 ${data.headline} – Milford Key Club`,
        body: wrapEmail({ preheader: data.snippet || data.headline, body }),
      });
      sent++;
    }

    return Response.json({ sent });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});