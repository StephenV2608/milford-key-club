import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Clock, Users, Handshake, Calendar, TrendingUp, Heart } from 'lucide-react';
import PageHeader from '../components/shared/PageHeader';
import { Link } from 'react-router-dom';
import { useSiteSettings } from '../hooks/useSiteSettings';

const pick = (override, computed) =>
  (override !== null && override !== undefined && override !== '') ? Number(override) : computed;

function AnimatedCounter({ value, duration = 1500, decimals = 0 }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const start = performance.now();
    let frame;
    const step = (t) => {
      const p = Math.min(1, (t - start) / duration);
      setN(value * (0.5 - Math.cos(p * Math.PI) / 2)); // ease-in-out
      if (p < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);
  return <>{n.toFixed(decimals)}</>;
}

export default function Impact() {
  const { settings } = useSiteSettings();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    (async () => {
      const [hours, members, events, partners] = await Promise.all([
        base44.entities.ServiceHour.filter({ status: 'approved' }),
        base44.entities.Member.filter({ active: true }),
        base44.entities.ClubEvent.list(),
        base44.entities.Partner.filter({ active: true }).catch(() => []),
      ]);
      const totalHours = hours.reduce((a, h) => a + (h.hours || 0), 0);
      const uniqueOrgs = new Set(hours.map(h => (h.organization || '').trim()).filter(Boolean));
      const thisYear = new Date().getFullYear();
      const hoursThisYear = hours
        .filter(h => new Date(h.date).getFullYear() === thisYear)
        .reduce((a, h) => a + (h.hours || 0), 0);
      const eventsPast = events.filter(e => new Date(e.date) <= new Date()).length;

      setStats({
        totalHours: pick(settings?.impact_total_hours_override, totalHours),
        hoursThisYear: pick(settings?.impact_hours_this_year_override, hoursThisYear),
        activeMembers: pick(settings?.impact_active_members_override, members.length),
        orgsServed: pick(settings?.impact_orgs_served_override, uniqueOrgs.size),
        eventsHosted: pick(settings?.impact_events_hosted_override, eventsPast),
        partners: partners.length,
      });
    })();
  }, [settings]);

  if (!stats) {
    return (
      <div>
        <PageHeader eyebrow="Community Impact" title="Our Impact" description="How Milford Key Club serves our community." />
        <div className="py-16 text-center">
          <div className="inline-block w-8 h-8 border-4 border-slate-200 border-t-primary rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const bigStats = [
    { icon: Clock,     value: stats.totalHours,    label: 'Service Hours Logged', color: 'bg-blue-50 text-blue-600',      decimals: 1 },
    { icon: Users,     value: stats.activeMembers, label: 'Active Members',       color: 'bg-rose-50 text-rose-600' },
    { icon: Handshake, value: stats.orgsServed,    label: 'Organizations Helped', color: 'bg-violet-50 text-violet-600' },
    { icon: Calendar,  value: stats.eventsHosted,  label: 'Events Hosted',        color: 'bg-emerald-50 text-emerald-600' },
  ];

  return (
    <div>
      <PageHeader
        eyebrow={settings?.impact_eyebrow || "Community Impact"}
        title={settings?.impact_heading || "Service in Numbers"}
        description={settings?.impact_description || "The difference Milford Key Club makes — measured in hours, hands, and hearts."}
      />

      {/* Big Counters */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {bigStats.map(({ icon: Icon, value, label, color, decimals }, i) => (
              <div key={i} className="bg-card rounded-2xl border border-border p-6 md:p-8 text-center hover:shadow-lg hover:-translate-y-0.5 transition-all">
                <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mx-auto mb-4`}>
                  <Icon className="w-6 h-6" />
                </div>
                <p className="font-heading font-black text-4xl md:text-5xl mb-1 tracking-tight">
                  <AnimatedCounter value={value} decimals={decimals || 0} />
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium uppercase tracking-wider">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* This Year */}
      <section className="py-12 md:py-16 bg-gradient-to-br from-primary/5 via-accent/30 to-blue-50/40">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full mb-5">
            <TrendingUp className="w-3 h-3" /> This Year
          </span>
          <h2 className="font-heading font-black text-3xl md:text-5xl mb-4 tracking-tight">
            <AnimatedCounter value={stats.hoursThisYear} decimals={1} /> hours
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
            {settings?.impact_this_year_caption || `Volunteered by Milford Key Club members in ${new Date().getFullYear()} alone. Every hour is a step toward a stronger community.`}
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 grid md:grid-cols-2 gap-5">
          <Link to="/request-help" className="group bg-card rounded-2xl border border-border p-6 hover:border-primary/40 hover:shadow-lg transition-all">
            <Heart className="w-8 h-8 text-rose-500 mb-3" />
            <h3 className="font-heading font-bold text-xl mb-2">Need Our Help?</h3>
            <p className="text-sm text-muted-foreground mb-4">Request volunteers from Key Club for your cause, event, or community project.</p>
            <span className="text-sm text-primary font-semibold group-hover:underline">Submit a Request →</span>
          </Link>
          <Link to="/join" className="group bg-card rounded-2xl border border-border p-6 hover:border-primary/40 hover:shadow-lg transition-all">
            <Users className="w-8 h-8 text-blue-500 mb-3" />
            <h3 className="font-heading font-bold text-xl mb-2">Want to Volunteer?</h3>
            <p className="text-sm text-muted-foreground mb-4">Join Key Club or partner with us on an upcoming service event.</p>
            <span className="text-sm text-primary font-semibold group-hover:underline">Get Involved →</span>
          </Link>
        </div>
      </section>
    </div>
  );
}