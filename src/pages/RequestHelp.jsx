import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { HandHeart, CheckCircle2, Users, Clock, Mail } from 'lucide-react';
import PageHeader from '../components/shared/PageHeader';

const CATEGORIES = [
  "Yard Work / Chores",
  "Event Volunteers",
  "Tutoring / Mentoring",
  "Donation Drive",
  "Cleanup / Beautification",
  "Senior Assistance",
  "Other",
];

export default function RequestHelp() {
  const [form, setForm] = useState({
    requester_name: '',
    organization: '',
    email: '',
    phone: '',
    category: '',
    date_needed: '',
    volunteers_needed: '',
    description: '',
    location: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.requester_name || !form.email || !form.category || !form.description) {
      toast.error('Please fill in all required fields.');
      return;
    }
    setSubmitting(true);
    await base44.entities.HelpRequestSubmission.create({
      ...form,
      volunteers_needed: form.volunteers_needed ? Number(form.volunteers_needed) : undefined,
      status: 'new',
    });
    setSubmitting(false);
    setSubmitted(true);
    toast.success('Request submitted! We\'ll be in touch soon.');
  };

  if (submitted) {
    return (
      <div>
        <PageHeader eyebrow="Request Help" title="Request Submitted!" description="Thank you for reaching out — we'll review your request and respond within a few days." />
        <section className="py-16 md:py-20">
          <div className="max-w-xl mx-auto px-4 text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Our officers have been notified of your request. They'll reach out to <strong className="text-foreground">{form.email}</strong> to coordinate next steps.
            </p>
            <Button onClick={() => { setSubmitted(false); setForm({ requester_name: '', organization: '', email: '', phone: '', category: '', date_needed: '', volunteers_needed: '', description: '', location: '' }); }} variant="outline" className="rounded-full">
              Submit Another Request
            </Button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Community Support"
        title="Request Our Help"
        description="Need volunteers for a community project, event, or cause? Submit a request and our members will see how we can help."
      />

      <section className="py-12 md:py-16">
        <div className="max-w-3xl mx-auto px-4">
          {/* How it works */}
          <div className="grid sm:grid-cols-3 gap-4 mb-10">
            {[
              { icon: HandHeart, title: 'Submit Request', desc: 'Tell us what you need help with' },
              { icon: Users, title: 'We Review', desc: 'Officers assess & coordinate members' },
              { icon: CheckCircle2, title: 'We Help', desc: 'Volunteers show up and serve' },
            ].map(({ icon: Icon, title, desc }, i) => (
              <div key={i} className="bg-card rounded-2xl border border-border p-5 text-center">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-heading font-semibold text-sm mb-1">{title}</h3>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={submit} className="bg-card rounded-2xl border border-border p-6 md:p-8 space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Your Name *</Label>
                <Input value={form.requester_name} onChange={e => set('requester_name', e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label>Organization / Group</Label>
                <Input value={form.organization} onChange={e => set('organization', e.target.value)} placeholder="Optional" />
              </div>
              <div className="space-y-1.5">
                <Label>Email *</Label>
                <Input type="email" value={form.email} onChange={e => set('email', e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="Optional" />
              </div>
              <div className="space-y-1.5">
                <Label>Type of Help *</Label>
                <select
                  className="w-full border border-input rounded-md h-9 px-3 text-sm bg-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={form.category}
                  onChange={e => set('category', e.target.value)}
                  required
                >
                  <option value="">— Select —</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Date Needed</Label>
                <Input type="date" value={form.date_needed} onChange={e => set('date_needed', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label># Volunteers Needed</Label>
                <Input type="number" min="1" value={form.volunteers_needed} onChange={e => set('volunteers_needed', e.target.value)} placeholder="e.g. 5" />
              </div>
              <div className="space-y-1.5">
                <Label>Location / Address</Label>
                <Input value={form.location} onChange={e => set('location', e.target.value)} placeholder="Where will volunteers go?" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Describe What You Need *</Label>
              <Textarea
                rows={5}
                value={form.description}
                onChange={e => set('description', e.target.value)}
                placeholder="Tell us about the project or event — what will volunteers be doing? Any special requirements?"
                required
              />
            </div>

            <div className="bg-muted/50 border border-border rounded-xl p-4 flex items-start gap-3 text-xs text-muted-foreground">
              <Clock className="w-4 h-4 shrink-0 mt-0.5" />
              <p>We review requests weekly. For time-sensitive needs, please contact us directly at our club email.</p>
            </div>

            <Button type="submit" disabled={submitting} className="rounded-full px-10 h-11 w-full sm:w-auto gap-2">
              <Mail className="w-4 h-4" />
              {submitting ? 'Submitting…' : 'Submit Request'}
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}