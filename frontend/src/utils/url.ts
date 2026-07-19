export const getUploadUrl = (filename: string | null | undefined): string => {
  if (!filename) return '';

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const baseUrl = apiUrl.endsWith('/api') ? apiUrl.slice(0, -4) : (apiUrl.endsWith('/api/') ? apiUrl.slice(0, -5) : apiUrl);
  let cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

  // Enforce https in production
  if (!cleanBase.includes('localhost:5000')) {
    cleanBase = cleanBase.replace('http://', 'https://');
  }

  // Handle full HTTP / HTTPS URLs
  if (filename.startsWith('http://') || filename.startsWith('https://')) {
    if (filename.includes('localhost:5000')) {
      return filename.replace('http://localhost:5000', cleanBase);
    }
    return filename;
  }

  // Handle relative paths
  const cleanName = filename.startsWith('/') ? filename.slice(1) : filename;
  const targetFile = cleanName.startsWith('uploads/') ? cleanName.slice(8) : cleanName;

  return `${cleanBase}/uploads/${targetFile}`;
};
