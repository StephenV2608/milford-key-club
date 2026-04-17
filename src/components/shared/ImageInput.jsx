import { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Link } from 'lucide-react';
import { toast } from 'sonner';

// Converts a Google Drive share URL to a direct image URL
function parseDriveLink(url) {
  if (!url) return url;
  // Handle: https://drive.google.com/file/d/FILE_ID/view?...
  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (match) return `https://lh3.googleusercontent.com/d/${match[1]}`;
  // Handle: https://drive.google.com/open?id=FILE_ID
  const match2 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (match2) return `https://lh3.googleusercontent.com/d/${match2[1]}`;
  return url;
}

/**
 * A reusable image input that supports:
 * - File upload (uploaded to Base44)
 * - Pasting any image URL (including Google Drive share links)
 *
 * Props:
 *   value      - current image URL string
 *   onChange   - callback(newUrl: string)
 *   label      - optional label text shown above
 *   size       - 'sm' | 'md' (default 'md') controls preview size
 */
export default function ImageInput({ value, onChange, label, size = 'md' }) {
  const [uploading, setUploading] = useState(false);
  const [showLink, setShowLink] = useState(false);
  const [linkInput, setLinkInput] = useState('');
  const fileRef = useRef();

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    onChange(file_url);
    setUploading(false);
    toast.success('Image uploaded!');
    e.target.value = '';
  };

  const applyLink = () => {
    const url = parseDriveLink(linkInput.trim());
    if (!url) return;
    onChange(url);
    setLinkInput('');
    setShowLink(false);
    toast.success('Image URL set!');
  };

  const previewSize = size === 'sm' ? 'w-10 h-10' : 'w-14 h-14';

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground block">{label}</label>
      )}
      <div className="flex items-start gap-2 flex-wrap">
        {value && (
          <img src={value} alt="" className={`${previewSize} rounded-lg object-cover border border-border shrink-0`} />
        )}
        <div className="flex flex-col gap-1.5">
          <div className="flex gap-1.5 flex-wrap">
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
            <Button variant="outline" size="sm" onClick={() => fileRef.current.click()} disabled={uploading} className="gap-1.5 h-8 text-xs">
              <Upload className="w-3 h-3" />{uploading ? 'Uploading...' : 'Upload'}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowLink(v => !v)} className="gap-1.5 h-8 text-xs">
              <Link className="w-3 h-3" />Drive Link
            </Button>
            {value && (
              <Button variant="ghost" size="sm" onClick={() => onChange('')} className="h-8 text-xs text-muted-foreground">
                Clear
              </Button>
            )}
          </div>
          {showLink && (
            <div className="flex gap-1.5">
              <Input
                value={linkInput}
                onChange={e => setLinkInput(e.target.value)}
                placeholder="Paste Google Drive or image URL..."
                className="h-8 text-xs w-64"
                onKeyDown={e => e.key === 'Enter' && applyLink()}
              />
              <Button size="sm" onClick={applyLink} className="h-8 text-xs">Apply</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}