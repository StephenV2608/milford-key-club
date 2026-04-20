// Fetches a public iCal (.ics) feed and returns parsed events as JSON.
// Avoids browser CORS issues by proxying through the server.

function unfoldLines(text) {
  // RFC 5545: lines starting with space/tab are continuations of the previous line
  return text.replace(/\r?\n[ \t]/g, '');
}

function decode(str) {
  if (!str) return '';
  return str
    .replace(/\\n/g, '\n')
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\\\/g, '\\');
}

// Parses iCal datetime like "20260515T140000Z", "20260515T140000", or "20260515"
function parseICalDate(val) {
  if (!val) return null;
  const m = val.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z)?)?$/);
  if (!m) return null;
  const [, y, mo, d, h, mi, s, z] = m;
  if (h === undefined) {
    // All-day event
    return { date: `${y}-${mo}-${d}`, time: null, allDay: true };
  }
  if (z === 'Z') {
    // UTC — convert to local readable time
    const dt = new Date(Date.UTC(+y, +mo - 1, +d, +h, +mi, +s || 0));
    const pad = n => String(n).padStart(2, '0');
    return {
      date: `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`,
      time: formatTime(dt.getHours(), dt.getMinutes()),
      allDay: false,
    };
  }
  // Floating / local time
  return {
    date: `${y}-${mo}-${d}`,
    time: formatTime(+h, +mi),
    allDay: false,
  };
}

function formatTime(h, m) {
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = ((h + 11) % 12) + 1;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

function parseICal(text) {
  const unfolded = unfoldLines(text);
  const lines = unfolded.split(/\r?\n/);
  const events = [];
  let current = null;

  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') {
      current = {};
    } else if (line === 'END:VEVENT') {
      if (current) events.push(current);
      current = null;
    } else if (current) {
      const idx = line.indexOf(':');
      if (idx === -1) continue;
      const keyPart = line.slice(0, idx);
      const value = line.slice(idx + 1);
      const [key] = keyPart.split(';');

      if (key === 'SUMMARY') current.title = decode(value);
      else if (key === 'DESCRIPTION') current.description = decode(value);
      else if (key === 'LOCATION') current.location = decode(value);
      else if (key === 'UID') current.uid = value;
      else if (key === 'DTSTART') {
        const parsed = parseICalDate(value);
        if (parsed) { current.date = parsed.date; current._startTime = parsed.time; current._allDay = parsed.allDay; }
      } else if (key === 'DTEND') {
        const parsed = parseICalDate(value);
        if (parsed) current._endTime = parsed.time;
      }
    }
  }

  // Build final time string
  return events
    .filter(e => e.date && e.title)
    .map(e => ({
      id: `gcal-${e.uid || `${e.date}-${e.title}`}`,
      title: e.title,
      date: e.date,
      time: e._allDay ? '' : (e._endTime ? `${e._startTime} – ${e._endTime}` : e._startTime || ''),
      location: e.location || '',
      description: e.description || '',
      type: 'meeting',
      source: 'gcal',
    }));
}

Deno.serve(async (req) => {
  try {
    const { url } = await req.json();
    if (!url) return Response.json({ error: 'Missing url' }, { status: 400 });

    // Google iCal URLs use https://calendar.google.com/calendar/ical/...
    // Also allow the "webcal://" prefix by normalizing to https://
    const fetchUrl = url.replace(/^webcal:\/\//i, 'https://');

    const r = await fetch(fetchUrl);
    if (!r.ok) return Response.json({ error: `Feed returned ${r.status}` }, { status: 502 });

    const text = await r.text();
    const events = parseICal(text);
    return Response.json({ events });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
});