import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ThemeProvider from '@/components/ThemeProvider';
import ErrorBoundary from '@/components/ErrorBoundary';

import SiteLayout from './components/layout/SiteLayout';
import Home from './pages/Home';
import About from './pages/About';
import Projects from './pages/Projects';
import Events from './pages/Events';
import Officers from './pages/Officers';
import Gallery from './pages/Gallery';
import JoinUs from './pages/JoinUs';
import Contact from './pages/Contact';
import Admin from './pages/Admin.jsx';
import ServiceHours from './pages/ServiceHours';
import CustomPageView from './pages/CustomPageView';
import Resources from './pages/Resources';
import Portal from './pages/Portal';
import Register from './pages/Register';
import AdviserSetup from './pages/AdviserSetup';
import Showcase from './pages/Showcase';
import AttendanceScan from './pages/AttendanceScan';
import RequestHelp from './pages/RequestHelp';
import Impact from './pages/Impact';
import Partners from './pages/Partners';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Allow /register, /portal, and /adviser-setup to be accessed without auth
      const path = window.location.pathname;
      if (path !== '/register' && path !== '/portal' && path !== '/adviser-setup') {
        navigateToLogin();
        return null;
      }
    }
  }

  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/events" element={<Events />} />
        <Route path="/officers" element={<Officers />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/join" element={<JoinUs />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/admin" element={<Admin />} />

        <Route path="/hours" element={<ServiceHours />} />
        <Route path="/pages/:slug" element={<CustomPageView />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/portal" element={<Portal />} />
        <Route path="/showcase" element={<Showcase />} />
        <Route path="/request-help" element={<RequestHelp />} />
        <Route path="/impact" element={<Impact />} />
        <Route path="/partners" element={<Partners />} />
      </Route>
      <Route path="/attend" element={<AttendanceScan />} />
      <Route path="/register" element={<Register />} />
      <Route path="/adviser-setup" element={<AdviserSetup />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <AuthProvider>
          <QueryClientProvider client={queryClientInstance}>
            <Router>
              <AuthenticatedApp />
            </Router>
            <Toaster />
          </QueryClientProvider>
        </AuthProvider>
      </ErrorBoundary>
    </ThemeProvider>
  )
}

export default App