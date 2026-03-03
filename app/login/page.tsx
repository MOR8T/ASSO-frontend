"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  login as apiLogin,
  setStoredTokens,
  type LoginParams,
} from "@/api/login";

const MIN_PASSWORD_LENGTH = 1;

function validate(params: LoginParams): string | null {
  const { login, password } = params;
  const trimmedLogin = login.trim();
  if (!trimmedLogin) return "Введите логин";
  if (!password) return "Введите пароль";
  if (password.length < MIN_PASSWORD_LENGTH) return "Пароль слишком короткий";
  return null;
}

export default function LoginPage() {
  const router = useRouter();
  const [loginValue, setLoginValue] = useState("");
  const [passwordValue, setPasswordValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const params: LoginParams = {
      login: loginValue.trim(),
      password: passwordValue,
    };

    const validationError = validate(params);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const res = await apiLogin(params);
      setStoredTokens(res.access_token, res.refresh_token);
      router.push("/admin/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка входа");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#31353b] px-4">
      <div className="w-full max-w-sm rounded-xl bg-[#3f444b] p-8 shadow-xl">
        <h1 className="text-2xl font-semibold text-gray-100 text-center mb-6">
          Вход в админку
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div
              className="rounded-lg bg-red-500/20 border border-red-500/50 text-red-200 text-sm px-4 py-3"
              role="alert"
            >
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="login"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Логин
            </label>
            <input
              id="login"
              type="text"
              autoComplete="username"
              value={loginValue}
              onChange={(e) => setLoginValue(e.target.value)}
              disabled={loading}
              className="w-full rounded-lg border border-gray-600 bg-[#292d32] px-4 py-2.5 text-gray-100 placeholder-gray-500 focus:border-[#ff7d24] focus:outline-none focus:ring-1 focus:ring-[#ff7d24] disabled:opacity-60"
              placeholder="asso_user"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Пароль
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={passwordValue}
              onChange={(e) => setPasswordValue(e.target.value)}
              disabled={loading}
              className="w-full rounded-lg border border-gray-600 bg-[#292d32] px-4 py-2.5 text-gray-100 placeholder-gray-500 focus:border-[#ff7d24] focus:outline-none focus:ring-1 focus:ring-[#ff7d24] disabled:opacity-60"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#ff7d24] py-2.5 font-medium text-white hover:bg-[#e66e1a] focus:outline-none focus:ring-2 focus:ring-[#ff7d24] focus:ring-offset-2 focus:ring-offset-[#3f444b] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Вход..." : "Войти"}
          </button>
        </form>
      </div>
    </div>
  );
}
