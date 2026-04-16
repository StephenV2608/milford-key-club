import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Menu, X, ShieldCheck } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useSiteSettings } from '../../hooks/useSiteSettings';

const BUILT_IN_NAV = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'Projects', path: '/projects' },
  { label: 'Events', path: '/events' },
  { label: 'Officers', path: '/officers' },
  { label: 'Gallery', path: '/gallery' },
  { label: 'Log Hours', path: '/hours' },
  { label: 'Join Us', path: '/join' },
  { label: 'Contact', path: '/contact' },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { settings } = useSiteSettings();

  const [customPages, setCustomPages] = useState([]);
  useEffect(() => {
    base44.entities.CustomPage.filter({ show_in_nav: true }, 'order').then(setCustomPages);
  }, []);

  const siteName = settings.site_name || 'Milford Key Club';
  const tagline = settings.tagline || 'Service · Leadership · Caring';
  const hiddenPaths = (settings.hidden_nav_items || '').split(',').map(s => s.trim()).filter(Boolean);
  const builtInVisible = BUILT_IN_NAV.filter(l => !hiddenPaths.includes(l.path));
  const customNav = customPages.map(p => ({ label: p.title, path: `/pages/${p.slug}` }));
  const visibleLinks = [...builtInVisible, ...customNav];

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            {settings.logo_url ? (
              <img src={settings.logo_url} alt={siteName} className="h-10 w-10 rounded-lg object-contain" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-heading font-black text-sm">KC</span>
              </div>
            )}
            <div className="leading-tight">
              <span className="font-heading font-bold text-foreground text-sm sm:text-base block">{siteName}</span>
              <span className="text-[10px] sm:text-xs text-muted-foreground font-medium tracking-wide uppercase">{tagline}</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {visibleLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  location.pathname === link.path
                    ? 'text-primary bg-accent'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Super Admin + Mobile Toggle */}
          <div className="flex items-center gap-1">
            <Link to="/portal" className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5" /> Portal
            </Link>
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-border bg-background">
          <nav className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1">
            {visibleLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={`px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  location.pathname === link.path
                    ? 'text-primary bg-accent'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}