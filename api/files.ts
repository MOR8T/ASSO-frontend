/**
 * API загрузки файлов. POST /api/v1/files/upload с Bearer + refresh/retry.
 */

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const FILES_UPLOAD = "/api/v1/files/upload";

import {
  getStoredAccessToken,
  getStoredRefreshToken,
  setStoredTokens,
  clearStoredTokens,
  refresh,
} from "./login";

export const AUTH_REQUIRED = "AUTH_REQUIRED";

export interface UploadResponse {
  path: string;
  filename: string;
}

async function uploadWithToken(
  file: File,
  token: string,
  skipRetry?: boolean
): Promise<Response> {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${API_BASE}${FILES_UPLOAD}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: form,
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
      return uploadWithToken(file, data.access_token, true);
    } catch {
      clearStoredTokens();
      throw new Error(AUTH_REQUIRED);
    }
  }

  return res;
}

/**
 * Загружает файл на backend. Требует access token; при 401 делает refresh и один retry.
 * При неуспешном refresh очищает токены и выбрасывает AUTH_REQUIRED.
 */
export async function uploadFile(file: File): Promise<UploadResponse> {
  const token = getStoredAccessToken();
  if (!token) {
    clearStoredTokens();
    throw new Error(AUTH_REQUIRED);
  }

  const res = await uploadWithToken(file, token);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg =
      typeof data.detail === "string"
        ? data.detail
        : "Ошибка загрузки файла";
    throw new Error(msg);
  }

  if (typeof data.path !== "string" || typeof data.filename !== "string") {
    throw new Error("Некорректный ответ сервера");
  }

  return { path: data.path, filename: data.filename };
}
