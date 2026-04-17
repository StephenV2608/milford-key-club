import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, CheckCircle2, Image } from 'lucide-react';
import { toast } from 'sonner';

export default function ProjectSubmitForm({ memberUser }) {
  const [form, setForm] = useState({ title: '', description: '', organization: '', date: '', photo_url: '' });
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handlePhoto = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    set('photo_url', file_url);
    setUploading(false);
    toast.success('Photo uploaded!');
  };

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
        <Label>Photo</Label>
        {form.photo_url ? (
          <div className="flex items-center gap-3">
            <img src={form.photo_url} alt="Preview" className="w-20 h-20 rounded-xl object-cover border border-border" />
            <Button type="button" variant="outline" size="sm" onClick={() => set('photo_url', '')}>Remove</Button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-border rounded-xl cursor-pointer hover:bg-muted/40 transition-colors">
            <Image className="w-6 h-6 text-muted-foreground mb-1.5" />
            <span className="text-sm text-muted-foreground">{uploading ? 'Uploading...' : 'Click to upload a photo'}</span>
            <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} disabled={uploading} />
          </label>
        )}
      </div>
      <Button type="submit" className="w-full rounded-full h-11 font-bold" disabled={saving || uploading}>
        {saving ? 'Submitting...' : 'Submit Project'}
      </Button>
    </form>
  );
}