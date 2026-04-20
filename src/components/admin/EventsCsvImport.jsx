import { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Upload, Download, FileSpreadsheet, Check, X, AlertCircle } from 'lucide-react';

const HEADERS = ['title', 'date', 'time', 'location', 'description', 'type', 'hours_credit'];
const TEMPLATE_ROWS = [
  ['Fall Food Drive', '2025-10-15', '3:00 PM – 5:00 PM', 'Milford HS Cafeteria', 'Collected 500 lbs of food for local pantry', 'volunteer', '2'],
  ['Monthly Meeting', '2025-09-05', '2:45 PM – 3:30 PM', 'Room 204', 'Kickoff meeting for the year', 'meeting', '1'],
  ['Park Cleanup', '2025-09-20', '10:00 AM – 12:00 PM', 'Central Park', 'Litter pickup & landscaping', 'project', '2'],
];

// Simple CSV parser: handles quoted fields with commas & escaped quotes
function parseCSV(text) {
  const rows = [];
  let row = [], field = '', inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') { inQuotes = false; }
      else { field += c; }
    } else {
      if (c === '"') { inQuotes = true; }
      else if (c === ',') { row.push(field); field = ''; }
      else if (c === '\n' || c === '\r') {
        if (c === '\r' && text[i + 1] === '\n') i++;
        row.push(field); rows.push(row); row = []; field = '';
      } else { field += c; }
    }
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }
  return rows.filter(r => r.some(cell => cell && cell.trim()));
}

function toCSVCell(v) {
  const s = String(v ?? '');
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function downloadFile(name, content) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function EventsCsvImport({ onImported }) {
  const [preview, setPreview] = useState(null); // { rows, errors }
  const [importing, setImporting] = useState(false);
  const inputRef = useRef(null);

  const downloadTemplate = () => {
    const csv = [HEADERS, ...TEMPLATE_ROWS].map(r => r.map(toCSVCell).join(',')).join('\n');
    downloadFile('past-events-template.csv', csv);
  };

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const rows = parseCSV(text);
    if (rows.length === 0) { toast.error('File is empty.'); return; }

    // Map headers (case/space insensitive)
    const header = rows[0].map(h => h.trim().toLowerCase().replace(/\s+/g, '_'));
    const data = rows.slice(1);

    const parsed = [];
    const errors = [];
    data.forEach((r, idx) => {
      const obj = {};
      header.forEach((h, i) => { obj[h] = (r[i] || '').trim(); });
      const lineNum = idx + 2;
      if (!obj.title) { errors.push(`Row ${lineNum}: missing title`); return; }
      if (!obj.date)  { errors.push(`Row ${lineNum}: missing date`); return; }
      const event = {
        title: obj.title,
        date: obj.date,
        time: obj.time || '',
        location: obj.location || '',
        description: obj.description || '',
        type: ['meeting', 'project', 'volunteer', 'social'].includes((obj.type || '').toLowerCase()) ? obj.type.toLowerCase() : 'project',
        hours_credit: obj.hours_credit ? Number(obj.hours_credit) : 0,
        qr_enabled: false,
        max_rsvps: 0,
      };
      parsed.push(event);
    });

    setPreview({ rows: parsed, errors });
    if (inputRef.current) inputRef.current.value = '';
  };

  const confirmImport = async () => {
    if (!preview?.rows.length) return;
    setImporting(true);
    // Bulk create (chunked to be safe)
    const chunkSize = 25;
    for (let i = 0; i < preview.rows.length; i += chunkSize) {
      const chunk = preview.rows.slice(i, i + chunkSize);
      await base44.entities.ClubEvent.bulkCreate(chunk);
    }
    toast.success(`Imported ${preview.rows.length} event${preview.rows.length === 1 ? '' : 's'}!`);
    setPreview(null);
    setImporting(false);
    onImported?.();
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <FileSpreadsheet className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h3 className="font-heading font-semibold text-base mb-1">Import Past Events (CSV)</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Bulk-add historical events. Download the template, fill it in (one event per row), then upload.
            Required columns: <code className="bg-muted px-1 rounded">title</code>, <code className="bg-muted px-1 rounded">date</code> (YYYY-MM-DD).
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={downloadTemplate} className="gap-1.5 rounded-full">
          <Download className="w-3.5 h-3.5" /> Download Template
        </Button>
        <Button size="sm" onClick={() => inputRef.current?.click()} className="gap-1.5 rounded-full">
          <Upload className="w-3.5 h-3.5" /> Upload CSV
        </Button>
        <input ref={inputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={onFile} />
      </div>

      {/* Preview */}
      {preview && (
        <div className="border-t border-border pt-4 space-y-3">
          {preview.errors.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
              <div className="flex items-center gap-1.5 font-semibold mb-1">
                <AlertCircle className="w-3.5 h-3.5" /> {preview.errors.length} row{preview.errors.length === 1 ? '' : 's'} skipped
              </div>
              <ul className="list-disc list-inside space-y-0.5">
                {preview.errors.slice(0, 5).map((err, i) => <li key={i}>{err}</li>)}
                {preview.errors.length > 5 && <li>…and {preview.errors.length - 5} more</li>}
              </ul>
            </div>
          )}

          {preview.rows.length > 0 ? (
            <>
              <p className="text-xs text-muted-foreground font-medium">
                Ready to import <strong>{preview.rows.length}</strong> event{preview.rows.length === 1 ? '' : 's'}:
              </p>
              <div className="max-h-56 overflow-auto border border-border rounded-lg">
                <table className="w-full text-xs">
                  <thead className="bg-muted/60 sticky top-0">
                    <tr>
                      <th className="text-left px-2 py-1.5 font-semibold">Title</th>
                      <th className="text-left px-2 py-1.5 font-semibold">Date</th>
                      <th className="text-left px-2 py-1.5 font-semibold">Type</th>
                      <th className="text-left px-2 py-1.5 font-semibold">Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.rows.slice(0, 50).map((r, i) => (
                      <tr key={i} className="border-t border-border">
                        <td className="px-2 py-1.5 truncate max-w-[200px]">{r.title}</td>
                        <td className="px-2 py-1.5">{r.date}</td>
                        <td className="px-2 py-1.5 capitalize">{r.type}</td>
                        <td className="px-2 py-1.5 truncate max-w-[160px] text-muted-foreground">{r.location}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {preview.rows.length > 50 && <p className="text-[10px] text-muted-foreground text-center py-2">…and {preview.rows.length - 50} more rows</p>}
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={confirmImport} disabled={importing} className="gap-1.5 rounded-full">
                  <Check className="w-3.5 h-3.5" /> {importing ? 'Importing…' : `Import ${preview.rows.length} Event${preview.rows.length === 1 ? '' : 's'}`}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setPreview(null)} disabled={importing} className="gap-1.5 rounded-full">
                  <X className="w-3.5 h-3.5" /> Cancel
                </Button>
              </div>
            </>
          ) : (
            <p className="text-xs text-muted-foreground">No valid rows found in the file.</p>
          )}
        </div>
      )}
    </div>
  );
}