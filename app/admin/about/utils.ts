/** Хелперы для админки «О нас» */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function teamPhotoUrl(path: string | null): string {
  if (!path?.trim()) return "";
  const base = API_BASE.replace(/\/$/, "");
  if (path.startsWith("http")) return path;
  return path.startsWith("/") ? `${base}${path}` : `${base}/media/${path}`;
}
