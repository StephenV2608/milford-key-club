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
    const { data } = payload;

    if (!data?.member_email) return Response.json({ skipped: 'no member email' });
    const isApproved = data.status === 'approved';
    const isRejected = data.status === 'rejected';
    if (!isApproved && !isRejected) return Response.json({ skipped: 'not a final status' });

    const firstName = (data.member_name || 'there').split(' ')[0];
    const accentColor = isApproved ? '#15803d' : '#b91c1c';
    const accentBg = isApproved ? '#f0fdf4' : '#fef2f2';
    const accentBorder = isApproved ? '#bbf7d0' : '#fecaca';
    const statusLabel = isApproved ? '✓ Approved' : '✗ Not Approved';
    const statusBadgeBg = isApproved ? '#dcfce7' : '#fee2e2';
    const headline = isApproved ? `Your hours have been approved! 🎉` : `Your hours submission needs attention`;
    const subtext = isApproved
      ? `Great work, ${firstName}! Your submission has been reviewed and approved by a club officer.`
      : `Hi ${firstName}, your recent submission was not approved this time.`;

    const body = `
      <p style="margin:0 0 6px 0;font-size:12px;font-weight:700;color:#6366f1;text-transform:uppercase;letter-spacing:0.1em;">Service Hours Update</p>
      <h2 style="margin:0 0 12px 0;font-size:22px;font-weight:800;color:#0f172a;line-height:1.3;">${headline}</h2>
      <p style="margin:0 0 28px 0;font-size:15px;color:#475569;line-height:1.65;">${subtext}</p>

      <div style="height:1px;background:#e2e8f0;margin:0 0 24px 0;"></div>

      <p style="margin:0 0 10px 0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#94a3b8;">Submission Details</p>
      <table cellpadding="0" cellspacing="0" border="0" style="width:100%;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;border-collapse:collapse;">
        <tr style="border-bottom:1px solid #e2e8f0;">
          <td style="padding:10px 14px;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.06em;width:110px;">Status</td>
          <td style="padding:10px 14px;"><span style="display:inline-block;background:${statusBadgeBg};color:${accentColor};font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;padding:3px 10px;border-radius:999px;">${statusLabel}</span></td>
        </tr>
        <tr style="border-bottom:1px solid #e2e8f0;">
          <td style="padding:10px 14px;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.06em;">Organization</td>
          <td style="padding:10px 14px;font-size:14px;color:#1e293b;font-weight:500;">${data.organization || '—'}</td>
        </tr>
        <tr style="border-bottom:1px solid #e2e8f0;">
          <td style="padding:10px 14px;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.06em;">Date</td>
          <td style="padding:10px 14px;font-size:14px;color:#1e293b;font-weight:500;">${data.date || '—'}</td>
        </tr>
        <tr>
          <td style="padding:10px 14px;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.06em;">Hours</td>
          <td style="padding:10px 14px;font-size:15px;color:#1e293b;font-weight:800;">${data.hours} hr${data.hours !== 1 ? 's' : ''}</td>
        </tr>
      </table>

      ${data.admin_notes ? `
        <div style="margin-top:20px;background:${accentBg};border:1px solid ${accentBorder};border-radius:10px;padding:16px 20px;">
          <p style="margin:0 0 4px 0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:${accentColor};">Officer Note</p>
          <p style="margin:0;font-size:14px;color:#1e293b;line-height:1.6;">${data.admin_notes}</p>
        </div>
      ` : ''}

      <div style="height:1px;background:#e2e8f0;margin:28px 0 20px 0;"></div>
      <p style="margin:0;font-size:13px;color:#64748b;line-height:1.65;">
        ${isApproved
          ? 'Keep up the amazing work! Every hour you give makes a real difference in our community. 💙'
          : 'If you have questions about this decision, reach out to a club officer — we\'re happy to help.'
        }
      </p>
    `;

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: data.member_email,
      subject: isApproved ? `✅ Hours Approved – ${data.organization}` : `⚠️ Hours Not Approved – ${data.organization}`,
      body: wrapEmail({ preheader: headline, body }),
    });

    return Response.json({ sent: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});