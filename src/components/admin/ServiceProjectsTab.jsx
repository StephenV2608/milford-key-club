import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Trash2, Edit2, Check, X, Briefcase, GitMerge, AlertCircle } from 'lucide-react';

export default function ServiceProjectsTab() {
  const [projects, setProjects] = useState([]);
  const [hourOrgs, setHourOrgs] = useState([]); // { name, count }
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  // merge state
  const [mergeFrom, setMergeFrom] = useState('');
  const [mergeTo, setMergeTo] = useState('');
  const [merging, setMerging] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const [list, hours] = await Promise.all([
      base44.entities.ServiceProject.list('name'),
      base44.entities.ServiceHour.list(),
    ]);
    setProjects(list);

    // Aggregate organization names from existing ServiceHour entries
    const counts = {};
    hours.forEach(h => {
      const key = (h.organization || '').trim();
      if (!key) return;
      counts[key] = (counts[key] || 0) + 1;
    });
    const arr = Object.entries(counts).map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
    setHourOrgs(arr);
    setLoading(false);
  };

  const addProject = async () => {
    const name = newName.trim();
    if (!name) return;
    if (projects.some(p => p.name.toLowerCase() === name.toLowerCase())) {
      toast.error('That project already exists.');
      return;
    }
    await base44.entities.ServiceProject.create({ name, active: true });
    toast.success('Project added!');
    setNewName('');
    setAdding(false);
    load();
  };

  const addFromHours = async (name) => {
    if (projects.some(p => p.name.toLowerCase() === name.toLowerCase())) {
      toast.info('Already in list.');
      return;
    }
    await base44.entities.ServiceProject.create({ name, active: true });
    toast.success(`Added "${name}"`);
    load();
  };

  const saveEdit = async (id) => {
    const name = editName.trim();
    if (!name) return;
    const original = projects.find(p => p.id === id);
    await base44.entities.ServiceProject.update(id, { name });

    // Also rename existing ServiceHour records that match the old name
    if (original && original.name !== name) {
      const matching = await base44.entities.ServiceHour.filter({ organization: original.name });
      for (const h of matching) {
        await base44.entities.ServiceHour.update(h.id, { organization: name });
      }
      toast.success(`Renamed & updated ${matching.length} hour entr${matching.length === 1 ? 'y' : 'ies'}.`);
    } else {
      toast.success('Renamed!');
    }
    setEditingId(null);
    setEditName('');
    load();
  };

  const toggleActive = async (p) => {
    await base44.entities.ServiceProject.update(p.id, { active: !p.active });
    load();
  };

  const del = async (p) => {
    if (!confirm(`Delete "${p.name}"? This only removes it from the dropdown — existing hour entries are not affected.`)) return;
    await base44.entities.ServiceProject.delete(p.id);
    toast.success('Deleted.');
    load();
  };

  const doMerge = async () => {
    if (!mergeFrom || !mergeTo) { toast.error('Pick both a source and destination.'); return; }
    if (mergeFrom === mergeTo) { toast.error('Pick two different names.'); return; }
    setMerging(true);
    const matching = await base44.entities.ServiceHour.filter({ organization: mergeFrom });
    for (const h of matching) {
      await base44.entities.ServiceHour.update(h.id, { organization: mergeTo });
    }
    toast.success(`Merged ${matching.length} entr${matching.length === 1 ? 'y' : 'ies'} from "${mergeFrom}" → "${mergeTo}".`);
    setMergeFrom('');
    setMergeTo('');
    setMerging(false);
    load();
  };

  // Names that are used in hours but NOT in the official project list
  const projectNameSet = new Set(projects.map(p => p.name.toLowerCase()));
  const orphanedOrgs = hourOrgs.filter(o => !projectNameSet.has(o.name.toLowerCase()));

  // All unique names for merge dropdowns (official + orphaned)
  const allOrgNames = Array.from(new Set([
    ...projects.map(p => p.name),
    ...hourOrgs.map(o => o.name),
  ])).sort();

  if (loading) {
    return <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />)}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-heading font-bold text-xl mb-1 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-primary" /> Service Projects
        </h2>
        <p className="text-sm text-muted-foreground">Manage the dropdown list members see when logging hours, and merge duplicate entries.</p>
      </div>

      {/* Official Projects */}
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-heading font-semibold text-base">Project List</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{projects.length} project{projects.length !== 1 ? 's' : ''} · shown in member dropdown</p>
          </div>
          <Button size="sm" onClick={() => setAdding(true)} className="gap-1.5"><Plus className="w-4 h-4" />Add</Button>
        </div>

        {adding && (
          <div className="flex gap-2 mb-3 bg-accent/30 rounded-lg p-3 border border-primary/20">
            <Input autoFocus value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Milford Food Bank" onKeyDown={e => e.key === 'Enter' && addProject()} />
            <Button size="sm" onClick={addProject} className="gap-1.5"><Check className="w-3.5 h-3.5" />Add</Button>
            <Button size="sm" variant="ghost" onClick={() => { setAdding(false); setNewName(''); }}><X className="w-3.5 h-3.5" /></Button>
          </div>
        )}

        <div className="space-y-2">
          {projects.map(p => (
            <div key={p.id} className="flex items-center gap-3 bg-muted/40 rounded-lg px-4 py-2.5">
              {editingId === p.id ? (
                <>
                  <Input value={editName} onChange={e => setEditName(e.target.value)} className="h-8 text-sm" onKeyDown={e => e.key === 'Enter' && saveEdit(p.id)} />
                  <Button size="sm" onClick={() => saveEdit(p.id)} className="h-8 gap-1"><Check className="w-3 h-3" />Save</Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="h-8"><X className="w-3 h-3" /></Button>
                </>
              ) : (
                <>
                  <div className="flex-1 min-w-0 flex items-center gap-2">
                    <span className="font-medium text-sm">{p.name}</span>
                    {!p.active && <span className="text-[10px] bg-muted text-muted-foreground font-bold px-2 py-0.5 rounded-full">Hidden</span>}
                  </div>
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs text-muted-foreground shrink-0">
                    <input type="checkbox" checked={p.active !== false} onChange={() => toggleActive(p)} className="rounded" />
                    Active
                  </label>
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setEditingId(p.id); setEditName(p.name); }}><Edit2 className="w-3.5 h-3.5" /></Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => del(p)}><Trash2 className="w-3.5 h-3.5" /></Button>
                </>
              )}
            </div>
          ))}
          {projects.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">No projects yet. Add one or import from logged hours below.</p>}
        </div>
      </div>

      {/* Merge duplicates */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-heading font-semibold text-base mb-1 flex items-center gap-2"><GitMerge className="w-4 h-4 text-primary" />Merge Duplicate Names</h3>
        <p className="text-xs text-muted-foreground mb-4">Combine mis-spelled or duplicate names. All hour entries using the source name will be renamed to the destination.</p>

        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">From (source)</Label>
            <select
              value={mergeFrom}
              onChange={e => setMergeFrom(e.target.value)}
              className="mt-1 w-full border border-input rounded-md h-9 px-3 text-sm bg-background"
            >
              <option value="">— Select duplicate —</option>
              {allOrgNames.map(n => {
                const count = hourOrgs.find(o => o.name === n)?.count || 0;
                return <option key={n} value={n}>{n} ({count} entr{count === 1 ? 'y' : 'ies'})</option>;
              })}
            </select>
          </div>
          <div>
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">To (keep this name)</Label>
            <select
              value={mergeTo}
              onChange={e => setMergeTo(e.target.value)}
              className="mt-1 w-full border border-input rounded-md h-9 px-3 text-sm bg-background"
            >
              <option value="">— Select correct name —</option>
              {allOrgNames.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>
        <Button onClick={doMerge} disabled={merging || !mergeFrom || !mergeTo} className="gap-1.5 mt-4">
          <GitMerge className="w-4 h-4" />{merging ? 'Merging…' : 'Merge Entries'}
        </Button>
      </div>

      {/* Unlinked names found in hour logs */}
      {orphanedOrgs.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
          <h3 className="font-heading font-semibold text-base mb-1 flex items-center gap-2 text-amber-900">
            <AlertCircle className="w-4 h-4" />Names Not in Project List
          </h3>
          <p className="text-xs text-amber-800 mb-4">These names appear in member-logged hours but aren't in the official dropdown list. Add them, or merge them into a standard name above.</p>
          <div className="space-y-2">
            {orphanedOrgs.map(o => (
              <div key={o.name} className="flex items-center gap-3 bg-white rounded-lg px-4 py-2.5 border border-amber-100">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{o.name}</p>
                  <p className="text-xs text-muted-foreground">{o.count} hour entr{o.count === 1 ? 'y' : 'ies'}</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => addFromHours(o.name)} className="gap-1.5"><Plus className="w-3.5 h-3.5" />Add to List</Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}