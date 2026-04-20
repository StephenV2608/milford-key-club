import { useState, useEffect, useCallback } from 'react';
import PageHeader from '../components/shared/PageHeader';
import ProjectCard from '../components/shared/ProjectCard';
import { base44 } from '@/api/base44Client';
import { useSiteSettings } from '../hooks/useSiteSettings';
import MobileBackButton from '../components/layout/MobileBackButton';
import { useMemberAuth } from '../hooks/useMemberAuth';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Clock, CheckCircle2, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const FALLBACK_PROJECTS = [
  { id: 'f1', image_url: 'https://media.base44.com/images/public/69c2a0f26438a6d865c0f034/966810261_generated_0f8cf771.png', title: 'Got Bags? Initiative', description: 'We collect plastic bags from the community and weave them into durable sleeping mats for those experiencing homelessness. It takes about 700 bags to make a single mat.' },
  { id: 'f2', image_url: 'https://media.base44.com/images/public/69c2a0f26438a6d865c0f034/eae6320ab_generated_d26c231a.png', title: 'Care Closet Support', description: 'Our members organize and donate hygiene products to stock the school care closet, ensuring every student has access to basic necessities.' },
  { id: 'f3', image_url: 'https://media.base44.com/images/public/69c2a0f26438a6d865c0f034/e36514680_generated_a44aae9c.png', title: 'Community Events', description: 'From local festivals to school fairs, Key Club members volunteer their time to support community events and spread awareness.' },
];

export default function Projects() {
  const { settings } = useSiteSettings();
  const { memberUser } = useMemberAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serviceEvents, setServiceEvents] = useState([]);
  const [rsvps, setRsvps] = useState([]);
  const [rsvpCounts, setRsvpCounts] = useState({});
  const [rsvpLoading, setRsvpLoading] = useState(null);

  const loadData = useCallback(async () => {
    const [list, allEvents] = await Promise.all([
      base44.entities.Project.list('order'),
      base44.entities.ClubEvent.list('date'),
    ]);
    setProjects(list);
    setLoading(false);

    const today = new Date().toISOString().split('T')[0];
    const upcoming = allEvents.filter(e =>
      (e.type === 'volunteer' || e.type === 'project') && e.date >= today
    );
    setServiceEvents(upcoming);

    const allRsvps = await base44.entities.EventRSVP.list();
    const counts = {};
    allRsvps.forEach(r => { counts[r.event_id] = (counts[r.event_id] || 0) + 1; });
    setRsvpCounts(counts);

    if (memberUser) {
      setRsvps(allRsvps.filter(r => r.member_email === memberUser.email));
    }
  }, [memberUser?.email]);

  useEffect(() => { loadData(); }, [loadData]);

  const isRsvpd = (eventId) => rsvps.some(r => r.event_id === eventId);

  const handleRSVP = async (event) => {
    if (!memberUser) { toast.error('Log in to the member portal to sign up.'); return; }
    setRsvpLoading(event.id);
    const already = rsvps.find(r => r.event_id === event.id);
    if (already) {
      await base44.entities.EventRSVP.delete(already.id);
      setRsvps(p => p.filter(r => r.id !== already.id));
      setRsvpCounts(p => ({ ...p, [event.id]: (p[event.id] || 1) - 1 }));
      toast.success('Sign-up removed.');
    } else {
      if (event.max_rsvps > 0 && (rsvpCounts[event.id] || 0) >= event.max_rsvps) {
        toast.error('This event is full.'); setRsvpLoading(null); return;
      }
      const newR = await base44.entities.EventRSVP.create({ event_id: event.id, member_email: memberUser.email, member_name: memberUser.name });
      setRsvps(p => [...p, newR]);
      setRsvpCounts(p => ({ ...p, [event.id]: (p[event.id] || 0) + 1 }));
      toast.success('Signed up!');
    }
    setRsvpLoading(null);
  };

  const items = projects.length > 0 ? projects : FALLBACK_PROJECTS;

  return (
    <div>
      <MobileBackButton />
      <PageHeader
        eyebrow={settings.projects_eyebrow || 'Our Work'}
        title={settings.projects_heading || 'Service Projects'}
        description={settings.projects_description || "Every project is an opportunity to learn, grow, and give back. Here's a look at what we've been working on."}
        imageUrl={settings.projects_header_image_url}
      />

      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3].map(i => <div key={i} className="rounded-xl bg-muted animate-pulse aspect-[3/2]" />)}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {items.map(p => (
                <ProjectCard key={p.id} image={p.image_url} title={p.title} description={p.description} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Upcoming Service Events Sign-Up */}
      {serviceEvents.length > 0 && (
        <section className="py-16 bg-gradient-to-b from-muted/40 to-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8 text-center">
              <span className="text-xs font-bold uppercase tracking-widest text-primary">Get Involved</span>
              <h2 className="font-heading font-bold text-2xl sm:text-3xl mt-1">Upcoming Service Events</h2>
              <p className="text-muted-foreground text-sm mt-2">Sign up to volunteer at an upcoming service event or project.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {serviceEvents.map(e => {
                const d = new Date(e.date);
                const signed = isRsvpd(e.id);
                const full = e.max_rsvps > 0 && (rsvpCounts[e.id] || 0) >= e.max_rsvps && !signed;
                return (
                  <div key={e.id} className={`bg-card rounded-2xl border p-5 flex flex-col gap-4 ${signed ? 'border-green-300 bg-green-50/40' : 'border-border'}`}>
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 w-12 h-12 rounded-xl bg-primary flex flex-col items-center justify-center text-primary-foreground">
                        <span className="text-[9px] font-bold uppercase">{isNaN(d) ? '' : d.toLocaleDateString('en-US',{month:'short'})}</span>
                        <span className="text-lg font-black leading-none">{isNaN(d) ? '?' : d.getDate()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-heading font-bold text-sm leading-tight">{e.title}</p>
                        <div className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                          {e.time && <p className="flex items-center gap-1"><Clock className="w-3 h-3" />{e.time}</p>}
                          {e.location && <p className="flex items-center gap-1"><MapPin className="w-3 h-3" />{e.location}</p>}
                        </div>
                      </div>
                    </div>
                    {e.description && <p className="text-xs text-muted-foreground leading-relaxed">{e.description}</p>}
                    <div className="flex items-center justify-between mt-auto">
                      {(rsvpCounts[e.id] !== undefined) && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {rsvpCounts[e.id]}{e.max_rsvps > 0 ? `/${e.max_rsvps}` : ''} signed up
                        </span>
                      )}
                      <Button
                        size="sm"
                        className={`rounded-full ml-auto gap-1.5 ${signed ? 'bg-green-600 hover:bg-green-700 text-white' : ''}`}
                        onClick={() => handleRSVP(e)}
                        disabled={rsvpLoading === e.id || (full && !signed)}
                      >
                        {rsvpLoading === e.id ? 'Updating...' : signed
                          ? <><CheckCircle2 className="w-3.5 h-3.5" /> Signed Up</>
                          : full ? 'Event Full' : 'Sign Up'}
                      </Button>
                    </div>
                    {!memberUser && <p className="text-[11px] text-center text-muted-foreground -mt-2">
                      <Link to="/portal" className="text-primary hover:underline">Log in</Link> to sign up
                    </p>}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}