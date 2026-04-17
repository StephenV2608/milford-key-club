import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Trash2, Mail, Users, Copy, ClipboardList, Send } from 'lucide-react';

const DEFAULT_TEMPLATE = `Hi [Name],

We hope you're doing well! Here's the latest from Milford Key Club.

📅 Upcoming Events:
[Add events here]

📢 Announcements:
[Add announcements here]

💙 Thank you for your support!

— Milford Key Club`;

export default function NewsletterTab() {
  const [subscribers, setSubscribers] = useState([]);
  const [template, setTemplate] = useState(DEFAULT_TEMPLATE);
  const [subject, setSubject] = useState('Update from Milford Key Club');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    base44.entities.NewsletterSubscriber.list('-created_date').then(setSubscribers);
  }, []);

  const del = async (id) => {
    await base44.entities.NewsletterSubscriber.delete(id);
    toast.success('Removed');
    setSubscribers(s => s.filter(x => x.id !== id));
  };

  const copyAllEmails = () => {
    const emails = subscribers.map(s => s.email).join(', ');
    if (!emails) { toast.error('No subscribers yet.'); return; }
    navigator.clipboard.writeText(emails);
    toast.success(`Copied ${subscribers.length} email(s) to clipboard!`);
  };

  const copyTemplate = () => {
    navigator.clipboard.writeText(template);
    toast.success('Email template copied to clipboard!');
  };

  const sendToAll = async () => {
    if (!subscribers.length) { toast.error('No subscribers yet.'); return; }
    if (!subject.trim()) { toast.error('Please enter a subject.'); return; }
    if (!confirm(`Send to ${subscribers.length} subscriber(s)?`)) return;
    setSending(true);
    const res = await base44.functions.invoke('sendMassEmail', {
      subject,
      body: template,
      recipients: subscribers.map(s => ({ email: s.email, name: s.name || '' })),
    });
    toast.success(`Sent to ${res.data.sent} subscriber(s)!`);
    setSending(false);
  };

  return (
    <div className="space-y-6">
      {/* Subscribers list */}
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-heading font-semibold text-base flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" /> Newsletter Subscribers
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">{subscribers.length} subscriber{subscribers.length !== 1 ? 's' : ''}</p>
          </div>
          <Button variant="outline" size="sm" onClick={copyAllEmails} className="gap-1.5">
            <Copy className="w-3.5 h-3.5" /> Copy All Emails
          </Button>
        </div>

        {subscribers.length > 0 && (
          <div className="mb-4 p-3 bg-muted/50 rounded-lg border border-border">
            <p className="text-xs text-muted-foreground mb-1 font-medium">All emails (paste into Gmail BCC, Mailchimp, etc.):</p>
            <p className="text-xs font-mono break-all text-foreground select-all">
              {subscribers.map(s => s.email).join(', ')}
            </p>
          </div>
        )}

        <div className="space-y-2">
          {subscribers.map(s => (
            <div key={s.id} className="flex items-center gap-3 bg-muted/40 rounded-lg px-4 py-2.5">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{s.name || '—'}</p>
                <p className="text-xs text-muted-foreground">{s.email}</p>
              </div>
              <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => del(s.id)}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
          {!subscribers.length && <p className="text-center py-8 text-sm text-muted-foreground">No subscribers yet.</p>}
        </div>
      </div>

      {/* Email template */}
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-heading font-semibold text-base flex items-center gap-2">
            <Mail className="w-4 h-4 text-primary" /> Send Newsletter
          </h3>
          <Button variant="outline" size="sm" onClick={copyTemplate} className="gap-1.5">
            <ClipboardList className="w-3.5 h-3.5" /> Copy
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Write your email below and click "Send to All Subscribers" to deliver it directly. Use <code className="bg-muted px-1 rounded">[Name]</code> to personalize.
        </p>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground block mb-1">Subject Line</label>
            <input
              className="w-full border border-input rounded-md h-9 px-3 text-sm bg-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="Email subject..."
            />
          </div>
          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground block mb-1">Body</label>
            <textarea
              className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background min-h-[220px] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-mono"
              value={template}
              onChange={e => setTemplate(e.target.value)}
            />
          </div>
          <Button onClick={sendToAll} disabled={sending || !subscribers.length} className="gap-1.5 rounded-full">
            <Send className="w-3.5 h-3.5" />
            {sending ? 'Sending…' : `Send to All ${subscribers.length} Subscriber${subscribers.length !== 1 ? 's' : ''}`}
          </Button>
        </div>
      </div>
    </div>
  );
}