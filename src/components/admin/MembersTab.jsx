import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Trash2, Edit2, Check, X, Eye, EyeOff, Send, Mail } from 'lucide-react';

const GRADES = ['9', '10', '11', '12'];

export default function MembersTab({ isSuperAdmin }) {
  const [members, setMembers] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [showPw, setShowPw] = useState({});
  const [massEmail, setMassEmail] = useState({ subject: '', body: '' });
  const [sending, setSending] = useState(false);

  useEffect(() => { load(); }, []);
  const load = () => base44.entities.Member.list('name').then(setMembers);

  const startNew = () => { setEditing('new'); setForm({ active: true, grade: '9' }); };
  const startEdit = (m) => { setEditing(m.id); setForm(m); };
  const cancel = () => { setEditing(null); setForm({}); };
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const save = async () => {
    if (!form.name || !form.email) { toast.error('Name and email are required.'); return; }
    if (editing === 'new') await base44.entities.Member.create(form);
    else await base44.entities.Member.update(editing, form);
    toast.success('Saved!'); cancel(); load();
  };

  const del = async (id) => { await base44.entities.Member.delete(id); toast.success('Deleted'); load(); };

  const sendMassEmail = async () => {
    if (!massEmail.subject || !massEmail.body) { toast.error('Fill in subject and body.'); return; }
    const active = members.filter(m => m.active !== false && m.email);
    if (!active.length) { toast.error('No active members with emails.'); return; }
    setSending(true);
    for (const m of active) {
      await base44.integrations.Core.SendEmail({
        to: m.email,
        subject: massEmail.subject,
        body: `Hi ${m.name},\n\n${massEmail.body}\n\n— Milford Key Club`,
      });
    }
    toast.success(`Email sent to ${active.length} member(s)!`);
    setMassEmail({ subject: '', body: '' });
    setSending(false);
  };

  const activeCount = members.filter(m => m.active !== false).length;

  return (
    <div className="space-y-6">
      {/* Members List */}
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-heading font-semibold text-base">Members</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{activeCount} active · {members.length} total</p>
          </div>
          <Button size="sm" onClick={startNew} className="gap-1.5"><Plus className="w-4 h-4" />Add Member</Button>
        </div>

        {editing === 'new' && (
          <MemberForm form={form} set={set} onSave={save} onCancel={cancel} isSuperAdmin={isSuperAdmin} showPw={showPw} setShowPw={setShowPw} isNew />
        )}

        <div className="space-y-2 mt-2">
          {members.map(m => (
            <div key={m.id}>
              {editing === m.id ? (
                <MemberForm form={form} set={set} onSave={save} onCancel={cancel} isSuperAdmin={isSuperAdmin} showPw={showPw} setShowPw={setShowPw} />
              ) : (
                <div className="flex items-center gap-3 bg-muted/40 rounded-lg px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{m.name}</span>
                      {m.grade && <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full">Grade {m.grade}</span>}
                      {m.class_year && <span className="text-[10px] bg-muted text-muted-foreground font-mono px-2 py-0.5 rounded-full">'{String(m.class_year).slice(-2)}</span>}
                      {m.active === false && <span className="text-[10px] bg-destructive/10 text-destructive font-bold px-2 py-0.5 rounded-full">Inactive</span>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{m.email}</p>
                  </div>
                  {isSuperAdmin && (
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-xs text-muted-foreground font-mono mr-1">
                        {showPw[m.id] ? (m.password || '—') : '••••••'}
                      </span>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setShowPw(p => ({ ...p, [m.id]: !p[m.id] }))}>
                        {showPw[m.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </Button>
                    </div>
                  )}
                  <div className="flex items-center gap-1 shrink-0">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => startEdit(m)}><Edit2 className="w-3.5 h-3.5" /></Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => del(m.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {!members.length && editing !== 'new' && (
            <p className="text-center py-8 text-sm text-muted-foreground">No members yet. Click "Add Member" to get started.</p>
          )}
        </div>
      </div>

      {/* Mass Email */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-heading font-semibold text-base mb-1 flex items-center gap-2">
          <Mail className="w-4 h-4 text-primary" /> Send Mass Email to Members
        </h3>
        <p className="text-xs text-muted-foreground mb-4">Emails all active members with an email address on file.</p>
        <div className="space-y-3">
          <div>
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Subject</Label>
            <Input className="mt-1" value={massEmail.subject} onChange={e => setMassEmail(p => ({ ...p, subject: e.target.value }))} placeholder="Important Update from Key Club" />
          </div>
          <div>
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Message Body</Label>
            <textarea
              className="mt-1 w-full border border-input rounded-md px-3 py-2 text-sm bg-background min-h-[120px] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={massEmail.body}
              onChange={e => setMassEmail(p => ({ ...p, body: e.target.value }))}
              placeholder="Write your message here..."
            />
          </div>
          <Button onClick={sendMassEmail} disabled={sending} className="gap-1.5">
            <Send className="w-4 h-4" />{sending ? `Sending to ${activeCount} members...` : `Send to ${activeCount} Active Members`}
          </Button>
        </div>
      </div>
    </div>
  );
}

function MemberForm({ form, set, onSave, onCancel, isSuperAdmin, showPw, setShowPw, isNew }) {
  const [pwVisible, setPwVisible] = useState(false);
  return (
    <div className="bg-accent/30 rounded-xl border border-primary/20 p-4 space-y-3 mb-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Full Name *</Label>
          <Input className="mt-1" value={form.name || ''} onChange={e => set('name', e.target.value)} placeholder="Jane Doe" />
        </div>
        <div>
          <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Email *</Label>
          <Input className="mt-1" type="email" value={form.email || ''} onChange={e => set('email', e.target.value)} placeholder="jane@example.com" />
        </div>
        <div>
          <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Grade</Label>
          <select className="mt-1 w-full border border-input rounded-md h-9 px-3 text-sm bg-background" value={form.grade || '9'} onChange={e => set('grade', e.target.value)}>
            {GRADES.map(g => <option key={g} value={g}>Grade {g}</option>)}
          </select>
        </div>
        <div>
          <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Graduation Year</Label>
          <Input className="mt-1" value={form.class_year || ''} onChange={e => set('class_year', e.target.value)} placeholder="2027" />
        </div>
        {isSuperAdmin && (
          <div>
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Password</Label>
            <div className="flex gap-1 mt-1">
              <Input type={pwVisible ? 'text' : 'password'} value={form.password || ''} onChange={e => set('password', e.target.value)} placeholder="Member password" />
              <Button type="button" size="icon" variant="ghost" className="h-9 w-9 shrink-0" onClick={() => setPwVisible(v => !v)}>
                {pwVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        )}
        <div className="flex items-center gap-2 pt-5">
          <input type="checkbox" id="active-chk" checked={form.active !== false} onChange={e => set('active', e.target.checked)} />
          <label htmlFor="active-chk" className="text-sm cursor-pointer">Active Member</label>
        </div>
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={onSave} className="gap-1.5"><Check className="w-3.5 h-3.5" />Save</Button>
        <Button size="sm" variant="ghost" onClick={onCancel} className="gap-1.5"><X className="w-3.5 h-3.5" />Cancel</Button>
      </div>
    </div>
  );
}