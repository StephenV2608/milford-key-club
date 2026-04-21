import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { invalidateSettings } from '../../hooks/useSiteSettings';
import { TrendingUp, Info, RotateCcw } from 'lucide-react';

export default function ImpactStatsTab() {
  const [form, setForm] = useState(null);
  const [settingsId, setSettingsId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [computed, setComputed] = useState(null);

  useEffect(() => {
    (async () => {
      const list = await base44.entities.SiteSettings.list();
      const s = list[0];
      if (s) { setForm(s); setSettingsId(s.id); } else setForm({});

      // Compute live stats for reference
      const [hours, members, events] = await Promise.all([
        base44.entities.ServiceHour.filter({ status: 'approved' }),
        base44.entities.Member.filter({ active: true }),
        base44.entities.ClubEvent.list(),
      ]);
      const totalHours = hours.reduce((a, h) => a + (h.hours || 0), 0);
      const uniqueOrgs = new Set(hours.map(h => (h.organization || '').trim()).filter(Boolean));
      const thisYear = new Date().getFullYear();
      const hoursThisYear = hours
        .filter(h => new Date(h.date).getFullYear() === thisYear)
        .reduce((a, h) => a + (h.hours || 0), 0);
      const eventsPast = events.filter(e => new Date(e.date) <= new Date()).length;
      setComputed({
        totalHours: +totalHours.toFixed(1),
        hoursThisYear: +hoursThisYear.toFixed(1),
        activeMembers: members.length,
        orgsServed: uniqueOrgs.size,
        eventsHosted: eventsPast,
      });
    })();
  }, []);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v === '' ? null : v }));

  const save = async () => {
    setSaving(true);
    if (settingsId) await base44.entities.SiteSettings.update(settingsId, form);
    else { const c = await base44.entities.SiteSettings.create(form); setSettingsId(c.id); }
    invalidateSettings();
    setSaving(false);
    toast.success('Impact stats saved!');
  };

  const clearOverride = (key) => set(key, null);

  if (!form) return <div className="py-12 text-center text-muted-foreground">Loading...</div>;

  const overrideFields = [
    { key: 'impact_total_hours_override',     label: 'Total Service Hours',   computed: computed?.totalHours },
    { key: 'impact_active_members_override',  label: 'Active Members',        computed: computed?.activeMembers },
    { key: 'impact_orgs_served_override',     label: 'Organizations Helped', computed: computed?.orgsServed },
    { key: 'impact_events_hosted_override',   label: 'Events Hosted',         computed: computed?.eventsHosted },
    { key: 'impact_hours_this_year_override', label: 'Hours This Year',       computed: computed?.hoursThisYear },
  ];

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-heading font-bold text-xl">Impact Page Stats</h2>
            <p className="text-sm text-muted-foreground">Customize the Impact page numbers and text.</p>
          </div>
        </div>
        <Button onClick={save} disabled={saving} className="rounded-full px-6">
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-xs text-blue-900 leading-relaxed">
          By default, stats are calculated automatically from approved service hours, active members, and events.
          Leave an override blank to keep using the live number. Set a value to replace it (useful for historical totals or special milestones).
        </div>
      </div>

      {/* Page text */}
      <div className="bg-card rounded-xl border border-border p-5 space-y-4">
        <h3 className="font-heading font-semibold text-sm">Page Text</h3>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Eyebrow</Label>
          <Input value={form.impact_eyebrow || ''} onChange={e => set('impact_eyebrow', e.target.value)} placeholder="Community Impact" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Heading</Label>
          <Input value={form.impact_heading || ''} onChange={e => set('impact_heading', e.target.value)} placeholder="Service in Numbers" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Description</Label>
          <Textarea rows={2} value={form.impact_description || ''} onChange={e => set('impact_description', e.target.value)} placeholder="The difference Milford Key Club makes..." />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">"This Year" Caption</Label>
          <Textarea rows={2} value={form.impact_this_year_caption || ''} onChange={e => set('impact_this_year_caption', e.target.value)} placeholder="Volunteered by Milford Key Club members..." />
          <p className="text-xs text-muted-foreground">Shown below the "hours this year" counter.</p>
        </div>
      </div>

      {/* Stat overrides */}
      <div className="bg-card rounded-xl border border-border p-5 space-y-4">
        <h3 className="font-heading font-semibold text-sm">Stat Overrides</h3>
        <div className="space-y-3">
          {overrideFields.map(({ key, label, computed: liveVal }) => {
            const hasOverride = form[key] !== null && form[key] !== undefined && form[key] !== '';
            return (
              <div key={key} className="flex items-end gap-3">
                <div className="flex-1 space-y-1.5">
                  <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</Label>
                  <Input
                    type="number"
                    step="any"
                    value={form[key] ?? ''}
                    onChange={e => set(key, e.target.value === '' ? null : Number(e.target.value))}
                    placeholder={`Auto: ${liveVal ?? '…'}`}
                  />
                </div>
                <div className="text-xs text-muted-foreground pb-2.5 min-w-[90px]">
                  Live: <span className="font-semibold text-foreground">{liveVal ?? '…'}</span>
                </div>
                {hasOverride && (
                  <Button size="sm" variant="ghost" onClick={() => clearOverride(key)} className="gap-1 pb-2" title="Clear override">
                    <RotateCcw className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={save} disabled={saving} className="rounded-full px-8">
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}