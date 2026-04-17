import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Download, Image, ExternalLink } from 'lucide-react';

export default function ImageDownloadTab() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.GalleryImage.list('order'),
      base44.entities.Officer.list('order'),
      base44.entities.SiteSettings.list(),
    ]).then(([gallery, officers, settings]) => {
      const all = [];

      (settings[0] ? [
        { url: settings[0].logo_url, label: 'Logo' },
        { url: settings[0].hero_image_url, label: 'Hero Image' },
        { url: settings[0].about_image_url, label: 'About Image' },
        { url: settings[0].about_header_image_url, label: 'About Header' },
        { url: settings[0].projects_header_image_url, label: 'Projects Header' },
        { url: settings[0].events_header_image_url, label: 'Events Header' },
        { url: settings[0].officers_header_image_url, label: 'Officers Header' },
        { url: settings[0].gallery_header_image_url, label: 'Gallery Header' },
        { url: settings[0].join_header_image_url, label: 'Join Header' },
        { url: settings[0].contact_header_image_url, label: 'Contact Header' },
      ] : []).forEach(({ url, label }) => {
        if (url) all.push({ url, label, category: 'Site' });
      });

      gallery.forEach(img => {
        if (img.image_url) all.push({ url: img.image_url, label: img.alt_text || img.category || 'Gallery', category: 'Gallery' });
      });

      officers.forEach(o => {
        if (o.photo_url) all.push({ url: o.photo_url, label: o.name, category: 'Officers' });
      });

      setImages(all);
      setLoading(false);
    });
  }, []);

  const downloadImage = async (url, filename) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename || 'image';
      a.click();
    } catch {
      window.open(url, '_blank');
    }
  };

  const downloadAll = () => {
    images.forEach((img, i) => {
      setTimeout(() => downloadImage(img.url, `${img.category}-${img.label}-${i + 1}`), i * 300);
    });
  };

  const categories = [...new Set(images.map(i => i.category))];

  if (loading) return <div className="py-12 text-center text-muted-foreground">Loading images...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-bold text-xl flex items-center gap-2">
            <Image className="w-5 h-5 text-primary" /> Image Downloads
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">{images.length} images across the site</p>
        </div>
        {images.length > 0 && (
          <Button size="sm" onClick={downloadAll} className="gap-1.5">
            <Download className="w-3.5 h-3.5" /> Download All
          </Button>
        )}
      </div>

      {categories.map(cat => (
        <div key={cat}>
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">{cat}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {images.filter(i => i.category === cat).map((img, idx) => (
              <div key={idx} className="group relative bg-muted rounded-xl overflow-hidden aspect-square border border-border">
                <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                  <p className="text-white text-xs font-medium text-center leading-tight">{img.label}</p>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => downloadImage(img.url, `${img.label}`)}
                      className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition-colors"
                      title="Download"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <a
                      href={img.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition-colors"
                      title="Open in new tab"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {images.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Image className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No images found on the site yet.</p>
        </div>
      )}
    </div>
  );
}