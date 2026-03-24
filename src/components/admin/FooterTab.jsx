import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Save, Plus, Trash2, GripVertical } from 'lucide-react';
import { invalidateSettings } from '../../hooks/useSiteSettings';

const DEFAULT_LINKS = [
  { label: 'About', path: '/about' },
  { label: 'Projects', path: '/projects' },
  { label: 'Events', path: '/events' },
  { label: 'Officers', path: '/officers' },
  { label: 'Gallery', path: '/gallery' },
  { label: 'Join Us', path: '/join' },
];

export default function FooterTab() {
  const [links, setLinks] = useState(DEFAULT_LINKS);
  const [footerTagline, setFooterTagline] = useState('');
  const [settingsId, setSettingsId] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    base44.entities.SiteSettings.list().then(list => {
      const s = list[0];
      if (s) {
        setSettingsId(s.id);
        setFooterTagline(s.footer_tagline || '');
        if (s.footer_links) {
          setLinks(JSON.parse(s.footer_links));
        }
      }
    });
  }, []);

  const addLink = () => setLinks(l => [...l, { label: '', path: '' }]);
  const removeLink = (i) => setLinks(l => l.filter((_, idx) => idx !== i));
  const updateLink = (i, field, value) => setLinks(l => l.map((item, idx) => idx === i ? { ...item, [field]: value } : item));

  const save = async () => {
    setSaving(true);
    const data = { footer_links: JSON.stringify(links), footer_tagline: footerTagline };
    if (settingsId) await base44.entities.SiteSettings.update(settingsId, data);
    else { const c = await base44.entities.SiteSettings.create(data); setSettingsId(c.id); }
    invalidateSettings();
    setSaving(false);
    toast.success('Footer saved!');
  };

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl border border-border p-5 md:p-6">
        <h3 className="font-heading font-semibold text-base mb-4">Footer Tagline</h3>
        <Input
          value={footerTagline}
          onChange={e => setFooterTagline(e.target.value)}
          placeholder="A student-led organization dedicated to serving our community..."
        />
      </div>

      <div className="bg-card rounded-xl border border-border p-5 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-semibold text-base">Quick Links</h3>
          <Button size="sm" variant="outline" onClick={addLink} className="gap-1.5">
            <Plus className="w-3.5 h-3.5" />Add Link
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mb-4">These appear in the "Quick Links" column of the footer. Use full paths like <code className="bg-muted px-1 py-0.5 rounded">/about</code> or full URLs like <code className="bg-muted px-1 py-0.5 rounded">https://...</code></p>

        <div className="space-y-3">
          {links.map((link, i) => (
            <div key={i} className="flex items-center gap-3">
              <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />
              <div className="flex-1 grid grid-cols-2 gap-2">
                <Input
                  placeholder="Label (e.g. About)"
                  value={link.label}
                  onChange={e => updateLink(i, 'label', e.target.value)}
                />
                <Input
                  placeholder="Path (e.g. /about)"
                  value={link.path}
                  onChange={e => updateLink(i, 'path', e.target.value)}
                />
              </div>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive shrink-0" onClick={() => removeLink(i)}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <Button onClick={save} disabled={saving} className="gap-2 rounded-full px-8">
        <Save className="w-4 h-4" />{saving ? 'Saving...' : 'Save Footer'}
      </Button>
    </div>
  );
}