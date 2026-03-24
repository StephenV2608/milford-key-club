import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, X, Clock, User, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from "sonner";
import { base44 } from '@/api/base44Client';

const statusColors = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

export default function HoursTab() {
  const [hours, setHours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [expandedMember, setExpandedMember] = useState(null);
  const [notes, setNotes] = useState({});

  useEffect(() => { load(); }, []);

  const load = () => {
    setLoading(true);
    base44.entities.ServiceHour.list('-created_date').then(list => {
      setHours(list);
      setLoading(false);
    });
  };

  const updateStatus = async (id, status) => {
    await base44.entities.ServiceHour.update(id, { status, admin_notes: notes[id] || '' });
    toast.success(`Hours ${status}!`);
    load();
  };

  const filtered = hours.filter(h => filter === 'all' ? true : h.status === filter);

  // Group by member for totals
  const memberTotals = hours.reduce((acc, h) => {
    const key = h.member_name || h.member_email || 'Unknown';
    if (!acc[key]) acc[key] = { total: 0, approved: 0, pending: 0 };
    acc[key].total += h.hours || 0;
    if (h.status === 'approved') acc[key].approved += h.hours || 0;
    if (h.status === 'pending') acc[key].pending += h.hours || 0;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Member Summary */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-heading font-semibold text-sm mb-4 uppercase tracking-wide text-muted-foreground">Member Hour Totals</h3>
        <div className="space-y-2">
          {Object.entries(memberTotals).sort((a,b) => b[1].approved - a[1].approved).map(([name, data]) => (
            <div key={name} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <User className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{name}</p>
                <p className="text-xs text-muted-foreground">{data.pending > 0 ? `${data.pending}h pending` : 'all reviewed'}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-green-700">{data.approved}h approved</p>
                <p className="text-xs text-muted-foreground">{data.total}h total</p>
              </div>
            </div>
          ))}
          {Object.keys(memberTotals).length === 0 && (
            <p className="text-sm text-muted-foreground py-2">No submissions yet.</p>
          )}
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {['pending','approved','rejected','all'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors capitalize ${filter === f ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'}`}
          >{f}</button>
        ))}
      </div>

      {/* Submissions */}
      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">No {filter} submissions.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map(h => (
            <div key={h.id} className="bg-card rounded-xl border border-border p-5">
              <div className="flex flex-wrap items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p className="font-semibold text-sm">{h.member_name}</p>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${statusColors[h.status] || ''}`}>{h.status}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{h.organization} · {h.date}</p>
                  {h.description && <p className="text-xs text-muted-foreground mt-1">{h.description}</p>}
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-bold text-lg">{h.hours}h</p>
                  {h.member_email && <p className="text-xs text-muted-foreground">{h.member_email}</p>}
                </div>
              </div>

              {h.status === 'pending' && (
                <div className="mt-3 pt-3 border-t border-border space-y-2">
                  <Input
                    placeholder="Admin notes (optional)"
                    value={notes[h.id] || ''}
                    onChange={e => setNotes(p => ({ ...p, [h.id]: e.target.value }))}
                    className="text-sm"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" className="gap-1.5 bg-green-600 hover:bg-green-700 text-white" onClick={() => updateStatus(h.id, 'approved')}>
                      <Check className="w-3.5 h-3.5" /> Approve
                    </Button>
                    <Button size="sm" variant="destructive" className="gap-1.5" onClick={() => updateStatus(h.id, 'rejected')}>
                      <X className="w-3.5 h-3.5" /> Reject
                    </Button>
                  </div>
                </div>
              )}
              {h.admin_notes && h.status !== 'pending' && (
                <p className="mt-2 text-xs text-muted-foreground italic">Note: {h.admin_notes}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}