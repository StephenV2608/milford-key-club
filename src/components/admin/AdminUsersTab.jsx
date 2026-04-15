import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Check, X, Copy, RefreshCw, Crown, Shield, Key, Eye, EyeOff } from 'lucide-react';
import { toast } from "sonner";
import { base44 } from '@/api/base44Client';

const ALL_PERMISSIONS = [
  { key: 'settings', label: 'Site Settings' },
  { key: 'page-texts', label: 'Page Texts' },
  { key: 'projects', label: 'Projects' },
  { key: 'events', label: 'Events' },
  { key: 'officers', label: 'Officers' },
  { key: 'gallery', label: 'Gallery' },
  { key: 'hours', label: 'Service Hours' },
  { key: 'news', label: 'News / Announcements' },
  { key: 'members', label: 'Members' },
  { key: 'newsletter', label: 'Newsletter' },
  { key: 'forms', label: 'Forms' },
  { key: 'resources', label: 'Resources' },
];

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const seg = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `MKC-${seg()}-${seg()}`;
}

export default function AdminUsersTab({ isSuperAdmin }) {
  const [admins, setAdmins] = useState([]);
  const [members, setMembers] = useState([]);
  const [adding, setAdding] = useState(false);
  const [resetMemberId, setResetMemberId] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [showNewPw, setShowNewPw] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', id_code: generateCode(), role: 'admin', permissions: [] });

  useEffect(() => { load(); }, []);
  const load = () => {
    base44.entities.AdminUser.list().then(setAdmins);
    base44.entities.Member.list('name').then(setMembers);
  };

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const togglePerm = (perm) => {
    setForm(p => ({
      ...p,
      permissions: p.permissions.includes(perm)
        ? p.permissions.filter(x => x !== perm)
        : [...p.permissions, perm],
    }));
  };

  const selectAll = () => setForm(p => ({ ...p, permissions: ALL_PERMISSIONS.map(x => x.key) }));
  const selectNone = () => setForm(p => ({ ...p, permissions: [] }));

  const save = async () => {
    if (!form.username || !form.id_code) { toast.error('Username and ID code required'); return; }
    await base44.entities.AdminUser.create(form);
    toast.success(`Admin "${form.username}" created with code: ${form.id_code}`);
    setAdding(false);
    setForm({ username: '', email: '', id_code: generateCode(), role: 'admin', permissions: [] });
    load();
  };

  const del = async (id) => {
    await base44.entities.AdminUser.delete(id);
    toast.success('Admin removed');
    load();
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('ID Code copied!');
  };

  const resetMemberPassword = async () => {
    if (!newPassword.trim()) { toast.error('Enter a new password'); return; }
    await base44.entities.Member.update(resetMemberId, { password: newPassword.trim() });
    toast.success('Password updated!');
    setResetMemberId(null);
    setNewPassword('');
    load();
  };

  return (
    <div className="space-y-6">
      {/* Super Admin info */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 flex items-start gap-3">
        <Crown className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-sm">Super Admin (Built-in)</p>
          <p className="text-xs text-muted-foreground mt-0.5">Username: <code className="bg-muted px-1 rounded">SuperAdmin</code> · ID Code: <code className="bg-muted px-1 rounded">MKC-SUPER-2026</code></p>
          <p className="text-xs text-muted-foreground mt-1">This account has full access and cannot be removed.</p>
        </div>
      </div>

      {/* Admins */}
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-heading font-semibold text-base flex items-center gap-2"><Shield className="w-4 h-4 text-primary" /> Admin Accounts</h3>
          <Button size="sm" onClick={() => setAdding(true)} className="gap-1.5" disabled={adding}>
            <Plus className="w-4 h-4" />Add Admin
          </Button>
        </div>

        {adding && (
          <div className="bg-accent/30 rounded-xl border border-primary/20 p-5 space-y-4 mb-4">
            <h4 className="font-semibold text-sm">New Admin</h4>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Username *</Label>
                <Input value={form.username} onChange={e => set('username', e.target.value)} placeholder="johndoe" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Email</Label>
                <Input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="john@school.edu" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">ID Code</Label>
                <div className="flex gap-2">
                  <Input value={form.id_code} onChange={e => set('id_code', e.target.value)} className="font-mono text-sm" />
                  <Button type="button" variant="outline" size="icon" onClick={() => set('id_code', generateCode())}><RefreshCw className="w-3.5 h-3.5" /></Button>
                  <Button type="button" variant="outline" size="icon" onClick={() => copyCode(form.id_code)}><Copy className="w-3.5 h-3.5" /></Button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Role</Label>
                <select value={form.role} onChange={e => set('role', e.target.value)} className="w-full border border-input rounded-md h-10 px-3 text-sm bg-background">
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
            </div>

            {form.role === 'admin' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">Permissions</Label>
                  <div className="flex gap-2">
                    <button onClick={selectAll} className="text-xs text-primary hover:underline">All</button>
                    <span className="text-muted-foreground text-xs">·</span>
                    <button onClick={selectNone} className="text-xs text-muted-foreground hover:underline">None</button>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {ALL_PERMISSIONS.map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer text-sm">
                      <input type="checkbox" checked={form.permissions.includes(key)} onChange={() => togglePerm(key)} className="rounded" />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button size="sm" onClick={save} className="gap-1.5"><Check className="w-3.5 h-3.5" />Create Admin</Button>
              <Button size="sm" variant="ghost" onClick={() => setAdding(false)} className="gap-1.5"><X className="w-3.5 h-3.5" />Cancel</Button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {admins.map(admin => (
            <div key={admin.id} className="bg-muted/40 rounded-xl p-4 flex items-start gap-4">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                {admin.role === 'super_admin' ? <Crown className="w-4 h-4 text-primary" /> : <Shield className="w-4 h-4 text-primary" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <p className="font-semibold text-sm">{admin.username}</p>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${admin.role === 'super_admin' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                  </span>
                </div>
                {admin.email && <p className="text-xs text-muted-foreground mb-1">{admin.email}</p>}
                <div className="flex items-center gap-2 mt-1">
                  <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono">{admin.id_code}</code>
                  <button onClick={() => copyCode(admin.id_code)} className="text-muted-foreground hover:text-foreground"><Copy className="w-3 h-3" /></button>
                </div>
                {admin.role === 'admin' && admin.permissions?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {admin.permissions.map(p => {
                      const label = ALL_PERMISSIONS.find(x => x.key === p)?.label || p;
                      return <span key={p} className="text-[10px] bg-accent text-accent-foreground px-1.5 py-0.5 rounded">{label}</span>;
                    })}
                  </div>
                )}
              </div>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive shrink-0" onClick={() => del(admin.id)}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
          {admins.length === 0 && !adding && (
            <p className="text-sm text-center text-muted-foreground py-4">No additional admins yet.</p>
          )}
        </div>
      </div>

      {/* Member Password Reset */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-heading font-semibold text-base mb-4 flex items-center gap-2"><Key className="w-4 h-4 text-primary" /> Reset Member Passwords</h3>
        <p className="text-xs text-muted-foreground mb-4">As super admin, you can reset any member's login password.</p>
        <div className="space-y-2">
          {members.map(m => (
            <div key={m.id} className="flex items-center gap-3 bg-muted/40 rounded-lg px-4 py-2.5">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{m.name}</p>
                <p className="text-xs text-muted-foreground">{m.email}</p>
              </div>
              {resetMemberId === m.id ? (
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Input
                      type={showNewPw ? 'text' : 'password'}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="New password"
                      className="h-8 text-sm w-36 pr-8"
                    />
                    <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowNewPw(v => !v)}>
                      {showNewPw ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    </button>
                  </div>
                  <Button size="sm" onClick={resetMemberPassword} className="gap-1 h-8"><Check className="w-3 h-3" />Save</Button>
                  <Button size="sm" variant="ghost" onClick={() => { setResetMemberId(null); setNewPassword(''); }} className="h-8"><X className="w-3 h-3" /></Button>
                </div>
              ) : (
                <Button size="sm" variant="outline" onClick={() => { setResetMemberId(m.id); setNewPassword(''); }} className="gap-1.5 h-8">
                  <Key className="w-3 h-3" /> Reset Password
                </Button>
              )}
            </div>
          ))}
          {members.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No members found.</p>}
        </div>
      </div>
    </div>
  );
}