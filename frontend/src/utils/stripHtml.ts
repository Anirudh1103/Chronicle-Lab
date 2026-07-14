export const stripHtml = (html: string): string => {
  if (!html) return '';

  // First, replace common HTML entities
  const decoded = html
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  // Then strip tags
  const stripped = decoded.replace(/<[^>]*>/g, '');

  // Finally, trim and remove extra whitespace
  return stripped.trim().replace(/\s+/g, ' ');
};
