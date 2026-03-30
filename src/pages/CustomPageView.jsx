import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import ReactMarkdown from 'react-markdown';
import SectionHeading from '../components/shared/SectionHeading';

export default function CustomPageView() {
  const slug = window.location.pathname.replace('/pages/', '');
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.CustomPage.filter({ slug }, 'order').then(list => {
      const found = list[0] || null;
      if (found?.redirect_url) {
        window.location.replace(found.redirect_url);
        return;
      }
      setPage(found);
      setLoading(false);
    });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-muted-foreground">
        Page not found.
      </div>
    );
  }

  return (
    <div>
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow={page.eyebrow} title={page.title} description={page.description} />
        </div>
      </section>
      <section className="py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-slate max-w-none text-foreground">
            <ReactMarkdown>{page.content || ''}</ReactMarkdown>
          </div>
        </div>
      </section>
    </div>
  );
}