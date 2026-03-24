import { useState } from 'react';
import { X } from 'lucide-react';
import SectionHeading from '../components/shared/SectionHeading';

const galleryImages = [
  { src: 'https://media.base44.com/images/public/69c2a0f26438a6d865c0f034/fed622b44_generated_8d496406.png', alt: 'Members volunteering outdoors', category: 'Service' },
  { src: 'https://media.base44.com/images/public/69c2a0f26438a6d865c0f034/966810261_generated_0f8cf771.png', alt: 'Got Bags weaving project', category: 'Projects' },
  { src: 'https://media.base44.com/images/public/69c2a0f26438a6d865c0f034/eae6320ab_generated_d26c231a.png', alt: 'Care Closet hygiene drive', category: 'Projects' },
  { src: 'https://media.base44.com/images/public/69c2a0f26438a6d865c0f034/e36514680_generated_a44aae9c.png', alt: 'Community event volunteering', category: 'Events' },
  { src: 'https://media.base44.com/images/public/69c2a0f26438a6d865c0f034/cd49e8311_generated_b0a84d9f.png', alt: 'Club meeting discussion', category: 'Meetings' },
  { src: 'https://media.base44.com/images/public/69c2a0f26438a6d865c0f034/38e41a503_generated_e444290c.png', alt: 'Awards ceremony', category: 'Events' },
  { src: 'https://media.base44.com/images/public/69c2a0f26438a6d865c0f034/3b1b294b4_generated_e38479b8.png', alt: 'Mural painting project', category: 'Projects' },
  { src: 'https://media.base44.com/images/public/69c2a0f26438a6d865c0f034/2db13ba81_generated_e2bd570e.png', alt: 'Soup kitchen service', category: 'Service' },
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