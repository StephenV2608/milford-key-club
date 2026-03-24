import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Users, Target, HeartHandshake, ArrowRight } from 'lucide-react';
import SectionHeading from '../components/shared/SectionHeading';

const values = [
  { icon: Users, title: 'Leadership', desc: 'Developing skills that last a lifetime through hands-on experience and mentorship.' },
  { icon: Target, title: 'Character', desc: 'Building integrity, responsibility, and empathy in everything we do.' },
  { icon: HeartHandshake, title: 'Service', desc: 'Making a tangible difference in our community through meaningful action.' },
];

export default function About() {
  return (
    <div>
      {/* Hero */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="About Us"
            title="Who We Are"
            description="Key Club International is the oldest and largest service program for high school students, with over 250,000 members worldwide. Our Milford chapter carries on this proud tradition."
          />
        </div>
      </section>

      {/* Chapter Overview */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div className="rounded-2xl overflow-hidden aspect-[3/2]">
              <img
                src="/__generating__/img_5129f022ae23.png"
                alt="Key Club members at a meeting"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="font-heading font-bold text-2xl sm:text-3xl mb-4">Our Milford Chapter</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                The Milford Key Club has been serving our school and community for years. We're a dedicated group of students who believe in the power of service to transform both our community and ourselves.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                From collecting plastic bags for sleeping mats to stocking the care closet with hygiene supplies, our members show up for the people who need it most.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We meet regularly, plan service projects, and build lasting friendships — all while making Milford a better place to live.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission / Values */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Our Mission"
            title="Leadership · Character · Service"
            description="These three pillars guide everything we do. They're not just words — they're how we show up every day."
          />
          <div className="grid sm:grid-cols-3 gap-6 md:gap-8">
            {values.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-card rounded-xl p-8 border border-border text-center">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-heading font-semibold text-lg mb-2">{title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why It Matters */}
      <section className="py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <SectionHeading
            eyebrow="Why It Matters"
            title="Stronger Together"
            description="When students come together to serve, the ripple effect is enormous. Our projects don't just help individuals — they strengthen the fabric of our entire community. Every bag collected, every hour volunteered, and every smile shared makes Milford a better place."
          />
          <Button asChild className="rounded-full px-6">
            <Link to="/join">
              Join Our Mission <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}