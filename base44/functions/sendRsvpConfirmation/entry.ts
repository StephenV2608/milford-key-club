import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const wrap = (title, body) => `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${title}</title></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f4f6fa;margin:0;padding:32px 16px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 14px rgba(0,0,0,.05);">
    <tr><td style="background:linear-gradient(135deg,#2563eb,#1d4ed8);padding:28px 32px;color:#fff;">
      <p style="margin:0;font-size:11px;letter-spacing:2px;text-transform:uppercase;opacity:.85;">Milford Key Club</p>
      <h1 style="margin:6px 0 0;font-size:22px;font-weight:700;">${title}</h1>
    </td></tr>
    <tr><td style="padding:28px 32px;color:#0f172a;font-size:15px;line-height:1.6;">${body}</td></tr>
    <tr><td style="padding:16px 32px 24px;color:#64748b;font-size:12px;border-top:1px solid #e2e8f0;">
      You're receiving this because you signed up for a service event with Milford Key Club.
    </td></tr>
  </table>
</body></html>`;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { to, name, event } = await req.json();
    if (!to || !event) return Response.json({ error: 'Missing to or event' }, { status: 400 });

    const dateStr = event.date ? new Date(event.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : '';

    const body = `
      <p>Hi ${name || 'there'},</p>
      <p>You're signed up for <strong>${event.title}</strong>! 🎉 We've saved your spot.</p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:20px 0;background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;">
        <tr><td style="padding:16px 20px;">
          <p style="margin:0 0 6px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#64748b;">Event Details</p>
          <p style="margin:0 0 4px;font-size:16px;font-weight:700;color:#0f172a;">${event.title}</p>
          ${dateStr ? `<p style="margin:2px 0;color:#334155;">📅 ${dateStr}</p>` : ''}
          ${event.time ? `<p style="margin:2px 0;color:#334155;">🕐 ${event.time}</p>` : ''}
          ${event.location ? `<p style="margin:2px 0;color:#334155;">📍 ${event.location}</p>` : ''}
        </td></tr>
      </table>
      ${event.description ? `<p style="color:#475569;">${event.description}</p>` : ''}
      <p>Need to cancel? Just log in to the member portal and remove your sign-up.</p>
      <p style="margin-top:24px;">Thanks for serving with us! 💙<br/>— Milford Key Club</p>
    `;

    await base44.asServiceRole.integrations.Core.SendEmail({
      to,
      subject: `✅ You're signed up: ${event.title}`,
      body: wrap(`You're signed up!`, body),
      from_name: 'Milford Key Club',
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});