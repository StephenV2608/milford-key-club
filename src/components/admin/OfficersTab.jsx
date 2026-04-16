import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Trash2, Edit2, Check, X, Upload, Archive } from 'lucide-react';

export default function OfficersTab() {
  const [officers, setOfficers] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  useEffect(() => { load(); }, []);
  const load = () => base44.entities.Officer.list('order').then(setOfficers);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const startNew = () => { setEditing('new'); setForm({ archived: false, order: officers.length + 1 }); };
  const startEdit = (o) => { setEditing(o.id); setForm(o); };
  const cancel = () => { setEditing(null); setForm({}); };

  const save = async () => {
    if (!form.name || !form.role) { toast.error('Name and role are required.'); return; }
    if (editing === 'new') await base44.entities.Officer.create(form);
    else await base44.entities.Officer.update(editing, form);
    toast.success('Saved!'); cancel(); load();
  };

  const del = async (id) => { await base44.entities.Officer.delete(id); toast.success('Deleted'); load(); };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    set('photo_url', file_url);
    setUploading(false);
    e.target.value = '';
  };

  const active = officers.filter(o => !o.archived);
  const past = officers.filter(o => o.archived);

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-heading font-semibold text-base">Current Officers</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{active.length} active officers</p>
          </div>
          <Button size="sm" onClick={startNew} className="gap-1.5"><Plus className="w-4 h-4" />Add Officer</Button>
        </div>

        {editing === 'new' && (
          <OfficerForm form={form} set={set} onSave={save} onCancel={cancel} uploading={uploading} fileRef={fileRef} onUpload={handlePhotoUpload} />
        )}

        <div className="space-y-2 mt-2">
          {active.map(o => (
            <div key={o.id}>
              {editing === o.id ? (
                <OfficerForm form={form} set={set} onSave={save} onCancel={cancel} uploading={uploading} fileRef={fileRef} onUpload={handlePhotoUpload} />
              ) : (
                <OfficerRow officer={o} onEdit={startEdit} onDelete={del} />
              )}
            </div>
          ))}
          {!active.length && editing !== 'new' && <p className="text-center py-8 text-sm text-muted-foreground">No active officers yet.</p>}
        </div>
      </div>

      {past.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-heading font-semibold text-base mb-4 flex items-center gap-2">
            <Archive className="w-4 h-4 text-muted-foreground" /> Past Officers ({past.length})
          </h3>
          <div className="space-y-2">
            {past.map(o => (
              <div key={o.id}>
                {editing === o.id ? (
                  <OfficerForm form={form} set={set} onSave={save} onCancel={cancel} uploading={uploading} fileRef={fileRef} onUpload={handlePhotoUpload} />
                ) : (
                  <OfficerRow officer={o} onEdit={startEdit} onDelete={del} faded />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function OfficerRow({ officer, onEdit, onDelete, faded }) {
  return (
    <div className={`flex items-center gap-3 bg-muted/40 rounded-lg px-4 py-3 ${faded ? 'opacity-60' : ''}`}>
      {officer.photo_url ? (
        <img src={officer.photo_url} alt={officer.name} className="w-9 h-9 rounded-full object-cover shrink-0" />
      ) : (
        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-xs font-bold text-primary">
          {officer.name?.charAt(0)}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm">{officer.name}</span>
          <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full">{officer.role}</span>
          {officer.archived && officer.year && (
            <span className="text-[10px] bg-muted text-muted-foreground font-bold px-2 py-0.5 rounded-full">{officer.year}</span>
          )}
        </div>
        {officer.fun_fact && <p className="text-xs text-muted-foreground truncate mt-0.5">{officer.fun_fact}</p>}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onEdit(officer)}><Edit2 className="w-3.5 h-3.5" /></Button>
        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => onDelete(officer.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
      </div>
    </div>
  );
}

function OfficerForm({ form, set, onSave, onCancel, uploading, fileRef, onUpload }) {
  return (
    <div className="bg-accent/30 rounded-xl border border-primary/20 p-4 space-y-3 mb-3">
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onUpload} />
      <div className="grid sm:grid-cols-2 gap-3">
        <div><Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Name *</Label><Input className="mt-1" value={form.name || ''} onChange={e => set('name', e.target.value)} placeholder="Jane Doe" /></div>
        <div><Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Role *</Label><Input className="mt-1" value={form.role || ''} onChange={e => set('role', e.target.value)} placeholder="President" /></div>
        <div><Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Fun Fact / Bio</Label><Input className="mt-1" value={form.fun_fact || ''} onChange={e => set('fun_fact', e.target.value)} placeholder="Loves hiking..." /></div>
        <div><Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Display Order</Label><Input className="mt-1" type="number" value={form.order || ''} onChange={e => set('order', Number(e.target.value))} placeholder="1" /></div>
      </div>
      <div className="flex items-center gap-3">
        <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => fileRef.current.click()} disabled={uploading}>
          <Upload className="w-3.5 h-3.5" />{uploading ? 'Uploading...' : 'Upload Photo'}
        </Button>
        {form.photo_url && <img src={form.photo_url} alt="Preview" className="w-10 h-10 rounded-full object-cover border border-border" />}
      </div>
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={!!form.archived} onChange={e => set('archived', e.target.checked)} />
          Past Officer (Archived)
        </label>
        {form.archived && (
          <Input value={form.year || ''} onChange={e => set('year', e.target.value)} placeholder="e.g. 2024-2025" className="h-8 w-36 text-sm" />
        )}
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={onSave} className="gap-1.5"><Check className="w-3.5 h-3.5" />Save</Button>
        <Button size="sm" variant="ghost" onClick={onCancel} className="gap-1.5"><X className="w-3.5 h-3.5" />Cancel</Button>
      </div>
    </div>
  );
}