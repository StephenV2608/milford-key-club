import { useState, useEffect, useRef } from 'react';
import FormSelect from '@/components/ui/form-select';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Trash2, Upload, FileText, ExternalLink, Edit2, Check, X } from 'lucide-react';

const CATEGORIES = ['Guides', 'Templates', 'Documents', 'Forms', 'Other'];

const CATEGORY_COLORS = {
  Guides: 'bg-blue-100 text-blue-700',
  Templates: 'bg-purple-100 text-purple-700',
  Documents: 'bg-green-100 text-green-700',
  Forms: 'bg-orange-100 text-orange-700',
  Other: 'bg-gray-100 text-gray-700',
};

export default function ResourcesTab() {
  const [resources, setResources] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', category: 'Guides' });
  const fileRef = useRef();

  useEffect(() => { load(); }, []);
  const load = () => base44.entities.Resource.list('order').then(setResources);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!form.title.trim()) { toast.error('Please enter a title first.'); return; }
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await base44.entities.Resource.create({
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      file_url,
      file_name: file.name,
      order: resources.length + 1,
    });
    toast.success('Resource uploaded!');
    setForm({ title: '', description: '', category: 'Guides' });
    setUploading(false);
    load();
    e.target.value = '';
  };

  const startEdit = (r) => { setEditing(r.id); setForm({ title: r.title, description: r.description || '', category: r.category }); };
  const cancelEdit = () => { setEditing(null); setForm({ title: '', description: '', category: 'Guides' }); };

  const saveEdit = async () => {
    await base44.entities.Resource.update(editing, { title: form.title, description: form.description, category: form.category });
    toast.success('Updated!');
    cancelEdit();
    load();
  };

  const del = async (id) => { await base44.entities.Resource.delete(id); toast.success('Deleted'); load(); };

  return (
    <div className="space-y-6">
      {/* Upload */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-heading font-semibold text-base mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4 text-primary" /> Upload New Resource
        </h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Title *</Label>
            <Input className="mt-1" value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Service Hours Guide" />
          </div>
          <div>
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Category</Label>
            <FormSelect className="mt-1 w-full" value={form.category} onChange={v => set('category', v)} options={CATEGORIES.map(c => ({ value: c, label: c }))} />
          </div>
          <div className="sm:col-span-2">
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Description (optional)</Label>
            <Input className="mt-1" value={form.description} onChange={e => set('description', e.target.value)} placeholder="Brief description of this resource..." />
          </div>
        </div>
        <div className="mt-3">
          <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.zip" className="hidden" onChange={handleUpload} />
          <Button variant="outline" onClick={() => fileRef.current.click()} disabled={uploading} className="gap-2">
            <Upload className="w-4 h-4" />
            {uploading ? 'Uploading...' : 'Choose File'}
          </Button>
          <p className="text-xs text-muted-foreground mt-1.5">PDF, Word, Excel, PowerPoint, images, or ZIP</p>
        </div>
      </div>

      {/* List grouped by category */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-heading font-semibold text-base mb-4 flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" /> All Resources ({resources.length})
        </h3>
        {CATEGORIES.map(cat => {
          const items = resources.filter(r => r.category === cat);
          if (!items.length) return null;
          return (
            <div key={cat} className="mb-5">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">{cat}</p>
              <div className="space-y-2">
                {items.map(r => (
                  <div key={r.id}>
                    {editing === r.id ? (
                      <div className="bg-accent/30 rounded-lg border border-primary/20 p-3 space-y-2">
                        <div className="grid sm:grid-cols-2 gap-2">
                          <Input value={form.title} onChange={e => set('title', e.target.value)} placeholder="Title" className="h-8 text-sm" />
                          <FormSelect className="w-full" value={form.category} onChange={v => set('category', v)} options={CATEGORIES.map(c => ({ value: c, label: c }))} />
                          <Input value={form.description} onChange={e => set('description', e.target.value)} placeholder="Description" className="h-8 text-sm sm:col-span-2" />
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={saveEdit} className="gap-1"><Check className="w-3 h-3" />Save</Button>
                          <Button size="sm" variant="ghost" onClick={cancelEdit} className="gap-1"><X className="w-3 h-3" />Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 bg-muted/40 rounded-lg px-4 py-3">
                        <FileText className="w-4 h-4 text-primary shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-sm">{r.title}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[r.category] || CATEGORY_COLORS.Other}`}>{r.category}</span>
                          </div>
                          {r.description && <p className="text-xs text-muted-foreground truncate">{r.description}</p>}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <a href={r.file_url} target="_blank" rel="noreferrer">
                            <Button size="icon" variant="ghost" className="h-8 w-8"><ExternalLink className="w-3.5 h-3.5" /></Button>
                          </a>
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => startEdit(r)}><Edit2 className="w-3.5 h-3.5" /></Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => del(r.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        {!resources.length && <p className="text-center py-8 text-sm text-muted-foreground">No resources uploaded yet.</p>}
      </div>
    </div>
  );
}