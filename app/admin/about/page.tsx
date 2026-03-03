"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStoredAccessToken, me } from "@/api/login";
import { IntroSection, TeamSection } from "./components";

export default function AdminAboutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const token = getStoredAccessToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    me(token)
      .then(() => {})
      .catch(() => {
        setError("Сессия недействительна");
        router.replace("/login");
      })
      .finally(() => setLoading(false));
  }, [router]);

  const clearMessages = () => {
    setError(null);
    setSuccessMessage(null);
  };

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-gray-400">Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-gray-100 mb-4">О нас</h1>

      {error && (
        <div
          className="mb-4 p-3 rounded-lg bg-red-900/40 text-red-200 text-sm"
          role="alert"
        >
          {error}
        </div>
      )}
      {successMessage && (
        <div
          className="mb-4 p-3 rounded-lg bg-green-900/40 text-green-200 text-sm"
          role="status"
        >
          {successMessage}
        </div>
      )}

      <IntroSection
        onError={setError}
        onSuccess={setSuccessMessage}
        onClearMessages={clearMessages}
      />
      <TeamSection
        onError={setError}
        onSuccess={setSuccessMessage}
        onClearMessages={clearMessages}
      />
    </div>
  );
}
