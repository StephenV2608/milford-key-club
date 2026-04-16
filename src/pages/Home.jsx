import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { Button } from "@/components/ui/button";
import { Trophy, Handshake, Calendar, Heart, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import SectionHeading from '../components/shared/SectionHeading';
import LatestUpdates from '../components/home/LatestUpdates';
import { base44 } from '@/api/base44Client';

const highlights = [
{ icon: Trophy, title: 'Awards & Recognition', desc: 'District and state-level honors for outstanding service' },
{ icon: Handshake, title: 'Service Projects', desc: 'Dozens of hands-on projects helping our community every year' },
{ icon: Calendar, title: 'Upcoming Events', desc: 'Regular meetings, drives, and volunteer opportunities' },
{ icon: Heart, title: 'Community Impact', desc: 'Thousands of service hours logged by our dedicated members' }];


const HERO_FALLBACK = 'https://media.base44.com/images/public/69c2a0f26438a6d865c0f034/fed622b44_generated_8d496406.png';
const PROJECT_FALLBACK = 'https://media.base44.com/images/public/69c2a0f26438a6d865c0f034/966810261_generated_0f8cf771.png';

export default function Home() {
  const { settings } = useSiteSettings();
  const [featuredProject, setFeaturedProject] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [slideIndex, setSlideIndex] = useState(0);
  const slideTimer = useRef(null);

  useEffect(() => {
    base44.entities.Project.list('order', 1).then((list) => {
      if (list[0]) setFeaturedProject(list[0]);
    });
    base44.entities.GalleryImage.list('order').then((imgs) => {
      if (imgs.length) setGalleryImages(imgs.map((i) => i.image_url));
    });
  }, []);

  const heroImages = [
  ...(settings.hero_image_url ? [settings.hero_image_url] : []),
  ...galleryImages].
  filter(Boolean);
  const slides = heroImages.length ? heroImages : [HERO_FALLBACK];

  useEffect(() => {
    if (slides.length <= 1) return;
    slideTimer.current = setInterval(() => setSlideIndex((i) => (i + 1) % slides.length), 5000);
    return () => clearInterval(slideTimer.current);
  }, [slides.length]);

  const goTo = (idx) => {
    clearInterval(slideTimer.current);
    setSlideIndex((idx + slides.length) % slides.length);
    slideTimer.current = setInterval(() => setSlideIndex((i) => (i + 1) % slides.length), 5000);
  };
  const heroTitle = settings.hero_title || 'Milford\nKey Club';
  const heroSubtitle = settings.hero_subtitle || 'Building Leaders Through Service';

  return (
    <div>
      {/* Hero */}
      <section className="relative h-[70vh] min-h-[500px] max-h-[700px] flex items-center justify-center overflow-hidden">
        {slides.map((src, i) =>
        <img
          key={src}
          src={src}
          alt=""
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${i === slideIndex ? 'opacity-100' : 'opacity-0'}`} />

        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/45 to-black/75" />
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
          <span className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-white/80 mb-4 border border-white/20 px-4 py-1.5 rounded-full backdrop-blur-sm">
            Key Club International
          </span>
          <h1 className="font-heading font-black text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white leading-[1.1] mb-6 whitespace-pre-line">
            {heroTitle}
          </h1>
          <p className="text-lg sm:text-xl text-white/85 font-medium mb-8">
            {heroSubtitle}
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
        {slides.length > 1 &&
        <>
            <button onClick={() => goTo(slideIndex - 1)} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center text-white transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={() => goTo(slideIndex + 1)} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center text-white transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
              {slides.map((_, i) =>
            <button key={i} onClick={() => goTo(i)} className={`w-2 h-2 rounded-full transition-all ${i === slideIndex ? 'bg-white scale-125' : 'bg-white/50'}`} />
            )}
            </div>
          </>
        }
      </section>

      {/* Highlights */}
      <section className="py-16 md:py-20 bg-gradient-to-b from-muted/60 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
            {highlights.map(({ icon: Icon, title, desc }, i) => {
              const colors = [
              'from-blue-500/10 to-blue-600/5 border-blue-100 text-blue-600 bg-blue-50',
              'from-rose-500/10 to-rose-600/5 border-rose-100 text-rose-600 bg-rose-50',
              'from-violet-500/10 to-violet-600/5 border-violet-100 text-violet-600 bg-violet-50',
              'from-emerald-500/10 to-emerald-600/5 border-emerald-100 text-emerald-600 bg-emerald-50'];

              const [gradFrom, gradTo, borderC, iconColor, iconBg] = colors[i].split(' ');
              return (
                <div key={title} className={`rounded-2xl p-6 border bg-gradient-to-br ${gradFrom} ${gradTo} ${borderC} hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group`}>
                  <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-5 h-5 ${iconColor}`} />
                  </div>
                  <h3 className="font-heading font-bold text-base mb-1.5 text-foreground">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>);

            })}
          </div>
        </div>
      </section>

      {/* About Preview */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/4 blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-3xl mx-auto text-center">
            <SectionHeading
              eyebrow="Who We Are"
              title="Student-Led. Community-Driven."
              description={settings.about_intro || "Milford Key Club is a student-led organization dedicated to serving our school and community while building leadership skills. We believe every student has the power to make a positive difference."} />
            
            <Button asChild className="rounded-full px-8 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow">
              <Link to="/about">
                Learn More <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Project */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-slate-50 to-blue-50/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div className="rounded-3xl overflow-hidden aspect-[3/2] shadow-2xl shadow-slate-200 ring-1 ring-border/40">
              <img
                src={featuredProject?.image_url || PROJECT_FALLBACK}
                alt={featuredProject?.title || 'Featured Project'}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
              
            </div>
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-secondary bg-secondary/8 border border-secondary/20 px-3 py-1 rounded-full mb-4">
                ✦ Featured Project
              </span>
              <h3 className="font-heading font-bold text-2xl sm:text-3xl md:text-4xl mb-4 leading-tight">
                {featuredProject?.title || 'Got Bags? Initiative'}
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-8 text-base">
                {featuredProject?.description || 'Our flagship project transforms plastic bags into durable sleeping mats for those experiencing homelessness. It takes approximately 700 bags to create 1 mat.'}
              </p>
              <Button asChild className="rounded-full px-8 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all">
                <Link to="/projects">
                  View All Projects <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Updates */}
      <LatestUpdates />

      {/* CTA */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-blue-600 to-violet-600" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/4 w-80 h-80 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-yellow-300 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-3/4 w-64 h-64 bg-rose-300 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
          <span className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-white/70 mb-5 border border-white/20 px-4 py-1.5 rounded-full">
            Get Involved
          </span>
          <h2 className="font-heading font-black text-4xl sm:text-5xl md:text-6xl text-white mb-5 leading-[1.05]">
            Want to make<br />a difference?
          </h2>
          <p className="text-white/80 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            Join Key Club today and start building your legacy of service and leadership.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" className="rounded-full px-10 h-12 text-base font-bold bg-white text-primary hover:bg-white/90 shadow-2xl shadow-black/20">
              <Link to="/pages/join">Sign Up Now</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full px-8 h-12 text-base font-semibold border-white/30 text-white hover:bg-white/10 hover:text-white">
              <Link to="/contact" className="bg-background text-[hsl(var(--primary))] px-8 text-base font-semibold rounded-full inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border shadow-sm h-12 border-white/30 hover:bg-white/10 hover:text-white">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>);

}