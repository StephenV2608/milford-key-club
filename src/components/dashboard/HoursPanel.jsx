import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Check, X, Clock, Users, Hourglass } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import moment from 'moment';

const statusColors = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

export default function HoursPanel() {
  const [hours, setHours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => { load(); }, []);

  const load = () => {
    setLoading(true);
    base44.entities.ServiceHour.list('-created_date').then(list => {
      setHours(list);
      setLoading(false);
    });
  };

  const updateStatus = async (id, status) => {
    setUpdating(id);
    try {
      await base44.entities.ServiceHour.update(id, { status });
      toast.success(`Hours ${status}`);
      load();
    } catch (err) {
      toast.error('Failed to update');
    }
    setUpdating(null);
  };

  const pending = hours.filter(h => h.status === 'pending');
  const approved = hours.filter(h => h.status === 'approved');
  const totalApprovedHours = approved.reduce((sum, h) => sum + (h.hours || 0), 0);
  const uniqueMembers = new Set(approved.map(h => h.member_email).filter(Boolean)).size;

  const stats = [
    { label: 'Pending', value: pending.length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Approved Hours', value: totalApprovedHours, icon: Hourglass, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Active Members', value: uniqueMembers, icon: Users, color: 'text-primary', bg: 'bg-primary/5' },
  ];

  return (
    <div className="bg-card rounded-2xl border border-border p-6">
      <h2 className="font-heading font-bold text-lg mb-1">Service Hours</h2>
      <p className="text-sm text-muted-foreground mb-5">Review and approve member-submitted hours</p>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {stats.map(s => (
          <div key={s.label} className="rounded-xl border border-border p-3 text-center">
            <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center mx-auto mb-1.5`}>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <div className="font-heading font-bold text-xl">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-border border-t-primary rounded-full animate-spin" /></div>
      ) : pending.length === 0 ? (
        <div className="text-center py-8 text-sm text-muted-foreground">
          <Check className="w-8 h-8 mx-auto mb-2 opacity-40" />
          All caught up — no pending hours.
        </div>
      ) : (
        <div className="space-y-2">
          {pending.map(h => (
            <div key={h.id} className="flex items-start gap-3 p-3 rounded-xl border border-border">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm">{h.member_name}</span>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary font-semibold">{h.hours}h</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {h.organization} · {h.date ? moment(h.date).format('MMM D, YYYY') : 'No date'}
                </p>
                {h.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{h.description}</p>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <Button size="icon" className="h-7 w-7 bg-green-600 hover:bg-green-700" disabled={updating === h.id} onClick={() => updateStatus(h.id, 'approved')}>
                  <Check className="w-3.5 h-3.5" />
                </Button>
                <Button size="icon" variant="outline" className="h-7 w-7 text-destructive hover:bg-destructive/10" disabled={updating === h.id} onClick={() => updateStatus(h.id, 'rejected')}>
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}