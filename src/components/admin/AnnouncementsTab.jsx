import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Pencil, Trash2, Check, X, Megaphone, AlertTriangle, Info } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const EMPTY = { title: '', content: '', priority: 'normal', published: true, posted_by: '', expires_at: '' };

const priorityConfig = {
  normal:    { label: 'Normal',    color: 'bg-blue-100 text-blue-700',   icon: Info },
  important: { label: 'Important', color: 'bg-amber-100 text-amber-700', icon: AlertTriangle },
  urgent:    { label: 'Urgent',    color: 'bg-red-100 text-red-700',     icon: AlertTriangle },
};

export default function AnnouncementsTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const list = await base44.entities.Announcement.list('-created_date');
    setItems(list);
    setLoading(false);
  };

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const startNew = () => { setForm(EMPTY); setEditing('new'); };
  const startEdit = (a) => { setForm({ ...a }); setEditing(a); };
  const cancel = () => { setEditing(null); setForm(EMPTY); };

  const save = async () => {
    if (!form.title || !form.content) { toast.error('Title and content required.'); return; }
    setSaving(true);
    if (editing === 'new') {
      await base44.entities.Announcement.create(form);
      toast.success('Announcement posted!');
    } else {
      await base44.entities.Announcement.update(editing.id, form);
      toast.success('Updated!');
    }
    setSaving(false);
    cancel();
    load();
  };

  const del = async (id) => {
    if (!confirm('Delete this announcement?')) return;
    await base44.entities.Announcement.delete(id);
    toast.success('Deleted.');
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-bold text-xl flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-primary" /> Announcements
        </h2>
        <Button onClick={startNew} className="gap-1.5 rounded-full px-5">
          <Plus className="w-4 h-4" /> New Announcement
        </Button>
      </div>

      {editing && (
        <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
          <h3 className="font-heading font-semibold text-base">{editing === 'new' ? 'New Announcement' : 'Edit Announcement'}</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <Label>Title *</Label>
              <Input value={form.title} onChange={e => set('title', e.target.value)} placeholder="Announcement title" />
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <Label>Content *</Label>
              <Textarea value={form.content} onChange={e => set('content', e.target.value)} rows={4} placeholder="What do members need to know?" />
            </div>
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <select value={form.priority} onChange={e => set('priority', e.target.value)} className="w-full border border-input rounded-md h-9 px-3 text-sm bg-background">
                <option value="normal">Normal</option>
                <option value="important">Important</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Posted By</Label>
              <Input value={form.posted_by} onChange={e => set('posted_by', e.target.value)} placeholder="e.g. President" />
            </div>
            <div className="space-y-1.5">
              <Label>Expires At (optional)</Label>
              <Input type="date" value={form.expires_at} onChange={e => set('expires_at', e.target.value)} />
            </div>
            <div className="flex items-center gap-2 pt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <div
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${form.published ? 'bg-primary' : 'bg-muted'}`}
                  onClick={() => set('published', !form.published)}
                >
                  <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${form.published ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </div>
                <span className="text-sm">Published (visible to members)</span>
              </label>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button onClick={save} disabled={saving} className="rounded-full gap-1.5">
              <Check className="w-4 h-4" />{saving ? 'Saving...' : 'Save'}
            </Button>
            <Button variant="outline" onClick={cancel} className="rounded-full gap-1.5">
              <X className="w-4 h-4" /> Cancel
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">No announcements yet.</div>
      ) : (
        <div className="space-y-3">
          {items.map(a => {
            const cfg = priorityConfig[a.priority] || priorityConfig.normal;
            const Icon = cfg.icon;
            return (
              <div key={a.id} className={`bg-card rounded-xl border p-4 flex gap-4 items-start ${!a.published ? 'opacity-60' : ''}`}>
                <div className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${cfg.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p className="font-semibold text-sm">{a.title}</p>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${cfg.color}`}>{cfg.label}</span>
                    {!a.published && <span className="text-[10px] bg-muted text-muted-foreground font-bold px-2 py-0.5 rounded-full">Draft</span>}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{a.content}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {a.posted_by && `By ${a.posted_by} · `}
                    {a.created_date && format(new Date(a.created_date), 'MMM d, yyyy')}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Button size="icon" variant="outline" className="w-8 h-8" onClick={() => startEdit(a)}><Pencil className="w-3.5 h-3.5" /></Button>
                  <Button size="icon" variant="outline" className="w-8 h-8 text-destructive hover:bg-destructive/10" onClick={() => del(a.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}