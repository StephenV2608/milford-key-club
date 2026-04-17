import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, X, Check, ChevronDown, Shield } from 'lucide-react';

const ROLE_TITLES = [
  'President', 'Vice President', 'Secretary', 'Treasurer',
  'Editor', 'Webmaster', 'Lieutenant Governor', 'Faculty Advisor', 'Other'
];

const ALL_PERMISSIONS = [
  { id: 'approve_hours',     label: 'Approve Service Hours' },
  { id: 'post_announcements',label: 'Post Announcements' },
  { id: 'manage_events',     label: 'Manage Events' },
  { id: 'manage_members',    label: 'Manage Members' },
  { id: 'manage_gallery',    label: 'Manage Gallery' },
  { id: 'manage_showcase',   label: 'Manage Showcase' },
  { id: 'view_messages',     label: 'View Messages' },
];

const BLANK = {
  title: 'President', custom_title: '', member_name: '', member_id: '',
  member_email: '', show_email: false, photo_url: '', bio: '',
  permissions: [], order: 0, active: true,
};

export default function OfficerRolesTab() {
  const [roles, setRoles] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null | 'new' | role object
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      base44.entities.OfficerRole.list('order'),
      base44.entities.Member.filter({ active: true }),
    ]).then(([r, m]) => {
      setRoles(r);
      setMembers(m);
      setLoading(false);
    });
  }, []);

  const reload = () => base44.entities.OfficerRole.list('order').then(setRoles);

  const startNew = () => { setForm({ ...BLANK }); setEditing('new'); };
  const startEdit = (r) => { setForm({ ...BLANK, ...r }); setEditing(r); };
  const cancel = () => setEditing(null);

  const linkMember = (memberId) => {
    const m = members.find(m => m.id === memberId);
    setForm(f => ({
      ...f,
      member_id: memberId,
      member_name: m?.name || f.member_name,
      member_email: m?.email || f.member_email,
    }));
  };

  const togglePerm = (perm) => {
    setForm(f => ({
      ...f,
      permissions: f.permissions.includes(perm)
        ? f.permissions.filter(p => p !== perm)
        : [...f.permissions, perm],
    }));
  };

  const save = async () => {
    if (!form.member_name) { toast.error('Member name is required'); return; }
    setSaving(true);
    if (editing === 'new') {
      await base44.entities.OfficerRole.create(form);
      toast.success('Role created');
    } else {
      await base44.entities.OfficerRole.update(editing.id, form);
      toast.success('Role updated');
    }
    await reload();
    setSaving(false);
    setEditing(null);
  };

  const remove = async (id) => {
    if (!confirm('Delete this role?')) return;
    await base44.entities.OfficerRole.delete(id);
    toast.success('Role deleted');
    await reload();
  };

  if (loading) return <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />)}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-bold text-xl flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" /> Officer Roles
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">Link members to officer positions and assign permissions</p>
        </div>
        <Button size="sm" onClick={startNew} className="gap-1.5">
          <Plus className="w-3.5 h-3.5" /> Add Role
        </Button>
      </div>

      {/* Form */}
      {editing && (
        <div className="bg-card rounded-xl border border-border p-5 space-y-4">
          <h3 className="font-semibold text-sm">{editing === 'new' ? 'New Role' : 'Edit Role'}</h3>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Role title */}
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1">Role Title</label>
              <div className="relative">
                <select value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full border border-input rounded-md h-9 px-3 text-sm bg-background appearance-none pr-8">
                  {ROLE_TITLES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            {form.title === 'Other' && (
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1">Custom Title</label>
                <Input value={form.custom_title} onChange={e => setForm(f => ({ ...f, custom_title: e.target.value }))} placeholder="e.g. Media Director" className="h-9 text-sm" />
              </div>
            )}

            {/* Link member */}
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1">Link to Member</label>
              <div className="relative">
                <select value={form.member_id || ''} onChange={e => linkMember(e.target.value)}
                  className="w-full border border-input rounded-md h-9 px-3 text-sm bg-background appearance-none pr-8">
                  <option value="">— Select member (optional) —</option>
                  {members.map(m => <option key={m.id} value={m.id}>{m.name} ({m.email})</option>)}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1">Member Name</label>
              <Input value={form.member_name} onChange={e => setForm(f => ({ ...f, member_name: e.target.value }))} placeholder="Full name" className="h-9 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1">Contact Email</label>
              <Input type="email" value={form.member_email} onChange={e => setForm(f => ({ ...f, member_email: e.target.value }))} placeholder="officer@email.com" className="h-9 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1">Photo URL</label>
              <Input value={form.photo_url} onChange={e => setForm(f => ({ ...f, photo_url: e.target.value }))} placeholder="https://..." className="h-9 text-sm" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1">Bio / Fun Fact</label>
              <Input value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} placeholder="A short bio or fun fact" className="h-9 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1">Display Order</label>
              <Input type="number" value={form.order} onChange={e => setForm(f => ({ ...f, order: Number(e.target.value) }))} className="h-9 text-sm" />
            </div>
            <div className="flex items-center gap-3 pt-5">
              <input type="checkbox" id="show_email" checked={!!form.show_email} onChange={e => setForm(f => ({ ...f, show_email: e.target.checked }))} className="w-4 h-4 accent-primary" />
              <label htmlFor="show_email" className="text-sm text-muted-foreground">Show email publicly on Officers page</label>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="active" checked={!!form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} className="w-4 h-4 accent-primary" />
              <label htmlFor="active" className="text-sm text-muted-foreground">Currently active officer</label>
            </div>
          </div>

          {/* Permissions */}
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-2">Permissions</label>
            <div className="flex flex-wrap gap-2">
              {ALL_PERMISSIONS.map(p => (
                <button key={p.id} type="button" onClick={() => togglePerm(p.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    form.permissions.includes(p.id)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-muted text-muted-foreground border-border hover:border-primary/50'
                  }`}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2 border-t border-border">
            <Button size="sm" onClick={save} disabled={saving} className="gap-1.5">
              <Check className="w-3.5 h-3.5" />{saving ? 'Saving…' : 'Save Role'}
            </Button>
            <Button size="sm" variant="ghost" onClick={cancel}><X className="w-3.5 h-3.5" /> Cancel</Button>
          </div>
        </div>
      )}

      {/* Role list */}
      {roles.length === 0 && !editing ? (
        <div className="text-center py-16 text-muted-foreground">
          <Shield className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No roles yet. Add your first officer role above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {roles.map(r => (
            <div key={r.id} className="bg-card rounded-xl border border-border p-4 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
                {r.photo_url
                  ? <img src={r.photo_url} alt={r.member_name} className="w-full h-full object-cover" />
                  : <span className="text-primary font-bold text-sm">{r.member_name?.[0] || '?'}</span>
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-sm">{r.member_name}</p>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                    {r.title === 'Other' ? r.custom_title : r.title}
                  </span>
                  {!r.active && <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">Inactive</span>}
                </div>
                {r.member_email && (
                  <p className="text-xs text-muted-foreground mt-0.5">{r.member_email}{r.show_email ? ' · visible publicly' : ''}</p>
                )}
                {r.permissions?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {r.permissions.map(p => (
                      <span key={p} className="text-[10px] bg-accent text-accent-foreground px-1.5 py-0.5 rounded font-medium">
                        {ALL_PERMISSIONS.find(x => x.id === p)?.label || p}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-1 shrink-0">
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => startEdit(r)}>
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => remove(r.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}