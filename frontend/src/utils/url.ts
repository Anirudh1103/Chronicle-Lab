const SUPABASE_STORAGE_URL = 'https://espfrijljdzvzfoeuieg.supabase.co/storage/v1/object/public/media';

export const getUploadUrl = (filename: string | null | undefined): string => {
  if (!filename) return '';

  // Handle full HTTP / HTTPS URLs
  if (filename.startsWith('http://') || filename.startsWith('https://')) {
    // Rewrite old local uploads or backend uploads URLs directly to Supabase Storage
    if (filename.includes('/uploads/')) {
      const parts = filename.split('/uploads/');
      const targetFile = parts[parts.length - 1];
      return `${SUPABASE_STORAGE_URL}/${targetFile}`;
    }
    return filename;
  }

  // Handle relative paths
  const cleanName = filename.startsWith('/') ? filename.slice(1) : filename;
  const targetFile = cleanName.startsWith('uploads/') ? cleanName.slice(8) : cleanName;

  return `${SUPABASE_STORAGE_URL}/${targetFile}`;
};
