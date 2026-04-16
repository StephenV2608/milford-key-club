import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import PageHeader from '../components/shared/PageHeader';
import { Star } from 'lucide-react';

export default function Showcase() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.ProjectSubmission.filter({ status: 'approved' }, '-created_date').then(list => {
      setProjects(list);
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <PageHeader
        eyebrow="Community Showcase"
        title="Our Members in Action"
        description="Celebrating the service projects and community impact of our dedicated Key Club members."
      />

      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
              {[1,2,3,4,5,6].map(i => <div key={i} className="h-64 rounded-2xl bg-muted animate-pulse break-inside-avoid" />)}
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-24 text-muted-foreground">
              <Star className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">No showcased projects yet.</p>
              <p className="text-sm mt-1">Approved project submissions will appear here.</p>
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
              {projects.map(p => (
                <div key={p.id} className="break-inside-avoid bg-card rounded-2xl border border-border overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                  {p.photo_url && (
                    <div className="overflow-hidden">
                      <img src={p.photo_url} alt={p.title} className="w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}
                  <div className="p-5">
                    <h3 className="font-heading font-bold text-base mb-1">{p.title}</h3>
                    {p.organization && (
                      <p className="text-xs text-primary font-semibold mb-2">{p.organization}</p>
                    )}
                    <p className="text-sm text-muted-foreground leading-relaxed">{p.description}</p>
                    <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                      <span>{p.member_name}</span>
                      <span>{p.date ? new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}