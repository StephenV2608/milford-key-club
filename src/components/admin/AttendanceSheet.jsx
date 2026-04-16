import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Check, X, UserPlus, ClipboardList, ChevronDown, Search, Download } from 'lucide-react';

const GRADES = ['9', '10', '11', '12'];

export default function AttendanceSheet() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [members, setMembers] = useState([]);
  const [attended, setAttended] = useState(new Set());
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // New member quick-add
  const [showAdd, setShowAdd] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', email: '', grade: '9' });
  const [addingMember, setAddingMember] = useState(false);

  useEffect(() => {
    Promise.all([
      base44.entities.ClubEvent.list('-date'),
      base44.entities.Member.list('name'),
    ]).then(([evts, mbrs]) => {
      setEvents(evts);
      setMembers(mbrs.filter(m => m.active !== false));
      setLoading(false);
    });
  }, []);

  // When event is selected, pre-load any existing attendance logs
  useEffect(() => {
    if (!selectedEvent) { setAttended(new Set()); return; }
    base44.entities.AttendanceLog.filter({ event_id: selectedEvent.id }).then(logs => {
      setAttended(new Set(logs.map(l => l.member_email)));
    });
    setSaved(false);
  }, [selectedEvent]);

  const toggle = (email) => {
    setAttended(prev => {
      const next = new Set(prev);
      next.has(email) ? next.delete(email) : next.add(email);
      return next;
    });
    setSaved(false);
  };

  const markAll = () => { setAttended(new Set(filtered.map(m => m.email))); setSaved(false); };
  const clearAll = () => { setAttended(new Set()); setSaved(false); };

  const saveAttendance = async () => {
    if (!selectedEvent) return;
    setSaving(true);
    // Get existing logs for this event
    const existing = await base44.entities.AttendanceLog.filter({ event_id: selectedEvent.id });
    const existingEmails = new Set(existing.map(l => l.member_email));

    // Add new attendance entries
    const toAdd = [...attended].filter(e => !existingEmails.has(e));
    // Remove unchecked entries
    const toRemove = existing.filter(l => !attended.has(l.member_email));

    await Promise.all([
      ...toAdd.map(email => {
        const member = members.find(m => m.email === email);
        return base44.entities.AttendanceLog.create({
          event_id: selectedEvent.id,
          event_title: selectedEvent.title,
          member_email: email,
          member_name: member?.name || email,
          scanned_at: new Date().toISOString(),
          hours_credited: selectedEvent.hours_credit || 1,
        });
      }),
      ...toRemove.map(l => base44.entities.AttendanceLog.delete(l.id)),
    ]);

    toast.success(`Attendance saved — ${attended.size} member(s) marked present`);
    setSaving(false);
    setSaved(true);
  };

  const addNewMember = async () => {
    if (!newMember.name || !newMember.email) { toast.error('Name and email required'); return; }
    // Check for duplicate
    const existing = members.find(m => m.email.toLowerCase() === newMember.email.toLowerCase());
    if (existing) { toast.error('A member with that email already exists'); return; }
    setAddingMember(true);
    const created = await base44.entities.Member.create({ ...newMember, active: true });
    const updatedList = await base44.entities.Member.list('name');
    setMembers(updatedList.filter(m => m.active !== false));
    // Auto-mark them as attended
    setAttended(prev => new Set([...prev, newMember.email]));
    setNewMember({ name: '', email: '', grade: '9' });
    setShowAdd(false);
    setAddingMember(false);
    setSaved(false);
    toast.success(`${created.name} added to roster and marked present!`);
  };

  const exportCSV = () => {
    if (!selectedEvent) return;
    const rows = [['Name', 'Email', 'Grade', 'Present']];
    members.forEach(m => rows.push([m.name, m.email, m.grade || '', attended.has(m.email) ? 'Yes' : 'No']));
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${selectedEvent.title.replace(/\s+/g, '-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = members.filter(m =>
    !search || m.name.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-12 bg-muted rounded-xl animate-pulse" />)}</div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-bold text-xl flex items-center gap-2"><ClipboardList className="w-5 h-5 text-primary" />Attendance Sheet</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Take attendance for any meeting or event</p>
        </div>
      </div>

      {/* Event selector */}
      <div className="bg-card rounded-xl border border-border p-4 space-y-2">
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">Select Event / Meeting</Label>
        <div className="relative">
          <select
            className="w-full border border-input rounded-md h-9 px-3 text-sm bg-background appearance-none pr-8"
            value={selectedEvent?.id || ''}
            onChange={e => {
              const ev = events.find(ev => ev.id === e.target.value);
              setSelectedEvent(ev || null);
            }}
          >
            <option value="">— Pick an event —</option>
            {events.map(ev => (
              <option key={ev.id} value={ev.id}>
                {ev.date ? `${new Date(ev.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · ` : ''}
                {ev.title}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      {selectedEvent && (
        <>
          {/* Controls */}
          <div className="bg-card rounded-xl border border-border p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-sm">{selectedEvent.title}</p>
                <p className="text-xs text-muted-foreground">{attended.size} of {members.length} present</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button size="sm" variant="outline" onClick={markAll} className="text-xs gap-1"><Check className="w-3 h-3" />All Present</Button>
                <Button size="sm" variant="outline" onClick={clearAll} className="text-xs gap-1"><X className="w-3 h-3" />Clear</Button>
                <Button size="sm" variant="outline" onClick={exportCSV} className="text-xs gap-1"><Download className="w-3 h-3" />CSV</Button>
                <Button size="sm" onClick={saveAttendance} disabled={saving || saved} className={`text-xs gap-1 rounded-full ${saved ? 'bg-green-600 hover:bg-green-600' : ''}`}>
                  <Check className="w-3 h-3" />{saving ? 'Saving...' : saved ? 'Saved!' : 'Save Attendance'}
                </Button>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search members..."
                className="pl-8 h-8 text-sm"
              />
            </div>
          </div>

          {/* Member checklist */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="divide-y divide-border">
              {filtered.map(m => (
                <button
                  key={m.id}
                  onClick={() => toggle(m.email)}
                  className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left hover:bg-muted/40 ${attended.has(m.email) ? 'bg-green-50' : ''}`}
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${attended.has(m.email) ? 'bg-green-500 border-green-500' : 'border-muted-foreground/30'}`}>
                    {attended.has(m.email) && <Check className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${attended.has(m.email) ? 'text-green-800' : ''}`}>{m.name}</p>
                    <p className="text-xs text-muted-foreground">{m.email}{m.grade ? ` · Grade ${m.grade}` : ''}</p>
                  </div>
                  {attended.has(m.email) && (
                    <span className="text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full shrink-0">Present</span>
                  )}
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="text-sm text-center text-muted-foreground py-8">No members match your search.</p>
              )}
            </div>
          </div>

          {/* Quick-add new member */}
          <div className="bg-card rounded-xl border border-border p-4">
            <button
              onClick={() => setShowAdd(v => !v)}
              className="flex items-center gap-2 text-sm font-medium text-primary hover:underline w-full"
            >
              <UserPlus className="w-4 h-4" />
              Add a new member on the spot
            </button>
            {showAdd && (
              <div className="mt-4 space-y-3 border-t border-border pt-4">
                <p className="text-xs text-muted-foreground">They'll be added to the roster and marked present automatically.</p>
                <div className="grid sm:grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground">Full Name *</Label>
                    <Input className="mt-1" value={newMember.name} onChange={e => setNewMember(p => ({ ...p, name: e.target.value }))} placeholder="Jane Doe" />
                  </div>
                  <div>
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground">Email *</Label>
                    <Input className="mt-1" type="email" value={newMember.email} onChange={e => setNewMember(p => ({ ...p, email: e.target.value }))} placeholder="jane@school.edu" />
                  </div>
                  <div>
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground">Grade</Label>
                    <select className="mt-1 w-full border border-input rounded-md h-9 px-3 text-sm bg-background" value={newMember.grade} onChange={e => setNewMember(p => ({ ...p, grade: e.target.value }))}>
                      {GRADES.map(g => <option key={g} value={g}>Grade {g}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={addNewMember} disabled={addingMember} className="gap-1.5">
                    <UserPlus className="w-3.5 h-3.5" />{addingMember ? 'Adding...' : 'Add & Mark Present'}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setShowAdd(false)} className="gap-1.5">
                    <X className="w-3.5 h-3.5" />Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {!selectedEvent && (
        <div className="text-center py-16 text-muted-foreground">
          <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Select an event above to start taking attendance</p>
        </div>
      )}
    </div>
  );
}