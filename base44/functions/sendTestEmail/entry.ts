import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: 'stephenv2608@gmail.com',
      subject: 'Test Email – Milford Key Club Site',
      body: 'Hi! This is a test email from the Milford Key Club website. Emails are working correctly!\n\nThis confirms the contact form will now send real emails to your configured address.',
    });
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});