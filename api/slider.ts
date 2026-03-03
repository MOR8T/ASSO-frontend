/**
 * API слайдера главной страницы.
 * Публичный GET без токена; защищённые CRUD с Bearer + refresh/retry.
 */

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const SLIDER_PREFIX = "/api/v1/home-slider";

import {
  getStoredAccessToken,
  getStoredRefreshToken,
  setStoredTokens,
  clearStoredTokens,
  refresh,
} from "./login";

// ─── Types (совместимы с backend и HeroSlider) ─────────────────────────────

export type SlideType = "image" | "video";

export interface SourceItem {
  src: string;
  type: string;
}

/** Публичный элемент слайда (GET list) */
export interface SlidePublic {
  id: number;
  type: SlideType;
  src: string;
  alt: string;
  poster: string | null;
  sources: SourceItem[] | null;
}

/** Полная запись для админки (GET by id, POST response, PATCH response) */
export interface SlideAdmin extends SlidePublic {
  sort_order: number;
  is_active: boolean;
}

/** Тело создания слайда */
export interface SlideCreatePayload {
  type: SlideType;
  src: string;
  alt: string;
  poster?: string | null;
  sources?: SourceItem[] | null;
  sort_order: number;
  is_active: boolean;
}

/** Тело частичного обновления */
export interface SlideUpdatePayload {
  type?: SlideType;
  src?: string;
  alt?: string;
  poster?: string | null;
  sources?: SourceItem[] | null;
  sort_order?: number;
  is_active?: boolean;
}

/** Выбрасывается при провале авторизации (нужен редирект на /login) */
export const AUTH_REQUIRED = "AUTH_REQUIRED";

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

// ─── Публичный запрос (без токена) ─────────────────────────────────────────

/**
 * GET /api/v1/home-slider — список активных слайдов для главной.
 */
export async function getHomeSliderList(): Promise<SlidePublic[]> {
  const res = await fetch(`${API_BASE}${SLIDER_PREFIX}`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const msg = typeof data.detail === "string" ? data.detail : "Failed to load slides";
    throw new Error(msg);
  }
  return res.json();
}

// ─── Защищённые запросы ───────────────────────────────────────────────────

/**
 * GET /api/v1/home-slider/{id} — полная запись для админки.
 */
export async function getAdminSlide(slideId: number): Promise<SlideAdmin> {
  const res = await ensureAuthAndFetch(`${API_BASE}${SLIDER_PREFIX}/${slideId}`);
  if (res.status === 404) {
    throw new Error("Slide not found");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = typeof data.detail === "string" ? data.detail : "Request failed";
    throw new Error(msg);
  }
  return data as SlideAdmin;
}

/**
 * POST /api/v1/home-slider — создание слайда.
 */
export async function createSlide(payload: SlideCreatePayload): Promise<SlideAdmin> {
  const res = await ensureAuthAndFetch(`${API_BASE}${SLIDER_PREFIX}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = typeof data.detail === "string" ? data.detail : "Create failed";
    throw new Error(msg);
  }
  return data as SlideAdmin;
}

/**
 * PATCH /api/v1/home-slider/{id} — обновление слайда.
 */
export async function updateSlide(
  slideId: number,
  payload: SlideUpdatePayload
): Promise<SlideAdmin> {
  const res = await ensureAuthAndFetch(`${API_BASE}${SLIDER_PREFIX}/${slideId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = typeof data.detail === "string" ? data.detail : "Update failed";
    throw new Error(msg);
  }
  return data as SlideAdmin;
}

/**
 * DELETE /api/v1/home-slider/{id}
 */
export async function deleteSlide(slideId: number): Promise<void> {
  const res = await ensureAuthAndFetch(`${API_BASE}${SLIDER_PREFIX}/${slideId}`, {
    method: "DELETE",
  });
  if (res.status === 204) return;
  const data = await res.json().catch(() => ({}));
  const msg = typeof data.detail === "string" ? data.detail : "Delete failed";
  throw new Error(msg);
}
