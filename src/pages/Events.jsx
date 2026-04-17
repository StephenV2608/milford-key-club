import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Clock, CheckCircle2, Users, QrCode, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import PageHeader from '../components/shared/PageHeader';
import { base44 } from '@/api/base44Client';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { useMemberAuth } from '../hooks/useMemberAuth';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import usePullToRefresh from '../hooks/usePullToRefresh';
import PullToRefreshIndicator from '../components/layout/PullToRefreshIndicator';
import MobileBackButton from '../components/layout/MobileBackButton';

const typeColors = {
  meeting:   { badge: 'bg-primary/10 text-primary border-primary/20', dot: 'bg-primary' },
  project:   { badge: 'bg-rose-100 text-rose-700 border-rose-200', dot: 'bg-rose-500' },
  volunteer: { badge: 'bg-green-100 text-green-700 border-green-200', dot: 'bg-green-500' },
  social:    { badge: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
};

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export default function Events() {
  const { settings } = useSiteSettings();
  const { memberUser } = useMemberAuth();

  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [events, setEvents] = useState([]);
  const [rsvps, setRsvps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [rsvpLoading, setRsvpLoading] = useState(false);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    const list = await base44.entities.ClubEvent.list('date');
    setEvents(list);
    setLoading(false);
    if (memberUser) {
      const rsvpList = await base44.entities.EventRSVP.filter({ member_email: memberUser.email });
      setRsvps(rsvpList);
    }
  }, [memberUser?.email]);

  useEffect(() => { loadEvents(); }, [loadEvents]);

  const { pullY, refreshing, ready } = usePullToRefresh(loadEvents);

  const loadRsvpCount = async (eventId) => {
    const list = await base44.entities.EventRSVP.filter({ event_id: eventId });
    return list.length;
  };

  const handleRSVP = async (event) => {
    if (!memberUser) { toast.error('Please log in to the member portal to RSVP.'); return; }
    setRsvpLoading(true);
    const alreadyRsvpd = rsvps.find(r => r.event_id === event.id);
    if (alreadyRsvpd) {
      await base44.entities.EventRSVP.delete(alreadyRsvpd.id);
      setRsvps(prev => prev.filter(r => r.id !== alreadyRsvpd.id));
      toast.success('RSVP removed.');
    } else {
      if (event.max_rsvps > 0) {
        const count = await loadRsvpCount(event.id);
        if (count >= event.max_rsvps) { toast.error('This event is full.'); setRsvpLoading(false); return; }
      }
      const newRsvp = await base44.entities.EventRSVP.create({ event_id: event.id, member_email: memberUser.email, member_name: memberUser.name });
      setRsvps(prev => [...prev, newRsvp]);
      toast.success('RSVP confirmed!');
    }
    setRsvpLoading(false);
  };

  const isRsvpd = (eventId) => rsvps.some(r => r.event_id === eventId);

  // Calendar grid
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells = Array(firstDay).fill(null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));

  const eventsOnDay = (day) => events.filter(e => {
    const d = new Date(e.date);
    return d.getFullYear() === viewYear && d.getMonth() === viewMonth && d.getDate() === day;
  });

  const upcomingEvents = events.filter(e => new Date(e.date) >= new Date(today.toDateString())).slice(0, 10);

  return (
    <div>
      <PullToRefreshIndicator pullY={pullY} refreshing={refreshing} ready={ready} />
      <MobileBackButton />
      <PageHeader
        eyebrow={settings.events_eyebrow || "What's Happening"}
        title={settings.events_heading || 'Events Calendar'}
        description={settings.events_description || 'Stay up to date with meetings, service projects, and volunteer opportunities.'}
        imageUrl={settings.events_header_image_url}
      />

      <section className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[1fr_380px] gap-8 items-start">

            {/* Calendar */}
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
              {/* Month Nav */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
                <button onClick={() => { const d = new Date(viewYear, viewMonth - 1); setViewMonth(d.getMonth()); setViewYear(d.getFullYear()); }}
                 className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors select-none">
                 <ChevronLeft className="w-4 h-4" />
                </button>
                <h3 className="font-heading font-bold text-base select-none">{MONTHS[viewMonth]} {viewYear}</h3>
                <button onClick={() => { const d = new Date(viewYear, viewMonth + 1); setViewMonth(d.getMonth()); setViewYear(d.getFullYear()); }}
                 className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors select-none">
                 <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 border-b border-border">
                {DAYS.map(d => (
                  <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-2">{d}</div>
                ))}
              </div>

              {/* Cells */}
              <div className="grid grid-cols-7">
                {cells.map((day, idx) => {
                  const dayEvents = day ? eventsOnDay(day) : [];
                  const isToday = day && today.getDate() === day && today.getMonth() === viewMonth && today.getFullYear() === viewYear;
                  return (
                    <div key={idx} className={`min-h-[80px] border-r border-b border-border/50 p-1.5 ${!day ? 'bg-muted/20' : 'hover:bg-muted/30 transition-colors'}`}>
                      {day && (
                        <>
                          <span className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full mb-1 ${isToday ? 'bg-primary text-white' : 'text-foreground'}`}>{day}</span>
                          <div className="space-y-0.5">
                            {dayEvents.map(e => (
                              <button key={e.id} onClick={() => setSelectedEvent(e)}
                                className={`w-full text-left text-[10px] font-medium px-1.5 py-0.5 rounded truncate border ${typeColors[e.type]?.badge || 'bg-muted text-muted-foreground border-border'} hover:opacity-80 transition-opacity`}>
                                {e.title}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="px-4 py-3 border-t border-border flex flex-wrap gap-3">
                {Object.entries(typeColors).map(([type, c]) => (
                  <span key={type} className="flex items-center gap-1.5 text-xs text-muted-foreground capitalize">
                    <span className={`w-2 h-2 rounded-full ${c.dot}`} />{type}
                  </span>
                ))}
              </div>
            </div>

            {/* Sidebar: Selected Event + Upcoming */}
            <div className="space-y-5">
              {selectedEvent && (
                <EventCard event={selectedEvent} isRsvpd={isRsvpd(selectedEvent.id)} onRSVP={() => handleRSVP(selectedEvent)} rsvpLoading={rsvpLoading} memberUser={memberUser} />
              )}
              <div>
                <h3 className="font-heading font-semibold text-sm uppercase tracking-widest text-muted-foreground mb-3">Upcoming Events</h3>
                {loading ? (
                  <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />)}</div>
                ) : upcomingEvents.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4">No upcoming events.</p>
                ) : (
                  <div className="space-y-2">
                    {upcomingEvents.map(e => {
                      const d = new Date(e.date);
                      return (
                        <button key={e.id} onClick={() => setSelectedEvent(e)}
                          className={`w-full text-left flex items-center gap-3 p-3 rounded-xl border transition-all hover:shadow-sm ${selectedEvent?.id === e.id ? 'border-primary/40 bg-primary/5' : 'border-border bg-card hover:border-primary/20'}`}>
                          <div className="shrink-0 w-10 h-10 rounded-lg bg-primary flex flex-col items-center justify-center text-primary-foreground">
                            <span className="text-[9px] font-bold uppercase">{isNaN(d) ? '' : d.toLocaleDateString('en-US', { month: 'short' })}</span>
                            <span className="text-sm font-black leading-none">{isNaN(d) ? '?' : d.getDate()}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">{e.title}</p>
                            <p className="text-xs text-muted-foreground truncate">{e.time} {e.location ? `· ${e.location}` : ''}</p>
                          </div>
                          {isRsvpd(e.id) && <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="bg-accent/60 rounded-xl p-4 text-center border border-primary/10">
                <Star className="w-5 h-5 text-primary mx-auto mb-2" />
                <p className="text-xs font-semibold text-foreground mb-1">Did something great?</p>
                <p className="text-xs text-muted-foreground mb-3">Submit your service project to the Community Showcase!</p>
                <Link to="/showcase" className="text-xs font-bold text-primary hover:underline">View Showcase →</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function EventCard({ event, isRsvpd, onRSVP, rsvpLoading, memberUser }) {
  const d = new Date(event.date);
  const c = typeColors[event.type] || { badge: 'bg-muted text-muted-foreground border-border', dot: 'bg-muted-foreground' };
  const qrUrl = `${window.location.origin}/attend?event=${event.id}`;

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
      <div className="flex items-start gap-3 mb-4">
        <div className="shrink-0 w-12 h-12 rounded-xl bg-primary flex flex-col items-center justify-center text-primary-foreground">
          <span className="text-[9px] font-bold uppercase">{isNaN(d) ? '' : d.toLocaleDateString('en-US', { month: 'short' })}</span>
          <span className="text-lg font-black leading-none">{isNaN(d) ? '?' : d.getDate()}</span>
        </div>
        <div className="flex-1">
          <span className={`inline-flex text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border mb-1 ${c.badge}`}>{event.type}</span>
          <h3 className="font-heading font-bold text-base leading-tight">{event.title}</h3>
        </div>
      </div>

      <div className="space-y-1.5 text-sm text-muted-foreground mb-4">
        {event.time && <p className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 shrink-0" />{event.time}</p>}
        {event.location && <p className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 shrink-0" />{event.location}</p>}
        {event.max_rsvps > 0 && <p className="flex items-center gap-2"><Users className="w-3.5 h-3.5 shrink-0" />Limit: {event.max_rsvps} spots</p>}
      </div>

      {event.description && <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{event.description}</p>}

      {/* RSVP */}
      <Button
        className={`w-full rounded-full mb-3 ${isRsvpd ? 'bg-green-600 hover:bg-green-700 text-white' : ''}`}
        variant={isRsvpd ? 'default' : 'default'}
        onClick={onRSVP}
        disabled={rsvpLoading}
      >
        {rsvpLoading ? 'Updating...' : isRsvpd ? <><CheckCircle2 className="w-4 h-4 mr-1.5" /> RSVPd — Click to Cancel</> : 'RSVP for This Event'}
      </Button>
      {!memberUser && <p className="text-xs text-center text-muted-foreground">Log in to the <Link to="/portal" className="text-primary hover:underline">member portal</Link> to RSVP</p>}

      {/* QR */}
      {event.qr_enabled && (
        <div className="mt-3 pt-3 border-t border-border text-center">
          <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center justify-center gap-1"><QrCode className="w-3.5 h-3.5" /> QR Check-In</p>
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(qrUrl)}`}
            alt="QR Code"
            className="mx-auto rounded-lg border border-border"
          />
          {event.hours_credit > 0 && <p className="text-xs text-primary font-semibold mt-2">Scan = +{event.hours_credit}h service credit</p>}
        </div>
      )}
    </div>
  );
}