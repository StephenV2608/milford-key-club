import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Save } from 'lucide-react';
import { invalidateSettings } from '../../hooks/useSiteSettings';

const PAGE_SECTIONS = [
  {
    page: 'About',
    fields: [
      { key: 'about_eyebrow', label: 'Eyebrow', default: 'About Us' },
      { key: 'about_heading', label: 'Heading', default: 'Who We Are' },
      { key: 'about_intro', label: 'Intro Paragraph', multiline: true, default: '' },
      { key: 'about_chapter', label: 'Our Chapter Text', multiline: true, rows: 4, default: '' },
      { key: 'about_why', label: 'Why It Matters Text', multiline: true, default: '' },
    ],
  },
  {
    page: 'Projects',
    fields: [
      { key: 'projects_eyebrow', label: 'Eyebrow', default: 'Our Work' },
      { key: 'projects_heading', label: 'Heading', default: 'Service Projects' },
      { key: 'projects_description', label: 'Description', multiline: true, default: "Every project is an opportunity to learn, grow, and give back." },
    ],
  },
  {
    page: 'Events',
    fields: [
      { key: 'events_eyebrow', label: 'Eyebrow', default: "What's Happening" },
      { key: 'events_heading', label: 'Heading', default: 'Upcoming Events' },
      { key: 'events_description', label: 'Description', multiline: true, default: 'Stay up to date with our meetings, service projects, and volunteer opportunities.' },
    ],
  },
  {
    page: 'Officers',
    fields: [
      { key: 'officers_eyebrow', label: 'Eyebrow', default: 'Our Team' },
      { key: 'officers_heading', label: 'Heading', default: 'Meet the Officers' },
      { key: 'officers_description', label: 'Description', multiline: true, default: 'The dedicated students (and advisor) who keep our club running strong.' },
    ],
  },
  {
    page: 'Gallery',
    fields: [
      { key: 'gallery_eyebrow', label: 'Eyebrow', default: 'Photo Gallery' },
      { key: 'gallery_heading', label: 'Heading', default: 'Moments That Matter' },
      { key: 'gallery_description', label: 'Description', multiline: true, default: "A look at our members in action — serving, leading, and having fun along the way." },
    ],
  },
  {
    page: 'Join Us',
    fields: [
      { key: 'join_eyebrow', label: 'Eyebrow', default: 'Get Involved' },
      { key: 'join_heading', label: 'Heading', default: 'Join Milford Key Club' },
      { key: 'join_description', label: 'Description', multiline: true, default: "Ready to make a difference? Here's everything you need to know about becoming a member." },
      { key: 'join_form_url', label: 'Sign-Up Form URL', default: '/contact' },
    ],
  },
  {
    page: 'Contact',
    fields: [
      { key: 'contact_eyebrow', label: 'Eyebrow', default: 'Reach Out' },
      { key: 'contact_heading', label: 'Heading', default: 'Contact Us' },
      { key: 'contact_description', label: 'Description', multiline: true, default: "Have a question or want to collaborate? We'd love to hear from you." },
    ],
  },
];

export default function PageTextsTab() {
  const [form, setForm] = useState(null);
  const [settingsId, setSettingsId] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    base44.entities.SiteSettings.list().then(list => {
      const s = list[0];
      if (s) { setForm(s); setSettingsId(s.id); }
      else setForm({});
    });
  }, []);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const save = async () => {
    setSaving(true);
    if (settingsId) await base44.entities.SiteSettings.update(settingsId, form);
    else { const c = await base44.entities.SiteSettings.create(form); setSettingsId(c.id); }
    invalidateSettings();
    setSaving(false);
    toast.success('Page texts saved!');
  };

  if (!form) return <div className="py-12 text-center text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6">
      {PAGE_SECTIONS.map(({ page, fields }) => (
        <div key={page} className="bg-card rounded-xl border border-border p-5 md:p-6">
          <h3 className="font-heading font-semibold text-base mb-4">{page} Page</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {fields.map(({ key, label, multiline, rows = 2 }) => (
              <div key={key} className={multiline && rows >= 3 ? 'sm:col-span-2' : ''}>
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</Label>
                {multiline
                  ? <Textarea value={form[key] || ''} onChange={e => set(key, e.target.value)} rows={rows} className="mt-1" />
                  : <Input value={form[key] || ''} onChange={e => set(key, e.target.value)} className="mt-1" />
                }
              </div>
            ))}
          </div>
        </div>
      ))}
      <Button onClick={save} disabled={saving} className="gap-2 rounded-full px-8">
        <Save className="w-4 h-4" />{saving ? 'Saving...' : 'Save Page Texts'}
      </Button>
    </div>
  );
}