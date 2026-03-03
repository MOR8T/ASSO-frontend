/**
 * API раздела «О нас». GET /api/v1/about — без токена (публичный).
 * Admin CRUD для intro и team — с Bearer + refresh/retry.
 */

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const ABOUT_URL = "/api/v1/about";
const ABOUT_INTRO = `${ABOUT_URL}/intro`;
const ABOUT_TEAM = `${ABOUT_URL}/team`;

import {
  getStoredAccessToken,
  getStoredRefreshToken,
  setStoredTokens,
  clearStoredTokens,
  refresh,
} from "./login";

export const AUTH_REQUIRED = "AUTH_REQUIRED";

// ─── Публичный API (без токена) ───────────────────────────────────────────

/** Блок описания компании (ответ GET /about) */
export interface AboutIntroBlockPublic {
  id: number;
  text: string;
  sort_order: number;
  style_variant: string;
}

/** Сотрудник в публичном ответе (GET /about) */
export interface AboutTeamMemberPublic {
  id: number;
  full_name: string;
  jobtitle: string;
  photo_url: string | null;
  sort_order: number;
}

export interface AboutPublicResponse {
  intro: AboutIntroBlockPublic[];
  team: AboutTeamMemberPublic[];
}

/**
 * GET /api/v1/about — контент страницы «О нас» (без токена).
 * Использует NEXT_PUBLIC_API_URL.
 */
export async function getAbout(): Promise<AboutPublicResponse> {
  const url = `${API_BASE.replace(/\/$/, "")}${ABOUT_URL}`;
  const res = await fetch(url, { cache: "no-store" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(typeof data.detail === "string" ? data.detail : "Ошибка загрузки страницы «О нас»");
  }
  if (!Array.isArray(data?.intro) || !Array.isArray(data?.team)) {
    throw new Error("Некорректный ответ API");
  }
  return data as AboutPublicResponse;
}

/** Собирает абсолютный URL для фото (photo_url от бэкенда). */
export function toAbsoluteAboutPhotoUrl(photoUrl: string | null | undefined): string {
  if (!photoUrl || typeof photoUrl !== "string") return "";
  if (photoUrl.startsWith("http://") || photoUrl.startsWith("https://")) return photoUrl;
  const base = API_BASE.replace(/\/$/, "");
  return photoUrl.startsWith("/") ? `${base}${photoUrl}` : `${base}/${photoUrl}`;
}

/** Текстовый блок описания компании (админка) */
export interface AboutIntroBlockAdmin {
  id: number;
  text: string;
  sort_order: number;
  style_variant: string;
}

/** Сотрудник в админке (GET/POST/PATCH response) */
export interface AboutTeamMemberAdmin {
  id: number;
  full_name: string;
  jobtitle: string;
  photo_path: string | null;
  sort_order: number;
  is_active: boolean;
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

/** GET /api/v1/about/intro — список блоков (с токеном) */
export async function listIntroBlocks(): Promise<AboutIntroBlockAdmin[]> {
  const res = await ensureAuthAndFetch(`${API_BASE.replace(/\/$/, "")}${ABOUT_INTRO}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = typeof data.detail === "string" ? data.detail : "Ошибка загрузки блоков";
    throw new Error(msg);
  }
  return data as AboutIntroBlockAdmin[];
}

/** POST /api/v1/about/intro */
export async function createIntroBlock(payload: {
  text: string;
  sort_order?: number;
  style_variant?: string;
}): Promise<AboutIntroBlockAdmin> {
  const res = await ensureAuthAndFetch(
    `${API_BASE.replace(/\/$/, "")}${ABOUT_INTRO}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = typeof data.detail === "string" ? data.detail : "Ошибка добавления блока";
    throw new Error(msg);
  }
  return data as AboutIntroBlockAdmin;
}

/** PATCH /api/v1/about/intro/{blockId} */
export async function updateIntroBlock(
  blockId: number,
  payload: { text?: string; sort_order?: number; style_variant?: string }
): Promise<AboutIntroBlockAdmin> {
  const res = await ensureAuthAndFetch(
    `${API_BASE.replace(/\/$/, "")}${ABOUT_INTRO}/${blockId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = typeof data.detail === "string" ? data.detail : "Ошибка обновления блока";
    throw new Error(msg);
  }
  return data as AboutIntroBlockAdmin;
}

/** DELETE /api/v1/about/intro/{blockId} */
export async function deleteIntroBlock(blockId: number): Promise<void> {
  const res = await ensureAuthAndFetch(
    `${API_BASE.replace(/\/$/, "")}${ABOUT_INTRO}/${blockId}`,
    { method: "DELETE" }
  );
  if (res.status === 204) return;
  const data = await res.json().catch(() => ({}));
  const msg = typeof data.detail === "string" ? data.detail : "Ошибка удаления";
  throw new Error(msg);
}

// ─── Team (с токеном) ─────────────────────────────────────────────────────

/** GET /api/v1/about/team */
export async function listTeamMembers(): Promise<AboutTeamMemberAdmin[]> {
  const res = await ensureAuthAndFetch(`${API_BASE.replace(/\/$/, "")}${ABOUT_TEAM}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = typeof data.detail === "string" ? data.detail : "Ошибка загрузки сотрудников";
    throw new Error(msg);
  }
  return data as AboutTeamMemberAdmin[];
}

/** POST /api/v1/about/team */
export async function createTeamMember(payload: {
  full_name: string;
  jobtitle: string;
  photo_path?: string | null;
  sort_order?: number;
  is_active?: boolean;
}): Promise<AboutTeamMemberAdmin> {
  const res = await ensureAuthAndFetch(
    `${API_BASE.replace(/\/$/, "")}${ABOUT_TEAM}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = typeof data.detail === "string" ? data.detail : "Ошибка добавления сотрудника";
    throw new Error(msg);
  }
  return data as AboutTeamMemberAdmin;
}

/** PATCH /api/v1/about/team/{memberId} */
export async function updateTeamMember(
  memberId: number,
  payload: {
    full_name?: string;
    jobtitle?: string;
    photo_path?: string | null;
    sort_order?: number;
    is_active?: boolean;
  }
): Promise<AboutTeamMemberAdmin> {
  const res = await ensureAuthAndFetch(
    `${API_BASE.replace(/\/$/, "")}${ABOUT_TEAM}/${memberId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = typeof data.detail === "string" ? data.detail : "Ошибка обновления сотрудника";
    throw new Error(msg);
  }
  return data as AboutTeamMemberAdmin;
}

/** DELETE /api/v1/about/team/{memberId} */
export async function deleteTeamMember(memberId: number): Promise<void> {
  const res = await ensureAuthAndFetch(
    `${API_BASE.replace(/\/$/, "")}${ABOUT_TEAM}/${memberId}`,
    { method: "DELETE" }
  );
  if (res.status === 204) return;
  const data = await res.json().catch(() => ({}));
  const msg = typeof data.detail === "string" ? data.detail : "Ошибка удаления";
  throw new Error(msg);
}
