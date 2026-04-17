import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { data, event } = await req.json();

    const member = data;
    if (!member || !member.id) {
      return Response.json({ error: 'No member data' }, { status: 400 });
    }

    // Auto-approve: set active = true
    await base44.asServiceRole.entities.Member.update(member.id, { active: true });

    // Send welcome email
    if (member.email) {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: member.email,
        from_name: 'Milford Key Club',
        subject: 'Welcome to the Milford Key Club Portal!',
        body: `Hi ${member.name || 'there'},\n\nYour member account has been approved! You can now log in to the portal at any time.\n\nVisit your portal to:\n- Log service hours\n- View upcoming events\n- Check announcements\n\nWelcome aboard!\n\n— Milford Key Club Officers`,
      });
    }

    return Response.json({ success: true, member_id: member.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});