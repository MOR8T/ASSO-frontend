"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStoredAccessToken, me } from "@/api/login";
import {
  PartnersSection,
  SocialSection,
  VideoSection,
  ContactsSection,
} from "./components";

export default function AdminFooterPage() {
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
      <h1 className="text-2xl font-semibold text-gray-100 mb-4">
        Подвал сайта
      </h1>

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

      <PartnersSection
        onError={setError}
        onSuccess={setSuccessMessage}
        onClearMessages={clearMessages}
      />
      <SocialSection
        onError={setError}
        onSuccess={setSuccessMessage}
        onClearMessages={clearMessages}
      />
      <VideoSection
        onError={setError}
        onSuccess={setSuccessMessage}
        onClearMessages={clearMessages}
      />
      <ContactsSection
        onError={setError}
        onSuccess={setSuccessMessage}
        onClearMessages={clearMessages}
      />
    </div>
  );
}
