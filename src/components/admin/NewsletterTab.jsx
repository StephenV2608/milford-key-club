import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Trash2, Send, Mail, Users } from 'lucide-react';

export default function NewsletterTab() {
  const [subscribers, setSubscribers] = useState([]);
  const [appUsers, setAppUsers] = useState([]);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [sendTo, setSendTo] = useState('subscribers');

  useEffect(() => {
    base44.entities.NewsletterSubscriber.list('-created_date').then(setSubscribers);
    base44.entities.User.list().then(setAppUsers);
  }, []);

  const del = async (id) => {
    await base44.entities.NewsletterSubscriber.delete(id);
    toast.success('Removed');
    setSubscribers(s => s.filter(x => x.id !== id));
  };

  const sendEmails = async () => {
    if (!subject || !body) { toast.error('Fill in subject and body.'); return; }
    const targets = sendTo === 'app_users' ? appUsers : subscribers;
    const withEmail = targets.filter(t => t.email);
    if (!withEmail.length) { toast.error('No recipients found.'); return; }
    setSending(true);
    let sent = 0;
    for (const t of withEmail) {
      try {
        await base44.integrations.Core.SendEmail({
          to: t.email,
          subject,
          body: `Hi ${t.name || t.full_name || 'there'},\n\n${body}\n\n— Milford Key Club`,
        });
        sent++;
      } catch (e) {
        // skip non-app users silently
      }
    }
    toast.success(`Sent to ${sent} recipient(s)!`);
    setSubject('');
    setBody('');
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
        </div>
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

      {/* Send email */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-heading font-semibold text-base mb-1 flex items-center gap-2">
          <Mail className="w-4 h-4 text-primary" /> Send Newsletter
        </h3>
        <p className="text-xs text-muted-foreground mb-4">Send an email to your audience. Only app users can receive emails.</p>
        <div className="space-y-3">
          <div className="flex gap-3">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="radio" name="sendTo" checked={sendTo === 'app_users'} onChange={() => setSendTo('app_users')} />
              App Users ({appUsers.length})
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="radio" name="sendTo" checked={sendTo === 'subscribers'} onChange={() => setSendTo('subscribers')} />
              Newsletter Subscribers ({subscribers.length})
            </label>
          </div>
          <div>
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Subject</Label>
            <Input className="mt-1" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Key Club Newsletter – March 2026" />
          </div>
          <div>
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Message Body</Label>
            <textarea
              className="mt-1 w-full border border-input rounded-md px-3 py-2 text-sm bg-background min-h-[120px] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Write your message here..."
            />
          </div>
          <Button onClick={sendEmails} disabled={sending} className="gap-1.5">
            <Send className="w-4 h-4" />{sending ? 'Sending...' : 'Send Newsletter'}
          </Button>
        </div>
      </div>
    </div>
  );
}