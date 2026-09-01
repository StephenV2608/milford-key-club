import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, ArrowUp, ArrowDown, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

export default function ProjectsPanel() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', image_url: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  const load = () => {
    setLoading(true);
    base44.entities.Project.list('order').then(list => {
      setProjects(list);
      setLoading(false);
    });
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description) return;
    setSaving(true);
    try {
      const maxOrder = projects.reduce((max, p) => Math.max(max, p.order || 0), 0);
      await base44.entities.Project.create({
        title: form.title,
        description: form.description,
        image_url: form.image_url || undefined,
        order: maxOrder + 1,
      });
      toast.success('Project added!');
      setForm({ title: '', description: '', image_url: '' });
      setShowForm(false);
      load();
    } catch (err) {
      toast.error('Failed to add project');
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    await base44.entities.Project.delete(id);
    toast.success('Project removed');
    load();
  };

  const move = async (index, dir) => {
    const swapIndex = index + dir;
    if (swapIndex < 0 || swapIndex >= projects.length) return;
    const a = projects[index];
    const b = projects[swapIndex];
    await base44.entities.Project.bulkUpdate([
      { id: a.id, order: b.order || (swapIndex + 1) },
      { id: b.id, order: a.order || (index + 1) },
    ]);
    load();
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-heading font-bold text-lg">Projects</h2>
          <p className="text-sm text-muted-foreground">Manage the projects shown on your site</p>
        </div>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4" /> New
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="mb-6 space-y-3 p-4 rounded-xl bg-muted/40 border border-border">
          <div className="space-y-1.5">
            <Label htmlFor="p-title">Title</Label>
            <Input id="p-title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Project title" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="p-desc">Description</Label>
            <Textarea id="p-desc" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="What is this project about?" rows={3} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="p-img">Image URL (optional)</Label>
            <Input id="p-img" value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Add Project'}</Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-border border-t-primary rounded-full animate-spin" /></div>
      ) : projects.length === 0 ? (
        <div className="text-center py-8 text-sm text-muted-foreground">
          <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
          No projects yet. Click "New" to add one.
        </div>
      ) : (
        <div className="space-y-2">
          {projects.map((p, i) => (
            <div key={p.id} className="flex items-start gap-3 p-3 rounded-xl border border-border hover:bg-muted/30 transition-colors">
              {p.image_url && (
                <img src={p.image_url} alt={p.title} className="w-12 h-12 rounded-lg object-cover flex-none" />
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm truncate">{p.title}</h4>
                <p className="text-xs text-muted-foreground line-clamp-2">{p.description}</p>
              </div>
              <div className="flex flex-col gap-1">
                <button onClick={() => move(i, -1)} disabled={i === 0} className="text-muted-foreground hover:text-foreground disabled:opacity-30">
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button onClick={() => move(i, 1)} disabled={i === projects.length - 1} className="text-muted-foreground hover:text-foreground disabled:opacity-30">
                  <ArrowDown className="w-4 h-4" />
                </button>
              </div>
              <button onClick={() => handleDelete(p.id)} className="text-muted-foreground hover:text-destructive mt-0.5">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}