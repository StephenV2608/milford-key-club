import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { useSiteSettings } from '../../hooks/useSiteSettings';

export default function SiteLayout() {
  const { settings, loading } = useSiteSettings();
  const location = useLocation();

  // Allow admin and portal through even when site is closed
  const isAdminRoute = location.pathname.startsWith('/admin') || location.pathname.startsWith('/portal');

  if (!loading && settings.site_closed && !isAdminRoute) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <div className="text-center text-white max-w-lg space-y-6">
          {settings.logo_url && (
            <img src={settings.logo_url} alt={settings.site_name || 'Logo'} className="h-20 w-20 object-contain mx-auto rounded-2xl shadow-lg" />
          )}
          {!settings.logo_url && (
            <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center mx-auto">
              <span className="text-primary-foreground font-heading font-black text-2xl">KC</span>
            </div>
          )}
          <div>
            <h1 className="font-heading font-black text-3xl md:text-4xl mb-3">{settings.site_name || 'Milford Key Club'}</h1>
            <p className="text-slate-300 text-base leading-relaxed">
              {settings.site_closed_message || "We're currently performing scheduled maintenance. We'll be back shortly. Thank you for your patience!"}
            </p>
          </div>
          <a href="/admin" className="inline-block text-xs text-slate-600 hover:text-slate-400 transition-colors mt-8">Admin Access</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}