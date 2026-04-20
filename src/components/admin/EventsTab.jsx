import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Pencil, Trash2, QrCode, X, Check, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';

const EMPTY = { title: '', date: '', time: '', location: '', description: '', type: 'meeting', max_rsvps: 0, hours_credit: 1, qr_enabled: false };

const typeOptions = ['meeting', 'project', 'volunteer', 'social'];
const typeColors = {
  meeting: 'bg-primary/10 text-primary', project: 'bg-rose-100 text-rose-700',
  volunteer: 'bg-green-100 text-green-700', social: 'bg-amber-100 text-amber-700',
};

export default function EventsTab() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null | 'new' | event obj
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [qrEventId, setQrEventId] = useState(null);
  const [rsvpCounts, setRsvpCounts] = useState({});
  const [rsvpListEventId, setRsvpListEventId] = useState(null);
  const [rsvpList, setRsvpList] = useState([]);
  const [rsvpListLoading, setRsvpListLoading] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const [list, allRsvps] = await Promise.all([
      base44.entities.ClubEvent.list('date'),
      base44.entities.EventRSVP.list(),
    ]);
    setEvents(list);
    setLoading(false);
    const counts = {};
    allRsvps.forEach(r => { counts[r.event_id] = (counts[r.event_id] || 0) + 1; });
    setRsvpCounts(counts);
  };

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const startNew = () => { setForm(EMPTY); setEditing('new'); };
  const startEdit = (e) => { setForm({ ...e }); setEditing(e); };
  const cancel = () => { setEditing(null); setForm(EMPTY); };

  const save = async () => {
    if (!form.title || !form.date) { toast.error('Title and date are required.'); return; }
    setSaving(true);
    if (editing === 'new') {
      await base44.entities.ClubEvent.create(form);
      toast.success('Event created!');
    } else {
      await base44.entities.ClubEvent.update(editing.id, form);
      toast.success('Event updated!');
    }
    setSaving(false);
    cancel();
    load();
  };

  const deleteEvent = async (id) => {
    if (!confirm('Delete this event?')) return;
    await base44.entities.ClubEvent.delete(id);
    toast.success('Event deleted.');
    load();
  };

  const qrUrl = qrEventId ? `${window.location.origin}/attend?event=${qrEventId}` : '';

  const showRsvpList = async (eventId) => {
    if (rsvpListEventId === eventId) { setRsvpListEventId(null); return; }
    setRsvpListEventId(eventId);
    setRsvpListLoading(true);
    const list = await base44.entities.EventRSVP.filter({ event_id: eventId });
    setRsvpList(list);
    setRsvpListLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-bold text-xl">Events</h2>
        <Button onClick={startNew} className="gap-1.5 rounded-full px-5">
          <Plus className="w-4 h-4" /> New Event
        </Button>
      </div>

      {/* Form */}
      {editing && (
        <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
          <h3 className="font-heading font-semibold text-base">{editing === 'new' ? 'New Event' : 'Edit Event'}</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Title *</Label>
              <Input value={form.title} onChange={e => set('title', e.target.value)} placeholder="Event title" />
            </div>
            <div className="space-y-1.5">
              <Label>Date *</Label>
              <Input type="date" value={form.date} onChange={e => set('date', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Time</Label>
              <Input value={form.time} onChange={e => set('time', e.target.value)} placeholder="3:00 PM – 4:30 PM" />
            </div>
            <div className="space-y-1.5">
              <Label>Location</Label>
              <Input value={form.location} onChange={e => set('location', e.target.value)} placeholder="Room 204, Milford HS" />
            </div>
            <div className="space-y-1.5">
              <Label>Type</Label>
              <select value={form.type} onChange={e => set('type', e.target.value)} className="w-full border border-input rounded-md h-9 px-3 text-sm bg-background">
                {typeOptions.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Max RSVPs (0 = unlimited)</Label>
              <Input type="number" min="0" value={form.max_rsvps} onChange={e => set('max_rsvps', Number(e.target.value))} />
            </div>
            <div className="space-y-1.5">
              <Label>Hours Credit (QR scan)</Label>
              <Input type="number" min="0" step="0.5" value={form.hours_credit} onChange={e => set('hours_credit', Number(e.target.value))} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} placeholder="Optional event description…" />
            </div>
            <div className="sm:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <div
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${form.qr_enabled ? 'bg-primary' : 'bg-muted'}`}
                  onClick={() => set('qr_enabled', !form.qr_enabled)}
                >
                  <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${form.qr_enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </div>
                <span className="text-sm">Enable QR check-in & auto attendance credit</span>
              </label>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button onClick={save} disabled={saving} className="rounded-full gap-1.5">
              <Check className="w-4 h-4" />{saving ? 'Saving...' : 'Save Event'}
            </Button>
            <Button variant="outline" onClick={cancel} className="rounded-full gap-1.5">
              <X className="w-4 h-4" /> Cancel
            </Button>
          </div>
        </div>
      )}

      {/* QR Modal */}
      {qrEventId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setQrEventId(null)}>
          <div className="bg-card rounded-2xl border border-border p-8 text-center max-w-xs w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="font-heading font-bold text-lg mb-1">QR Check-In</h3>
            <p className="text-xs text-muted-foreground mb-4">Members scan this to log attendance</p>
            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrUrl)}`} alt="QR" className="mx-auto rounded-xl border border-border mb-4" />
            <p className="text-xs text-muted-foreground break-all mb-4">{qrUrl}</p>
            <Button variant="outline" className="w-full rounded-full" onClick={() => setQrEventId(null)}>Close</Button>
          </div>
        </div>
      )}

      {/* Events List */}
      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : events.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">No events yet. Create one!</div>
      ) : (
        <div className="space-y-3">
          {events.map(e => {
            const d = new Date(e.date);
            return (
              <div key={e.id} className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="p-4 flex items-center gap-4">
                  <div className="shrink-0 w-12 h-12 rounded-xl bg-primary flex flex-col items-center justify-center text-primary-foreground">
                    <span className="text-[9px] font-bold uppercase">{isNaN(d) ? '' : d.toLocaleDateString('en-US',{month:'short'})}</span>
                    <span className="text-base font-black leading-none">{isNaN(d) ? '?' : d.getDate()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <p className="font-semibold text-sm truncate">{e.title}</p>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${typeColors[e.type] || 'bg-muted text-muted-foreground'}`}>{e.type}</span>
                      {e.qr_enabled && <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full flex items-center gap-1"><QrCode className="w-2.5 h-2.5" />QR</span>}
                    </div>
                    <p className="text-xs text-muted-foreground">{e.time}{e.location ? ` · ${e.location}` : ''}</p>
                    {rsvpCounts[e.id] !== undefined && (
                      <button className="text-xs text-primary flex items-center gap-1 mt-0.5 hover:underline" onClick={() => showRsvpList(e.id)}>
                        <Users className="w-3 h-3" />{rsvpCounts[e.id]} signed up
                        {rsvpListEventId === e.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {e.qr_enabled && (
                      <Button size="icon" variant="outline" className="w-8 h-8" onClick={() => setQrEventId(e.id)} title="Show QR code">
                        <QrCode className="w-3.5 h-3.5" />
                      </Button>
                    )}
                    <Button size="icon" variant="outline" className="w-8 h-8" onClick={() => startEdit(e)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="icon" variant="outline" className="w-8 h-8 text-destructive hover:bg-destructive/10" onClick={() => deleteEvent(e.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
                {/* RSVP List Panel */}
                {rsvpListEventId === e.id && (
                  <div className="border-t border-border bg-muted/30 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Registered Members</p>
                    {rsvpListLoading ? (
                      <div className="text-xs text-muted-foreground">Loading...</div>
                    ) : rsvpList.length === 0 ? (
                      <div className="text-xs text-muted-foreground">No sign-ups yet.</div>
                    ) : (
                      <div className="grid sm:grid-cols-2 gap-1.5">
                        {rsvpList.map((r, i) => (
                          <div key={r.id} className="flex items-center gap-2 bg-card rounded-lg px-3 py-1.5 border border-border">
                            <span className="text-xs text-muted-foreground shrink-0">{i + 1}.</span>
                            <div className="min-w-0">
                              <p className="text-xs font-medium truncate">{r.member_name || '—'}</p>
                              <p className="text-[10px] text-muted-foreground truncate">{r.member_email}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}