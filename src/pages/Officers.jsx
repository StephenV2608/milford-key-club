import SectionHeading from '../components/shared/SectionHeading';
import OfficerCard from '../components/shared/OfficerCard';

const officers = [
  { name: 'Alex Johnson', role: 'President', funFact: 'Can weave a plastic bag mat in under 3 hours' },
  { name: 'Maria Santos', role: 'Vice President', funFact: 'Organized 12 service events last year' },
  { name: 'James Chen', role: 'Secretary', funFact: 'Has the best meeting notes in Key Club history' },
  { name: 'Sophia Williams', role: 'Treasurer', funFact: 'Raised over $2,000 for club initiatives' },
  { name: 'Ethan Brown', role: 'Bulletin Editor', funFact: 'Designs all our social media graphics' },
  { name: 'Olivia Davis', role: 'Webmaster', funFact: 'Taught herself coding over one summer' },
  { name: 'Ms. Rodriguez', role: 'Faculty Advisor', funFact: 'Has been advising Key Club for 8 years' },
];

export default function Officers() {
  return (
    <div>
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Our Team"
            title="Meet the Officers"
            description="The dedicated students (and advisor) who keep Milford Key Club running strong."
          />
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {officers.map((officer) => (
              <OfficerCard key={officer.name} {...officer} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}