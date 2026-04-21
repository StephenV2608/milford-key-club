import { useState } from 'react';
import { useAdminAuth } from '../hooks/useAdminAuth';
import AdminLogin from '../components/admin/AdminLogin';
import AdminHome from '../components/admin/AdminHome';
import PeopleTab from '../components/admin/PeopleTab';
import AIContentTab from '../components/admin/AIContentTab';
import SiteShutdownTab from '../components/admin/SiteShutdownTab';
import GalleryTab from '../components/admin/GalleryTab';
import HoursTab from '../components/admin/HoursTab';
import NewsTab from '../components/admin/NewsTab';
import FormsTab from '../components/admin/FormsTab';
import ResourcesTab from '../components/admin/ResourcesTab';
import NewsletterTab from '../components/admin/NewsletterTab';
import HelpRequestsTab from '../components/admin/HelpRequestsTab';
import FooterTab from '../components/admin/FooterTab';
import CustomPagesTab from '../components/admin/CustomPagesTab';

import SettingsTabContent from '../components/admin/SettingsTabContent';
import OfficersTab from '../components/admin/OfficersTab';
import AnalyticsTab from '../components/admin/AnalyticsTab';
import GamificationTab from '../components/admin/GamificationTab';
import EventsTab from '../components/admin/EventsTab';
import ShowcaseTab from '../components/admin/ShowcaseTab';
import ImageDownloadTab from '../components/admin/ImageDownloadTab';
import AnnouncementsTab from '../components/admin/AnnouncementsTab.jsx';
import OfficerMessagesTab from '../components/admin/OfficerMessagesTab';
import AttendanceSheet from '../components/admin/AttendanceSheet';
import MeetingQRDisplay from '../components/admin/MeetingQRDisplay';
import HoursReportTab from '../components/admin/HoursReportTab';
import OfficerRolesTab from '../components/admin/OfficerRolesTab';
import NewSchoolYearTab from '../components/admin/NewSchoolYearTab.jsx';
import ServiceProjectsTab from '../components/admin/ServiceProjectsTab.jsx';
import CommunityRequestsTab from '../components/admin/CommunityRequestsTab.jsx';
import PartnersTab from '../components/admin/PartnersTab.jsx';
import ImpactStatsTab from '../components/admin/ImpactStatsTab.jsx';

import {
  Settings, Users, Image, Clock, Newspaper, FileText, BookOpen,
  Mail, FileStack, Sparkles, PowerOff, LogOut, Shield, UserCheck,
  BarChart2, CalendarDays, Star, Megaphone, MessageCircle, ClipboardList, QrCode, FileBarChart, GraduationCap, Briefcase,
  HandHeart, Handshake, Home, ArrowLeft, MoreHorizontal, TrendingUp
} from 'lucide-react';
import { Button } from "@/components/ui/button";

// Primary cards — shown on the home dashboard (the 80/20 most-used)
const HOME_CARDS = [
  { id: 'announcements', label: 'Announcements', description: 'Post news to members', icon: Megaphone, section: 'Everyday', perm: 'announcements' },
  { id: 'events',        label: 'Events',        description: 'Meetings & projects',  icon: CalendarDays,  section: 'Everyday', perm: 'events' },
  { id: 'hours',         label: 'Service Hours', description: 'Approve submissions',  icon: Clock,         section: 'Everyday', perm: 'hours' },
  { id: 'messages',      label: 'Messages',      description: 'Member inbox',         icon: MessageCircle, section: 'Everyday', perm: 'messages' },

  { id: 'people',        label: 'Members',       description: 'Roster & admins',      icon: Users,         section: 'Members',  perm: 'people' },
  { id: 'attendance',    label: 'Attendance',    description: 'Meeting check-ins',    icon: ClipboardList, section: 'Members',  perm: 'hours' },
  { id: 'hoursreport',   label: 'Hours Report',  description: 'Totals & exports',     icon: FileBarChart,  section: 'Members',  perm: 'hours' },
  { id: 'qr',            label: 'Meeting QR',    description: 'Display check-in code',icon: QrCode,        section: 'Members',  perm: 'hours' },

  { id: 'gallery',       label: 'Gallery',       description: 'Photos & albums',      icon: Image,         section: 'Content',  perm: 'gallery' },
  { id: 'officers',      label: 'Officers',      description: 'Leadership team',      icon: UserCheck,     section: 'Content',  perm: 'officers' },
  { id: 'settings',      label: 'Site Settings', description: 'Branding & pages',     icon: Settings,      section: 'Site',     perm: 'settings' },
  { id: 'more',          label: 'More…',         description: 'All other tools',      icon: MoreHorizontal,section: 'Site',     perm: null },
];

// Secondary tabs — accessible from the "More" view
const MORE_GROUPS = [
  {
    label: 'Communicate',
    tabs: [
      { id: 'news',       label: 'News Posts',    icon: Newspaper, perm: 'news' },
      { id: 'newsletter', label: 'Newsletter',    icon: Mail,      perm: 'news' },
    ],
  },
  {
    label: 'Members & Service',
    tabs: [
      { id: 'serviceprojects', label: 'Projects List', icon: Briefcase, perm: 'hours' },
    ],
  },
  {
    label: 'Content',
    tabs: [
      { id: 'showcase',  label: 'Showcase',  icon: Star,     perm: 'showcase' },
      { id: 'forms',     label: 'Documents', icon: FileText, perm: 'forms' },
      { id: 'resources', label: 'Resources', icon: BookOpen, perm: 'resources' },
    ],
  },
  {
    label: 'Community',
    tabs: [
      { id: 'requests', label: 'Help Requests', icon: HandHeart, perm: 'messages' },
      { id: 'partners', label: 'Partners',      icon: Handshake, perm: 'pages' },
      { id: 'impactstats', label: 'Impact Stats', icon: TrendingUp, perm: 'settings' },
    ],
  },
  {
    label: 'Site Tools',
    tabs: [
      { id: 'pages',     label: 'Custom Pages', icon: FileStack, perm: 'pages' },
      { id: 'analytics', label: 'Analytics',    icon: BarChart2, perm: null },
      { id: 'ai',        label: 'AI Content',   icon: Sparkles,  perm: null },
    ],
  },
  {
    label: 'Advanced',
    tabs: [
      { id: 'shutdown', label: 'Site Shutdown',    icon: PowerOff,      perm: null, superOnly: true },
      { id: 'newyear',  label: 'New School Year',  icon: GraduationCap, perm: null, superOnly: true },
    ],
  },
];

export default function Admin() {
  const { adminUser, checking, login, logout, isSuperAdmin, hasPermission } = useAdminAuth();
  const [activeTab, setActiveTab] = useState('home');

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

  const canSee = (item) => {
    if (item.superOnly && !isSuperAdmin) return false;
    if (item.perm && !isSuperAdmin && !hasPermission(item.perm)) return false;
    return true;
  };

  const visibleHomeCards = HOME_CARDS.filter(canSee);

  const renderContent = () => {
    switch (activeTab) {
      case 'home':       return <AdminHome cards={visibleHomeCards} onNavigate={setActiveTab} />;
      case 'more':       return <MoreMenu groups={MORE_GROUPS} canSee={canSee} onNavigate={setActiveTab} />;
      case 'settings':   return <SettingsTabContent />;
      case 'people':     return <PeopleTab isSuperAdmin={isSuperAdmin} hasPermission={hasPermission} />;
      case 'officers':   return <OfficersTab />;
      case 'officerRoles': return <OfficerRolesTab />;
      case 'gallery':    return <GalleryTab />;
      case 'downloads':  return <ImageDownloadTab />;
      case 'attendance': return <AttendanceSheet />;
      case 'qr':         return <MeetingQRDisplay />;
      case 'hours':      return <HoursTab />;
      case 'hoursreport': return <HoursReportTab />;
      case 'serviceprojects': return <ServiceProjectsTab />;
      case 'requests':   return <CommunityRequestsTab />;
      case 'partners':   return <PartnersTab />;
      case 'impactstats': return <ImpactStatsTab />;
      case 'news':       return <NewsTab />;
      case 'forms':      return <FormsTab />;
      case 'resources':  return <ResourcesTab />;
      case 'newsletter': return <NewsletterTab />;
      case 'help':       return <HelpRequestsTab />;
      case 'footer':     return <FooterTab />;
      case 'pages':      return <CustomPagesTab />;
      case 'announcements': return <AnnouncementsTab />;
      case 'messages':   return <OfficerMessagesTab />;
      case 'events':     return <EventsTab />;
      case 'showcase':   return <ShowcaseTab />;
      case 'analytics':  return <AnalyticsTab />;
      case 'gamify':     return <GamificationTab />;
      case 'ai':         return <AIContentTab />;
      case 'shutdown':   return <SiteShutdownTab />;
      case 'newyear':    return <NewSchoolYearTab />;
      default:           return null;
    }
  };

  const showBack = activeTab !== 'home';

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3 min-w-0">
          {showBack ? (
            <Button variant="ghost" size="sm" onClick={() => setActiveTab('home')} className="gap-1.5 -ml-2">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Button>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary" />
            </div>
          )}
          <div className="min-w-0">
            <h1 className="font-heading font-bold text-base leading-tight truncate">Admin Panel</h1>
            <p className="text-xs text-muted-foreground truncate">{adminUser.username} · {isSuperAdmin ? 'Super Admin' : 'Admin'}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={logout} className="gap-1.5 text-muted-foreground shrink-0">
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Sign Out</span>
        </Button>
      </div>

      <main className="p-4 sm:p-6 min-w-0">
        {renderContent()}
      </main>
    </div>
  );
}

function MoreMenu({ groups, canSee, onNavigate }) {
  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h2 className="font-heading font-bold text-2xl mb-1">More Tools</h2>
        <p className="text-sm text-muted-foreground">Less-frequently used admin features.</p>
      </div>

      {groups.map(group => {
        const visibleTabs = group.tabs.filter(canSee);
        if (visibleTabs.length === 0) return null;
        return (
          <div key={group.label}>
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70 mb-3">
              {group.label}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {visibleTabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => onNavigate(tab.id)}
                    className="group text-left bg-card hover:bg-accent/40 border border-border hover:border-primary/30 rounded-xl p-4 transition-all hover:shadow-sm flex items-center gap-3"
                  >
                    <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                      <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <p className="font-medium text-sm leading-tight">{tab.label}</p>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}