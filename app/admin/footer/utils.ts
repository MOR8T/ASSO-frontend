const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Собирает абсолютный URL для медиа (логотипы, иконки).
 * Поддержка относительного пути и полного URL.
 */
export function getMediaUrl(path: string | null | undefined): string {
  if (!path || !path.trim()) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const base = API_BASE.replace(/\/$/, "");
  return path.startsWith("/") ? `${base}${path}` : `${base}/media/${path}`;
}

/**
 * Извлекает YouTube video ID из URL.
 */
export function parseYouTubeId(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;
  try {
    const u = new URL(trimmed);
    if (u.hostname === "youtu.be" && u.pathname.slice(1))
      return u.pathname.slice(1).split("?")[0];
    if (u.hostname?.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return v;
      const m = u.pathname.match(/^\/embed\/([^/?]+)/);
      if (m) return m[1];
    }
  } catch {
    return null;
  }
  return null;
}
