import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Trash2, Edit2, Check, X, Upload, Images } from 'lucide-react';
import ImageInput from '../shared/ImageInput';

const CATEGORIES = ['Service', 'Projects', 'Meetings', 'Events'];

export default function GalleryTab() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [massUploading, setMassUploading] = useState(false);
  const [massCategory, setMassCategory] = useState('Service');
  const [massProgress, setMassProgress] = useState('');
  const massFileRef = useRef();

  useEffect(() => { load(); }, []);
  const load = () => base44.entities.GalleryImage.list('order').then(setItems);
  const startEdit = (item) => { setEditing(item.id); setForm(item); };
  const startNew = () => { setEditing('new'); setForm({ category: 'Service', order: items.length + 1 }); };
  const cancel = () => { setEditing(null); setForm({}); };
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleMassUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setMassUploading(true);
    let done = 0;
    for (const file of files) {
      setMassProgress(`Uploading ${done + 1} / ${files.length}...`);
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.entities.GalleryImage.create({ image_url: file_url, alt_text: file.name.replace(/\.[^.]+$/, ''), category: massCategory, order: items.length + done + 1 });
      done++;
    }
    setMassUploading(false);
    setMassProgress('');
    toast.success(`${done} image${done !== 1 ? 's' : ''} uploaded!`);
    load();
    e.target.value = '';
  };

  const save = async () => {
    if (editing === 'new') await base44.entities.GalleryImage.create(form);
    else await base44.entities.GalleryImage.update(editing, form);
    toast.success('Saved!'); cancel(); load();
  };

  const del = async (id) => { await base44.entities.GalleryImage.delete(id); toast.success('Deleted'); load(); };

  return (
    <div className="space-y-6">
      {/* Mass Upload */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-heading font-semibold text-base mb-3 flex items-center gap-2"><Images className="w-4 h-4 text-primary" />Mass Upload</h3>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Category for all uploaded images</Label>
            <select className="mt-1 w-full border border-input rounded-md h-9 px-3 text-sm bg-background" value={massCategory} onChange={e => setMassCategory(e.target.value)}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <input ref={massFileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleMassUpload} />
            <Button variant="outline" onClick={() => massFileRef.current.click()} disabled={massUploading} className="gap-2 h-9">
              <Upload className="w-4 h-4" />{massUploading ? massProgress : 'Select Multiple Images'}
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">Select multiple files at once — they'll all be uploaded under the chosen category.</p>
      </div>

      {/* Individual Add */}
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-heading font-semibold text-base">Gallery Images ({items.length})</h3>
          <Button size="sm" onClick={startNew} className="gap-1.5"><Plus className="w-4 h-4" />Add Single</Button>
        </div>

        {editing === 'new' && (
          <div className="bg-accent/30 rounded-xl border border-primary/20 p-4 space-y-3 mb-4">
            <ImageInput value={form.image_url} onChange={v => set('image_url', v)} />
            <div className="grid sm:grid-cols-2 gap-3">
              <div><Label className="text-xs uppercase tracking-wide text-muted-foreground">Caption</Label><Input value={form.alt_text || ''} onChange={e => set('alt_text', e.target.value)} className="mt-1" placeholder="Caption..." /></div>
              <div>
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Category</Label>
                <select value={form.category || 'Service'} onChange={e => set('category', e.target.value)} className="mt-1 w-full border border-input rounded-md h-9 px-3 text-sm bg-background">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={save} className="gap-1.5"><Check className="w-3.5 h-3.5" />Save</Button>
              <Button size="sm" variant="ghost" onClick={cancel} className="gap-1.5"><X className="w-3.5 h-3.5" />Cancel</Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {items.map(item => (
            <div key={item.id} className="relative group rounded-xl overflow-hidden aspect-square border border-border">
              {editing === item.id ? (
                <div className="bg-card p-3 h-full overflow-auto space-y-2">
                  <ImageInput value={form.image_url} onChange={v => set('image_url', v)} size="sm" />
                  <Input value={form.alt_text || ''} onChange={e => set('alt_text', e.target.value)} placeholder="Caption" className="h-7 text-xs" />
                  <select value={form.category || 'Service'} onChange={e => set('category', e.target.value)} className="w-full border border-input rounded h-7 px-2 text-xs bg-background">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <div className="flex gap-1">
                    <Button size="sm" onClick={save} className="gap-1 h-7 text-xs"><Check className="w-3 h-3" />Save</Button>
                    <Button size="sm" variant="ghost" onClick={cancel} className="h-7 text-xs"><X className="w-3 h-3" /></Button>
                  </div>
                </div>
              ) : (
                <>
                  <img src={item.image_url} alt={item.alt_text} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button size="icon" variant="secondary" className="h-8 w-8" onClick={() => startEdit(item)}><Edit2 className="w-3.5 h-3.5" /></Button>
                    <Button size="icon" variant="destructive" className="h-8 w-8" onClick={() => del(item.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                  <span className="absolute bottom-2 left-2 text-[10px] bg-black/50 text-white px-2 py-0.5 rounded-full">{item.category}</span>
                </>
              )}
            </div>
          ))}
        </div>
        {!items.length && <p className="text-center py-8 text-sm text-muted-foreground">No images yet.</p>}
      </div>
    </div>
  );
}