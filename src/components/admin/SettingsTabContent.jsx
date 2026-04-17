import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { invalidateSettings } from '../../hooks/useSiteSettings';
import SettingsSection from './SettingsSection';
import {
  Globe, Image, Info, Briefcase, Calendar, Users, Camera, UserPlus,
  Mail, Instagram, Twitter, Facebook, Upload, Eye, EyeOff, Navigation, Link2, Copy, Check
} from 'lucide-react';
import { useState as useLocalState } from 'react';

function DriveConverter() {
  const [input, setInput] = useLocalState('');
  const [result, setResult] = useLocalState('');
  const [copied, setCopied] = useLocalState(false);

  const convert = () => {
    const match = input.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (!match) { setResult('❌ Could not find a file ID. Make sure you paste a full Google Drive link.'); return; }
    setResult(`https://drive.google.com/uc?export=view&id=${match[1]}`);
  };

  const copy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <Link2 className="w-4 h-4 text-blue-600" />
        <p className="font-semibold text-sm text-blue-800">Google Drive Image Converter</p>
      </div>
      <p className="text-xs text-blue-700">Paste a Google Drive sharing link to get an embeddable image URL you can use anywhere in settings.</p>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="https://drive.google.com/file/d/..."
          className="flex-1 border border-blue-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
        />
        <button onClick={convert} className="bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Convert
        </button>
      </div>
      {result && (
        <div className="flex items-center gap-2 bg-white border border-blue-200 rounded-lg px-3 py-2">
          <p className="flex-1 text-xs font-mono text-blue-900 truncate">{result}</p>
          {!result.startsWith('❌') && (
            <button onClick={copy} className="shrink-0 text-blue-600 hover:text-blue-800">
              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function ImageUploadField({ label, value, onChange }) {
  const ref = useRef();
  const [uploading, setUploading] = useState(false);
  const handleUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    onChange(file_url);
    setUploading(false);
    toast.success('Image uploaded!');
    e.target.value = '';
  };
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</Label>
      <div className="flex items-center gap-2">
        {value && <img src={value} alt="" className="w-12 h-12 rounded-lg object-cover border border-border shrink-0" />}
        <div className="flex-1 min-w-0">
          <Input value={value || ''} onChange={e => onChange(e.target.value)} placeholder="https://..." className="mb-1.5" />
          <Button variant="outline" size="sm" onClick={() => ref.current.click()} disabled={uploading} className="gap-1.5 h-7 text-xs">
            <Upload className="w-3 h-3" />{uploading ? 'Uploading...' : 'Upload'}
          </Button>
          <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', placeholder = '' }) {
  if (type === 'textarea') {
    return (
      <div className="space-y-1.5">
        <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</Label>
        <Textarea value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3} />
      </div>
    );
  }
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</Label>
      <Input type={type} value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <div
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-muted'}`}
        onClick={() => onChange(!checked)}
      >
        <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </div>
      <span className="text-sm">{label}</span>
    </label>
  );
}

export default function SettingsTabContent() {
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
    toast.success('Settings saved!');
  };

  if (!form) return <div className="py-12 text-center text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-heading font-bold text-xl">Site Settings</h2>
        <Button onClick={save} disabled={saving} className="rounded-full px-6">
          {saving ? 'Saving...' : 'Save All'}
        </Button>
      </div>

      <DriveConverter />

      {/* Branding */}
      <SettingsSection title="Branding & Identity" icon={Globe} defaultOpen>
        <div className="space-y-4 mt-2">
          <Field label="Site Name" value={form.site_name} onChange={v => set('site_name', v)} placeholder="Milford Key Club" />
          <Field label="Tagline" value={form.tagline} onChange={v => set('tagline', v)} placeholder="Leadership · Character · Service" />
          <ImageUploadField label="Logo" value={form.logo_url} onChange={v => set('logo_url', v)} />
        </div>
      </SettingsSection>

      {/* Navigation */}
      <SettingsSection title="Navigation" icon={Navigation}>
        <div className="mt-2">
          <p className="text-xs text-muted-foreground mb-3">Check the pages you want visible in the navigation bar.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { label: 'Home', path: '/' },
              { label: 'About', path: '/about' },
              { label: 'Projects', path: '/projects' },
              { label: 'Events', path: '/events' },
              { label: 'Officers', path: '/officers' },
              { label: 'Gallery', path: '/gallery' },
              { label: 'Log Hours', path: '/hours' },
              { label: 'Showcase', path: '/showcase' },
              { label: 'Contact', path: '/contact' },
              { label: 'Resources', path: '/resources' },
            ].map(({ label, path }) => {
              const hidden = (form.hidden_nav_items || '').split(',').map(s => s.trim()).filter(Boolean);
              const isVisible = !hidden.includes(path);
              const toggle = () => {
                const newHidden = isVisible
                  ? [...hidden, path]
                  : hidden.filter(p => p !== path);
                set('hidden_nav_items', newHidden.join(','));
              };
              return (
                <label key={path} className="flex items-center gap-2 cursor-pointer text-sm bg-muted/40 rounded-lg px-3 py-2">
                  <input type="checkbox" checked={isVisible} onChange={toggle} className="rounded" />
                  {label}
                </label>
              );
            })}
          </div>
        </div>
      </SettingsSection>

      {/* Hero */}
      <SettingsSection title="Home Page Hero" icon={Image}>
        <div className="space-y-4 mt-2">
          <Field label="Hero Title" value={form.hero_title} onChange={v => set('hero_title', v)} placeholder="Serve. Lead. Inspire." />
          <Field label="Hero Subtitle" value={form.hero_subtitle} onChange={v => set('hero_subtitle', v)} type="textarea" placeholder="Join us in making a difference..." />
          <ImageUploadField label="Hero Background Image" value={form.hero_image_url} onChange={v => set('hero_image_url', v)} />
        </div>
      </SettingsSection>

      {/* About Page */}
      <SettingsSection title="About Page" icon={Info}>
        <div className="space-y-4 mt-2">
          <Field label="Eyebrow" value={form.about_eyebrow} onChange={v => set('about_eyebrow', v)} placeholder="About Us" />
          <Field label="Heading" value={form.about_heading} onChange={v => set('about_heading', v)} placeholder="Who We Are" />
          <Field label="Intro Paragraph" value={form.about_intro} onChange={v => set('about_intro', v)} type="textarea" />
          <Field label="Our Chapter Text" value={form.about_chapter} onChange={v => set('about_chapter', v)} type="textarea" />
          <Field label="Why It Matters Text" value={form.about_why} onChange={v => set('about_why', v)} type="textarea" />
          <ImageUploadField label="Header Image" value={form.about_header_image_url} onChange={v => set('about_header_image_url', v)} />
          <ImageUploadField label="About Page Image" value={form.about_image_url} onChange={v => set('about_image_url', v)} />
        </div>
      </SettingsSection>

      {/* Projects Page */}
      <SettingsSection title="Projects Page" icon={Briefcase}>
        <div className="space-y-4 mt-2">
          <Field label="Eyebrow" value={form.projects_eyebrow} onChange={v => set('projects_eyebrow', v)} placeholder="Our Work" />
          <Field label="Heading" value={form.projects_heading} onChange={v => set('projects_heading', v)} placeholder="Service Projects" />
          <Field label="Description" value={form.projects_description} onChange={v => set('projects_description', v)} type="textarea" />
          <ImageUploadField label="Header Image" value={form.projects_header_image_url} onChange={v => set('projects_header_image_url', v)} />
        </div>
      </SettingsSection>

      {/* Events Page */}
      <SettingsSection title="Events Page" icon={Calendar}>
        <div className="space-y-4 mt-2">
          <Field label="Eyebrow" value={form.events_eyebrow} onChange={v => set('events_eyebrow', v)} placeholder="What's Happening" />
          <Field label="Heading" value={form.events_heading} onChange={v => set('events_heading', v)} placeholder="Upcoming Events" />
          <Field label="Description" value={form.events_description} onChange={v => set('events_description', v)} type="textarea" />
          <ImageUploadField label="Header Image" value={form.events_header_image_url} onChange={v => set('events_header_image_url', v)} />
        </div>
      </SettingsSection>

      {/* Officers Page */}
      <SettingsSection title="Officers Page" icon={Users} defaultOpen>
        <div className="space-y-4 mt-2">
          <Field label="Eyebrow" value={form.officers_eyebrow} onChange={v => set('officers_eyebrow', v)} placeholder="Our Team" />
          <Field label="Heading" value={form.officers_heading} onChange={v => set('officers_heading', v)} placeholder="Meet the Officers" />
          <Field label="Description" value={form.officers_description} onChange={v => set('officers_description', v)} type="textarea" />
          <ImageUploadField label="Header Image" value={form.officers_header_image_url} onChange={v => set('officers_header_image_url', v)} />
        </div>
      </SettingsSection>

      {/* Gallery Page */}
      <SettingsSection title="Gallery Page" icon={Camera}>
        <div className="space-y-4 mt-2">
          <Field label="Eyebrow" value={form.gallery_eyebrow} onChange={v => set('gallery_eyebrow', v)} placeholder="Photo Gallery" />
          <Field label="Heading" value={form.gallery_heading} onChange={v => set('gallery_heading', v)} placeholder="Our Memories" />
          <Field label="Description" value={form.gallery_description} onChange={v => set('gallery_description', v)} type="textarea" />
          <ImageUploadField label="Header Image" value={form.gallery_header_image_url} onChange={v => set('gallery_header_image_url', v)} />
        </div>
      </SettingsSection>

      {/* Join Page */}
      <SettingsSection title="Join Page" icon={UserPlus}>
        <div className="space-y-4 mt-2">
          <Field label="Eyebrow" value={form.join_eyebrow} onChange={v => set('join_eyebrow', v)} placeholder="Get Involved" />
          <Field label="Heading" value={form.join_heading} onChange={v => set('join_heading', v)} placeholder="Join Key Club" />
          <Field label="Description" value={form.join_description} onChange={v => set('join_description', v)} type="textarea" />
          <Field label="Sign-Up Form URL" value={form.join_form_url} onChange={v => set('join_form_url', v)} placeholder="https://..." />
          <ImageUploadField label="Header Image" value={form.join_header_image_url} onChange={v => set('join_header_image_url', v)} />
          <div className="grid sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-2">
              <Field label="Meeting Time" value={form.meeting_time} onChange={v => set('meeting_time', v)} placeholder="Tuesdays at 3:30 PM" />
              <Toggle label="Show meeting time" checked={!!form.show_meeting_time} onChange={v => set('show_meeting_time', v)} />
            </div>
            <div className="space-y-2">
              <Field label="Meeting Location" value={form.meeting_location} onChange={v => set('meeting_location', v)} placeholder="Room 204" />
              <Toggle label="Show meeting location" checked={!!form.show_meeting_location} onChange={v => set('show_meeting_location', v)} />
            </div>
            <div className="space-y-2">
              <Field label="Dues Info" value={form.dues_info} onChange={v => set('dues_info', v)} placeholder="$10/year" />
              <Toggle label="Show dues info" checked={!!form.show_dues} onChange={v => set('show_dues', v)} />
            </div>
            <div className="space-y-2">
              <Field label="Requirements Info" value={form.requirements_info} onChange={v => set('requirements_info', v)} placeholder="15 service hours/year" />
              <Toggle label="Show requirements" checked={!!form.show_requirements} onChange={v => set('show_requirements', v)} />
            </div>
          </div>
        </div>
      </SettingsSection>

      {/* Contact Page */}
      <SettingsSection title="Contact Page" icon={Mail}>
        <div className="space-y-4 mt-2">
          <Field label="Eyebrow" value={form.contact_eyebrow} onChange={v => set('contact_eyebrow', v)} placeholder="Get in Touch" />
          <Field label="Heading" value={form.contact_heading} onChange={v => set('contact_heading', v)} placeholder="Contact Us" />
          <Field label="Description" value={form.contact_description} onChange={v => set('contact_description', v)} type="textarea" />
          <Field label="Contact Email" value={form.contact_email} onChange={v => set('contact_email', v)} type="email" placeholder="keyclub@milford.edu" />
          <ImageUploadField label="Header Image" value={form.contact_header_image_url} onChange={v => set('contact_header_image_url', v)} />
          <Toggle label="Show location block" checked={!!form.show_contact_location} onChange={v => set('show_contact_location', v)} />
        </div>
      </SettingsSection>

      {/* Footer */}
      <SettingsSection title="Footer" icon={Globe}>
        <div className="space-y-4 mt-2">
          <Field label="Footer Tagline" value={form.footer_tagline} onChange={v => set('footer_tagline', v)} placeholder="A student-led organization dedicated to serving our community..." />
          <div className="space-y-1.5">
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Footer Quick Links (JSON)</Label>
            <Textarea
              value={form.footer_links || ''}
              onChange={e => set('footer_links', e.target.value)}
              rows={4}
              placeholder={`[{"label":"About","path":"/about"},{"label":"Join Us","path":"/join"}]`}
            />
            <p className="text-xs text-muted-foreground">Paste a JSON array of link objects with "label" and "path" keys.</p>
          </div>
        </div>
      </SettingsSection>

      {/* Social Media */}
      <SettingsSection title="Social Media" icon={Instagram}>
        <div className="space-y-4 mt-2">
          <Field label="Instagram URL" value={form.instagram_url} onChange={v => set('instagram_url', v)} placeholder="https://instagram.com/..." />
          <div className="space-y-2">
            <Field label="Twitter/X URL" value={form.twitter_url} onChange={v => set('twitter_url', v)} placeholder="https://x.com/..." />
            <Toggle label="Show Twitter/X in footer" checked={!!form.show_twitter} onChange={v => set('show_twitter', v)} />
          </div>
          <div className="space-y-2">
            <Field label="Facebook URL" value={form.facebook_url} onChange={v => set('facebook_url', v)} placeholder="https://facebook.com/..." />
            <Toggle label="Show Facebook in footer" checked={!!form.show_facebook} onChange={v => set('show_facebook', v)} />
          </div>
        </div>
      </SettingsSection>

      <div className="pt-2 flex justify-end">
        <Button onClick={save} disabled={saving} className="rounded-full px-8">
          {saving ? 'Saving...' : 'Save All Settings'}
        </Button>
      </div>
    </div>
  );
}