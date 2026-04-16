import { Link, useLocation } from 'react-router-dom';
import { Home, Briefcase, Calendar, ShieldCheck } from 'lucide-react';

const TABS = [
  { label: 'Home', path: '/', icon: Home },
  { label: 'Projects', path: '/projects', icon: Briefcase },
  { label: 'Events', path: '/events', icon: Calendar },
  { label: 'Portal', path: '/portal', icon: ShieldCheck },
];

export default function BottomTabNav() {
  const location = useLocation();

  // Hide on admin/portal pages that have their own nav
  const hide = ['/admin'].some(p => location.pathname.startsWith(p));
  if (hide) return null;

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border-border select-none"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-stretch h-14">
        {TABS.map(({ label, path, icon: Icon }) => {
          const active = path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);
          return (
            <Link
              key={path}
              to={path}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors ${
                active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? 'fill-primary/10' : ''}`} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}