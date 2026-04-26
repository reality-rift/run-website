import { isValidUrl } from './validation';

export function resolveImageUrl(url: string): string {
  if (!url) return '';
  if (!isValidUrl(url)) return '';
  const fileIdMatch = url.match(
    /(?:drive\.google\.com\/file\/d\/|drive\.google\.com\/open\?id=|drive\.google\.com\/uc\?(?:export=view&)?id=)([a-zA-Z0-9_-]+)/,
  );
  if (fileIdMatch) {
    return `https://lh3.googleusercontent.com/d/${fileIdMatch[1]}`;
  }
  return url;
}
