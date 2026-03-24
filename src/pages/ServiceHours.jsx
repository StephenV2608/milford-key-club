import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Clock, CheckCircle } from 'lucide-react';
import { toast } from "sonner";
import { base44 } from '@/api/base44Client';
import SectionHeading from '../components/shared/SectionHeading';

export default function ServiceHours() {
  const [form, setForm] = useState({
    member_name: '',
    member_email: '',
    date: '',
    hours: '',
    organization: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await base44.entities.ServiceHour.create({
      ...form,
      hours: parseFloat(form.hours),
      status: 'pending',
    });
    setSubmitted(true);
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="font-heading font-bold text-2xl mb-2">Hours Submitted!</h2>
          <p className="text-muted-foreground mb-6">Your service hours have been submitted for review. An admin will approve them shortly.</p>
          <Button onClick={() => { setSubmitted(false); setForm({ member_name:'', member_email:'', date:'', hours:'', organization:'', description:'' }); }} className="rounded-full px-6">
            Submit More Hours
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <section className="py-16 md:py-20 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Member Portal"
            title="Log Service Hours"
            description="Submit your volunteer hours for admin approval. Make sure to fill out all fields accurately."
          />
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border p-6 md:p-8 space-y-5">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-primary" />
              <h3 className="font-heading font-semibold text-lg">New Hours Entry</h3>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input placeholder="Your name" value={form.member_name} onChange={e => set('member_name', e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" placeholder="you@school.edu" value={form.member_email} onChange={e => set('member_email', e.target.value)} />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date of Service *</Label>
                <Input type="date" value={form.date} onChange={e => set('date', e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Hours Served *</Label>
                <Input type="number" min="0.5" max="24" step="0.5" placeholder="e.g. 2.5" value={form.hours} onChange={e => set('hours', e.target.value)} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Organization / Event *</Label>
              <Input placeholder="e.g. Milford Food Bank, Got Bags Drive" value={form.organization} onChange={e => set('organization', e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea placeholder="Briefly describe what you did..." rows={3} value={form.description} onChange={e => set('description', e.target.value)} />
            </div>

            <Button type="submit" className="rounded-full px-8 w-full" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Hours'}
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}