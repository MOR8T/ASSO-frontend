"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStoredAccessToken, me } from "@/api/login";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ login: string; role: string } | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getStoredAccessToken();
    if (!token) {
      router.replace("/admin/login");
      return;
    }

    me(token)
      .then((data) => {
        setUser({ login: data.login, role: data.role });
      })
      .catch(() => {
        setError("Сессия недействительна");
        router.replace("/admin/login");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#31353b]">
        <p className="text-gray-400">Загрузка...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#31353b]">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#31353b] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-100 mb-2">
          Админка (тест)
        </h1>
        {user && (
          <p className="text-gray-400">
            Вы вошли как <span className="text-[#ff7d24]">{user.login}</span> (
            {user.role})
          </p>
        )}
        <div className="mt-8 rounded-xl bg-[#3f444b] p-6 text-gray-300">
          Пустая страница для тестов авторизации.
        </div>
      </div>
    </div>
  );
}
