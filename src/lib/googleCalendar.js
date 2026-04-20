// Builds a Google Calendar "Add event" URL — works for anyone, no login/OAuth needed.
// Docs: https://calendar.google.com/calendar/render?action=TEMPLATE&text=...

// Parses event.time formats like "3:00 PM – 4:30 PM", "3:00 PM - 4:30 PM", "3pm", "15:00" → { start, end }
function parseTimeRange(timeStr) {
  if (!timeStr) return { start: null, end: null };
  const parts = timeStr.split(/[–-]/).map(s => s.trim()).filter(Boolean);
  return { start: parts[0] || null, end: parts[1] || null };
}

// Turns "3:00 PM" or "15:00" → "HH:MM" (24h). Returns null on failure.
function to24h(timeStr) {
  if (!timeStr) return null;
  const m = timeStr.match(/^\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm|AM|PM)?\s*$/);
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const min = m[2] ? parseInt(m[2], 10) : 0;
  const ampm = m[3]?.toLowerCase();
  if (ampm === 'pm' && h < 12) h += 12;
  if (ampm === 'am' && h === 12) h = 0;
  return `${String(h).padStart(2, '0')}${String(min).padStart(2, '0')}`;
}

// Formats "YYYY-MM-DD" + "HHMM" → "YYYYMMDDTHHMMSS" (local, floating)
function formatDT(date, hhmm) {
  const d = String(date).replace(/-/g, '');
  return `${d}T${hhmm}00`;
}

// Format a whole-day event as YYYYMMDD
function formatDay(date) {
  return String(date).replace(/-/g, '');
}

export function googleCalendarUrl(event) {
  if (!event?.date) return null;
  const { start, end } = parseTimeRange(event.time);
  const startHHMM = to24h(start);
  const endHHMM = to24h(end);

  let dates;
  if (startHHMM && endHHMM) {
    dates = `${formatDT(event.date, startHHMM)}/${formatDT(event.date, endHHMM)}`;
  } else if (startHHMM) {
    // No end → default 1 hour block
    const h = parseInt(startHHMM.slice(0, 2), 10);
    const m = parseInt(startHHMM.slice(2), 10);
    const endH = (h + 1) % 24;
    const endHHMMFallback = `${String(endH).padStart(2, '0')}${String(m).padStart(2, '0')}`;
    dates = `${formatDT(event.date, startHHMM)}/${formatDT(event.date, endHHMMFallback)}`;
  } else {
    // All-day event (next-day exclusive end)
    const day = new Date(event.date);
    day.setDate(day.getDate() + 1);
    const nextIso = day.toISOString().slice(0, 10);
    dates = `${formatDay(event.date)}/${formatDay(nextIso)}`;
  }

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title || 'Event',
    dates,
  });
  if (event.description) params.set('details', event.description);
  if (event.location) params.set('location', event.location);

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}