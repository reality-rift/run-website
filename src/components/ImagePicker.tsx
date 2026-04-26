import { useState, useRef } from 'react';
import {
  ImageIcon,
  Link2,
  ExternalLink,
  Check,
  X,
  AlertCircle,
  Upload,
  Loader2,
} from 'lucide-react';
import { resolveImageUrl } from '../lib/imageUrl';
import { isValidUrl } from '../lib/validation';
import { supabase } from '../lib/supabase';

const PRESET_IMAGES = [
  {
    url: 'https://images.pexels.com/photos/2524739/pexels-photo-2524739.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
    label: 'Marathon Runners',
  },
  {
    url: 'https://images.pexels.com/photos/3621183/pexels-photo-3621183.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
    label: 'Trail Running',
  },
  {
    url: 'https://images.pexels.com/photos/5836366/pexels-photo-5836366.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
    label: 'Cycling Race',
  },
  {
    url: 'https://images.pexels.com/photos/2526878/pexels-photo-2526878.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
    label: 'Road Running',
  },
  {
    url: 'https://images.pexels.com/photos/3621168/pexels-photo-3621168.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
    label: 'Cross Country',
  },
  {
    url: 'https://images.pexels.com/photos/5384538/pexels-photo-5384538.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
    label: 'Mountain Trail',
  },
  {
    url: 'https://images.pexels.com/photos/2590716/pexels-photo-2590716.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
    label: 'Cycling Group',
  },
  {
    url: 'https://images.pexels.com/photos/618612/pexels-photo-618612.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
    label: 'Starting Line',
  },
];

function isGoogleDriveUrl(url: string): boolean {
  return url.includes('drive.google.com');
}

type Tab = 'upload' | 'gallery' | 'url';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

interface ImagePickerProps {
  value: string;
  onChange: (url: string) => void;
}

export default function ImagePicker({ value, onChange }: ImagePickerProps) {
  const [tab, setTab] = useState<Tab>('upload');
  const [urlInput, setUrlInput] = useState(value || '');
  const [imgError, setImgError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayUrl = value ? resolveImageUrl(value) : '';

  const handleFileUpload = async (file: File) => {
    setUploadError('');

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setUploadError('Only JPEG, PNG, and WebP images are allowed.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setUploadError('File size must be under 5MB.');
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const filePath = `event-covers/${fileName}`;

      const { error } = await supabase.storage
        .from('event-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        setUploadError(error.message);
        setUploading(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from('event-images')
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;
      onChange(publicUrl);
      setUrlInput(publicUrl);
      setImgError(false);
    } catch {
      setUploadError('Upload failed. Please try again.');
    }
    setUploading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
    e.target.value = '';
  };

  const handleUrlSubmit = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    if (!isValidUrl(trimmed)) {
      setImgError(true);
      return;
    }
    setImgError(false);
    onChange(trimmed);
  };

  const handleSelectPreset = (url: string) => {
    setImgError(false);
    onChange(url);
    setUrlInput(url);
  };

  const handleClear = () => {
    onChange('');
    setUrlInput('');
    setImgError(false);
    setUploadError('');
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => setTab('upload')}
          aria-label="Upload image"
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-inter font-medium transition-all ${
            tab === 'upload'
              ? 'bg-accent/15 text-accent border border-accent/30'
              : 'bg-white/[0.04] text-white/50 border border-white/[0.08] hover:border-white/15'
          }`}
        >
          <Upload className="w-4 h-4" />
          Upload Image
        </button>
        <button
          type="button"
          onClick={() => setTab('gallery')}
          aria-label="Choose from gallery"
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-inter font-medium transition-all ${
            tab === 'gallery'
              ? 'bg-accent/15 text-accent border border-accent/30'
              : 'bg-white/[0.04] text-white/50 border border-white/[0.08] hover:border-white/15'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          Gallery
        </button>
        <button
          type="button"
          onClick={() => setTab('url')}
          aria-label="Paste image URL"
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-inter font-medium transition-all ${
            tab === 'url'
              ? 'bg-accent/15 text-accent border border-accent/30'
              : 'bg-white/[0.04] text-white/50 border border-white/[0.08] hover:border-white/15'
          }`}
        >
          <Link2 className="w-4 h-4" />
          Paste URL
        </button>
      </div>

      {tab === 'upload' && (
        <div className="space-y-4">
          <div
            onClick={() => !uploading && fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={`relative flex flex-col items-center justify-center gap-4 py-12 px-6 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-300 ${
              dragActive
                ? 'border-accent/50 bg-accent/[0.05]'
                : 'border-white/[0.1] bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
            {uploading ? (
              <>
                <Loader2 className="w-10 h-10 text-accent animate-spin" />
                <p className="font-inter text-sm text-white/50">Uploading...</p>
              </>
            ) : (
              <>
                <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                  <Upload className="w-6 h-6 text-accent" />
                </div>
                <div className="text-center">
                  <p className="font-inter text-sm text-white/60">
                    <span className="text-accent font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="font-inter text-xs text-white/25 mt-1.5">
                    JPEG, PNG or WebP &middot; Max 5MB &middot; Recommended 1920&times;1080
                  </p>
                </div>
              </>
            )}
          </div>

          {uploadError && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/[0.08] border border-red-500/20">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <p className="text-xs font-inter text-red-400/80">{uploadError}</p>
            </div>
          )}
        </div>
      )}

      {tab === 'gallery' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {PRESET_IMAGES.map((img) => {
            const selected = value === img.url;
            return (
              <button
                key={img.url}
                type="button"
                onClick={() => handleSelectPreset(img.url)}
                className={`group relative aspect-[16/10] rounded-xl overflow-hidden transition-all ${
                  selected
                    ? 'ring-2 ring-accent ring-offset-2 ring-offset-[#111]'
                    : 'hover:ring-1 hover:ring-white/20'
                }`}
              >
                <img
                  src={img.url}
                  alt={img.label}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div
                  className={`absolute inset-0 transition-all ${
                    selected
                      ? 'bg-accent/20'
                      : 'bg-black/40 group-hover:bg-black/20'
                  }`}
                />
                {selected && (
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-accent flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-black" strokeWidth={3} />
                  </div>
                )}
                <span className="absolute bottom-0 left-0 right-0 px-2 py-1.5 bg-gradient-to-t from-black/80 to-transparent text-[10px] font-inter font-medium text-white/80">
                  {img.label}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {tab === 'url' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleUrlSubmit();
                }
              }}
              placeholder="Paste image URL or Google Drive link..."
              aria-label="Image URL"
              className="form-input flex-1"
            />
            <button
              type="button"
              onClick={handleUrlSubmit}
              className="px-5 py-2 rounded-xl bg-accent/15 border border-accent/30 text-accent text-sm font-inter font-semibold hover:bg-accent/20 transition-all shrink-0"
            >
              Apply
            </button>
          </div>

          <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <AlertCircle className="w-4 h-4 text-white/25 shrink-0 mt-0.5" />
            <div className="text-xs font-inter text-white/35 leading-relaxed space-y-1">
              <p>Supported sources:</p>
              <ul className="list-disc list-inside space-y-0.5 text-white/30">
                <li>Direct image URLs (e.g. from Unsplash, Pexels)</li>
                <li>
                  Google Drive links with public/open access
                  <span className="text-white/20"> -- use "Anyone with the link can view"</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {value && (
        <div className="relative">
          <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-white/[0.03] border border-white/[0.06]">
            {!imgError ? (
              <img
                src={displayUrl}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                <AlertCircle className="w-8 h-8 text-red-400/40" />
                <p className="text-sm font-inter text-red-400/60">
                  Could not load image. Check the URL or sharing settings.
                </p>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear selected image"
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-black/80 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
          {isGoogleDriveUrl(value) && !imgError && (
            <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-sm border border-white/10">
              <span className="text-[10px] font-inter font-medium text-white/60">
                Google Drive Image
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
