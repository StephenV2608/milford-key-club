import { useState } from 'react';
import { useAdminAuth } from '../hooks/useAdminAuth';
import AdminLogin from '../components/admin/AdminLogin';
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
import AnnouncementsTab from '../components/admin/AnnouncementsTab';
import OfficerMessagesTab from '../components/admin/OfficerMessagesTab';
import AttendanceSheet from '../components/admin/AttendanceSheet';
import MeetingQRDisplay from '../components/admin/MeetingQRDisplay';

import {
  Settings, Users, Image, Clock, Newspaper, FileText, BookOpen,
  Mail, HelpCircle, Link, FileStack, Sparkles, PowerOff, LogOut, Shield, UserCheck,
  BarChart2, Trophy, CalendarDays, Star, Megaphone, MessageCircle, ClipboardList, QrCode
} from 'lucide-react';
import { Button } from "@/components/ui/button";

const TAB_GROUPS = [
  {
    label: 'Communication',
    tabs: [
      { id: 'announcements', label: 'Announcements', icon: Megaphone,     perm: 'announcements' },
      { id: 'messages',      label: 'Messages',      icon: MessageCircle, perm: 'messages' },
      { id: 'news',          label: 'Newsletter',    icon: Newspaper,     perm: 'news' },
      { id: 'newsletter',    label: 'Subscribers',   icon: Mail,          perm: 'news' },
    ],
  },
  {
    label: 'Members',
    tabs: [
      { id: 'people',      label: 'Members',       icon: Users,          perm: 'people' },
      { id: 'attendance',  label: 'Attendance',    icon: ClipboardList,  perm: 'hours' },
      { id: 'qr',          label: 'Meeting QR',    icon: QrCode,         perm: 'hours' },
      { id: 'hours',       label: 'Service Hours', icon: Clock,          perm: 'hours' },
      { id: 'events',      label: 'Events',        icon: CalendarDays,   perm: 'events' },
      { id: 'gamify',      label: 'Leaderboard',   icon: Trophy,         perm: null },
    ],
  },
  {
    label: 'Content',
    tabs: [
      { id: 'gallery',  label: 'Gallery',      icon: Image,     perm: 'gallery' },
      { id: 'showcase', label: 'Showcase',     icon: Star,      perm: 'showcase' },
      { id: 'officers', label: 'Officers',     icon: UserCheck, perm: 'officers' },
      { id: 'forms',    label: 'Documents',    icon: FileText,  perm: 'forms' },
      { id: 'resources',label: 'Resources',    icon: BookOpen,  perm: 'resources' },
    ],
  },
  {
    label: 'Site',
    tabs: [
      { id: 'settings', label: 'Settings',     icon: Settings,  perm: 'settings' },
      { id: 'pages',    label: 'Custom Pages', icon: FileStack, perm: 'pages' },
      { id: 'footer',   label: 'Footer',       icon: Link,      perm: 'settings' },
      { id: 'analytics',label: 'Analytics',    icon: BarChart2, perm: null },
      { id: 'ai',       label: 'AI Content',   icon: Sparkles,  perm: null },
      { id: 'help',     label: 'Help Requests',icon: HelpCircle,perm: null },
      { id: 'shutdown', label: 'Shutdown',     icon: PowerOff,  perm: null, superOnly: true },
    ],
  },
];

const ALL_TABS = TAB_GROUPS.flatMap(g => g.tabs);

export default function Admin() {
  const { adminUser, checking, login, logout, isSuperAdmin, hasPermission } = useAdminAuth();
  const [activeTab, setActiveTab] = useState('announcements');

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

  const visibleTabs = ALL_TABS.filter(t => {
    if (t.superOnly && !isSuperAdmin) return false;
    if (t.perm && !isSuperAdmin && !hasPermission(t.perm)) return false;
    return true;
  });

  const renderContent = () => {
    switch (activeTab) {
      case 'settings':   return <SettingsTabContent />;
      case 'people':     return <PeopleTab isSuperAdmin={isSuperAdmin} hasPermission={hasPermission} />;
      case 'officers':   return <OfficersTab />;
      case 'gallery':    return <GalleryTab />;
      case 'attendance': return <AttendanceSheet />;
      case 'qr':         return <MeetingQRDisplay />;
      case 'hours':      return <HoursTab />;
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
      default:           return null;
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Shield className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h1 className="font-heading font-bold text-base leading-tight">Admin Panel</h1>
            <p className="text-xs text-muted-foreground">{adminUser.username} · {isSuperAdmin ? 'Super Admin' : 'Admin'}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={logout} className="gap-1.5 text-muted-foreground">
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Sign Out</span>
        </Button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-48 shrink-0 border-r border-border bg-card min-h-[calc(100vh-61px)] hidden md:block">
          <nav className="p-2 space-y-4 py-3">
            {TAB_GROUPS.map(group => {
              const groupTabs = group.tabs.filter(t => {
                if (t.superOnly && !isSuperAdmin) return false;
                if (t.perm && !isSuperAdmin && !hasPermission(t.perm)) return false;
                return true;
              });
              if (groupTabs.length === 0) return null;
              return (
                <div key={group.label}>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 px-3 mb-1">{group.label}</p>
                  <div className="space-y-0.5">
                    {groupTabs.map(tab => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                            activeTab === tab.id
                              ? 'bg-primary/10 text-primary font-semibold'
                              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                          }`}
                        >
                          <Icon className="w-4 h-4 shrink-0" />
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>
        </aside>

        {/* Mobile tab bar */}
        <div className="md:hidden w-full fixed bottom-0 left-0 bg-card border-t border-border z-20 overflow-x-auto">
          <div className="flex gap-1 p-2 min-w-max">
            {visibleTabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-[10px] transition-colors whitespace-nowrap ${
                    activeTab === tab.id ? 'bg-primary/10 text-primary font-semibold' : 'text-muted-foreground'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 p-4 sm:p-6 pb-24 md:pb-6 min-w-0">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}