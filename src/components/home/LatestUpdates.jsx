import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { ArrowRight, Newspaper } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function LatestUpdates() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.NewsPost.filter({ published: true }, '-date', 3).then(list => {
      setPosts(list);
      setLoading(false);
    });
  }, []);

  if (loading) return null;
  if (posts.length === 0) return null;

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-primary mb-2">Latest Updates</span>
            <h2 className="font-heading font-bold text-2xl sm:text-3xl text-foreground">Club Announcements</h2>
          </div>
          <Button asChild variant="ghost" size="sm" className="hidden sm:flex gap-1.5 text-muted-foreground">
            <Link to="/contact">
              Contact Us <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {posts.map((post, i) => (
            <div
              key={post.id}
              className={`rounded-xl border border-border p-6 hover:shadow-md transition-shadow ${i === 0 ? 'bg-primary/5 border-primary/20' : 'bg-card'}`}
            >
              <div className="flex items-center gap-2 mb-3">
                <Newspaper className={`w-4 h-4 ${i === 0 ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className="text-xs text-muted-foreground font-medium">{post.date}</span>
                {i === 0 && <span className="text-[10px] font-bold uppercase tracking-wider bg-primary text-primary-foreground px-2 py-0.5 rounded-full">Latest</span>}
              </div>
              <h3 className="font-heading font-semibold text-base mb-2 leading-snug">{post.headline}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{post.snippet}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}