import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ProjectSubmitForm({ memberUser }) {
  const [form, setForm] = useState({ title: '', description: '', organization: '', date: '', photo_url: '' });
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await base44.entities.ProjectSubmission.create({
      ...form,
      member_name: memberUser.name,
      member_email: memberUser.email,
      status: 'pending',
    });
    setSaving(false);
    setSubmitted(true);
    toast.success('Project submitted for review!');
  };

  if (submitted) return (
    <div className="text-center py-10">
      <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto mb-4" />
      <h3 className="font-heading font-bold text-xl mb-2">Project Submitted!</h3>
      <p className="text-muted-foreground text-sm max-w-sm mx-auto">Your project is pending admin review. Once approved, it will appear in the Community Showcase.</p>
      <Button variant="outline" className="mt-6 rounded-full" onClick={() => { setSubmitted(false); setForm({ title: '', description: '', organization: '', date: '', photo_url: '' }); }}>
        Submit Another
      </Button>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Project Title *</Label>
          <Input required value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Food Bank Volunteer Day" />
        </div>
        <div className="space-y-1.5">
          <Label>Organization / Event</Label>
          <Input value={form.organization} onChange={e => set('organization', e.target.value)} placeholder="e.g. Milford Food Bank" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Date of Service *</Label>
        <Input required type="date" value={form.date} onChange={e => set('date', e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label>Description *</Label>
        <Textarea required value={form.description} onChange={e => set('description', e.target.value)} placeholder="Describe what you did and the impact it had..." rows={4} />
      </div>
      <div className="space-y-1.5">
        <Label>Photo URL</Label>
        <Input value={form.photo_url} onChange={e => set('photo_url', e.target.value)} placeholder="https://drive.google.com/uc?export=view&id=..." />
        {form.photo_url && (
          <img src={form.photo_url} alt="Preview" className="w-24 h-24 rounded-xl object-cover border border-border mt-2" />
        )}
      </div>
      <Button type="submit" className="w-full rounded-full h-11 font-bold" disabled={saving}>
        {saving ? 'Submitting...' : 'Submit Project'}
      </Button>
    </form>
  );
}