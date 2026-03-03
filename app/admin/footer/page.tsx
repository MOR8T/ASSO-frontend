"use client";

import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getStoredAccessToken, me } from "@/api/login";
import {
  listPartners,
  createPartner,
  updatePartner,
  deletePartner,
  AUTH_REQUIRED,
  type FooterPartnerAdmin,
} from "@/api/footer";
import { uploadFile } from "@/api/files";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function partnerLogoUrl(logo_path: string): string {
  if (!logo_path) return "";
  if (logo_path.startsWith("http://") || logo_path.startsWith("https://"))
    return logo_path;
  const base = API_BASE.replace(/\/$/, "");
  return logo_path.startsWith("/") ? `${base}${logo_path}` : `${base}/media/${logo_path}`;
}

export default function AdminFooterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [partners, setPartners] = useState<FooterPartnerAdmin[]>([]);
  const [partnersLoading, setPartnersLoading] = useState(false);

  const [formName, setFormName] = useState("");
  const [formLogoPath, setFormLogoPath] = useState("");
  const [formSortOrder, setFormSortOrder] = useState(0);
  const [formFile, setFormFile] = useState<File | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [editingSortOrderId, setEditingSortOrderId] = useState<number | null>(null);
  const [editSortOrderValue, setEditSortOrderValue] = useState<number>(0);

  const loadPartners = useCallback(async () => {
    setPartnersLoading(true);
    try {
      const list = await listPartners();
      setPartners(list);
      setError(null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Ошибка загрузки партнёров";
      if (msg === AUTH_REQUIRED) {
        router.replace("/login");
        return;
      }
      setError(msg);
    } finally {
      setPartnersLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const token = getStoredAccessToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    me(token)
      .then(() => loadPartners())
      .catch(() => {
        setError("Сессия недействительна");
        router.replace("/login");
      })
      .finally(() => setLoading(false));
  }, [router, loadPartners]);

  const clearMessages = () => {
    setError(null);
    setSuccessMessage(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormFile(file);
      setFormLogoPath("");
    } else {
      setFormFile(null);
      setFormLogoPath("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    let logo_path = formLogoPath.trim();
    if (formFile && !logo_path) {
      setUploading(true);
      try {
        const result = await uploadFile(formFile);
        logo_path = result.path;
      } catch (e) {
        setError(e instanceof Error ? e.message : "Ошибка загрузки файла");
        setUploading(false);
        return;
      }
      setUploading(false);
    }
    if (!logo_path) {
      setError("Выберите файл логотипа");
      return;
    }
    const name = formName.trim();
    if (!name) {
      setError("Введите название партнёра");
      return;
    }
    setSubmitLoading(true);
    try {
      await createPartner({ name, logo_path, sort_order: formSortOrder });
      setSuccessMessage("Партнёр добавлен");
      setFormName("");
      setFormLogoPath("");
      setFormSortOrder(partners.length > 0 ? Math.max(...partners.map((p) => p.sort_order), 0) + 1 : 0);
      setFormFile(null);
      if (document.getElementById("partner-logo-input") instanceof HTMLInputElement) {
        (document.getElementById("partner-logo-input") as HTMLInputElement).value = "";
      }
      await loadPartners();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка создания партнёра");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    clearMessages();
    setDeletingId(id);
    try {
      await deletePartner(id);
      setSuccessMessage("Партнёр удалён");
      await loadPartners();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка удаления");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSaveSortOrder = async (id: number) => {
    clearMessages();
    try {
      await updatePartner(id, { sort_order: editSortOrderValue });
      setSuccessMessage("Порядок сохранён");
      setEditingSortOrderId(null);
      await loadPartners();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка обновления");
    }
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

      {/* Партнёры */}
      <section className="rounded-xl bg-[#3f444b] p-6 text-gray-300 mb-6">
        <h2 className="text-lg font-medium text-gray-100 mb-4">Партнёры</h2>

        <form onSubmit={handleSubmit} className="mb-6 flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Название</label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Партнёр 1"
              className="w-48 px-3 py-2 rounded-lg bg-[#2a2e33] border border-[#53565B] text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#ff7d24]"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Логотип</label>
            <input
              id="partner-logo-input"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-400 file:mr-2 file:py-2 file:px-3 file:rounded file:border-0 file:bg-[#53565B] file:text-gray-200"
            />
            {formFile && (
              <p className="mt-1 text-xs text-gray-500">
                Выбран: {formFile.name}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Порядок</label>
            <input
              type="number"
              min={0}
              value={formSortOrder}
              onChange={(e) => setFormSortOrder(Number(e.target.value) || 0)}
              className="w-20 px-3 py-2 rounded-lg bg-[#2a2e33] border border-[#53565B] text-gray-100 focus:outline-none focus:ring-1 focus:ring-[#ff7d24]"
            />
          </div>
          <button
            type="submit"
            disabled={submitLoading || uploading}
            className="px-4 py-2 rounded-lg bg-[#ff7d24] text-white font-medium hover:bg-[#e66f1a] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? "Загрузка…" : submitLoading ? "Добавление…" : "Добавить партнёра"}
          </button>
        </form>

        {partnersLoading ? (
          <p className="text-gray-500">Загрузка списка...</p>
        ) : partners.length === 0 ? (
          <p className="text-gray-500">Партнёров пока нет.</p>
        ) : (
          <ul className="space-y-3">
            {partners.map((p) => (
              <li
                key={p.id}
                className="flex flex-wrap items-center gap-4 py-3 border-b border-[#53565B] last:border-0"
              >
                <div className="relative w-16 h-16 rounded overflow-hidden bg-[#2a2e33] shrink-0">
                  <Image
                    src={partnerLogoUrl(p.logo_path)}
                    alt={p.name}
                    fill
                    className="object-contain"
                    unoptimized={p.logo_path.startsWith("http")}
                  />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-gray-100">{p.name}</p>
                  <p className="text-xs text-gray-500 truncate max-w-[200px]">
                    {p.logo_path}
                  </p>
                </div>
                {editingSortOrderId === p.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      value={editSortOrderValue}
                      onChange={(e) =>
                        setEditSortOrderValue(Number(e.target.value) || 0)
                      }
                      className="w-16 px-2 py-1 rounded bg-[#2a2e33] border border-[#53565B] text-gray-100 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveSortOrder(p.id)}
                      className="text-sm text-[#ff7d24] hover:underline"
                    >
                      Сохранить
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingSortOrderId(null)}
                      className="text-sm text-gray-500 hover:underline"
                    >
                      Отмена
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                      Порядок: {p.sort_order}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingSortOrderId(p.id);
                        setEditSortOrderValue(p.sort_order);
                      }}
                      className="text-sm text-[#ff7d24] hover:underline"
                    >
                      Изменить
                    </button>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(p.id)}
                  disabled={deletingId === p.id}
                  className="ml-auto px-3 py-1 rounded text-sm bg-red-900/50 text-red-200 hover:bg-red-900/70 disabled:opacity-50"
                >
                  {deletingId === p.id ? "Удаление…" : "Удалить"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
