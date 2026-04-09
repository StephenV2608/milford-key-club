import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Check, Trash2, Mail, Clock } from 'lucide-react';

export default function HelpRequestsTab() {
  const [requests, setRequests] = useState([]);

  useEffect(() => { load(); }, []);
  const load = () => base44.entities.HelpRequest.list('-created_date').then(setRequests);

  const resolve = async (id) => {
    await base44.entities.HelpRequest.update(id, { status: 'resolved' });
    toast.success('Marked as resolved');
    load();
  };

  const del = async (id) => {
    await base44.entities.HelpRequest.delete(id);
    toast.success('Deleted');
    load();
  };

  const open = requests.filter(r => r.status !== 'resolved');
  const resolved = requests.filter(r => r.status === 'resolved');

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-heading font-semibold text-base mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" /> Open Requests ({open.length})
        </h3>
        <div className="space-y-3">
          {open.map(r => <RequestCard key={r.id} r={r} onResolve={resolve} onDelete={del} />)}
          {!open.length && <p className="text-center py-8 text-sm text-muted-foreground">No open requests.</p>}
        </div>
      </div>

      {resolved.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-heading font-semibold text-base mb-4 flex items-center gap-2">
            <Check className="w-4 h-4 text-green-600" /> Resolved ({resolved.length})
          </h3>
          <div className="space-y-3">
            {resolved.map(r => <RequestCard key={r.id} r={r} onDelete={del} />)}
          </div>
        </div>
      )}
    </div>
  );
}

function RequestCard({ r, onResolve, onDelete }) {
  return (
    <div className="bg-muted/40 rounded-lg px-4 py-3 flex gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="font-medium text-sm">{r.name}</span>
          {r.email && (
            <a href={`mailto:${r.email}`} className="text-xs text-primary flex items-center gap-1 hover:underline">
              <Mail className="w-3 h-3" />{r.email}
            </a>
          )}
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${r.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
            {r.status}
          </span>
          {r.created_date && (
            <span className="text-[10px] text-muted-foreground">{new Date(r.created_date).toLocaleDateString()}</span>
          )}
        </div>
        <p className="text-sm text-foreground/80 whitespace-pre-wrap">{r.problem}</p>
      </div>
      <div className="flex items-start gap-1 shrink-0">
        {onResolve && r.status !== 'resolved' && (
          <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600 hover:text-green-700" onClick={() => onResolve(r.id)}>
            <Check className="w-4 h-4" />
          </Button>
        )}
        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => onDelete(r.id)}>
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}