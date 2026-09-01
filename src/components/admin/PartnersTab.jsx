import { useEffect, useState } from 'react';
import FormSelect from '@/components/ui/form-select';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Trash2, Edit2, Check, X, Handshake, Star, Upload } from 'lucide-react';

const CATEGORIES = ['Nonprofit', 'School', 'Business', 'Kiwanis', 'Community Group', 'Other'];

export default function PartnersTab() {
  const [partners, setPartners] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});

  useEffect(() => { load(); }, []);
  const load = () => base44.entities.Partner.list('order').then(setPartners);

  const startNew = () => { setEditing('new'); setForm({ active: true, featured: false, category: 'Nonprofit' }); };
  const startEdit = (p) => { setEditing(p.id); setForm(p); };
  const cancel = () => { setEditing(null); setForm({}); };
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const save = async () => {
    if (!form.name) { toast.error('Name is required.'); return; }
    if (editing === 'new') await base44.entities.Partner.create(form);
    else await base44.entities.Partner.update(editing, form);
    toast.success('Saved!');
    cancel();
    load();
  };
  const del = async (p) => {
    if (!confirm(`Delete "${p.name}"?`)) return;
    await base44.entities.Partner.delete(p.id);
    toast.success('Deleted');
    load();
  };
  const uploadLogo = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    set('logo_url', file_url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading font-bold text-xl mb-1 flex items-center gap-2">
          <Handshake className="w-5 h-5 text-primary" /> Partner Organizations
        </h2>
        <p className="text-sm text-muted-foreground">Manage the partners shown on the public Partners page.</p>
      </div>

      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">{partners.length} partner{partners.length !== 1 ? 's' : ''}</p>
          <Button size="sm" onClick={startNew} className="gap-1.5"><Plus className="w-4 h-4" />Add Partner</Button>
        </div>

        {editing === 'new' && <PartnerForm form={form} set={set} onSave={save} onCancel={cancel} onUpload={uploadLogo} />}

        <div className="space-y-2">
          {partners.map(p => (
            <div key={p.id}>
              {editing === p.id ? (
                <PartnerForm form={form} set={set} onSave={save} onCancel={cancel} onUpload={uploadLogo} />
              ) : (
                <div className="flex items-center gap-3 bg-muted/40 rounded-lg px-4 py-3">
                  <div className="w-10 h-10 rounded-lg bg-background border border-border overflow-hidden shrink-0 flex items-center justify-center">
                    {p.logo_url
                      ? <img src={p.logo_url} alt={p.name} className="w-full h-full object-contain p-1" />
                      : <Handshake className="w-5 h-5 text-muted-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{p.name}</span>
                      {p.featured && <span className="text-[10px] bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><Star className="w-2.5 h-2.5" />Featured</span>}
                      {p.category && <span className="text-[10px] bg-muted text-muted-foreground font-bold px-2 py-0.5 rounded-full">{p.category}</span>}
                      {!p.active && <span className="text-[10px] bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full">Hidden</span>}
                    </div>
                    {p.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{p.description}</p>}
                  </div>
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => startEdit(p)}><Edit2 className="w-3.5 h-3.5" /></Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => del(p)}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              )}
            </div>
          ))}
          {partners.length === 0 && editing !== 'new' && <p className="text-sm text-muted-foreground text-center py-6">No partners yet.</p>}
        </div>
      </div>
    </div>
  );
}

function PartnerForm({ form, set, onSave, onCancel, onUpload }) {
  return (
    <div className="bg-accent/30 rounded-xl border border-primary/20 p-4 space-y-3 mb-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Name *</Label>
          <Input className="mt-1" value={form.name || ''} onChange={e => set('name', e.target.value)} placeholder="e.g. Milford Food Bank" />
        </div>
        <div>
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Category</Label>
          <FormSelect className="mt-1 w-full" placeholder="— Select —" value={form.category || ''} onChange={v => set('category', v)} options={CATEGORIES.map(c => ({ value: c, label: c }))} />
        </div>
        <div className="sm:col-span-2">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Description</Label>
          <Textarea rows={2} className="mt-1" value={form.description || ''} onChange={e => set('description', e.target.value)} placeholder="Short description of the partner…" />
        </div>
        <div>
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Website URL</Label>
          <Input className="mt-1" value={form.website_url || ''} onChange={e => set('website_url', e.target.value)} placeholder="https://…" />
        </div>
        <div>
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Display Order</Label>
          <Input type="number" className="mt-1" value={form.order || ''} onChange={e => set('order', e.target.value ? Number(e.target.value) : '')} placeholder="0" />
        </div>
        <div className="sm:col-span-2">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Logo</Label>
          <div className="flex items-center gap-3 mt-1">
            {form.logo_url && <img src={form.logo_url} alt="Logo" className="w-12 h-12 rounded object-contain bg-background border border-border p-1" />}
            <label className="cursor-pointer inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
              <Upload className="w-3.5 h-3.5" /> {form.logo_url ? 'Change' : 'Upload'} Logo
              <input type="file" accept="image/*" className="hidden" onChange={onUpload} />
            </label>
            {form.logo_url && <button onClick={() => set('logo_url', '')} className="text-xs text-muted-foreground hover:text-destructive">Remove</button>}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4 pt-1">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={form.featured || false} onChange={e => set('featured', e.target.checked)} /> Featured
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={form.active !== false} onChange={e => set('active', e.target.checked)} /> Active / Visible
        </label>
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={onSave} className="gap-1.5"><Check className="w-3.5 h-3.5" />Save</Button>
        <Button size="sm" variant="ghost" onClick={onCancel} className="gap-1.5"><X className="w-3.5 h-3.5" />Cancel</Button>
      </div>
    </div>
  );
}