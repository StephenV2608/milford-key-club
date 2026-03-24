import { useState } from 'react';
import { X } from 'lucide-react';
import SectionHeading from '../components/shared/SectionHeading';

const galleryImages = [
  { src: '/__generating__/img_b196aaa88c7b.png', alt: 'Members volunteering outdoors', category: 'Service' },
  { src: '/__generating__/img_27af8f23500d.png', alt: 'Got Bags weaving project', category: 'Projects' },
  { src: '/__generating__/img_b077131f7169.png', alt: 'Care Closet hygiene drive', category: 'Projects' },
  { src: '/__generating__/img_f4e1af6e4411.png', alt: 'Community event volunteering', category: 'Events' },
  { src: '/__generating__/img_5129f022ae23.png', alt: 'Club meeting discussion', category: 'Meetings' },
  { src: '/__generating__/img_070ea661710d.png', alt: 'Awards ceremony', category: 'Events' },
  { src: '/__generating__/img_2428e41bf033.png', alt: 'Mural painting project', category: 'Projects' },
  { src: '/__generating__/img_2173a2a13fce.png', alt: 'Soup kitchen service', category: 'Service' },
];

const categories = ['All', 'Service', 'Projects', 'Meetings', 'Events'];

export default function Gallery() {
  const [filter, setFilter] = useState('All');
  const [lightbox, setLightbox] = useState(null);

  const filtered = filter === 'All' ? galleryImages : galleryImages.filter(img => img.category === filter);

  return (
    <div>
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Photo Gallery"
            title="Moments That Matter"
            description="A look at our members in action — serving, leading, and having fun along the way."
          />
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filter Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                  filter === cat
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {filtered.map((img, i) => (
              <button
                key={i}
                onClick={() => setLightbox(img)}
                className="aspect-square rounded-xl overflow-hidden group cursor-pointer"
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-8 h-8" />
          </button>
          <img
            src={lightbox.src}
            alt={lightbox.alt}
            className="max-w-full max-h-[85vh] rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}