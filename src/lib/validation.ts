export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

export function sanitizeUrl(url: string): string {
  if (!url) return '';
  return isValidUrl(url) ? url : '';
}

export function escapeCSVField(field: string): string {
  if (!field) return '';
  // Prevent CSV formula injection
  if (/^[=+\-@\t\r]/.test(field)) {
    return `'${field}`;
  }
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

export function validateFileUpload(file: File, options: { maxSizeMB?: number; allowedTypes?: string[] } = {}): string | null {
  const { maxSizeMB = 5, allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] } = options;
  if (!allowedTypes.includes(file.type)) {
    return `File type ${file.type} not allowed. Accepted: ${allowedTypes.join(', ')}`;
  }
  if (file.size > maxSizeMB * 1024 * 1024) {
    return `File too large. Maximum size: ${maxSizeMB}MB`;
  }
  return null;
}
