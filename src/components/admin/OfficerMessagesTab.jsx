import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, Mail, Check, Trash2, ChevronDown, ChevronUp, Send } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const statusConfig = {
  unread:  { label: 'Unread',  color: 'bg-blue-100 text-blue-700' },
  read:    { label: 'Read',    color: 'bg-muted text-muted-foreground' },
  replied: { label: 'Replied', color: 'bg-green-100 text-green-700' },
};

export default function OfficerMessagesTab() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const list = await base44.entities.OfficerMessage.list('-created_date');
    setMessages(list);
    setLoading(false);
  };

  const toggleExpand = async (msg) => {
    if (expanded === msg.id) { setExpanded(null); return; }
    setExpanded(msg.id);
    setReply(msg.reply || '');
    if (msg.status === 'unread') {
      await base44.entities.OfficerMessage.update(msg.id, { status: 'read' });
      load();
    }
  };

  const sendReply = async (msg) => {
    if (!reply.trim()) { toast.error('Write a reply first.'); return; }
    setSending(true);
    await base44.integrations.Core.SendEmail({
      to: msg.member_email,
      subject: `Re: ${msg.subject}`,
      body: `Hi ${msg.member_name},\n\n${reply}\n\n— Club Officers`,
    });
    await base44.entities.OfficerMessage.update(msg.id, { status: 'replied', reply: reply.trim() });
    toast.success('Reply sent!');
    setSending(false);
    setExpanded(null);
    load();
  };

  const del = async (id) => {
    await base44.entities.OfficerMessage.delete(id);
    toast.success('Deleted.');
    load();
  };

  const unreadCount = messages.filter(m => m.status === 'unread').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-bold text-xl flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-primary" /> Member Messages
          {unreadCount > 0 && (
            <span className="bg-primary text-primary-foreground text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">{unreadCount}</span>
          )}
        </h2>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : messages.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">No messages yet.</div>
      ) : (
        <div className="space-y-3">
          {messages.map(msg => {
            const cfg = statusConfig[msg.status] || statusConfig.read;
            const isOpen = expanded === msg.id;
            return (
              <div key={msg.id} className={`bg-card rounded-xl border border-border overflow-hidden ${msg.status === 'unread' ? 'border-primary/30 bg-primary/2' : ''}`}>
                <div className="flex items-center gap-3 p-4 cursor-pointer" onClick={() => toggleExpand(msg)}>
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <p className={`font-semibold text-sm ${msg.status === 'unread' ? 'text-foreground' : 'text-muted-foreground'}`}>{msg.subject}</p>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${cfg.color}`}>{cfg.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{msg.member_name} · {msg.member_email}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-muted-foreground hidden sm:block">
                      {msg.created_date && format(new Date(msg.created_date), 'MMM d')}
                    </span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    <Button size="icon" variant="ghost" className="w-7 h-7 text-destructive hover:text-destructive" onClick={e => { e.stopPropagation(); del(msg.id); }}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {isOpen && (
                  <div className="px-4 pb-4 border-t border-border pt-4 space-y-4">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap bg-muted/40 rounded-lg p-3">{msg.message}</p>
                    {msg.reply && (
                      <div className="bg-green-50 border border-green-100 rounded-lg p-3">
                        <p className="text-[10px] text-green-700 font-bold uppercase mb-1">Previous Reply</p>
                        <p className="text-sm text-green-800 whitespace-pre-wrap">{msg.reply}</p>
                      </div>
                    )}
                    <div className="space-y-2">
                      <Textarea
                        value={reply}
                        onChange={e => setReply(e.target.value)}
                        placeholder="Write your reply..."
                        rows={3}
                        className="text-sm"
                      />
                      <div className="flex items-center gap-2">
                        <Button size="sm" onClick={() => sendReply(msg)} disabled={sending} className="gap-1.5 rounded-full">
                          <Send className="w-3.5 h-3.5" />{sending ? 'Sending...' : 'Send Reply'}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={async () => {
                          await base44.entities.OfficerMessage.update(msg.id, { status: 'read' });
                          setExpanded(null); load();
                        }} className="gap-1.5">
                          <Check className="w-3.5 h-3.5" /> Mark Read
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}