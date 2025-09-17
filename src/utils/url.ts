// src/utils/url.ts
export function withBase(p?: string) {
  if (!p) return '';
  if (/^https?:\/\//i.test(p)) return p;        // already absolute
  const base = (import.meta as any).env?.VITE_IMAGES_BASE_URL || '';
  const cleanBase = base.replace(/\/+$/, '');
  const cleanPath = String(p).replace(/^\/+/, '');
  return cleanBase ? `${cleanBase}/${cleanPath}` : `/${cleanPath}`;
}
