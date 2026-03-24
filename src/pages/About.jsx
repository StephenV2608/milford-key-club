import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Users, Target, HeartHandshake, ArrowRight } from 'lucide-react';
import SectionHeading from '../components/shared/SectionHeading';
import { useSiteSettings } from '../hooks/useSiteSettings';

const MEETING_IMG = 'https://media.base44.com/images/public/69c2a0f26438a6d865c0f034/cd49e8311_generated_b0a84d9f.png';


const values = [
  { icon: Users, title: 'Leadership', desc: 'Developing skills that last a lifetime through hands-on experience and mentorship.' },
  { icon: Target, title: 'Character', desc: 'Building integrity, responsibility, and empathy in everything we do.' },
  { icon: HeartHandshake, title: 'Service', desc: 'Making a tangible difference in our community through meaningful action.' },
];

export default function About() {
  const { settings } = useSiteSettings();

  return (
    <div>
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow={settings.about_eyebrow || 'About Us'}
            title={settings.about_heading || 'Who We Are'}
            description={settings.about_intro || "Key Club International is the oldest and largest service program for high school students, with over 250,000 members worldwide. Our Milford chapter carries on this proud tradition."}
          />
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div className="rounded-2xl overflow-hidden aspect-[3/2]">
              <img src={settings.about_image_url || MEETING_IMG} alt="Key Club members at a meeting" className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-2xl sm:text-3xl mb-4">Our Milford Chapter</h3>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {settings.about_chapter || "The Milford Key Club has been serving our school and community for years. We're a dedicated group of students who believe in the power of service to transform both our community and ourselves.\n\nFrom collecting plastic bags for sleeping mats to stocking the care closet with hygiene supplies, our members show up for the people who need it most."}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Our Mission"
            title="Leadership · Character · Service"
            description="These three pillars guide everything we do. They're not just words — they're how we show up every day."
          />
          <div className="grid sm:grid-cols-3 gap-6 md:gap-8">
            {values.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-card rounded-xl border border-border p-8 text-center">
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

      <section className="py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <SectionHeading
            eyebrow="Why It Matters"
            title="Stronger Together"
            description={settings.about_why || "When students come together to serve, the ripple effect is enormous. Our projects don't just help individuals — they strengthen the fabric of our entire community."}
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