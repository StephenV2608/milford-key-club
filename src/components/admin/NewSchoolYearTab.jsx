import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { GraduationCap, Users, UserCheck, ChevronRight, Check, X, AlertTriangle, Archive, RefreshCw } from 'lucide-react';

export default function NewSchoolYearTab() {
  const [officers, setOfficers] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState('intro'); // intro | review | confirm | done
  const [membersToArchive, setMembersToArchive] = useState(new Set());
  const [running, setRunning] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    const [o, m] = await Promise.all([
      base44.entities.Officer.list('order'),
      base44.entities.Member.list('name'),
    ]);
    setOfficers(o);
    setMembers(m);
    setLoading(false);
  };

  // Officers that will be archived (all non-advisors, non-archived)
  const officersToArchive = officers.filter(o =>
    !o.archived &&
    o.role?.toLowerCase() !== 'faculty advisor' &&
    o.role?.toLowerCase() !== 'advisor' &&
    o.role?.toLowerCase() !== 'faculty adviser' &&
    o.role?.toLowerCase() !== 'adviser'
  );
  const advisors = officers.filter(o =>
    !o.archived && (
      o.role?.toLowerCase() === 'faculty advisor' ||
      o.role?.toLowerCase() === 'advisor' ||
      o.role?.toLowerCase() === 'faculty adviser' ||
      o.role?.toLowerCase() === 'adviser'
    )
  );
  const activeMembers = members.filter(m => m.active !== false);

  const toggleMember = (id) => {
    setMembersToArchive(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectByGrade = (grade) => {
    const toAdd = activeMembers.filter(m => m.grade === grade).map(m => m.id);
    setMembersToArchive(prev => {
      const next = new Set(prev);
      toAdd.forEach(id => next.add(id));
      return next;
    });
  };

  const runNewYear = async () => {
    setRunning(true);
    let officerCount = 0;
    let memberCount = 0;

    // Archive officers (except advisors)
    for (const o of officersToArchive) {
      await base44.entities.Officer.update(o.id, {
        archived: true,
        year: o.year || new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
      });
      officerCount++;
    }

    // Archive selected members
    for (const id of membersToArchive) {
      await base44.entities.Member.update(id, { active: false });
      memberCount++;
    }

    toast.success(`New school year started! Archived ${officerCount} officer(s) and ${memberCount} member(s).`);
    setRunning(false);
    setStep('done');
    loadData();
  };

  if (loading) return <div className="py-16 text-center text-muted-foreground">Loading...</div>;

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <GraduationCap className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="font-heading font-bold text-xl">New School Year</h2>
          <p className="text-sm text-muted-foreground">Archive outgoing officers and graduating members</p>
        </div>
      </div>

      {step === 'intro' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm text-amber-800">Before you continue</p>
                <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                  This will archive all current officers (except Faculty Advisors) and any members you select.
                  Archived officers move to the "Past Officers" section. Archived members are marked inactive but <strong>their service hours are kept</strong>.
                  This action can be partially undone by manually re-activating individual records.
                </p>
              </div>
            </div>
          </div>

          {/* Officer preview */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="font-heading font-semibold text-sm mb-3 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-primary" /> Officers that will be archived ({officersToArchive.length})
            </h3>
            {officersToArchive.length === 0 ? (
              <p className="text-xs text-muted-foreground">No active officers to archive.</p>
            ) : (
              <div className="space-y-1.5">
                {officersToArchive.map(o => (
                  <div key={o.id} className="flex items-center gap-2.5 bg-muted/40 rounded-lg px-3 py-2">
                    <div className="w-7 h-7 rounded-full bg-muted overflow-hidden shrink-0">
                      {o.photo_url ? <img src={o.photo_url} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-xs font-bold text-muted-foreground">{o.name?.[0]}</div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{o.name}</p>
                      <p className="text-xs text-muted-foreground">{o.role}</p>
                    </div>
                    <Archive className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  </div>
                ))}
              </div>
            )}
            {advisors.length > 0 && (
              <p className="text-xs text-muted-foreground mt-3">
                ✓ Staying: {advisors.map(a => a.name).join(', ')} (Advisor{advisors.length > 1 ? 's' : ''})
              </p>
            )}
          </div>

          <Button onClick={() => setStep('review')} className="gap-2 rounded-full px-8">
            Continue <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {step === 'review' && (
        <div className="space-y-4">
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="font-heading font-semibold text-sm mb-1 flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" /> Select members to archive
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Check members who are graduating or leaving. Leave others checked-off to keep them active for the new year.
            </p>

            {/* Quick-select by grade */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="text-xs text-muted-foreground self-center">Quick select grade:</span>
              {['9','10','11','12'].map(g => {
                const count = activeMembers.filter(m => m.grade === g).length;
                if (!count) return null;
                return (
                  <button key={g} onClick={() => selectByGrade(g)}
                    className="text-xs bg-muted hover:bg-primary/10 hover:text-primary border border-border rounded-full px-3 py-1 transition-colors font-medium">
                    Grade {g} ({count})
                  </button>
                );
              })}
              <button onClick={() => setMembersToArchive(new Set())}
                className="text-xs text-muted-foreground hover:text-foreground border border-border rounded-full px-3 py-1 transition-colors">
                Clear all
              </button>
            </div>

            {activeMembers.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">No active members.</p>
            ) : (
              <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
                {activeMembers.map(m => {
                  const checked = membersToArchive.has(m.id);
                  return (
                    <label key={m.id} className={`flex items-center gap-3 rounded-lg px-3 py-2 cursor-pointer transition-colors ${checked ? 'bg-destructive/5 border border-destructive/20' : 'bg-muted/40 hover:bg-muted'}`}>
                      <input type="checkbox" checked={checked} onChange={() => toggleMember(m.id)} className="rounded shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{m.name}</p>
                        <p className="text-xs text-muted-foreground">{m.email}{m.grade ? ` · Grade ${m.grade}` : ''}{m.class_year ? ` · Class of ${m.class_year}` : ''}</p>
                      </div>
                      {checked && <Archive className="w-3.5 h-3.5 text-destructive shrink-0" />}
                    </label>
                  );
                })}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-3">
              {membersToArchive.size} member{membersToArchive.size !== 1 ? 's' : ''} selected to archive
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep('intro')} className="rounded-full gap-1.5">
              <X className="w-4 h-4" /> Back
            </Button>
            <Button onClick={() => setStep('confirm')} className="gap-2 rounded-full px-8">
              Review & Confirm <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {step === 'confirm' && (
        <div className="space-y-4">
          <div className="bg-destructive/5 border border-destructive/30 rounded-xl p-5 space-y-3">
            <p className="font-semibold text-sm flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-4 h-4" /> Final confirmation
            </p>
            <ul className="text-sm space-y-1.5 text-foreground">
              <li className="flex items-center gap-2"><Archive className="w-3.5 h-3.5 text-muted-foreground" /> Archive <strong>{officersToArchive.length}</strong> officer(s) → Past Officers</li>
              <li className="flex items-center gap-2"><Archive className="w-3.5 h-3.5 text-muted-foreground" /> Deactivate <strong>{membersToArchive.size}</strong> member(s)</li>
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-green-600" /> Keep <strong>{advisors.length}</strong> advisor(s) active</li>
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-green-600" /> Keep <strong>{activeMembers.length - membersToArchive.size}</strong> member(s) active</li>
            </ul>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep('review')} className="rounded-full gap-1.5" disabled={running}>
              <X className="w-4 h-4" /> Back
            </Button>
            <Button onClick={runNewYear} disabled={running} className="gap-2 rounded-full px-8 bg-primary">
              <GraduationCap className="w-4 h-4" />
              {running ? 'Processing...' : 'Start New School Year'}
            </Button>
          </div>
        </div>
      )}

      {step === 'done' && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto">
            <GraduationCap className="w-6 h-6 text-green-600" />
          </div>
          <p className="font-heading font-bold text-lg">New school year started!</p>
          <p className="text-sm text-muted-foreground">Officers have been moved to Past Officers and selected members are now inactive. You can now add new officers and welcome new members.</p>
          <Button variant="outline" onClick={() => { setStep('intro'); setMembersToArchive(new Set()); }} className="gap-1.5 mt-2 rounded-full">
            <RefreshCw className="w-4 h-4" /> Reset
          </Button>
        </div>
      )}
    </div>
  );
}