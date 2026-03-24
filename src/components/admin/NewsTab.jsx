import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Edit2, Trash2, Check, X, Eye, EyeOff } from 'lucide-react';
import { toast } from "sonner";
import { base44 } from '@/api/base44Client';

export default function NewsTab() {
  const [posts, setPosts] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});

  useEffect(() => { load(); }, []);
  const load = () => base44.entities.NewsPost.list('-date').then(setPosts);

  const startNew = () => {
    setEditing('new');
    setForm({ date: new Date().toISOString().split('T')[0], published: true });
  };
  const startEdit = (post) => { setEditing(post.id); setForm(post); };
  const cancel = () => { setEditing(null); setForm({}); };
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const save = async () => {
    if (editing === 'new') await base44.entities.NewsPost.create(form);
    else await base44.entities.NewsPost.update(editing, form);
    toast.success('Post saved!');
    cancel();
    load();
  };

  const del = async (id) => {
    await base44.entities.NewsPost.delete(id);
    toast.success('Post deleted');
    load();
  };

  const togglePublish = async (post) => {
    await base44.entities.NewsPost.update(post.id, { published: !post.published });
    load();
  };

  const EditForm = () => (
    <div className="bg-accent/30 rounded-xl border border-primary/20 p-5 space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5 sm:col-span-2">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Headline *</Label>
          <Input value={form.headline || ''} onChange={e => set('headline', e.target.value)} placeholder="Announcement headline" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Date *</Label>
          <Input type="date" value={form.date || ''} onChange={e => set('date', e.target.value)} />
        </div>
        <div className="space-y-1.5 flex items-end">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.published !== false} onChange={e => set('published', e.target.checked)} className="rounded" />
            <span className="text-sm">Published</span>
          </label>
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Short Snippet * (shown on homepage)</Label>
          <Textarea value={form.snippet || ''} onChange={e => set('snippet', e.target.value)} rows={2} placeholder="Brief summary shown on homepage..." />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Full Content (optional)</Label>
          <Textarea value={form.content || ''} onChange={e => set('content', e.target.value)} rows={4} placeholder="Full post content..." />
        </div>
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={save} className="gap-1.5"><Check className="w-3.5 h-3.5"/>Save</Button>
        <Button size="sm" variant="ghost" onClick={cancel} className="gap-1.5"><X className="w-3.5 h-3.5"/>Cancel</Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{posts.length} post{posts.length !== 1 ? 's' : ''}</p>
        <Button size="sm" onClick={startNew} className="gap-1.5"><Plus className="w-4 h-4"/>New Post</Button>
      </div>

      {editing === 'new' && <EditForm />}

      <div className="space-y-3">
        {posts.map(post => (
          <div key={post.id}>
            {editing === post.id ? <EditForm /> : (
              <div className="bg-card rounded-xl border border-border p-5">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <p className="font-semibold text-sm">{post.headline}</p>
                      {!post.published && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-muted text-muted-foreground">Draft</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">{post.date}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2">{post.snippet}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => togglePublish(post)} title={post.published ? 'Unpublish' : 'Publish'}>
                      {post.published ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => startEdit(post)}>
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => del(post.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}