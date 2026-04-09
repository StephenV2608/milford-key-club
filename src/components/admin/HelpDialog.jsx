import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { HelpCircle, X } from 'lucide-react';
import { toast } from "sonner";
import { base44 } from '@/api/base44Client';
import { useSiteSettings } from '../../hooks/useSiteSettings';

export default function HelpDialog() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', problem: '' });
  const [sending, setSending] = useState(false);
  const { settings } = useSiteSettings();

  const send = async () => {
    if (!form.name || !form.problem) {
      toast.error('Please fill in your name and problem.');
      return;
    }
    setSending(true);
    await base44.entities.HelpRequest.create({ name: form.name, email: form.email, problem: form.problem, status: 'open' });
    // Email the club's contact address from settings
    const contactEmail = 'stephenv2608@gmail.com';
    if (contactEmail) {
      await base44.integrations.Core.SendEmail({
        to: contactEmail,
        subject: `Help Request from ${form.name}`,
        body: `Name: ${form.name}\nEmail: ${form.email || 'N/A'}\n\nProblem:\n${form.problem}`,
      });
    }
    toast.success('Help request submitted!');
    setForm({ name: '', email: '', problem: '' });
    setSending(false);
    setOpen(false);
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="gap-1.5">
        <HelpCircle className="w-3.5 h-3.5" /> Help
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card rounded-xl border border-border w-full max-w-md p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="font-heading font-bold text-lg">Request Help</h2>
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-3">
              <div>
                <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Your Name</Label>
                <Input className="mt-1" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Jane Doe" />
              </div>
              <div>
                <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Your Email</Label>
                <Input className="mt-1" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="you@example.com" />
              </div>
              <div>
                <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Describe the Problem</Label>
                <Textarea className="mt-1" rows={4} value={form.problem} onChange={e => setForm(p => ({ ...p, problem: e.target.value }))} placeholder="What's going wrong?" />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <Button onClick={send} disabled={sending} className="gap-1.5">
                {sending ? 'Sending...' : 'Send Help Request'}
              </Button>
              <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}