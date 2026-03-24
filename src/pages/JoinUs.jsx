import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Clock, MapPin, DollarSign, Heart, Users, Sparkles, ArrowRight } from 'lucide-react';
import SectionHeading from '../components/shared/SectionHeading';
import { useSiteSettings } from '../hooks/useSiteSettings';

const reasons = [
  { icon: Users, title: 'Leadership Skills', desc: 'Develop real-world leadership experience through organizing projects and leading teams.' },
  { icon: Heart, title: 'Community Service', desc: 'Make a meaningful impact in Milford through hands-on volunteer work.' },
  { icon: Sparkles, title: 'Friends & Experiences', desc: 'Build lasting friendships and create memories at events, meetings, and projects.' },
];

export default function JoinUs() {
  const { settings } = useSiteSettings();

  return (
    <div>
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Get Involved"
            title="Join Milford Key Club"
            description="Ready to make a difference? Here's everything you need to know about becoming a member."
          />
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-10 md:gap-16">
            <div>
              <h3 className="font-heading font-bold text-2xl mb-6">How to Join</h3>
              <div className="space-y-5">
                <div className="flex gap-4">
                  <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Meeting Time</h4>
                    <p className="text-sm text-muted-foreground">{settings.meeting_time || 'Every Wednesday, 3:00 PM – 4:00 PM'}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Location</h4>
                    <p className="text-sm text-muted-foreground">{settings.meeting_location || 'Room 204, Milford High School'}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Dues</h4>
                    <p className="text-sm text-muted-foreground">{settings.dues_info || '$15 per year'}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Heart className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Requirements</h4>
                    <p className="text-sm text-muted-foreground">{settings.requirements_info || 'Minimum 50 service hours per year & regular meeting attendance'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-primary rounded-2xl p-8 md:p-10 flex flex-col justify-center text-primary-foreground">
              <h3 className="font-heading font-bold text-2xl mb-3">Ready to Start?</h3>
              <p className="text-primary-foreground/80 mb-6 leading-relaxed">
                Fill out our quick sign-up form and a club officer will reach out to you with next steps. We can't wait to meet you!
              </p>
              <Button asChild variant="secondary" size="lg" className="rounded-full font-semibold w-fit">
                <Link to="/contact">
                  Sign Up Form <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Why Join?"
            title="More Than a Club"
            description="Key Club is where students grow into leaders while having a blast."
          />
          <div className="grid sm:grid-cols-3 gap-6 md:gap-8">
            {reasons.map(({ icon: Icon, title, desc }) => (
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
    </div>
  );
}