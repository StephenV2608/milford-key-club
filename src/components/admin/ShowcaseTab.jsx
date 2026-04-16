import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Check, X, Star, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

const statusColors = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

export default function ShowcaseTab() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  useEffect(() => { load(); }, []);

  const load = () => {
    setLoading(true);
    base44.entities.ProjectSubmission.list('-created_date').then(list => { setSubmissions(list); setLoading(false); });
  };

  const update = async (id, status) => {
    await base44.entities.ProjectSubmission.update(id, { status });
    toast.success(`Project ${status}!`);
    load();
  };

  const filtered = submissions.filter(s => filter === 'all' || s.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-bold text-xl">Community Showcase</h2>
        <a href="/showcase" target="_blank" className="text-xs text-primary hover:underline flex items-center gap-1">
          <ExternalLink className="w-3.5 h-3.5" /> View Showcase
        </a>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['pending','approved','rejected','all'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${filter === f ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'}`}>
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-48 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Star className="w-10 h-10 mx-auto mb-3 opacity-20" />
          <p className="text-sm">No {filter} submissions.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {filtered.map(s => (
            <div key={s.id} className="bg-card rounded-xl border border-border overflow-hidden">
              {s.photo_url && <img src={s.photo_url} alt={s.title} className="w-full h-40 object-cover" />}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-semibold text-sm">{s.title}</h3>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full shrink-0 ${statusColors[s.status]}`}>{s.status}</span>
                </div>
                {s.organization && <p className="text-xs text-primary font-semibold mb-1">{s.organization}</p>}
                <p className="text-xs text-muted-foreground mb-1">{s.member_name} · {s.date}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">{s.description}</p>
                {s.status === 'pending' && (
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" className="gap-1 bg-green-600 hover:bg-green-700 text-white rounded-full" onClick={() => update(s.id, 'approved')}>
                      <Check className="w-3.5 h-3.5" /> Approve
                    </Button>
                    <Button size="sm" variant="destructive" className="gap-1 rounded-full" onClick={() => update(s.id, 'rejected')}>
                      <X className="w-3.5 h-3.5" /> Reject
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}