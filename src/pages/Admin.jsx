import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Settings, Layers, Calendar, Users, Image as ImageIcon,
  Plus, Trash2, Save, Upload, Edit2, X, Check, Clock, Newspaper, Shield, LogOut, Crown,
  FileText, Layout, PanelBottom, Mail, HelpCircle, ChevronDown, ChevronRight
} from 'lucide-react';
import { invalidateSettings } from '../hooks/useSiteSettings';
import SettingsSection from '../components/admin/SettingsSection';
import { useAdminAuth } from '../hooks/useAdminAuth';
import AdminLogin from '../components/admin/AdminLogin';
import HoursTab from '../components/admin/HoursTab';
import NewsTab from '../components/admin/NewsTab';
import AdminUsersTab from '../components/admin/AdminUsersTab';
import PageTextsTab from '../components/admin/PageTextsTab';
import FooterTab from '../components/admin/FooterTab';
import CustomPagesTab from '../components/admin/CustomPagesTab';
import MembersTab from '../components/admin/MembersTab';
import HelpDialog from '../components/admin/HelpDialog';
import NewsletterTab from '../components/admin/NewsletterTab';
import HelpRequestsTab from '../components/admin/HelpRequestsTab';
import FormsTab from '../components/admin/FormsTab';
import ResourcesTab from '../components/admin/ResourcesTab';

export default function Admin({ injectedAuth } = {}) {
  const ownAuth = useAdminAuth();
  const auth = injectedAuth || ownAuth;
  const { adminUser, checking, login, logout, isSuperAdmin, hasPermission } = auth;
  const [activeTab, setActiveTab] = useState(null);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!adminUser) {
    return <AdminLogin onLogin={login} />;
  }

  const tabs = [
    { value: 'settings', label: 'Site Settings', icon: Settings, perm: 'settings' },
    { value: 'page-texts', label: 'Page Texts', icon: FileText, perm: 'page-texts' },
    { value: 'projects', label: 'Projects', icon: Layers, perm: 'projects' },
    { value: 'events', label: 'Events', icon: Calendar, perm: 'events' },
    { value: 'officers', label: 'Officers', icon: Users, perm: 'officers' },
    { value: 'gallery', label: 'Gallery', icon: ImageIcon, perm: 'gallery' },
    { value: 'hours', label: 'Hours', icon: Clock, perm: 'hours' },
    { value: 'news', label: 'News', icon: Newspaper, perm: 'news' },
    { value: 'members', label: 'Members', icon: Users, perm: 'members' },
    { value: 'newsletter', label: 'Newsletter', icon: Mail, perm: 'newsletter' },
    { value: 'forms', label: 'Forms', icon: FileText, perm: 'forms' },
    { value: 'resources', label: 'Resources', icon: FileText, perm: 'resources' },
    ...(isSuperAdmin ? [
      { value: 'admins', label: 'Admins', icon: Crown, perm: null },
      { value: 'help-requests', label: 'Help Requests', icon: HelpCircle, perm: null },
    ] : []),
  ].filter(t => isSuperAdmin || t.perm === null || hasPermission(t.perm));

  const currentTab = activeTab || tabs[0]?.value;

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-3xl">Admin Dashboard</h1>
          <div className="flex items-center gap-2 mt-1">
            {isSuperAdmin ? <Crown className="w-3.5 h-3.5 text-primary" /> : <Shield className="w-3.5 h-3.5 text-muted-foreground" />}
            <p className="text-muted-foreground text-sm">
              Logged in as <strong>{adminUser.username}</strong> · {isSuperAdmin ? 'Super Admin' : 'Admin'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <HelpDialog />
          <Button variant="outline" size="sm" onClick={logout} className="gap-1.5">
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </Button>
        </div>
        </div>

        <Tabs value={currentTab} onValueChange={setActiveTab}>
          <div className="mb-6 flex flex-wrap gap-1.5">
            {tabs.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setActiveTab(value)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors border ${
                  currentTab === value
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border bg-background hover:bg-muted text-foreground'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />{label}
              </button>
            ))}
          </div>
          <TabsList className="hidden">
            {tabs.map(({ value }) => (
              <TabsTrigger key={value} value={value} />
            ))}
          </TabsList>

          <TabsContent value="settings"><SiteSettingsTab /></TabsContent>
          <TabsContent value="page-texts"><PageTextsTab /></TabsContent>
          <TabsContent value="projects"><ProjectsTab /></TabsContent>
          <TabsContent value="events"><EventsTab /></TabsContent>
          <TabsContent value="officers"><OfficersTab /></TabsContent>
          <TabsContent value="gallery"><GalleryTab /></TabsContent>
          <TabsContent value="hours"><HoursTab /></TabsContent>
          <TabsContent value="news"><NewsTab /></TabsContent>
          <TabsContent value="members"><MembersTab isSuperAdmin={isSuperAdmin} /></TabsContent>

          <TabsContent value="newsletter"><NewsletterTab /></TabsContent>
          <TabsContent value="forms"><FormsTab /></TabsContent>
          <TabsContent value="resources"><ResourcesTab /></TabsContent>
          {isSuperAdmin && <TabsContent value="admins"><AdminUsersTab isSuperAdmin={isSuperAdmin} /></TabsContent>}
          {isSuperAdmin && <TabsContent value="help-requests"><HelpRequestsTab /></TabsContent>}
        </Tabs>
      </div>
    </div>
  );
}

// ─── SITE SETTINGS TAB ───────────────────────────────────────────────────────

function SiteSettingsTab() {
  const [form, setForm] = useState(null);
  const [settingsId, setSettingsId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadingAbout, setUploadingAbout] = useState(false);
  const fileRef = useRef();
  const heroFileRef = useRef();
  const aboutFileRef = useRef();

  useEffect(() => {
    base44.entities.SiteSettings.list().then(list => {
      const s = list[0];
      if (s) { setForm(s); setSettingsId(s.id); }
      else setForm({
        site_name: 'Milford Key Club', tagline: 'Service · Leadership · Caring',
        hero_title: 'Milford\nKey Club', hero_subtitle: 'Building Leaders Through Service',
        about_intro: '', about_chapter: '', about_why: '',
        contact_email: 'milfordkeyclub@gmail.com',
        meeting_time: 'Every Wednesday, 3:00 PM – 4:00 PM',
        meeting_location: 'Room 204, Milford High School',
        dues_info: '$15 per year',
        requirements_info: 'Minimum 50 service hours per year & regular meeting attendance',
        instagram_url: '', twitter_url: '', logo_url: '',
      });
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

  const handleHeroImageUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setUploadingHero(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    set('hero_image_url', file_url);
    setUploadingHero(false);
    toast.success('Hero image uploaded!');
  };

  const handleAboutImageUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setUploadingAbout(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    set('about_image_url', file_url);
    setUploadingAbout(false);
    toast.success('About image uploaded!');
  };

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
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">Click a section to expand and edit it.</p>

      <SettingsSection title="Logo & Branding" icon={ImageIcon} defaultOpen>
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-xl border-2 border-dashed border-border flex items-center justify-center bg-muted overflow-hidden">
              {form.logo_url ? <img src={form.logo_url} alt="Logo" className="w-full h-full object-contain p-1" /> : <ImageIcon className="w-7 h-7 text-muted-foreground" />}
            </div>
            <div>
              <Button variant="outline" size="sm" onClick={() => fileRef.current.click()} disabled={uploading} className="gap-1.5">
                <Upload className="w-3.5 h-3.5" />{uploading ? 'Uploading...' : 'Upload Logo'}
              </Button>
              <p className="text-xs text-muted-foreground mt-1.5">PNG, SVG or JPG recommended</p>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Site Name" value={form.site_name} onChange={v => set('site_name', v)} />
            <Field label="Tagline" value={form.tagline} onChange={v => set('tagline', v)} />
          </div>
        </div>
      </SettingsSection>

      <SettingsSection title="Home Page Hero" icon={Layout}>
        <div className="space-y-4 pt-2">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Hero Title" value={form.hero_title} onChange={v => set('hero_title', v)} multiline />
            <Field label="Hero Subtitle" value={form.hero_subtitle} onChange={v => set('hero_subtitle', v)} />
          </div>
          <div className="flex items-center gap-4">
            <div className="w-32 h-20 rounded-xl border-2 border-dashed border-border flex items-center justify-center bg-muted overflow-hidden">
              {form.hero_image_url ? <img src={form.hero_image_url} alt="Hero" className="w-full h-full object-cover" /> : <ImageIcon className="w-6 h-6 text-muted-foreground" />}
            </div>
            <div>
              <Button variant="outline" size="sm" onClick={() => heroFileRef.current.click()} disabled={uploadingHero} className="gap-1.5">
                <Upload className="w-3.5 h-3.5" />{uploadingHero ? 'Uploading...' : 'Upload Hero Image'}
              </Button>
              <p className="text-xs text-muted-foreground mt-1.5">Recommended: 1600×900px or wider</p>
              <input ref={heroFileRef} type="file" accept="image/*" className="hidden" onChange={handleHeroImageUpload} />
            </div>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection title="About Page" icon={Layout}>
        <div className="space-y-4 pt-2">
          <Field label="Intro Paragraph" value={form.about_intro} onChange={v => set('about_intro', v)} multiline rows={3} />
          <Field label="Our Milford Chapter" value={form.about_chapter} onChange={v => set('about_chapter', v)} multiline rows={4} />
          <Field label="Why It Matters" value={form.about_why} onChange={v => set('about_why', v)} multiline rows={3} />
          <div className="flex items-center gap-4">
            <div className="w-32 h-20 rounded-xl border-2 border-dashed border-border flex items-center justify-center bg-muted overflow-hidden">
              {form.about_image_url ? <img src={form.about_image_url} alt="About" className="w-full h-full object-cover" /> : <ImageIcon className="w-6 h-6 text-muted-foreground" />}
            </div>
            <div>
              <Button variant="outline" size="sm" onClick={() => aboutFileRef.current.click()} disabled={uploadingAbout} className="gap-1.5">
                <Upload className="w-3.5 h-3.5" />{uploadingAbout ? 'Uploading...' : 'Upload About Image'}
              </Button>
              <input ref={aboutFileRef} type="file" accept="image/*" className="hidden" onChange={handleAboutImageUpload} />
            </div>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection title="Join Us Page" icon={Users}>
        <div className="space-y-4 pt-2">
          <p className="text-xs text-muted-foreground">Uncheck items to hide them from the Join Us page.</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Meeting Time" value={form.meeting_time} onChange={v => set('meeting_time', v)} />
            <label className="flex items-center gap-2 text-sm pt-5 cursor-pointer">
              <input type="checkbox" checked={form.show_meeting_time !== false} onChange={e => set('show_meeting_time', e.target.checked)} />
              Show Meeting Time
            </label>
            <Field label="Meeting Location" value={form.meeting_location} onChange={v => set('meeting_location', v)} />
            <label className="flex items-center gap-2 text-sm pt-5 cursor-pointer">
              <input type="checkbox" checked={form.show_meeting_location !== false} onChange={e => set('show_meeting_location', e.target.checked)} />
              Show Meeting Location
            </label>
            <Field label="Dues Info" value={form.dues_info} onChange={v => set('dues_info', v)} />
            <label className="flex items-center gap-2 text-sm pt-5 cursor-pointer">
              <input type="checkbox" checked={form.show_dues !== false} onChange={e => set('show_dues', e.target.checked)} />
              Show Dues
            </label>
            <Field label="Requirements" value={form.requirements_info} onChange={v => set('requirements_info', v)} />
            <label className="flex items-center gap-2 text-sm pt-5 cursor-pointer">
              <input type="checkbox" checked={form.show_requirements !== false} onChange={e => set('show_requirements', e.target.checked)} />
              Show Requirements
            </label>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection title="Navigation" icon={Layout}>
        <div className="pt-2">
          <p className="text-xs text-muted-foreground mb-3">Check items to <strong>hide</strong> them from the top navigation bar.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { label: 'Home', path: '/' },
              { label: 'About', path: '/about' },
              { label: 'Projects', path: '/projects' },
              { label: 'Events', path: '/events' },
              { label: 'Officers', path: '/officers' },
              { label: 'Gallery', path: '/gallery' },
              { label: 'Log Hours', path: '/hours' },
              { label: 'Join Us', path: '/join' },
              { label: 'Contact', path: '/contact' },
            ].map(({ label, path }) => {
              const hidden = (form.hidden_nav_items || '').split(',').map(s => s.trim()).includes(path);
              const toggle = () => {
                const current = (form.hidden_nav_items || '').split(',').map(s => s.trim()).filter(Boolean);
                const updated = hidden ? current.filter(p => p !== path) : [...current, path];
                set('hidden_nav_items', updated.join(','));
              };
              return (
                <label key={path} className="flex items-center gap-2 cursor-pointer text-sm">
                  <input type="checkbox" checked={hidden} onChange={toggle} className="rounded" />
                  <span className={hidden ? 'line-through text-muted-foreground' : ''}>{label}</span>
                </label>
              );
            })}
          </div>
        </div>
      </SettingsSection>

      <SettingsSection title="Footer" icon={PanelBottom}>
        <div className="pt-2">
          <FooterSubSection form={form} set={set} />
        </div>
      </SettingsSection>

      <SettingsSection title="Contact & Social" icon={Mail}>
        <div className="grid sm:grid-cols-2 gap-4 pt-2">
          <Field label="Contact Email" value={form.contact_email} onChange={v => set('contact_email', v)} />
          <Field label="Instagram URL" value={form.instagram_url} onChange={v => set('instagram_url', v)} />
          <Field label="Facebook URL" value={form.facebook_url} onChange={v => set('facebook_url', v)} />
          <Field label="Twitter/X URL" value={form.twitter_url} onChange={v => set('twitter_url', v)} />
          <label className="flex items-center gap-2 cursor-pointer text-sm">
            <input type="checkbox" checked={form.show_twitter !== false} onChange={e => set('show_twitter', e.target.checked)} className="rounded" />
            Show Twitter/X icon in footer
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-sm">
            <input type="checkbox" checked={form.show_facebook !== false} onChange={e => set('show_facebook', e.target.checked)} className="rounded" />
            Show Facebook icon in footer
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-sm col-span-2">
            <input type="checkbox" checked={form.show_contact_location !== false} onChange={e => set('show_contact_location', e.target.checked)} className="rounded" />
            Show Location block on Contact page
          </label>
        </div>
      </SettingsSection>

      <SettingsSection title="Custom Pages" icon={FileText}>
        <div className="pt-2">
          <CustomPagesTab />
        </div>
      </SettingsSection>

      <Button onClick={save} disabled={saving} className="gap-2 rounded-full px-8">
        <Save className="w-4 h-4" />{saving ? 'Saving...' : 'Save All Settings'}
      </Button>
    </div>
  );
}

// ─── FOOTER SUB-SECTION (used inside SiteSettingsTab) ───────────────────────

function FooterSubSection({ form, set }) {
  const DEFAULT_LINKS = [
    { label: 'About', path: '/about' },
    { label: 'Projects', path: '/projects' },
    { label: 'Events', path: '/events' },
    { label: 'Officers', path: '/officers' },
    { label: 'Gallery', path: '/gallery' },
    { label: 'Join Us', path: '/join' },
  ];
  const links = (() => { try { return form.footer_links ? JSON.parse(form.footer_links) : DEFAULT_LINKS; } catch { return DEFAULT_LINKS; } })();
  const setLinks = (fn) => set('footer_links', JSON.stringify(typeof fn === 'function' ? fn(links) : fn));
  const addLink = () => setLinks(l => [...l, { label: '', path: '' }]);
  const removeLink = (i) => setLinks(l => l.filter((_, idx) => idx !== i));
  const updateLink = (i, field, value) => setLinks(l => l.map((item, idx) => idx === i ? { ...item, [field]: value } : item));
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Footer Tagline</Label>
        <Input className="mt-1" value={form.footer_tagline || ''} onChange={e => set('footer_tagline', e.target.value)} placeholder="A student-led organization dedicated to serving our community..." />
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Quick Links</Label>
          <Button size="sm" variant="outline" onClick={addLink} className="gap-1 h-7 text-xs"><Plus className="w-3 h-3" />Add</Button>
        </div>
        <div className="space-y-2">
          {links.map((link, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input placeholder="Label" value={link.label} onChange={e => updateLink(i, 'label', e.target.value)} className="h-8 text-sm" />
              <Input placeholder="/path" value={link.path} onChange={e => updateLink(i, 'path', e.target.value)} className="h-8 text-sm" />
              <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive shrink-0" onClick={() => removeLink(i)}><Trash2 className="w-3.5 h-3.5" /></Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── PROJECTS TAB ────────────────────────────────────────────────────────────

function ProjectsTab() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  useEffect(() => { load(); }, []);
  const load = () => base44.entities.Project.list('order').then(setItems);
  const startEdit = (item) => { setEditing(item.id || 'new'); setForm(item || {}); };
  const startNew = () => { setEditing('new'); setForm({ order: items.length + 1 }); };
  const cancel = () => { setEditing(null); setForm({}); };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(p => ({ ...p, image_url: file_url }));
    setUploading(false);
    toast.success('Image uploaded!');
  };

  const save = async () => {
    if (editing === 'new') await base44.entities.Project.create(form);
    else await base44.entities.Project.update(editing, form);
    toast.success('Saved!'); cancel(); load();
  };
  const del = async (id) => { await base44.entities.Project.delete(id); toast.success('Deleted'); load(); };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{items.length} project{items.length !== 1 ? 's' : ''}</p>
        <Button size="sm" onClick={startNew} className="gap-1.5"><Plus className="w-4 h-4"/>Add Project</Button>
      </div>
      {editing === 'new' && <EditForm form={form} setForm={setForm} uploading={uploading} fileRef={fileRef} onUpload={handleImageUpload} onSave={save} onCancel={cancel} fields={['title','description','order']} hasImage />}
      <div className="space-y-3">
        {items.map(item => (
          <div key={item.id}>
            {editing === item.id
              ? <EditForm form={form} setForm={setForm} uploading={uploading} fileRef={fileRef} onUpload={handleImageUpload} onSave={save} onCancel={cancel} fields={['title','description','order']} hasImage />
              : <ListItem image={item.image_url} title={item.title} subtitle={item.description?.slice(0,80)+'...'} onEdit={() => startEdit(item)} onDelete={() => del(item.id)} />
            }
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── EVENTS TAB ──────────────────────────────────────────────────────────────

function EventsTab() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});

  useEffect(() => { load(); }, []);
  const load = () => base44.entities.ClubEvent.list('date').then(setItems);
  const startEdit = (item) => { setEditing(item.id || 'new'); setForm(item || {}); };
  const startNew = () => { setEditing('new'); setForm({ type: 'meeting' }); };
  const cancel = () => { setEditing(null); setForm({}); };

  const save = async () => {
    if (editing === 'new') await base44.entities.ClubEvent.create(form);
    else await base44.entities.ClubEvent.update(editing, form);
    toast.success('Saved!'); cancel(); load();
  };
  const del = async (id) => { await base44.entities.ClubEvent.delete(id); toast.success('Deleted'); load(); };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{items.length} event{items.length !== 1 ? 's' : ''}</p>
        <Button size="sm" onClick={startNew} className="gap-1.5"><Plus className="w-4 h-4"/>Add Event</Button>
      </div>
      {editing === 'new' && <EditForm form={form} setForm={setForm} onSave={save} onCancel={cancel} fields={['title','date','time','location']} selects={[{key:'type',options:['meeting','project','volunteer','social']}]} />}
      <div className="space-y-3">
        {items.map(item => (
          <div key={item.id}>
            {editing === item.id
              ? <EditForm form={form} setForm={setForm} onSave={save} onCancel={cancel} fields={['title','date','time','location']} selects={[{key:'type',options:['meeting','project','volunteer','social']}]} />
              : <ListItem title={item.title} subtitle={`${item.date}  •  ${item.time||''}  •  ${item.location||''}`} badge={item.type} onEdit={() => startEdit(item)} onDelete={() => del(item.id)} />
            }
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── OFFICERS TAB ────────────────────────────────────────────────────────────

function OfficersTab() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  useEffect(() => { load(); }, []);
  const load = () => base44.entities.Officer.list('order').then(setItems);
  const startEdit = (item) => { setEditing(item.id); setForm(item); };
  const startNew = () => { setEditing('new'); setForm({ order: items.length + 1 }); };
  const cancel = () => { setEditing(null); setForm({}); };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(p => ({ ...p, photo_url: file_url }));
    setUploading(false);
    toast.success('Photo uploaded!');
  };

  const save = async () => {
    if (editing === 'new') await base44.entities.Officer.create(form);
    else await base44.entities.Officer.update(editing, form);
    toast.success('Saved!'); cancel(); load();
  };
  const del = async (id) => { await base44.entities.Officer.delete(id); toast.success('Deleted'); load(); };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{items.length} officer{items.length !== 1 ? 's' : ''}</p>
        <Button size="sm" onClick={startNew} className="gap-1.5"><Plus className="w-4 h-4"/>Add Officer</Button>
      </div>
      {editing === 'new' && <EditForm form={form} setForm={setForm} uploading={uploading} fileRef={fileRef} onUpload={handleImageUpload} onSave={save} onCancel={cancel} fields={['name','role','fun_fact','order']} hasImage imageKey="photo_url" />}
      <div className="space-y-3">
        {items.map(item => (
          <div key={item.id}>
            {editing === item.id
              ? <EditForm form={form} setForm={setForm} uploading={uploading} fileRef={fileRef} onUpload={handleImageUpload} onSave={save} onCancel={cancel} fields={['name','role','fun_fact','order']} hasImage imageKey="photo_url" />
              : <ListItem image={item.photo_url} title={item.name} subtitle={item.role} onEdit={() => startEdit(item)} onDelete={() => del(item.id)} />
            }
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── GALLERY TAB ─────────────────────────────────────────────────────────────

function GalleryTab() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  useEffect(() => { load(); }, []);
  const load = () => base44.entities.GalleryImage.list('order').then(setItems);
  const startEdit = (item) => { setEditing(item.id); setForm(item); };
  const startNew = () => { setEditing('new'); setForm({ category: 'Service', order: items.length + 1 }); };
  const cancel = () => { setEditing(null); setForm({}); };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(p => ({ ...p, image_url: file_url }));
    setUploading(false);
    toast.success('Image uploaded!');
  };

  const save = async () => {
    if (editing === 'new') await base44.entities.GalleryImage.create(form);
    else await base44.entities.GalleryImage.update(editing, form);
    toast.success('Saved!'); cancel(); load();
  };
  const del = async (id) => { await base44.entities.GalleryImage.delete(id); toast.success('Deleted'); load(); };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{items.length} image{items.length !== 1 ? 's' : ''}</p>
        <Button size="sm" onClick={startNew} className="gap-1.5"><Plus className="w-4 h-4"/>Add Image</Button>
      </div>
      {editing === 'new' && <EditForm form={form} setForm={setForm} uploading={uploading} fileRef={fileRef} onUpload={handleImageUpload} onSave={save} onCancel={cancel} fields={['alt_text','order']} selects={[{key:'category',options:['Service','Projects','Meetings','Events']}]} hasImage imageKey="image_url" />}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {items.map(item => (
          <div key={item.id} className="relative group rounded-xl overflow-hidden aspect-square border border-border">
            {editing === item.id ? (
              <div className="bg-card p-3 h-full overflow-auto">
                <EditForm form={form} setForm={setForm} uploading={uploading} fileRef={fileRef} onUpload={handleImageUpload} onSave={save} onCancel={cancel} fields={['alt_text','order']} selects={[{key:'category',options:['Service','Projects','Meetings','Events']}]} hasImage imageKey="image_url" compact />
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
    </div>
  );
}

// ─── REUSABLE COMPONENTS ─────────────────────────────────────────────────────

function Card({ title, children }) {
  return (
    <div className="bg-card rounded-xl border border-border p-5 md:p-6">
      <h3 className="font-heading font-semibold text-base mb-4">{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, value, onChange, multiline, rows = 2 }) {
  const props = { value: value || '', onChange: e => onChange(e.target.value), className: 'mt-1' };
  return (
    <div>
      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</Label>
      {multiline ? <Textarea {...props} rows={rows} /> : <Input {...props} />}
    </div>
  );
}

function EditForm({ form, setForm, onSave, onCancel, fields, selects = [], hasImage, imageKey = 'image_url', fileRef, onUpload, uploading, compact }) {
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const labels = { title:'Title', description:'Description', order:'Order', date:'Date', time:'Time', location:'Location', name:'Name', role:'Role', fun_fact:'Fun Fact / Bio', alt_text:'Caption / Alt Text', type:'Type', category:'Category' };
  return (
    <div className={`bg-accent/30 rounded-xl border border-primary/20 ${compact?'p-3':'p-5'} space-y-3`}>
      {hasImage && (
        <div>
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Photo / Image</Label>
          <div className="flex items-center gap-3 mt-1">
            {form[imageKey] && <img src={form[imageKey]} alt="" className="w-16 h-16 rounded-lg object-cover border border-border" />}
            <Button variant="outline" size="sm" onClick={() => fileRef.current.click()} disabled={uploading} className="gap-1.5">
              <Upload className="w-3 h-3" />{uploading ? 'Uploading...' : 'Upload'}
            </Button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onUpload} />
          </div>
        </div>
      )}
      <div className={`grid gap-3 ${compact?'grid-cols-1':'sm:grid-cols-2'}`}>
        {fields.map(f => (
          <div key={f} className={f==='description'||f==='fun_fact'?'sm:col-span-2':''}>
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{labels[f]||f}</Label>
            {f==='description'||f==='fun_fact'
              ? <Textarea value={form[f]||''} onChange={e => set(f,e.target.value)} rows={3} className="mt-1" />
              : <Input value={form[f]||''} onChange={e => set(f,e.target.value)} className="mt-1" />
            }
          </div>
        ))}
        {selects.map(({key,options}) => (
          <div key={key}>
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{labels[key]||key}</Label>
            <select value={form[key]||options[0]} onChange={e => set(key,e.target.value)} className="mt-1 w-full border border-input rounded-md h-10 px-3 text-sm bg-background">
              {options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        ))}
      </div>
      <div className="flex gap-2 pt-1">
        <Button size="sm" onClick={onSave} className="gap-1.5"><Check className="w-3.5 h-3.5"/>Save</Button>
        <Button size="sm" variant="ghost" onClick={onCancel} className="gap-1.5"><X className="w-3.5 h-3.5"/>Cancel</Button>
      </div>
    </div>
  );
}

function ListItem({ image, title, subtitle, badge, onEdit, onDelete }) {
  return (
    <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-4">
      {image && <img src={image} alt={title} className="w-12 h-12 rounded-lg object-cover border border-border shrink-0" />}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-medium text-sm">{title}</p>
          {badge && <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded-full">{badge}</span>}
        </div>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5 truncate">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={onEdit}><Edit2 className="w-3.5 h-3.5" /></Button>
        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={onDelete}><Trash2 className="w-3.5 h-3.5" /></Button>
      </div>
    </div>
  );
}