import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Trash2, Mail, Users, Copy, ClipboardList } from 'lucide-react';

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
            <Mail className="w-4 h-4 text-primary" /> Email Template
          </h3>
          <Button variant="outline" size="sm" onClick={copyTemplate} className="gap-1.5">
            <ClipboardList className="w-3.5 h-3.5" /> Copy Template
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Edit your template below, then click "Copy Template" and paste it into Gmail, Outlook, or any email client.
        </p>
        <textarea
          className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background min-h-[260px] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-mono"
          value={template}
          onChange={e => setTemplate(e.target.value)}
        />
        <p className="text-xs text-muted-foreground mt-2">
          💡 Tip: Copy all subscriber emails above, then paste into the BCC field of your email client.
        </p>
      </div>
    </div>
  );
}