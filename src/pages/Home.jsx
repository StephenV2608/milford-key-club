import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Trophy, Handshake, Calendar, Heart, ArrowRight } from 'lucide-react';
import SectionHeading from '../components/shared/SectionHeading';

const highlights = [
  { icon: Trophy, title: 'Awards & Recognition', desc: 'District and state-level honors for outstanding service' },
  { icon: Handshake, title: 'Service Projects', desc: 'Dozens of hands-on projects helping our community every year' },
  { icon: Calendar, title: 'Upcoming Events', desc: 'Regular meetings, drives, and volunteer opportunities' },
  { icon: Heart, title: 'Community Impact', desc: 'Thousands of service hours logged by our dedicated members' },
];

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative h-[70vh] min-h-[500px] max-h-[700px] flex items-center justify-center overflow-hidden">
        <img
          src="https://media.base44.com/images/public/69c2a0f26438a6d865c0f034/fed622b44_generated_8d496406.png"
          alt="Milford Key Club members volunteering together"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
          <span className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-white/80 mb-4 border border-white/20 px-4 py-1.5 rounded-full backdrop-blur-sm">
            Key Club International
          </span>
          <h1 className="font-heading font-black text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white leading-[1.1] mb-6">
            Milford<br />Key Club
          </h1>
          <p className="text-lg sm:text-xl text-white/85 font-medium mb-8">
            Building Leaders Through Service
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" className="text-base px-8 h-12 rounded-full font-semibold">
              <Link to="/join">Join Us</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-base px-8 h-12 rounded-full font-semibold bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white">
              <Link to="/projects">See Our Impact</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {highlights.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="bg-card rounded-xl p-6 border border-border hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-heading font-semibold text-base mb-1.5">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Preview */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <SectionHeading
              eyebrow="Who We Are"
              title="Student-Led. Community-Driven."
              description="Milford Key Club is a student-led organization dedicated to serving our school and community while building leadership skills. We believe every student has the power to make a positive difference."
            />
            <Button asChild variant="outline" className="rounded-full px-6">
              <Link to="/about">
                Learn More <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Project */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="rounded-2xl overflow-hidden aspect-[3/2]">
              <img
                src="https://media.base44.com/images/public/69c2a0f26438a6d865c0f034/966810261_generated_0f8cf771.png"
                alt="Got Bags Initiative - weaving plastic bags into sleeping mats"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-widest text-secondary mb-3">Featured Project</span>
              <h3 className="font-heading font-bold text-2xl sm:text-3xl mb-4">Got Bags? Initiative</h3>
              <p className="text-muted-foreground leading-relaxed mb-2">
                Our flagship project transforms plastic bags into durable sleeping mats for those experiencing homelessness. It takes approximately <strong className="text-foreground">700 bags to create 1 mat</strong>.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Members collect, cut, and weave bags into mats — reducing waste while providing comfort to someone in need.
              </p>
              <Button asChild className="rounded-full px-6">
                <Link to="/projects">
                  View All Projects <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
          <h2 className="font-heading font-bold text-3xl sm:text-4xl md:text-5xl text-primary-foreground mb-4">
            Want to make a difference?
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-8">
            Join Key Club today and start building your legacy of service.
          </p>
          <Button asChild size="lg" variant="secondary" className="rounded-full px-10 h-12 text-base font-semibold">
            <Link to="/join">Sign Up Now</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}