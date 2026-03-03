/**
 * API подвала сайта. GET /api/v1/footer — без токена.
 * Admin CRUD — с Bearer + refresh/retry.
 * NEXT_PUBLIC_API_URL или http://localhost:8000.
 */

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const FOOTER_URL = "/api/v1/footer";
const FOOTER_PARTNERS = `${FOOTER_URL}/partners`;

import {
  getStoredAccessToken,
  getStoredRefreshToken,
  setStoredTokens,
  clearStoredTokens,
  refresh,
} from "./login";

export const AUTH_REQUIRED = "AUTH_REQUIRED";

/** Партнёр для админки (GET/POST/PATCH response) */
export interface FooterPartnerAdmin {
  id: number;
  name: string;
  logo_path: string;
  sort_order: number;
}

async function ensureAuthAndFetch(
  url: string,
  options: RequestInit & { skipRetry?: boolean } = {}
): Promise<Response> {
  const { skipRetry, ...fetchOptions } = options;
  const token = getStoredAccessToken();
  if (!token) {
    clearStoredTokens();
    throw new Error(AUTH_REQUIRED);
  }
  const res = await fetch(url, {
    ...fetchOptions,
    headers: {
      ...(typeof fetchOptions.headers === "object" && fetchOptions.headers
        ? fetchOptions.headers
        : {}),
      Authorization: `Bearer ${token}`,
    },
  });
  if (res.status === 401 && !skipRetry) {
    const refreshToken = getStoredRefreshToken();
    if (!refreshToken) {
      clearStoredTokens();
      throw new Error(AUTH_REQUIRED);
    }
    try {
      const data = await refresh({ refresh_token: refreshToken });
      setStoredTokens(data.access_token, data.refresh_token);
    } catch {
      clearStoredTokens();
      throw new Error(AUTH_REQUIRED);
    }
    return ensureAuthAndFetch(url, { ...options, skipRetry: true });
  }
  return res;
}

export interface FooterPartner {
  name: string;
  logo: string;
}

export interface FooterVideo {
  mode: "external" | "uploaded";
  video_id: string | null;
  video_url: string | null;
  thumbnail: string | null;
  label: string | null;
}

export interface FooterSocial {
  name: string;
  url: string;
  icon: string;
}

export interface FooterContact {
  city_country: string;
  address: string | null;
  contact: string | null;
}

export interface FooterResponse {
  partners: FooterPartner[];
  video: FooterVideo | null;
  social: FooterSocial[];
  contacts: FooterContact[];
}

/**
 * Преобразует путь от бэкенда в абсолютный URL для медиа.
 * Если уже http(s) — возвращает как есть.
 */
export function toAbsoluteMediaUrl(path: string | null | undefined): string {
  if (!path || typeof path !== "string") return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const base = API_BASE.replace(/\/$/, "");
  return path.startsWith("/") ? `${base}${path}` : `${base}/${path}`;
}

/**
 * GET /api/v1/footer — весь контент подвала.
 * При ошибке сети или не-2xx бросает.
 */
export async function getFooter(): Promise<FooterResponse> {
  const url = `${API_BASE.replace(/\/$/, "")}${FOOTER_URL}`;
  const res = await fetch(url, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Footer API error: ${res.status}`);
  }
  return res.json() as Promise<FooterResponse>;
}

// ─── Admin: партнёры (с токеном) ───────────────────────────────────────────

/** GET /api/v1/footer/partners */
export async function listPartners(): Promise<FooterPartnerAdmin[]> {
  const res = await ensureAuthAndFetch(`${API_BASE.replace(/\/$/, "")}${FOOTER_PARTNERS}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = typeof data.detail === "string" ? data.detail : "Ошибка загрузки партнёров";
    throw new Error(msg);
  }
  return data as FooterPartnerAdmin[];
}

/** POST /api/v1/footer/partners */
export async function createPartner(payload: {
  name: string;
  logo_path: string;
  sort_order: number;
}): Promise<FooterPartnerAdmin> {
  const res = await ensureAuthAndFetch(
    `${API_BASE.replace(/\/$/, "")}${FOOTER_PARTNERS}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = typeof data.detail === "string" ? data.detail : "Ошибка создания партнёра";
    throw new Error(msg);
  }
  return data as FooterPartnerAdmin;
}

/** PATCH /api/v1/footer/partners/{id} */
export async function updatePartner(
  partnerId: number,
  payload: { name?: string; logo_path?: string; sort_order?: number }
): Promise<FooterPartnerAdmin> {
  const res = await ensureAuthAndFetch(
    `${API_BASE.replace(/\/$/, "")}${FOOTER_PARTNERS}/${partnerId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = typeof data.detail === "string" ? data.detail : "Ошибка обновления";
    throw new Error(msg);
  }
  return data as FooterPartnerAdmin;
}

/** DELETE /api/v1/footer/partners/{id} */
export async function deletePartner(partnerId: number): Promise<void> {
  const res = await ensureAuthAndFetch(
    `${API_BASE.replace(/\/$/, "")}${FOOTER_PARTNERS}/${partnerId}`,
    { method: "DELETE" }
  );
  if (res.status === 204) return;
  const data = await res.json().catch(() => ({}));
  const msg = typeof data.detail === "string" ? data.detail : "Ошибка удаления";
  throw new Error(msg);
}
