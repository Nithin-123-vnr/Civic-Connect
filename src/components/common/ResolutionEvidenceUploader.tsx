import { useState, useRef } from 'react';
import { Icon } from './Icon';
import { Button } from './Button';
import { uploadComplaintEvidence } from '@/lib/storageService';

interface ResolutionEvidenceUploaderProps {
  complaintRef: string;
  onUploaded: (url: string) => void;
  uploadedUrls: string[];
  onRemoveUrl: (url: string) => void;
}

export function ResolutionEvidenceUploader({
  complaintRef,
  onUploaded,
  uploadedUrls,
  onRemoveUrl,
}: ResolutionEvidenceUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (JPEG, PNG, WebP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Image size exceeds 10MB limit.');
      return;
    }

    try {
      setUploading(true);
      setUploadError(null);
      const publicUrl = await uploadComplaintEvidence(file, `${complaintRef}_resolution`);
      onUploaded(publicUrl);
    } catch (err: any) {
      setUploadError(err?.message || 'Failed to upload photo.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <label className="text-xs sm:text-sm font-bold text-on-surface flex items-center gap-1.5">
          <Icon name="add_a_photo" size={18} className="text-primary" />
          <span>Attach Resolution Evidence (AFTER Photo)</span>
        </label>
        <span className="text-xs text-on-surface-variant font-mono font-medium">
          {uploadedUrls.length} attached
        </span>
      </div>

      {uploadError && (
        <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-1.5 animate-slide-down">
          <Icon name="error" size={14} />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Uploaded Thumbnails */}
      {uploadedUrls.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {uploadedUrls.map((url, i) => (
            <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-emerald-400 bg-emerald-50 group">
              <img src={url} alt={`Resolution proof ${i + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => onRemoveUrl(url)}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs opacity-90 hover:opacity-100 shadow"
                title="Remove photo"
              >
                <Icon name="close" size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* File input button */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          isLoading={uploading}
          className="w-full border-dashed border-2 hover:border-primary font-bold text-xs"
          icon="upload_file"
        >
          {uploading ? 'Uploading Photo to Cloud...' : '+ Upload Resolution Photo'}
        </Button>
      </div>
    </div>
  );
}
