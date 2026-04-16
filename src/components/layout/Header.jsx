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
  { label: 'Resources', path: '/resources' },
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
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-background/95 backdrop-blur-xl border-b border-border/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            {settings.logo_url ? (
              <img src={settings.logo_url} alt={siteName} className="h-9 w-9 rounded-xl object-contain" />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-blue-700 flex items-center justify-center shadow-sm">
                <span className="text-white font-heading font-black text-sm">KC</span>
              </div>
            )}
            <div className="leading-tight">
              <span className="font-heading font-bold text-slate-900 text-sm sm:text-base block tracking-tight">{siteName}</span>
              <span className="text-[10px] sm:text-xs text-slate-500 font-medium tracking-widest uppercase">{tagline}</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {visibleLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-all ${
                  location.pathname === link.path
                    ? 'text-primary bg-primary/10 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Portal + Mobile Toggle */}
          <div className="flex items-center gap-2">
            <Link to="/portal" className="hidden sm:flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-primary to-blue-600 text-white hover:opacity-90 transition-opacity shadow-md shadow-primary/20">
              <ShieldCheck className="w-3.5 h-3.5" /> Portal
            </Link>
            <Button variant="ghost" size="icon" className="lg:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-border/50 bg-white/95 backdrop-blur-xl">
          <nav className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1">
            {visibleLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={`px-4 py-2.5 text-sm font-medium rounded-xl transition-colors ${
                  location.pathname === link.path
                    ? 'text-primary bg-primary/10 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link to="/portal" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-4 py-2.5 mt-1 rounded-xl text-sm font-semibold bg-gradient-to-r from-primary to-blue-600 text-white">
              <ShieldCheck className="w-4 h-4" /> Member Portal
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}