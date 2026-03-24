import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Trash2, Edit2, Check, X, ExternalLink } from 'lucide-react';

export default function CustomPagesTab() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});

  useEffect(() => { load(); }, []);
  const load = () => base44.entities.CustomPage.list('order').then(setItems);

  const startNew = () => { setEditing('new'); setForm({ show_in_nav: false, show_in_footer: false, order: items.length + 1 }); };
  const startEdit = (item) => { setEditing(item.id); setForm(item); };
  const cancel = () => { setEditing(null); setForm({}); };
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const save = async () => {
    if (!form.title || !form.slug) { toast.error('Title and Slug are required'); return; }
    const cleanSlug = form.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const data = { ...form, slug: cleanSlug };
    if (editing === 'new') await base44.entities.CustomPage.create(data);
    else await base44.entities.CustomPage.update(editing, data);
    toast.success('Saved!'); cancel(); load();
  };

  const del = async (id) => { await base44.entities.CustomPage.delete(id); toast.success('Deleted'); load(); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{items.length} custom page{items.length !== 1 ? 's' : ''}</p>
        <Button size="sm" onClick={startNew} className="gap-1.5"><Plus className="w-4 h-4" />New Page</Button>
      </div>

      {editing === 'new' && <PageForm form={form} set={set} onSave={save} onCancel={cancel} />}

      <div className="space-y-3">
        {items.map(item => (
          <div key={item.id}>
            {editing === item.id ? (
              <PageForm form={form} set={set} onSave={save} onCancel={cancel} />
            ) : (
              <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-sm">{item.title}</p>
                    <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded font-mono">/pages/{item.slug}</span>
                    {item.show_in_nav && <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded-full">Nav</span>}
                    {item.show_in_footer && <span className="text-[10px] font-bold uppercase tracking-wider bg-secondary/10 text-secondary px-2 py-0.5 rounded-full">Footer</span>}
                  </div>
                  {item.description && <p className="text-xs text-muted-foreground mt-0.5 truncate">{item.description}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a href={`/pages/${item.slug}`} target="_blank" rel="noreferrer">
                    <Button size="icon" variant="ghost" className="h-8 w-8"><ExternalLink className="w-3.5 h-3.5" /></Button>
                  </a>
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => startEdit(item)}><Edit2 className="w-3.5 h-3.5" /></Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => del(item.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {items.length === 0 && editing !== 'new' && (
        <div className="text-center py-12 text-muted-foreground text-sm">
          No custom pages yet. Click "New Page" to create one.
        </div>
      )}
    </div>
  );
}

function PageForm({ form, set, onSave, onCancel }) {
  return (
    <div className="bg-accent/30 rounded-xl border border-primary/20 p-5 space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Page Title *</Label>
          <Input value={form.title || ''} onChange={e => set('title', e.target.value)} className="mt-1" placeholder="Resources" />
        </div>
        <div>
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">URL Slug * (e.g. "resources" → /pages/resources)</Label>
          <Input value={form.slug || ''} onChange={e => set('slug', e.target.value)} className="mt-1" placeholder="resources" />
        </div>
        <div>
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Eyebrow Text</Label>
          <Input value={form.eyebrow || ''} onChange={e => set('eyebrow', e.target.value)} className="mt-1" placeholder="Helpful Links" />
        </div>
        <div>
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Display Order</Label>
          <Input type="number" value={form.order || ''} onChange={e => set('order', Number(e.target.value))} className="mt-1" />
        </div>
        <div className="sm:col-span-2">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Page Description / Subtitle</Label>
          <Input value={form.description || ''} onChange={e => set('description', e.target.value)} className="mt-1" />
        </div>
        <div className="sm:col-span-2">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Page Content (Markdown supported)</Label>
          <Textarea value={form.content || ''} onChange={e => set('content', e.target.value)} rows={8} className="mt-1 font-mono text-sm" placeholder="# Heading&#10;&#10;Write your content here using **Markdown**." />
        </div>
      </div>
      <div className="flex gap-4">
        <label className="flex items-center gap-2 cursor-pointer text-sm">
          <input type="checkbox" checked={!!form.show_in_nav} onChange={e => set('show_in_nav', e.target.checked)} className="rounded" />
          Show in Navigation Bar
        </label>
        <label className="flex items-center gap-2 cursor-pointer text-sm">
          <input type="checkbox" checked={!!form.show_in_footer} onChange={e => set('show_in_footer', e.target.checked)} className="rounded" />
          Show in Footer Quick Links
        </label>
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={onSave} className="gap-1.5"><Check className="w-3.5 h-3.5" />Save Page</Button>
        <Button size="sm" variant="ghost" onClick={onCancel} className="gap-1.5"><X className="w-3.5 h-3.5" />Cancel</Button>
      </div>
    </div>
  );
}