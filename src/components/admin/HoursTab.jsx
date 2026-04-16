import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, X, Clock, User, Sparkles, ChevronDown, ChevronUp, ArrowUpDown, Filter } from 'lucide-react';
import { toast } from "sonner";
import { base44 } from '@/api/base44Client';

const statusColors = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

const SORT_OPTIONS = [
  { value: 'date_desc',   label: 'Newest First' },
  { value: 'date_asc',    label: 'Oldest First' },
  { value: 'hours_desc',  label: 'Most Hours' },
  { value: 'hours_asc',   label: 'Fewest Hours' },
  { value: 'member_asc',  label: 'Member A–Z' },
];

function sortHours(list, sort) {
  const s = [...list];
  switch (sort) {
    case 'date_asc':   return s.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
    case 'date_desc':  return s.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    case 'hours_desc': return s.sort((a, b) => (b.hours || 0) - (a.hours || 0));
    case 'hours_asc':  return s.sort((a, b) => (a.hours || 0) - (b.hours || 0));
    case 'member_asc': return s.sort((a, b) => (a.member_name || '').localeCompare(b.member_name || ''));
    default:           return s;
  }
}

export default function HoursTab() {
  const [hours, setHours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [sort, setSort] = useState('date_desc');
  const [search, setSearch] = useState('');
  const [minHours, setMinHours] = useState('');
  const [maxHours, setMaxHours] = useState('');
  const [notes, setNotes] = useState({});
  const [aiLoading, setAiLoading] = useState({});
  const [aiResults, setAiResults] = useState({});
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => { load(); }, []);

  const load = () => {
    setLoading(true);
    base44.entities.ServiceHour.list('-created_date').then(list => {
      setHours(list);
      setLoading(false);
    });
  };

  const updateStatus = async (id, status, note) => {
    await base44.entities.ServiceHour.update(id, { status, admin_notes: note || notes[id] || '' });
    toast.success(`Hours ${status}!`);
    load();
  };

  // AI Auto-Review
  const aiReview = async (h) => {
    setAiLoading(p => ({ ...p, [h.id]: true }));
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are reviewing a service hour submission for a high school Key Club. 
Decide whether to APPROVE or REJECT it, and give a short reason (1 sentence).

Submission:
- Organization: ${h.organization}
- Hours: ${h.hours}
- Date: ${h.date}
- Description: ${h.description || '(none provided)'}

Rules for approval:
- Organization must be a plausible nonprofit, school, or community service entity
- Hours should be reasonable (not more than 12 in a day)
- Description should be vaguely relevant to community service

Respond with JSON: { "decision": "approved" | "rejected", "reason": "..." }`,
      response_json_schema: {
        type: 'object',
        properties: {
          decision: { type: 'string', enum: ['approved', 'rejected'] },
          reason: { type: 'string' },
        },
      },
    });
    setAiResults(p => ({ ...p, [h.id]: result }));
    setNotes(p => ({ ...p, [h.id]: `AI: ${result.reason}` }));
    setAiLoading(p => ({ ...p, [h.id]: false }));
  };

  const aiApproveAll = async () => {
    const pending = hours.filter(h => h.status === 'pending');
    if (!pending.length) { toast.info('No pending submissions.'); return; }
    toast.info(`Reviewing ${pending.length} submissions with AI…`);
    for (const h of pending) await aiReview(h);
    toast.success('AI review complete — check results and confirm.');
  };

  // Filtered + sorted
  const filtered = sortHours(
    hours.filter(h => {
      if (filter !== 'all' && h.status !== filter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!(h.member_name || '').toLowerCase().includes(q) &&
            !(h.organization || '').toLowerCase().includes(q) &&
            !(h.description || '').toLowerCase().includes(q)) return false;
      }
      if (minHours && (h.hours || 0) < Number(minHours)) return false;
      if (maxHours && (h.hours || 0) > Number(maxHours)) return false;
      return true;
    }),
    sort
  );

  // Member totals
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
                <p className="text-xs text-muted-foreground">{data.pending > 0 ? `${data.pending.toFixed(1)}h pending` : 'all reviewed'}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-green-700">{data.approved.toFixed(1)}h approved</p>
                <p className="text-xs text-muted-foreground">{data.total.toFixed(1)}h total</p>
              </div>
            </div>
          ))}
          {Object.keys(memberTotals).length === 0 && <p className="text-sm text-muted-foreground py-2">No submissions yet.</p>}
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          {['pending','approved','rejected','all'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors capitalize ${filter === f ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'}`}
            >{f}</button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => setShowFilters(v => !v)} className="gap-1.5">
              <Filter className="w-3.5 h-3.5" /> Filters {showFilters ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </Button>
            <Button size="sm" variant="outline" onClick={aiApproveAll} className="gap-1.5 border-purple-300 text-purple-700 hover:bg-purple-50">
              <Sparkles className="w-3.5 h-3.5" /> AI Review All
            </Button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="bg-muted/40 rounded-xl border border-border p-4 grid sm:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1">Search</label>
              <Input placeholder="Member, org, description…" value={search} onChange={e => setSearch(e.target.value)} className="h-8 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1">Min Hours</label>
              <Input type="number" min="0" placeholder="e.g. 2" value={minHours} onChange={e => setMinHours(e.target.value)} className="h-8 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1">Max Hours</label>
              <Input type="number" min="0" placeholder="e.g. 8" value={maxHours} onChange={e => setMaxHours(e.target.value)} className="h-8 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1">Sort By</label>
              <select value={sort} onChange={e => setSort(e.target.value)} className="w-full border border-input rounded-md h-8 px-2 text-sm bg-background">
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="sm:col-span-4 flex justify-end">
              <Button size="sm" variant="ghost" onClick={() => { setSearch(''); setMinHours(''); setMaxHours(''); setSort('date_desc'); }} className="text-xs">Clear All</Button>
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground">{filtered.length} submission{filtered.length !== 1 ? 's' : ''} shown</p>
      </div>

      {/* Submissions */}
      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">No matching submissions.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map(h => {
            const ai = aiResults[h.id];
            return (
              <div key={h.id} className={`bg-card rounded-xl border p-5 transition-all ${ai ? (ai.decision === 'approved' ? 'border-green-300' : 'border-red-300') : 'border-border'}`}>
                <div className="flex flex-wrap items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <p className="font-semibold text-sm">{h.member_name}</p>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${statusColors[h.status] || ''}`}>{h.status}</span>
                      {ai && (
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 ${ai.decision === 'approved' ? 'bg-purple-100 text-purple-700' : 'bg-red-100 text-red-700'}`}>
                          <Sparkles className="w-2.5 h-2.5" /> AI: {ai.decision}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{h.organization} · {h.date}</p>
                    {h.description && <p className="text-xs text-muted-foreground mt-1">{h.description}</p>}
                    {ai && <p className="text-xs text-purple-600 mt-1 italic">AI reason: {ai.reason}</p>}
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
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" className="gap-1.5 bg-green-600 hover:bg-green-700 text-white" onClick={() => updateStatus(h.id, 'approved')}>
                        <Check className="w-3.5 h-3.5" /> Approve
                      </Button>
                      <Button size="sm" variant="destructive" className="gap-1.5" onClick={() => updateStatus(h.id, 'rejected')}>
                        <X className="w-3.5 h-3.5" /> Reject
                      </Button>
                      {!ai && (
                        <Button size="sm" variant="outline" className="gap-1.5 border-purple-300 text-purple-700 hover:bg-purple-50" onClick={() => aiReview(h)} disabled={aiLoading[h.id]}>
                          <Sparkles className="w-3.5 h-3.5" />
                          {aiLoading[h.id] ? 'Reviewing…' : 'AI Review'}
                        </Button>
                      )}
                      {ai && (
                        <Button size="sm" className={`gap-1.5 ${ai.decision === 'approved' ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}`}
                          onClick={() => updateStatus(h.id, ai.decision, `AI: ${ai.reason}`)}>
                          <Sparkles className="w-3.5 h-3.5" /> Apply AI Decision
                        </Button>
                      )}
                    </div>
                  </div>
                )}
                {h.admin_notes && h.status !== 'pending' && (
                  <p className="mt-2 text-xs text-muted-foreground italic">Note: {h.admin_notes}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}