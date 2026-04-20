import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { HandHeart, Mail, Phone, MapPin, Calendar, Users, Trash2 } from 'lucide-react';

const STATUS_COLORS = {
  new:        'bg-blue-100 text-blue-700',
  reviewing:  'bg-amber-100 text-amber-700',
  accepted:   'bg-green-100 text-green-700',
  completed:  'bg-muted text-muted-foreground',
  declined:   'bg-red-100 text-red-700',
};
const STATUSES = ['new', 'reviewing', 'accepted', 'completed', 'declined'];

export default function CommunityRequestsTab() {
  const [reqs, setReqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState(null);
  const [notes, setNotes] = useState({});

  useEffect(() => { load(); }, []);
  const load = async () => {
    setLoading(true);
    const list = await base44.entities.HelpRequestSubmission.list('-created_date');
    setReqs(list);
    setLoading(false);
  };

  const setStatus = async (r, status) => {
    await base44.entities.HelpRequestSubmission.update(r.id, { status });
    toast.success(`Marked as ${status}`);
    load();
  };
  const saveNotes = async (r) => {
    await base44.entities.HelpRequestSubmission.update(r.id, { admin_notes: notes[r.id] || '' });
    toast.success('Notes saved');
  };
  const del = async (r) => {
    if (!confirm(`Delete request from ${r.requester_name}?`)) return;
    await base44.entities.HelpRequestSubmission.delete(r.id);
    toast.success('Deleted');
    load();
  };

  const filtered = filter === 'all' ? reqs : reqs.filter(r => r.status === filter);
  const counts = STATUSES.reduce((acc, s) => { acc[s] = reqs.filter(r => r.status === s).length; return acc; }, {});

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading font-bold text-xl mb-1 flex items-center gap-2">
          <HandHeart className="w-5 h-5 text-primary" /> Community Help Requests
        </h2>
        <p className="text-sm text-muted-foreground">Requests from the community asking for volunteer support.</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <FilterChip active={filter === 'all'} onClick={() => setFilter('all')}>All ({reqs.length})</FilterChip>
        {STATUSES.map(s => (
          <FilterChip key={s} active={filter === s} onClick={() => setFilter(s)}>
            {s.charAt(0).toUpperCase() + s.slice(1)} ({counts[s] || 0})
          </FilterChip>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-8 text-center">
          <HandHeart className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No requests here yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(r => (
            <div key={r.id} className="bg-card rounded-xl border border-border overflow-hidden">
              <button
                onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                className="w-full p-5 flex items-start gap-3 text-left hover:bg-muted/40 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="font-semibold text-sm">{r.requester_name}</p>
                    {r.organization && <span className="text-xs text-muted-foreground">· {r.organization}</span>}
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${STATUS_COLORS[r.status] || STATUS_COLORS.new}`}>{r.status || 'new'}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">{r.category}</span>
                    {r.date_needed && ` · ${r.date_needed}`}
                    {r.volunteers_needed ? ` · ${r.volunteers_needed} vol.` : ''}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{r.description}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {r.created_date && new Date(r.created_date).toLocaleDateString()}
                </span>
              </button>

              {expanded === r.id && (
                <div className="border-t border-border p-5 space-y-4 bg-muted/20">
                  <div className="grid sm:grid-cols-2 gap-3 text-sm">
                    <InfoRow icon={Mail} label="Email"><a href={`mailto:${r.email}`} className="text-primary hover:underline">{r.email}</a></InfoRow>
                    {r.phone && <InfoRow icon={Phone} label="Phone">{r.phone}</InfoRow>}
                    {r.date_needed && <InfoRow icon={Calendar} label="Date">{r.date_needed}</InfoRow>}
                    {r.volunteers_needed && <InfoRow icon={Users} label="Volunteers">{r.volunteers_needed}</InfoRow>}
                    {r.location && <InfoRow icon={MapPin} label="Location">{r.location}</InfoRow>}
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">Description</p>
                    <p className="text-sm whitespace-pre-wrap">{r.description}</p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">Admin Notes</p>
                    <Textarea
                      rows={2}
                      value={notes[r.id] !== undefined ? notes[r.id] : (r.admin_notes || '')}
                      onChange={e => setNotes(p => ({ ...p, [r.id]: e.target.value }))}
                      placeholder="Internal notes…"
                    />
                    <Button size="sm" variant="outline" onClick={() => saveNotes(r)} className="mt-2">Save Notes</Button>
                  </div>

                  <div className="flex gap-2 flex-wrap pt-1 border-t border-border">
                    {STATUSES.map(s => (
                      <Button
                        key={s}
                        size="sm"
                        variant={r.status === s ? 'default' : 'outline'}
                        onClick={() => setStatus(r, s)}
                        className="capitalize"
                      >
                        {s}
                      </Button>
                    ))}
                    <Button size="sm" variant="ghost" onClick={() => del(r)} className="ml-auto text-destructive hover:text-destructive gap-1">
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
        active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/70'
      }`}
    >
      {children}
    </button>
  );
}

function InfoRow({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
        <div className="text-sm">{children}</div>
      </div>
    </div>
  );
}