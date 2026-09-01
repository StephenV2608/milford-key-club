import { useState, useEffect } from 'react';
import FormSelect from '@/components/ui/form-select';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { QrCode, Maximize2, Users, Clock, MapPin, CheckCircle2, RefreshCw, X } from 'lucide-react';

export default function MeetingQRDisplay() {
  const [events, setEvents] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [fullscreen, setFullscreen] = useState(false);
  const [attendeeCount, setAttendeeCount] = useState(0);
  const [recentAttendees, setRecentAttendees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.ClubEvent.list('-date').then(list => {
      const qrEvents = list.filter(e => e.qr_enabled);
      setEvents(qrEvents);
      if (qrEvents.length) setSelectedId(qrEvents[0].id);
      setLoading(false);
    });
  }, []);

  // Poll attendance every 5s when event is selected
  useEffect(() => {
    if (!selectedId) return;
    const refresh = () => {
      base44.entities.AttendanceLog.filter({ event_id: selectedId }).then(logs => {
        setAttendeeCount(logs.length);
        const sorted = [...logs].sort((a, b) => new Date(b.scanned_at) - new Date(a.scanned_at));
        setRecentAttendees(sorted.slice(0, 8));
      });
    };
    refresh();
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, [selectedId]);

  const selected = events.find(e => e.id === selectedId);
  const qrUrl = selected ? `${window.location.origin}/attend?event=${selected.id}` : '';
  const qrImg = qrUrl ? `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(qrUrl)}&bgcolor=ffffff&color=1e3a8a&margin=10` : '';

  if (loading) return <div className="h-40 flex items-center justify-center"><div className="w-6 h-6 border-2 border-muted border-t-primary rounded-full animate-spin" /></div>;

  if (!events.length) return (
    <div className="text-center py-16 space-y-3">
      <QrCode className="w-12 h-12 mx-auto text-muted-foreground/40" />
      <p className="font-semibold text-sm">No QR-enabled events found</p>
      <p className="text-xs text-muted-foreground">Go to Events, create or edit an event, and enable QR check-in.</p>
    </div>
  );

  return (
    <>
      {/* Fullscreen overlay */}
      {fullscreen && selected && (
        <div className="fixed inset-0 bg-slate-900 z-50 flex flex-col items-center justify-center gap-6 p-8">
          <button onClick={() => setFullscreen(false)} className="absolute top-4 right-4 text-white/60 hover:text-white">
            <X className="w-6 h-6" />
          </button>
          <div className="text-center text-white mb-2">
            <p className="text-xs font-bold uppercase tracking-widest text-white/50 mb-1">QR Check-In</p>
            <h2 className="font-heading font-black text-4xl">{selected.title}</h2>
            <div className="flex justify-center gap-6 mt-2 text-white/60 text-sm">
              {selected.time && <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{selected.time}</span>}
              {selected.location && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{selected.location}</span>}
            </div>
          </div>
          <div className="bg-white p-4 rounded-3xl shadow-2xl">
            <img src={qrImg} alt="QR Code" className="w-64 h-64 sm:w-80 sm:h-80" />
          </div>
          {selected.hours_credit > 0 && (
            <p className="text-white/70 text-sm font-medium bg-white/10 px-5 py-2 rounded-full">
              +{selected.hours_credit}h service credit on scan
            </p>
          )}
          <div className="flex items-center gap-3 text-white">
            <div className="flex items-center gap-2 bg-white/10 rounded-full px-5 py-2">
              <Users className="w-5 h-5" />
              <span className="text-xl font-bold">{attendeeCount}</span>
              <span className="text-sm text-white/60">checked in</span>
            </div>
          </div>
          {recentAttendees.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 max-w-lg">
              {recentAttendees.map(a => (
                <span key={a.id} className="flex items-center gap-1.5 bg-white/10 text-white/80 text-xs px-3 py-1.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3 text-green-400" />{a.member_name}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Normal view */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading font-bold text-xl flex items-center gap-2"><QrCode className="w-5 h-5 text-primary" />Meeting QR Check-In</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Members scan to log attendance & earn service hours automatically</p>
          </div>
        </div>

        {/* Event picker */}
        <div className="bg-card rounded-xl border border-border p-4">
          <label className="text-xs uppercase tracking-wide text-muted-foreground font-medium block mb-1.5">Active Event</label>
          <FormSelect
            className="w-full"
            value={selectedId}
            onChange={v => setSelectedId(v)}
            options={events.map(ev => ({
              value: ev.id,
              label: `${ev.date ? `${new Date(ev.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · ` : ''}${ev.title}`
            }))}
          />
        </div>

        {selected && (
          <div className="grid md:grid-cols-2 gap-5">
            {/* QR Code card */}
            <div className="bg-card rounded-2xl border border-border p-6 flex flex-col items-center gap-4">
              <div className="text-center">
                <p className="font-heading font-bold text-lg">{selected.title}</p>
                <div className="flex justify-center gap-4 mt-1 text-xs text-muted-foreground">
                  {selected.time && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{selected.time}</span>}
                  {selected.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{selected.location}</span>}
                </div>
              </div>
              <div className="bg-white p-3 rounded-2xl border border-border shadow-md">
                <img src={qrImg} alt="QR Code" className="w-48 h-48" />
              </div>
              {selected.hours_credit > 0 && (
                <p className="text-xs font-semibold text-primary bg-primary/10 px-4 py-1.5 rounded-full">
                  +{selected.hours_credit}h service credit on scan
                </p>
              )}
              <div className="flex gap-2 w-full">
                <Button onClick={() => setFullscreen(true)} className="flex-1 gap-1.5 rounded-full">
                  <Maximize2 className="w-4 h-4" /> Project Fullscreen
                </Button>
                <Button variant="outline" size="icon" className="rounded-full shrink-0" title="Copy link" onClick={() => { navigator.clipboard.writeText(qrUrl); }}>
                  <QrCode className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground text-center break-all">{qrUrl}</p>
            </div>

            {/* Live attendance feed */}
            <div className="bg-card rounded-2xl border border-border p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-heading font-semibold text-sm">Live Attendance</p>
                  <p className="text-xs text-muted-foreground">Updates every 5 seconds</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 text-sm font-bold px-3 py-1.5 rounded-full">
                    <Users className="w-3.5 h-3.5" />{attendeeCount} in
                  </div>
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                </div>
              </div>

              <div className="flex-1 min-h-0 space-y-2 max-h-80 overflow-y-auto">
                {recentAttendees.length === 0 ? (
                  <div className="text-center py-10">
                    <QrCode className="w-8 h-8 mx-auto text-muted-foreground/30 mb-2" />
                    <p className="text-xs text-muted-foreground">No one has checked in yet</p>
                    <p className="text-xs text-muted-foreground">Share the QR code to get started</p>
                  </div>
                ) : (
                  recentAttendees.map((a, i) => (
                    <div key={a.id} className="flex items-center gap-3 bg-muted/40 rounded-lg px-3 py-2.5">
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{a.member_name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {a.scanned_at ? new Date(a.scanned_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : ''}
                          {a.hours_credited ? ` · +${a.hours_credited}h` : ''}
                        </p>
                      </div>
                      {i === 0 && <span className="text-[10px] bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full shrink-0">Latest</span>}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}