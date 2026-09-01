import { useState, useEffect } from 'react';
import FormSelect from '@/components/ui/form-select';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, FileText, User, Clock, Filter } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function HoursReportTab() {
  const [hours, setHours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [memberSearch, setMemberSearch] = useState('');
  const [orgSearch, setOrgSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('approved');

  useEffect(() => {
    base44.entities.ServiceHour.list('-date').then(list => {
      setHours(list);
      setLoading(false);
    });
  }, []);

  const filtered = hours.filter(h => {
    if (statusFilter !== 'all' && h.status !== statusFilter) return false;
    if (dateFrom && h.date < dateFrom) return false;
    if (dateTo && h.date > dateTo) return false;
    if (memberSearch) {
      const q = memberSearch.toLowerCase();
      if (!(h.member_name || '').toLowerCase().includes(q) &&
          !(h.member_email || '').toLowerCase().includes(q)) return false;
    }
    if (orgSearch && !(h.organization || '').toLowerCase().includes(orgSearch.toLowerCase())) return false;
    return true;
  });

  // Summary stats
  const totalHours = filtered.reduce((sum, h) => sum + (h.hours || 0), 0);
  const uniqueMembers = new Set(filtered.map(h => h.member_email || h.member_name)).size;

  // Per-member totals
  const memberTotals = filtered.reduce((acc, h) => {
    const key = h.member_name || h.member_email || 'Unknown';
    if (!acc[key]) acc[key] = { name: key, email: h.member_email || '', hours: 0, entries: 0 };
    acc[key].hours += h.hours || 0;
    acc[key].entries++;
    return acc;
  }, {});

  const exportCSV = () => {
    const rows = [
      ['Member Name', 'Member Email', 'Date', 'Hours', 'Organization', 'Description', 'Status'],
      ...filtered.map(h => [
        h.member_name || '',
        h.member_email || '',
        h.date || '',
        h.hours || 0,
        h.organization || '',
        (h.description || '').replace(/,/g, ';'),
        h.status || '',
      ])
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hours-report-${dateFrom || 'all'}-to-${dateTo || 'all'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportMemberSummaryCSV = () => {
    const rows = [
      ['Member Name', 'Member Email', 'Total Hours', 'Entries'],
      ...Object.values(memberTotals).sort((a, b) => b.hours - a.hours).map(m => [
        m.name, m.email, m.hours.toFixed(1), m.entries
      ])
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `member-summary-${dateFrom || 'all'}-to-${dateTo || 'all'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-heading font-semibold text-sm uppercase tracking-wide text-muted-foreground">Report Filters</h3>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1">Date From</label>
            <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="h-9 text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1">Date To</label>
            <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="h-9 text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1">Status</label>
            <FormSelect value={statusFilter} onChange={v => setStatusFilter(v)} className="w-full" options={[{ value: 'all', label: 'All Statuses' }, { value: 'approved', label: 'Approved' }, { value: 'pending', label: 'Pending' }, { value: 'rejected', label: 'Rejected' }]} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1">Member</label>
            <Input placeholder="Search by name or email…" value={memberSearch} onChange={e => setMemberSearch(e.target.value)} className="h-9 text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1">Project / Organization</label>
            <Input placeholder="Search by org or project…" value={orgSearch} onChange={e => setOrgSearch(e.target.value)} className="h-9 text-sm" />
          </div>
          <div className="flex items-end">
            <Button size="sm" variant="ghost" onClick={() => { setDateFrom(''); setDateTo(''); setMemberSearch(''); setOrgSearch(''); setStatusFilter('approved'); }} className="text-xs w-full">
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="text-2xl font-black text-primary">{totalHours.toFixed(1)}</p>
          <p className="text-xs text-muted-foreground mt-1">Total Hours</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="text-2xl font-black text-primary">{uniqueMembers}</p>
          <p className="text-xs text-muted-foreground mt-1">Members</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="text-2xl font-black text-primary">{filtered.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Entries</p>
        </div>
      </div>

      {/* Export Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={exportCSV} className="gap-2">
          <Download className="w-4 h-4" /> Export Detailed CSV
        </Button>
        <Button onClick={exportMemberSummaryCSV} variant="outline" className="gap-2">
          <FileText className="w-4 h-4" /> Export Member Summary CSV
        </Button>
      </div>

      {/* Member Summary Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="font-heading font-semibold text-sm uppercase tracking-wide text-muted-foreground">Member Summary</h3>
        </div>
        {loading ? (
          <div className="p-5 space-y-2">{[1,2,3].map(i => <div key={i} className="h-10 rounded bg-muted animate-pulse" />)}</div>
        ) : Object.keys(memberTotals).length === 0 ? (
          <p className="text-sm text-muted-foreground p-5">No records match your filters.</p>
        ) : (
          <div className="divide-y divide-border">
            {Object.values(memberTotals).sort((a, b) => b.hours - a.hours).map(m => (
              <div key={m.name} className="flex items-center gap-3 px-5 py-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <User className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{m.name}</p>
                  {m.email && <p className="text-xs text-muted-foreground truncate">{m.email}</p>}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-green-700">{m.hours.toFixed(1)}h</p>
                  <p className="text-xs text-muted-foreground">{m.entries} {m.entries === 1 ? 'entry' : 'entries'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detailed Entries */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h3 className="font-heading font-semibold text-sm uppercase tracking-wide text-muted-foreground">Detailed Entries</h3>
          <span className="text-xs text-muted-foreground">{filtered.length} records</span>
        </div>
        {loading ? (
          <div className="p-5 space-y-2">{[1,2,3].map(i => <div key={i} className="h-12 rounded bg-muted animate-pulse" />)}</div>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground p-5">No records match your filters.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 border-b border-border">
                <tr>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Member</th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Date</th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Organization</th>
                  <th className="text-right px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Hours</th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(h => (
                  <tr key={h.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-2.5">
                      <p className="font-medium">{h.member_name}</p>
                      {h.member_email && <p className="text-xs text-muted-foreground">{h.member_email}</p>}
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">{h.date}</td>
                    <td className="px-4 py-2.5 text-muted-foreground max-w-[200px] truncate">{h.organization}</td>
                    <td className="px-4 py-2.5 text-right font-bold">{h.hours}h</td>
                    <td className="px-4 py-2.5">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        h.status === 'approved' ? 'bg-green-100 text-green-700' :
                        h.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>{h.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}