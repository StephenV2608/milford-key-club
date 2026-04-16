import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { CheckCircle2, XCircle, Clock, MapPin, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMemberAuth } from '../hooks/useMemberAuth';

export default function AttendanceScan() {
  const urlParams = new URLSearchParams(window.location.search);
  const eventId = urlParams.get('event');

  const { memberUser } = useMemberAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null); // 'success' | 'already' | 'error'
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!eventId) { setLoading(false); return; }
    base44.entities.ClubEvent.filter({ id: eventId }).then(list => {
      setEvent(list[0] || null);
      setLoading(false);
    });
  }, [eventId]);

  const logAttendance = async (name, email) => {
    setSubmitting(true);
    // Check duplicate
    const existing = await base44.entities.AttendanceLog.filter({ event_id: eventId, member_email: email });
    if (existing.length > 0) { setStatus('already'); setSubmitting(false); return; }

    const hours = event?.hours_credit || 1;
    await base44.entities.AttendanceLog.create({
      event_id: eventId,
      event_title: event?.title || 'Club Meeting',
      member_email: email,
      member_name: name,
      scanned_at: new Date().toISOString(),
      hours_credited: hours,
    });
    // Auto-log service hours
    await base44.entities.ServiceHour.create({
      member_email: email,
      member_name: name,
      date: event?.date || new Date().toISOString().split('T')[0],
      hours,
      organization: event?.title || 'Club Meeting',
      description: `Attendance via QR check-in`,
      status: 'approved',
      admin_notes: 'Auto-approved via QR attendance',
    });
    setStatus('success');
    setSubmitting(false);
  };

  const handleGuestSubmit = (e) => {
    e.preventDefault();
    logAttendance(guestName, guestEmail);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
    </div>
  );

  if (!eventId || !event) return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
        <h1 className="font-heading font-bold text-xl">Invalid QR Code</h1>
        <p className="text-muted-foreground mt-2">This QR code doesn't link to a valid event.</p>
      </div>
    </div>
  );

  if (!event.qr_enabled) return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <XCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
        <h1 className="font-heading font-bold text-xl">QR Check-In Not Active</h1>
        <p className="text-muted-foreground mt-2">QR attendance is not enabled for this event.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/20 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card rounded-2xl border border-border shadow-xl p-8">
        {/* Event Info */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-7 h-7 text-primary" />
          </div>
          <h1 className="font-heading font-black text-2xl mb-1">{event.title}</h1>
          <div className="flex flex-wrap justify-center gap-3 text-sm text-muted-foreground mt-2">
            {event.time && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{event.time}</span>}
            {event.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{event.location}</span>}
          </div>
          {event.hours_credit > 0 && (
            <p className="mt-2 text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full inline-block">
              +{event.hours_credit}h service credit on check-in
            </p>
          )}
        </div>

        {status === 'success' && (
          <div className="text-center py-4">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-3" />
            <h2 className="font-heading font-bold text-xl text-green-700">Attendance Logged!</h2>
            <p className="text-muted-foreground mt-2 text-sm">
              {event.hours_credit > 0 ? `${event.hours_credit} service hour(s) have been automatically credited to your account.` : 'Your attendance has been recorded.'}
            </p>
          </div>
        )}

        {status === 'already' && (
          <div className="text-center py-4">
            <CheckCircle2 className="w-16 h-16 text-amber-500 mx-auto mb-3" />
            <h2 className="font-heading font-bold text-xl">Already Checked In</h2>
            <p className="text-muted-foreground mt-2 text-sm">Your attendance for this event was already recorded.</p>
          </div>
        )}

        {!status && (
          memberUser ? (
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">Checking in as <strong>{memberUser.name}</strong></p>
              <Button className="w-full rounded-full h-12 text-base font-bold" onClick={() => logAttendance(memberUser.name, memberUser.email)} disabled={submitting}>
                {submitting ? 'Logging...' : 'Check In Now'}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleGuestSubmit} className="space-y-4">
              <p className="text-sm text-muted-foreground text-center mb-2">Enter your details to check in</p>
              <div className="space-y-1.5">
                <Label>Full Name</Label>
                <Input required value={guestName} onChange={e => setGuestName(e.target.value)} placeholder="Your name" />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input required type="email" value={guestEmail} onChange={e => setGuestEmail(e.target.value)} placeholder="your@email.com" />
              </div>
              <Button type="submit" className="w-full rounded-full h-12 text-base font-bold" disabled={submitting}>
                {submitting ? 'Logging...' : 'Check In'}
              </Button>
            </form>
          )
        )}
      </div>
    </div>
  );
}