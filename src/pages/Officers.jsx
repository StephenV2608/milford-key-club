import { useState, useEffect } from 'react';
import SectionHeading from '../components/shared/SectionHeading';
import OfficerCard from '../components/shared/OfficerCard';
import { base44 } from '@/api/base44Client';
import { useSiteSettings } from '../hooks/useSiteSettings';

const FALLBACK_OFFICERS = [
  { id: 'f1', name: 'Alex Johnson', role: 'President', fun_fact: 'Can weave a plastic bag mat in under 3 hours' },
  { id: 'f2', name: 'Maria Santos', role: 'Vice President', fun_fact: 'Organized 12 service events last year' },
  { id: 'f3', name: 'James Chen', role: 'Secretary', fun_fact: 'Has the best meeting notes in Key Club history' },
  { id: 'f4', name: 'Sophia Williams', role: 'Treasurer', fun_fact: 'Raised over $2,000 for club initiatives' },
  { id: 'f5', name: 'Ethan Brown', role: 'Bulletin Editor', fun_fact: 'Designs all our social media graphics' },
  { id: 'f6', name: 'Olivia Davis', role: 'Webmaster', fun_fact: 'Taught herself coding over one summer' },
  { id: 'f7', name: 'Ms. Rodriguez', role: 'Faculty Advisor', fun_fact: 'Has been advising Key Club for 8 years' },
];

export default function Officers() {
  const { settings } = useSiteSettings();
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Officer.list('order').then(list => {
      setOfficers(list);
      setLoading(false);
    });
  }, []);

  const items = officers.length > 0 ? officers : FALLBACK_OFFICERS;

  return (
    <div>
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow={settings.officers_eyebrow || 'Our Team'}
            title={settings.officers_heading || 'Meet the Officers'}
            description={settings.officers_description || 'The dedicated students (and advisor) who keep Milford Key Club running strong.'}
          />
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1,2,3,4].map(i => <div key={i} className="h-40 rounded-xl bg-muted animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {items.map((officer) => (
                <OfficerCard
                  key={officer.id}
                  name={officer.name}
                  role={officer.role}
                  funFact={officer.fun_fact}
                  photoUrl={officer.photo_url}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}