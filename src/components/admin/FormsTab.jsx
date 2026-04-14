import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Trash2, Upload, FileText, ExternalLink } from 'lucide-react';

export default function FormsTab() {
  const [forms, setForms] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [name, setName] = useState('');
  const fileRef = useRef();

  useEffect(() => { load(); }, []);

  const load = () => {
    base44.entities.ClubForm.list('-created_date').then(setForms);
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!name.trim()) {
      toast.error('Please enter a name for this form first.');
      return;
    }
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await base44.entities.ClubForm.create({ name: name.trim(), file_url, file_name: file.name });
    toast.success('Form uploaded!');
    setName('');
    setUploading(false);
    load();
    e.target.value = '';
  };

  const del = async (id) => {
    await base44.entities.ClubForm.delete(id);
    toast.success('Deleted');
    load();
  };

  return (
    <div className="space-y-6">
      {/* Upload */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-heading font-semibold text-base mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4 text-primary" /> Upload New Form
        </h3>
        <div className="space-y-3">
          <div>
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Form Name</Label>
            <Input
              className="mt-1"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Service Hours Log, Permission Slip..."
            />
          </div>
          <div>
            <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" className="hidden" onChange={handleUpload} />
            <Button
              variant="outline"
              onClick={() => fileRef.current.click()}
              disabled={uploading}
              className="gap-2"
            >
              <Upload className="w-4 h-4" />
              {uploading ? 'Uploading...' : 'Choose File (PDF, Word, Image)'}
            </Button>
            <p className="text-xs text-muted-foreground mt-1.5">Enter a name above, then click to choose a file.</p>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-heading font-semibold text-base mb-4 flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" /> Uploaded Forms ({forms.length})
        </h3>
        <div className="space-y-2">
          {forms.map(f => (
            <div key={f.id} className="flex items-center gap-3 bg-muted/40 rounded-lg px-4 py-3">
              <FileText className="w-5 h-5 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{f.name}</p>
                {f.file_name && <p className="text-xs text-muted-foreground truncate">{f.file_name}</p>}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <a href={f.file_url} target="_blank" rel="noreferrer">
                  <Button size="icon" variant="ghost" className="h-8 w-8">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Button>
                </a>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => del(f.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
          {!forms.length && (
            <p className="text-center py-8 text-sm text-muted-foreground">No forms uploaded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}