/**
 * API подвала сайта. GET /api/v1/footer — без токена.
 * Admin CRUD — с Bearer + refresh/retry.
 * NEXT_PUBLIC_API_URL или http://localhost:8000.
 */

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const FOOTER_URL = "/api/v1/footer";
const FOOTER_PARTNERS = `${FOOTER_URL}/partners`;
const FOOTER_VIDEO = `${FOOTER_URL}/video`;
const FOOTER_CONTACTS = `${FOOTER_URL}/contacts`;
const FOOTER_SOCIAL = `${FOOTER_URL}/social`;

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

// ─── Admin: видео (один блок) ──────────────────────────────────────────────

/** Конфиг видео для админки (GET/PUT response) */
export interface FooterVideoAdmin {
  id: number;
  mode: "external" | "uploaded";
  external_video_id: string | null;
  video_path: string | null;
  thumbnail_path: string | null;
  label: string | null;
}

/** Тело обновления видео (PUT) */
export interface FooterVideoUpdatePayload {
  mode: "external" | "uploaded";
  external_video_id?: string | null;
  video_path?: string | null;
  thumbnail_path?: string | null;
  label?: string | null;
}

/** GET /api/v1/footer/video */
export async function getFooterVideo(): Promise<FooterVideoAdmin | null> {
  const res = await ensureAuthAndFetch(`${API_BASE.replace(/\/$/, "")}${FOOTER_VIDEO}`);
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const msg =
      typeof (data as { detail?: string })?.detail === "string"
        ? (data as { detail: string }).detail
        : "Ошибка загрузки видео";
    throw new Error(msg);
  }
  if (data === null || data === undefined) return null;
  return data as FooterVideoAdmin;
}

/** PUT /api/v1/footer/video */
export async function putFooterVideo(
  payload: FooterVideoUpdatePayload
): Promise<FooterVideoAdmin> {
  const res = await ensureAuthAndFetch(
    `${API_BASE.replace(/\/$/, "")}${FOOTER_VIDEO}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = typeof data.detail === "string" ? data.detail : "Ошибка сохранения видео";
    throw new Error(msg);
  }
  return data as FooterVideoAdmin;
}

// ─── Admin: контакты (с токеном) ───────────────────────────────────────────

/** Контакт для админки (GET/POST/PATCH response) */
export interface FooterContactAdmin {
  id: number;
  city_country: string;
  address: string | null;
  contact: string | null;
  sort_order: number;
}

/** GET /api/v1/footer/contacts */
export async function listContacts(): Promise<FooterContactAdmin[]> {
  const res = await ensureAuthAndFetch(`${API_BASE.replace(/\/$/, "")}${FOOTER_CONTACTS}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = typeof data.detail === "string" ? data.detail : "Ошибка загрузки контактов";
    throw new Error(msg);
  }
  return data as FooterContactAdmin[];
}

/** POST /api/v1/footer/contacts */
export async function createContact(payload: {
  city_country: string;
  address?: string | null;
  contact?: string | null;
  sort_order: number;
}): Promise<FooterContactAdmin> {
  const res = await ensureAuthAndFetch(
    `${API_BASE.replace(/\/$/, "")}${FOOTER_CONTACTS}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = typeof data.detail === "string" ? data.detail : "Ошибка создания контакта";
    throw new Error(msg);
  }
  return data as FooterContactAdmin;
}

/** PATCH /api/v1/footer/contacts/{id} */
export async function updateContact(
  contactId: number,
  payload: { city_country?: string; address?: string | null; contact?: string | null; sort_order?: number }
): Promise<FooterContactAdmin> {
  const res = await ensureAuthAndFetch(
    `${API_BASE.replace(/\/$/, "")}${FOOTER_CONTACTS}/${contactId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = typeof data.detail === "string" ? data.detail : "Ошибка обновления контакта";
    throw new Error(msg);
  }
  return data as FooterContactAdmin;
}

/** DELETE /api/v1/footer/contacts/{id} */
export async function deleteContact(contactId: number): Promise<void> {
  const res = await ensureAuthAndFetch(
    `${API_BASE.replace(/\/$/, "")}${FOOTER_CONTACTS}/${contactId}`,
    { method: "DELETE" }
  );
  if (res.status === 204) return;
  const data = await res.json().catch(() => ({}));
  const msg = typeof data.detail === "string" ? data.detail : "Ошибка удаления";
  throw new Error(msg);
}

// ─── Admin: соцсети (с токеном) ────────────────────────────────────────────

/** Соцсеть для админки (GET/POST/PATCH response) */
export interface FooterSocialAdmin {
  id: number;
  name: string;
  url: string;
  icon_path: string;
  sort_order: number;
}

/** GET /api/v1/footer/social */
export async function listSocial(): Promise<FooterSocialAdmin[]> {
  const res = await ensureAuthAndFetch(`${API_BASE.replace(/\/$/, "")}${FOOTER_SOCIAL}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = typeof data.detail === "string" ? data.detail : "Ошибка загрузки соцсетей";
    throw new Error(msg);
  }
  return data as FooterSocialAdmin[];
}

/** POST /api/v1/footer/social */
export async function createSocial(payload: {
  name: string;
  url: string;
  icon_path: string;
  sort_order: number;
}): Promise<FooterSocialAdmin> {
  const res = await ensureAuthAndFetch(
    `${API_BASE.replace(/\/$/, "")}${FOOTER_SOCIAL}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = typeof data.detail === "string" ? data.detail : "Ошибка создания соцсети";
    throw new Error(msg);
  }
  return data as FooterSocialAdmin;
}

/** PATCH /api/v1/footer/social/{id} */
export async function updateSocial(
  socialId: number,
  payload: { name?: string; url?: string; icon_path?: string; sort_order?: number }
): Promise<FooterSocialAdmin> {
  const res = await ensureAuthAndFetch(
    `${API_BASE.replace(/\/$/, "")}${FOOTER_SOCIAL}/${socialId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = typeof data.detail === "string" ? data.detail : "Ошибка обновления соцсети";
    throw new Error(msg);
  }
  return data as FooterSocialAdmin;
}

/** DELETE /api/v1/footer/social/{id} */
export async function deleteSocial(socialId: number): Promise<void> {
  const res = await ensureAuthAndFetch(
    `${API_BASE.replace(/\/$/, "")}${FOOTER_SOCIAL}/${socialId}`,
    { method: "DELETE" }
  );
  if (res.status === 204) return;
  const data = await res.json().catch(() => ({}));
  const msg = typeof data.detail === "string" ? data.detail : "Ошибка удаления";
  throw new Error(msg);
}
