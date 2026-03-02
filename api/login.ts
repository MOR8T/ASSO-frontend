/**
 * API авторизации — соответствует backend app/api/v1/auth.py
 * Базовый URL: NEXT_PUBLIC_API_URL или http://localhost:8000
 */

const API_BASE =
  (typeof window !== "undefined"
    ? process.env.NEXT_PUBLIC_API_URL
    : process.env.NEXT_PUBLIC_API_URL) || "http://localhost:8000";

const AUTH_PREFIX = "/api/v1/auth";

export type UserInfo = {
  login: string;
  role: string;
};

export type TokenResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  refresh_expires_in: number;
  user: UserInfo | null;
};

export type MeResponse = {
  authorized: boolean;
  login: string;
  role: string;
};

const TOKEN_KEY = "asso_access_token";
const REFRESH_KEY = "asso_refresh_token";

export function getStoredAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_KEY);
}

export function setStoredTokens(access: string, refresh: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
}

export function clearStoredTokens(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

export type LoginParams = {
  login: string;
  password: string;
};

/**
 * POST /api/v1/auth/login — вход по логину и паролю.
 */
export async function login(params: LoginParams): Promise<TokenResponse> {
  const res = await fetch(`${API_BASE}${AUTH_PREFIX}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ login: params.login, password: params.password }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const detail = data.detail;
    let message = "Invalid login or password";
    if (typeof detail === "string") message = detail;
    else if (Array.isArray(detail) && detail[0]?.msg) message = detail[0].msg;
    throw new Error(message);
  }

  return data as TokenResponse;
}

export type RefreshParams = {
  refresh_token: string;
};

/**
 * POST /api/v1/auth/refresh — обмен refresh token на новую пару токенов.
 */
export async function refresh(params: RefreshParams): Promise<TokenResponse> {
  const res = await fetch(`${API_BASE}${AUTH_PREFIX}/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: params.refresh_token }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const detail = data.detail;
    let message = "Invalid or expired refresh token";
    if (typeof detail === "string") message = detail;
    else if (Array.isArray(detail) && detail[0]?.msg) message = detail[0].msg;
    throw new Error(message);
  }

  return data as TokenResponse;
}

/**
 * GET /api/v1/auth/me — текущий пользователь по access token (Bearer).
 */
export async function me(accessToken: string): Promise<MeResponse> {
  const res = await fetch(`${API_BASE}${AUTH_PREFIX}/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const detail = data.detail;
    let message = "Unauthorized";
    if (typeof detail === "string") message = detail;
    else if (Array.isArray(detail) && detail[0]?.msg) message = detail[0].msg;
    throw new Error(message);
  }

  return data as MeResponse;
}
