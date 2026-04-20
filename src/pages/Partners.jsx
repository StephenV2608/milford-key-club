import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { ExternalLink, Handshake, Star } from 'lucide-react';
import PageHeader from '../components/shared/PageHeader';

export default function Partners() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Partner.filter({ active: true }, 'order')
      .then(list => {
        setPartners(list);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const featured = partners.filter(p => p.featured);
  const others = partners.filter(p => !p.featured);

  return (
    <div>
      <PageHeader
        eyebrow="Our Network"
        title="Partners & Supporters"
        description="We're grateful to the organizations, businesses, and community groups who make our service possible."
      />

      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-48 bg-muted rounded-2xl animate-pulse" />)}
            </div>
          ) : partners.length === 0 ? (
            <div className="text-center py-16">
              <Handshake className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Partners will be listed here soon.</p>
            </div>
          ) : (
            <>
              {featured.length > 0 && (
                <div className="mb-12">
                  <div className="flex items-center gap-2 mb-6">
                    <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                    <h2 className="font-heading font-bold text-xl">Featured Partners</h2>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {featured.map(p => <PartnerCard key={p.id} partner={p} featured />)}
                  </div>
                </div>
              )}

              {others.length > 0 && (
                <div>
                  {featured.length > 0 && <h2 className="font-heading font-bold text-xl mb-6">All Partners</h2>}
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {others.map(p => <PartnerCard key={p.id} partner={p} />)}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <section className="py-12 md:py-16 bg-gradient-to-br from-primary/5 via-accent/30 to-blue-50/40">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="font-heading font-bold text-2xl md:text-3xl mb-3">Want to Partner With Us?</h2>
          <p className="text-muted-foreground mb-6">If your organization would like to collaborate on a service project or sponsor an event, we'd love to hear from you.</p>
          <a href="/contact" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
            Get in Touch <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </section>
    </div>
  );
}

function PartnerCard({ partner, featured }) {
  const card = (
    <div className={`bg-card rounded-2xl border p-6 h-full flex flex-col hover:shadow-lg hover:-translate-y-0.5 transition-all ${featured ? 'border-amber-200' : 'border-border'}`}>
      {partner.logo_url ? (
        <div className="w-full h-32 bg-muted/40 rounded-xl overflow-hidden mb-4 flex items-center justify-center">
          <img src={partner.logo_url} alt={partner.name} className="w-full h-full object-contain p-3" />
        </div>
      ) : (
        <div className="w-full h-32 bg-gradient-to-br from-primary/10 to-blue-100 rounded-xl mb-4 flex items-center justify-center">
          <Handshake className="w-10 h-10 text-primary/40" />
        </div>
      )}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-heading font-bold text-base leading-tight">{partner.name}</h3>
        {partner.category && <span className="text-[10px] font-bold uppercase tracking-wider bg-muted text-muted-foreground px-2 py-0.5 rounded-full shrink-0">{partner.category}</span>}
      </div>
      {partner.description && <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">{partner.description}</p>}
      {partner.website_url && (
        <span className="text-sm text-primary font-semibold inline-flex items-center gap-1">
          Visit Website <ExternalLink className="w-3.5 h-3.5" />
        </span>
      )}
    </div>
  );

  if (partner.website_url) {
    return <a href={partner.website_url} target="_blank" rel="noopener noreferrer" className="block">{card}</a>;
  }
  return card;
}