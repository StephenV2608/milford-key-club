import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Trash2, Edit2, Check, X, Eye, EyeOff, Mail, Send, Crown, Shield, Copy, RefreshCw, Key } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const GRADES = ['9', '10', '11', '12'];

const ALL_PERMISSIONS = [
  { key: 'announcements', label: 'Announcements' },
  { key: 'events', label: 'Events / Calendar' },
  { key: 'settings', label: 'Site Settings / Approval' },
  { key: 'pages', label: 'Custom Pages' },
  { key: 'people', label: 'Member Roster' },
  { key: 'hours', label: 'Attendance / Hours' },
  { key: 'forms', label: 'Meeting Minutes / Docs' },
  { key: 'resources', label: 'Reports / Resources' },
  { key: 'news', label: 'Newsletter / Blog / Posts' },
  { key: 'gallery', label: 'Photo Gallery / Media' },
  { key: 'showcase', label: 'Showcase' },
  { key: 'officers', label: 'Officers Page' },
  { key: 'messages', label: 'Member Messages' },
];

// Preset permission sets per officer role
const OFFICER_ROLE_PRESETS = {
  President:   ['announcements', 'events', 'settings', 'pages', 'people', 'hours', 'forms', 'resources', 'news', 'gallery', 'showcase', 'officers', 'messages'],
  'Vice President': ['people', 'events', 'announcements', 'pages', 'messages'],
  Secretary:   ['people', 'hours', 'forms', 'resources'],
  Treasurer:   ['forms', 'resources'],
  Editor:      ['news', 'gallery', 'showcase'],
  Webmaster:   ['settings', 'pages', 'officers', 'forms', 'resources', 'news', 'gallery', 'showcase', 'announcements', 'events', 'people', 'hours', 'messages'],
};

const OFFICER_ROLES = ['President', 'Vice President', 'Secretary', 'Treasurer', 'Editor', 'Webmaster'];

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const seg = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `MKC-${seg()}-${seg()}`;
}

export default function PeopleTab({ isSuperAdmin }) {
  return (
    <div>
      <Tabs defaultValue="members">
        <TabsList className="mb-6">
          <TabsTrigger value="members">Members</TabsTrigger>
          {isSuperAdmin && <TabsTrigger value="admins">Admin Accounts</TabsTrigger>}
        </TabsList>

        <TabsContent value="members"><MembersSection isSuperAdmin={isSuperAdmin} /></TabsContent>
        {isSuperAdmin && <TabsContent value="admins"><AdminsSection /></TabsContent>}
      </Tabs>
    </div>
  );
}

/* ── MEMBERS ── */
function MembersSection({ isSuperAdmin }) {
  const [members, setMembers] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [showPw, setShowPw] = useState({});
  const [massEmail, setMassEmail] = useState({ subject: '', body: '' });
  const [sending, setSending] = useState(false);
  const [resetMemberId, setResetMemberId] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [showNewPw, setShowNewPw] = useState(false);

  useEffect(() => { load(); }, []);
  const [pending, setPending] = useState([]);
  const load = () => {
    base44.entities.Member.list('name').then(setMembers);
    base44.entities.Member.filter({ status: 'pending' }).then(setPending);
  };

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

  const resetMemberPassword = async () => {
    if (!newPassword.trim()) { toast.error('Enter a new password'); return; }
    await base44.entities.Member.update(resetMemberId, { password: newPassword.trim() });
    toast.success('Password updated!');
    setResetMemberId(null);
    setNewPassword('');
    load();
  };

  const sendMassEmail = async () => {
    if (!massEmail.subject || !massEmail.body) { toast.error('Fill in subject and body.'); return; }
    setSending(true);
    const appUsers = await base44.entities.User.list();
    const memberEmails = new Set(members.filter(m => m.active !== false && m.email).map(m => m.email.toLowerCase()));
    const recipients = appUsers.filter(u => u.email && memberEmails.has(u.email.toLowerCase()));
    const targets = recipients.length ? recipients : appUsers.filter(u => u.email);
    for (const u of targets) {
      await base44.integrations.Core.SendEmail({ to: u.email, subject: massEmail.subject, body: `Hi ${u.full_name || 'there'},\n\n${massEmail.body}\n\n— Milford Key Club` });
    }
    toast.success(`Sent to ${targets.length} member(s)!`);
    setMassEmail({ subject: '', body: '' });
    setSending(false);
  };

  const activeCount = members.filter(m => m.active !== false).length;

  const approve = async (m) => {
    await base44.entities.Member.update(m.id, { active: true, status: 'approved' });
    toast.success(`${m.name} approved!`);
    load();
  };

  const deny = async (m) => {
    await base44.entities.Member.delete(m.id);
    toast.success(`${m.name} removed.`);
    load();
  };

  return (
    <div className="space-y-6">
      {/* Pending Approvals */}
      {pending.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
          <h3 className="font-heading font-semibold text-base mb-3 flex items-center gap-2 text-amber-800">
            <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center font-bold">{pending.length}</span>
            Pending Approvals
          </h3>
          <div className="space-y-2">
            {pending.map(m => (
              <div key={m.id} className="flex items-center gap-3 bg-white rounded-lg px-4 py-3 border border-amber-100">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{m.name}</p>
                  <p className="text-xs text-muted-foreground">{m.email} {m.grade ? `· Grade ${m.grade}` : ''} {m.class_year ? `· Class of ${m.class_year}` : ''}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button size="sm" className="gap-1 bg-green-600 hover:bg-green-700 text-white" onClick={() => approve(m)}>
                    <Check className="w-3.5 h-3.5" /> Approve
                  </Button>
                  <Button size="sm" variant="destructive" className="gap-1" onClick={() => deny(m)}>
                    <X className="w-3.5 h-3.5" /> Deny
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-heading font-semibold text-base">Members</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{activeCount} active · {members.length} total</p>
          </div>
          <Button size="sm" onClick={startNew} className="gap-1.5"><Plus className="w-4 h-4" />Add Member</Button>
        </div>
        {editing === 'new' && <MemberForm form={form} set={set} onSave={save} onCancel={cancel} isSuperAdmin={isSuperAdmin} />}
        <div className="space-y-2 mt-2">
          {members.map(m => (
            <div key={m.id}>
              {editing === m.id ? (
                <MemberForm form={form} set={set} onSave={save} onCancel={cancel} isSuperAdmin={isSuperAdmin} />
              ) : (
                <div className="flex items-center gap-3 bg-muted/40 rounded-lg px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{m.name}</span>
                      {m.grade && <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full">Grade {m.grade}</span>}
                      {m.active === false && <span className="text-[10px] bg-destructive/10 text-destructive font-bold px-2 py-0.5 rounded-full">Inactive</span>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{m.email}</p>
                  </div>
                  {isSuperAdmin && (
                    <div className="flex items-center gap-1 shrink-0">
                      {resetMemberId === m.id ? (
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <Input type={showNewPw ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New password" className="h-8 text-sm w-32 pr-8" />
                            <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowNewPw(v => !v)}>
                              {showNewPw ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            </button>
                          </div>
                          <Button size="sm" onClick={resetMemberPassword} className="h-8 gap-1"><Check className="w-3 h-3" />Save</Button>
                          <Button size="sm" variant="ghost" onClick={() => setResetMemberId(null)} className="h-8"><X className="w-3 h-3" /></Button>
                        </div>
                      ) : (
                        <Button size="sm" variant="ghost" className="h-8 gap-1 text-xs" onClick={() => { setResetMemberId(m.id); setNewPassword(''); }}>
                          <Key className="w-3 h-3" />
                        </Button>
                      )}
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
          {!members.length && editing !== 'new' && <p className="text-center py-8 text-sm text-muted-foreground">No members yet.</p>}
        </div>
      </div>

      {/* Mass Email */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-heading font-semibold text-base mb-1 flex items-center gap-2"><Mail className="w-4 h-4 text-primary" />Send Mass Email</h3>
        <p className="text-xs text-muted-foreground mb-4">Emails all active members.</p>
        <div className="space-y-3">
          <div>
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Subject</Label>
            <Input className="mt-1" value={massEmail.subject} onChange={e => setMassEmail(p => ({ ...p, subject: e.target.value }))} placeholder="Subject line..." />
          </div>
          <div>
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Message</Label>
            <textarea className="mt-1 w-full border border-input rounded-md px-3 py-2 text-sm bg-background min-h-[100px] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" value={massEmail.body} onChange={e => setMassEmail(p => ({ ...p, body: e.target.value }))} placeholder="Write your message..." />
          </div>
          <Button onClick={sendMassEmail} disabled={sending} className="gap-1.5"><Send className="w-4 h-4" />{sending ? 'Sending...' : `Send to ${activeCount} Active Members`}</Button>
        </div>
      </div>
    </div>
  );
}

function MemberForm({ form, set, onSave, onCancel, isSuperAdmin }) {
  const [pwVisible, setPwVisible] = useState(false);
  return (
    <div className="bg-accent/30 rounded-xl border border-primary/20 p-4 space-y-3 mb-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <div><Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Full Name *</Label><Input className="mt-1" value={form.name || ''} onChange={e => set('name', e.target.value)} placeholder="Jane Doe" /></div>
        <div><Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Email *</Label><Input className="mt-1" type="email" value={form.email || ''} onChange={e => set('email', e.target.value)} placeholder="jane@example.com" /></div>
        <div>
          <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Grade</Label>
          <select className="mt-1 w-full border border-input rounded-md h-9 px-3 text-sm bg-background" value={form.grade || '9'} onChange={e => set('grade', e.target.value)}>
            {GRADES.map(g => <option key={g} value={g}>Grade {g}</option>)}
          </select>
        </div>
        <div><Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Graduation Year</Label><Input className="mt-1" value={form.class_year || ''} onChange={e => set('class_year', e.target.value)} placeholder="2027" /></div>
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

/* ── ADMINS ── */
function AdminsSection() {
  const [admins, setAdmins] = useState([]);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', id_code: generateCode(), role: 'admin', officer_role: '', permissions: [] });

  useEffect(() => { base44.entities.AdminUser.list().then(setAdmins); }, []);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const togglePerm = (perm) => setForm(p => ({ ...p, permissions: p.permissions.includes(perm) ? p.permissions.filter(x => x !== perm) : [...p.permissions, perm] }));

  const save = async () => {
    if (!form.username || !form.id_code) { toast.error('Username and ID code required'); return; }
    await base44.entities.AdminUser.create(form);
    toast.success(`"${form.username}" added as ${form.officer_role || 'Admin'}`);
    setAdding(false);
    setForm({ username: '', email: '', id_code: generateCode(), role: 'admin', officer_role: '', permissions: [] });
    base44.entities.AdminUser.list().then(setAdmins);
  };

  const del = async (id) => { await base44.entities.AdminUser.delete(id); toast.success('Removed'); base44.entities.AdminUser.list().then(setAdmins); };
  const copyCode = (code) => { navigator.clipboard.writeText(code); toast.success('Copied!'); };

  return (
    <div className="space-y-4">
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-start gap-3">
        <Crown className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-sm">Built-in Super Admin</p>
          <p className="text-xs text-muted-foreground mt-0.5">Username: <code className="bg-muted px-1 rounded">SuperAdmin</code> · Code: <code className="bg-muted px-1 rounded">MKC-SUPER-2026</code></p>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-heading font-semibold text-base flex items-center gap-2"><Shield className="w-4 h-4 text-primary" />Admin Accounts</h3>
          <Button size="sm" onClick={() => setAdding(true)} disabled={adding} className="gap-1.5"><Plus className="w-4 h-4" />Add Admin</Button>
        </div>

        {adding && (
          <div className="bg-accent/30 rounded-xl border border-primary/20 p-4 space-y-3 mb-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <div><Label className="text-xs uppercase tracking-wide text-muted-foreground">Username *</Label><Input value={form.username} onChange={e => set('username', e.target.value)} placeholder="johndoe" className="mt-1" /></div>
              <div><Label className="text-xs uppercase tracking-wide text-muted-foreground">Email</Label><Input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="john@school.edu" className="mt-1" /></div>
              <div>
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">ID Code</Label>
                <div className="flex gap-2 mt-1">
                  <Input value={form.id_code} onChange={e => set('id_code', e.target.value)} className="font-mono text-sm" />
                  <Button type="button" variant="outline" size="icon" onClick={() => set('id_code', generateCode())}><RefreshCw className="w-3.5 h-3.5" /></Button>
                  <Button type="button" variant="outline" size="icon" onClick={() => copyCode(form.id_code)}><Copy className="w-3.5 h-3.5" /></Button>
                </div>
              </div>
              <div>
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Officer Position</Label>
                <select
                  value={form.officer_role}
                  onChange={e => {
                    const r = e.target.value;
                    set('officer_role', r);
                    if (r && OFFICER_ROLE_PRESETS[r]) setForm(p => ({ ...p, officer_role: r, permissions: OFFICER_ROLE_PRESETS[r], role: r === 'Webmaster' ? 'super_admin' : 'admin' }));
                    else set('officer_role', r);
                  }}
                  className="mt-1 w-full border border-input rounded-md h-9 px-3 text-sm bg-background"
                >
                  <option value="">— Select Position —</option>
                  {OFFICER_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Permissions (auto-set by position)</Label>
                <div className="flex gap-2">
                  <button onClick={() => setForm(p => ({ ...p, permissions: ALL_PERMISSIONS.map(x => x.key) }))} className="text-xs text-primary hover:underline">All</button>
                  <span className="text-muted-foreground text-xs">·</span>
                  <button onClick={() => setForm(p => ({ ...p, permissions: [] }))} className="text-xs text-muted-foreground hover:underline">None</button>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ALL_PERMISSIONS.map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer text-sm">
                    <input type="checkbox" checked={form.permissions.includes(key)} onChange={() => togglePerm(key)} className="rounded" />{label}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={save} className="gap-1.5"><Check className="w-3.5 h-3.5" />Create</Button>
              <Button size="sm" variant="ghost" onClick={() => setAdding(false)} className="gap-1.5"><X className="w-3.5 h-3.5" />Cancel</Button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {admins.map(admin => (
            <div key={admin.id} className="bg-muted/40 rounded-xl p-4 flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                {admin.role === 'super_admin' ? <Crown className="w-3.5 h-3.5 text-primary" /> : <Shield className="w-3.5 h-3.5 text-primary" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <p className="font-semibold text-sm">{admin.username}</p>
                  {admin.officer_role && <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary">{admin.officer_role}</span>}
                  {!admin.officer_role && <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${admin.role === 'super_admin' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>{admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}</span>}
                </div>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono">{admin.id_code}</code>
                  <button onClick={() => copyCode(admin.id_code)} className="text-muted-foreground hover:text-foreground"><Copy className="w-3 h-3" /></button>
                </div>
              </div>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive shrink-0" onClick={() => del(admin.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
            </div>
          ))}
          {admins.length === 0 && !adding && <p className="text-sm text-center text-muted-foreground py-4">No additional admins yet.</p>}
        </div>
      </div>
    </div>
  );
}