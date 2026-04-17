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

    return Response.json({ success: true, member_id: member.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});