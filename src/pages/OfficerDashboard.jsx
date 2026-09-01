import { Button } from '@/components/ui/button';
import { LogOut, LayoutDashboard, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import AdminLogin from '@/components/admin/AdminLogin';
import HoursPanel from '@/components/dashboard/HoursPanel';
import ProjectsPanel from '@/components/dashboard/ProjectsPanel';

export default function OfficerDashboard() {
  const { adminUser, checking, login, logout } = useAdminAuth();

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!adminUser) {
    return <AdminLogin onLogin={login} />;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-lg leading-tight">Officer Dashboard</h1>
              <p className="text-xs text-muted-foreground">{adminUser.username || adminUser.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/admin">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4" /> Full Admin
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="w-4 h-4" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <HoursPanel />
          <ProjectsPanel />
        </div>
      </main>
    </div>
  );
}