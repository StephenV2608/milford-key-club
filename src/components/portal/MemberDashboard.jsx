import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Clock, CheckCircle, LogOut, User, AlertCircle } from 'lucide-react';
import { toast } from "sonner";
import { base44 } from '@/api/base44Client';

const statusColors = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

function calcHours(start, end) {
  if (!start || !end) return null;
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const diff = (eh * 60 + em) - (sh * 60 + sm);
  if (diff <= 0) return null;
  return Math.round(diff) / 60;
}

export default function MemberDashboard({ memberAuth }) {
  const { memberUser, logout } = memberAuth;
  const [myHours, setMyHours] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    date: '', start_time: '', end_time: '', organization: '', description: ''
  });

  useEffect(() => { loadHours(); }, []);
  const loadHours = () => {
    base44.entities.ServiceHour.filter({ member_email: memberUser.email })
      .then(list => setMyHours(list.sort((a, b) => new Date(b.date) - new Date(a.date))));
  };

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const computedHours = calcHours(form.start_time, form.end_time);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!computedHours || computedHours <= 0) { toast.error('End time must be after start time.'); return; }
    setSubmitting(true);
    await base44.entities.ServiceHour.create({
      member_name: memberUser.name,
      member_email: memberUser.email,
      date: form.date,
      hours: computedHours,
      organization: form.organization,
      description: form.description,
      status: 'pending',
    });
    toast.success('Hours submitted for review!');
    setForm({ date: '', start_time: '', end_time: '', organization: '', description: '' });
    setSubmitted(true);
    setSubmitting(false);
    loadHours();
  };

  const approvedHours = myHours.filter(h => h.status === 'approved').reduce((a, h) => a + (h.hours || 0), 0);
  const pendingHours = myHours.filter(h => h.status === 'pending').reduce((a, h) => a + (h.hours || 0), 0);

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-heading font-bold text-2xl">Welcome, {memberUser.name}!</h1>
            <p className="text-muted-foreground text-sm mt-0.5">{memberUser.email} · Grade {memberUser.grade || '—'}</p>
          </div>
          <Button variant="outline" size="sm" onClick={logout} className="gap-1.5">
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-card rounded-xl border border-border p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{approvedHours.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Approved Hours</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 text-center">
            <p className="text-2xl font-bold text-amber-500">{pendingHours.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Pending</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 text-center">
            <p className="text-2xl font-bold text-primary">{myHours.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Submissions</p>
          </div>
        </div>

        {/* Log Hours Form */}
        <div className="bg-card rounded-xl border border-border p-5 mb-6">
          <h3 className="font-heading font-semibold text-base mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" /> Log Service Hours
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>Date *</Label>
                <Input type="date" value={form.date} onChange={e => set('date', e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label>Start Time *</Label>
                <Input type="time" value={form.start_time} onChange={e => set('start_time', e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label>End Time *</Label>
                <Input type="time" value={form.end_time} onChange={e => set('end_time', e.target.value)} required />
              </div>
            </div>

            {/* Computed hours preview */}
            {form.start_time && form.end_time && (
              <div className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg ${computedHours && computedHours > 0 ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {computedHours && computedHours > 0
                  ? <><CheckCircle className="w-4 h-4 shrink-0" /> <strong>{computedHours.toFixed(2)} hours</strong> will be logged ({form.start_time} – {form.end_time})</>
                  : <><AlertCircle className="w-4 h-4 shrink-0" /> End time must be after start time</>
                }
              </div>
            )}

            <div className="space-y-1.5">
              <Label>Organization / Event *</Label>
              <Input placeholder="e.g. Milford Food Bank, Got Bags Drive" value={form.organization} onChange={e => set('organization', e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea placeholder="Briefly describe what you did..." rows={2} value={form.description} onChange={e => set('description', e.target.value)} />
            </div>
            <Button type="submit" className="rounded-full px-8" disabled={submitting || !computedHours || computedHours <= 0}>
              {submitting ? 'Submitting...' : 'Submit Hours'}
            </Button>
          </form>
        </div>

        {/* Hours History */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-heading font-semibold text-base mb-4">My Submissions</h3>
          {myHours.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No submissions yet. Log your first hours above!</p>
          ) : (
            <div className="space-y-3">
              {myHours.map(h => (
                <div key={h.id} className="flex items-start gap-3 bg-muted/40 rounded-lg px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <span className="font-medium text-sm">{h.organization}</span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${statusColors[h.status]}`}>{h.status}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{h.date}</p>
                    {h.admin_notes && <p className="text-xs text-muted-foreground italic mt-1">Admin: {h.admin_notes}</p>}
                  </div>
                  <p className="font-bold text-sm shrink-0">{h.hours}h</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}