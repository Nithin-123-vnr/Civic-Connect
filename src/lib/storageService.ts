import { supabase } from './supabase';

/**
 * Uploads evidence photo/document to Supabase Storage bucket 'complaint-evidence'
 */
export async function uploadComplaintEvidence(
  file: File,
  complaintRef: string
): Promise<string> {
  try {
    const fileExt = file.name.split('.').pop() || 'jpg';
    const cleanRef = complaintRef.replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const filePath = `${cleanRef}/${filename}`;

    const { data, error } = await supabase.storage
      .from('complaint-evidence')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: true,
      });

    if (error || !data) {
      console.warn('Supabase Storage upload error, falling back to data URL:', error);
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    }

    const { data: publicData } = supabase.storage
      .from('complaint-evidence')
      .getPublicUrl(data.path);

    return publicData.publicUrl;
  } catch (err) {
    console.warn('Evidence upload exception:', err);
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  }
}
