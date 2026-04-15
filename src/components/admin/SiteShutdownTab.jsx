import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { invalidateSettings } from '../../hooks/useSiteSettings';
import { AlertTriangle, Power, PowerOff, Upload } from 'lucide-react';

export default function SiteShutdownTab() {
  const [form, setForm] = useState(null);
  const [settingsId, setSettingsId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    base44.entities.SiteSettings.list().then(list => {
      const s = list[0];
      if (s) { setForm(s); setSettingsId(s.id); }
      else setForm({ site_closed: false, site_closed_message: '' });
    });
  }, []);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    set('logo_url', file_url);
    setUploading(false);
    toast.success('Logo uploaded!');
  };

  const save = async () => {
    setSaving(true);
    if (settingsId) await base44.entities.SiteSettings.update(settingsId, form);
    else { const c = await base44.entities.SiteSettings.create(form); setSettingsId(c.id); }
    invalidateSettings();
    setSaving(false);
    toast.success(form.site_closed ? 'Site is now CLOSED.' : 'Site is now OPEN.');
  };

  if (!form) return <div className="py-12 text-center text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className={`rounded-xl border p-5 ${form.site_closed ? 'bg-destructive/5 border-destructive/30' : 'bg-green-50 border-green-200'}`}>
        <div className="flex items-center gap-3">
          {form.site_closed
            ? <PowerOff className="w-6 h-6 text-destructive shrink-0" />
            : <Power className="w-6 h-6 text-green-600 shrink-0" />
          }
          <div>
            <p className="font-semibold text-sm">Site is currently <strong>{form.site_closed ? 'CLOSED' : 'OPEN'}</strong></p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {form.site_closed ? 'Visitors see the maintenance page. Only you can access the admin.' : 'The site is live and accessible to all visitors.'}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-5 space-y-5">
        <h3 className="font-heading font-semibold text-base flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" /> Maintenance Mode
        </h3>

        <label className="flex items-center gap-3 cursor-pointer">
          <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.site_closed ? 'bg-destructive' : 'bg-muted'}`} onClick={() => set('site_closed', !form.site_closed)}>
            <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${form.site_closed ? 'translate-x-6' : 'translate-x-1'}`} />
          </div>
          <span className="text-sm font-medium">{form.site_closed ? 'Close Site (Maintenance Mode ON)' : 'Site is Open — toggle to close'}</span>
        </label>

        <div>
          <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Maintenance Message</Label>
          <Textarea
            className="mt-1"
            rows={4}
            value={form.site_closed_message || ''}
            onChange={e => set('site_closed_message', e.target.value)}
            placeholder="We're currently performing scheduled maintenance. We'll be back shortly. Thank you for your patience!"
          />
          <p className="text-xs text-muted-foreground mt-1">This message is shown to visitors when the site is closed.</p>
        </div>

        <div>
          <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Logo on Maintenance Page</Label>
          <div className="flex items-center gap-4 mt-2">
            <div className="w-16 h-16 rounded-xl border-2 border-dashed border-border flex items-center justify-center bg-muted overflow-hidden">
              {form.logo_url ? <img src={form.logo_url} alt="Logo" className="w-full h-full object-contain p-1" /> : <span className="text-xs text-muted-foreground">No logo</span>}
            </div>
            <div>
              <Button variant="outline" size="sm" onClick={() => fileRef.current.click()} disabled={uploading} className="gap-1.5">
                <Upload className="w-3.5 h-3.5" />{uploading ? 'Uploading...' : 'Upload Logo'}
              </Button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
              <p className="text-xs text-muted-foreground mt-1">This is the same logo used across the whole site.</p>
            </div>
          </div>
        </div>

        <Button onClick={save} disabled={saving} className={`gap-2 rounded-full px-8 ${form.site_closed ? 'bg-destructive hover:bg-destructive/90' : ''}`}>
          {saving ? 'Saving...' : form.site_closed ? 'Close Site' : 'Save Settings'}
        </Button>
      </div>

      {form.site_closed && (
        <div className="bg-card rounded-xl border border-border p-5">
          <h4 className="font-semibold text-sm mb-3">Preview of Maintenance Page</h4>
          <div className="rounded-xl bg-slate-900 p-8 text-center text-white space-y-4">
            {form.logo_url && <img src={form.logo_url} alt="Logo" className="h-16 w-16 object-contain mx-auto rounded-xl" />}
            <h2 className="text-2xl font-bold">{form.site_name || 'Milford Key Club'}</h2>
            <p className="text-slate-300 text-sm max-w-sm mx-auto">{form.site_closed_message || "We're under maintenance. Be back soon!"}</p>
          </div>
        </div>
      )}
    </div>
  );
}