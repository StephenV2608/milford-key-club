import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useSiteSettings } from '../hooks/useSiteSettings';
import OfficerCard from '../components/shared/OfficerCard';
import PageHeader from '../components/shared/PageHeader';
import { Archive, Mail } from 'lucide-react';

const FALLBACK_OFFICERS = [
  { id: 'f1', name: 'Alex Johnson', role: 'President', fun_fact: 'Can weave a plastic bag mat in under 3 hours' },
  { id: 'f2', name: 'Maria Santos', role: 'Vice President', fun_fact: 'Organized 12 service events last year' },
  { id: 'f3', name: 'James Chen', role: 'Secretary', fun_fact: 'Has the best meeting notes in Key Club history' },
  { id: 'f4', name: 'Sophia Williams', role: 'Treasurer', fun_fact: 'Raised over $2,000 for club initiatives' },
  { id: 'f5', name: 'Ethan Brown', role: 'Bulletin Editor', fun_fact: 'Designs all our social media graphics' },
  { id: 'f6', name: 'Olivia Davis', role: 'Webmaster', fun_fact: 'Taught herself coding over one summer' },
];

export default function Officers() {
  const { settings } = useSiteSettings();
  const [officers, setOfficers] = useState([]);
  const [officerRoles, setOfficerRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPast, setShowPast] = useState(false);

  useEffect(() => {
    Promise.all([
      base44.entities.Officer.list('order'),
      base44.entities.OfficerRole.list('order'),
    ]).then(([list, roles]) => {
      setOfficers(list);
      setOfficerRoles(roles.filter(r => r.active !== false));
      setLoading(false);
    });
  }, []);

  // Prefer OfficerRole data if it has entries, else fall back to Officer entity
  const useRoles = officerRoles.length > 0;
  const hasOfficerData = officers.length > 0;

  const allActive = useRoles
    ? officerRoles
    : hasOfficerData ? officers.filter(o => !o.archived) : FALLBACK_OFFICERS;

  // Separate advisors from student officers
  const isAdvisor = (item) => {
    const role = (useRoles ? (item.title === 'Other' ? item.custom_title : item.title) : item.role) || '';
    return /advisor|adviser/i.test(role);
  };
  const active = allActive.filter(o => !isAdvisor(o));
  const advisors = allActive.filter(isAdvisor);

  const past = hasOfficerData && !useRoles ? officers.filter(o => o.archived) : [];

  const pastByYear = past.reduce((acc, o) => {
    const yr = o.year || 'Previous Years';
    if (!acc[yr]) acc[yr] = [];
    acc[yr].push(o);
    return acc;
  }, {});

  const getDisplayTitle = (r) => r.title === 'Other' ? (r.custom_title || r.title) : r.title;

  return (
    <div>
      <PageHeader
        eyebrow={settings.officers_eyebrow || 'Our Team'}
        title={settings.officers_heading || 'Meet the Officers'}
        description={settings.officers_description || 'The dedicated students (and advisor) who keep Milford Key Club running strong.'}
        imageUrl={settings.officers_header_image_url}
      />

      <section className="py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1,2,3,4].map(i => <div key={i} className="h-40 rounded-xl bg-muted animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {active.map((officer) => (
                useRoles ? (
                  <OfficerCard
                    key={officer.id}
                    name={officer.member_name}
                    role={getDisplayTitle(officer)}
                    funFact={officer.bio}
                    photoUrl={officer.photo_url}
                    email={officer.show_email ? officer.member_email : null}
                  />
                ) : (
                  <OfficerCard
                    key={officer.id}
                    name={officer.name}
                    role={officer.role}
                    funFact={officer.fun_fact}
                    photoUrl={officer.photo_url}
                  />
                )
              ))}
            </div>
          )}

          {/* Faculty Advisor(s) - separate section */}
          {!loading && advisors.length > 0 && (
            <div className="mt-16 pt-12 border-t border-border">
              <div className="text-center mb-8">
                <span className="inline-block text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70 mb-2">
                  Faculty
                </span>
                <h2 className="font-heading font-black text-2xl md:text-3xl tracking-tight">
                  {advisors.length > 1 ? 'Our Advisors' : 'Our Advisor'}
                </h2>
              </div>
              <div className={`grid gap-4 md:gap-6 max-w-3xl mx-auto ${advisors.length === 1 ? 'grid-cols-1 sm:max-w-xs' : 'grid-cols-2 md:grid-cols-3'}`}>
                {advisors.map((officer) => (
                  useRoles ? (
                    <OfficerCard
                      key={officer.id}
                      name={officer.member_name}
                      role={getDisplayTitle(officer)}
                      funFact={officer.bio}
                      photoUrl={officer.photo_url}
                      email={officer.show_email ? officer.member_email : null}
                    />
                  ) : (
                    <OfficerCard
                      key={officer.id}
                      name={officer.name}
                      role={officer.role}
                      funFact={officer.fun_fact}
                      photoUrl={officer.photo_url}
                    />
                  )
                ))}
              </div>
            </div>
          )}

          {/* Past Officers (legacy Officer entity only) */}
          {past.length > 0 && (
            <div className="mt-16">
              <button
                onClick={() => setShowPast(v => !v)}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 mx-auto"
              >
                <Archive className="w-4 h-4" />
                <span className="text-sm font-medium">{showPast ? 'Hide' : 'View'} Past Officers</span>
              </button>

              {showPast && Object.entries(pastByYear).sort((a,b) => b[0].localeCompare(a[0])).map(([year, group]) => (
                <div key={year} className="mb-10">
                  <h3 className="text-center font-heading font-semibold text-lg mb-6 text-muted-foreground">{year}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {group.map(officer => (
                      <OfficerCard key={officer.id} name={officer.name} role={officer.role} funFact={officer.fun_fact} photoUrl={officer.photo_url} faded />
                    ))}
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