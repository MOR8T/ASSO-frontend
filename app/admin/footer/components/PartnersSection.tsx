"use client";

import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  listPartners,
  createPartner,
  updatePartner,
  deletePartner,
  AUTH_REQUIRED,
  type FooterPartnerAdmin,
} from "@/api/footer";
import { uploadFile } from "@/api/files";
import { getMediaUrl } from "../utils";

export type PartnersSectionProps = {
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
  onClearMessages: () => void;
};

const inputClass =
  "px-3 py-2 rounded-lg bg-[#2a2e33] border border-[#53565B] text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#ff7d24]";
const buttonPrimaryClass =
  "px-4 py-2 rounded-lg bg-[#ff7d24] text-white font-medium hover:bg-[#e66f1a] disabled:opacity-50 disabled:cursor-not-allowed";

export function PartnersSection({
  onError,
  onSuccess,
  onClearMessages,
}: PartnersSectionProps) {
  const router = useRouter();
  const [partners, setPartners] = useState<FooterPartnerAdmin[]>([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [sortOrder, setSortOrder] = useState(0);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editingSortOrderId, setEditingSortOrderId] = useState<number | null>(null);
  const [editSortOrderValue, setEditSortOrderValue] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await listPartners();
      setPartners(list);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Ошибка загрузки партнёров";
      if (msg === AUTH_REQUIRED) {
        router.replace("/login");
        return;
      }
      onError(msg);
    } finally {
      setLoading(false);
    }
  }, [router, onError]);

  useEffect(() => {
    load();
  }, [load]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setLogoFile(file ?? null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onClearMessages();
    let logo_path = "";
    if (logoFile) {
      setUploading(true);
      try {
        const result = await uploadFile(logoFile);
        logo_path = result.path;
      } catch (err) {
        onError(err instanceof Error ? err.message : "Ошибка загрузки файла");
        setUploading(false);
        return;
      }
      setUploading(false);
    }
    if (!logo_path) {
      onError("Выберите файл логотипа");
      return;
    }
    const nameTrimmed = name.trim();
    if (!nameTrimmed) {
      onError("Введите название партнёра");
      return;
    }
    setSubmitLoading(true);
    try {
      await createPartner({
        name: nameTrimmed,
        logo_path,
        sort_order: sortOrder,
      });
      onSuccess("Партнёр добавлен");
      setName("");
      setLogoFile(null);
      setSortOrder(
        partners.length > 0 ? Math.max(...partners.map((p) => p.sort_order), 0) + 1 : 0
      );
      const logoInput = document.getElementById("partner-logo-input");
      if (logoInput instanceof HTMLInputElement) logoInput.value = "";
      await load();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Ошибка создания партнёра");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    onClearMessages();
    setDeletingId(id);
    try {
      await deletePartner(id);
      onSuccess("Партнёр удалён");
      await load();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Ошибка удаления");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSaveSortOrder = async (id: number) => {
    onClearMessages();
    try {
      await updatePartner(id, { sort_order: editSortOrderValue });
      onSuccess("Порядок сохранён");
      setEditingSortOrderId(null);
      await load();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Ошибка обновления");
    }
  };

  return (
    <section className="rounded-xl bg-[#3f444b] p-6 text-gray-300 mb-6">
      <h2 className="text-lg font-medium text-gray-100 mb-4">Партнёры</h2>

      <form onSubmit={handleSubmit} className="mb-6 flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Название</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Партнёр 1"
            className={`w-48 ${inputClass}`}
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
          {logoFile && (
            <p className="mt-1 text-xs text-gray-500">Выбран: {logoFile.name}</p>
          )}
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Порядок</label>
          <input
            type="number"
            min={0}
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value) || 0)}
            className={`w-20 ${inputClass}`}
          />
        </div>
        <button
          type="submit"
          disabled={submitLoading || uploading}
          className={buttonPrimaryClass}
        >
          {uploading ? "Загрузка…" : submitLoading ? "Добавление…" : "Добавить партнёра"}
        </button>
      </form>

      {loading ? (
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
                  src={getMediaUrl(p.logo_path)}
                  alt={p.name}
                  fill
                  className="object-contain"
                  unoptimized={p.logo_path.startsWith("http")}
                />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-gray-100">{p.name}</p>
                <p className="text-xs text-gray-500 truncate max-w-[200px]">{p.logo_path}</p>
              </div>
              {editingSortOrderId === p.id ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    value={editSortOrderValue}
                    onChange={(e) => setEditSortOrderValue(Number(e.target.value) || 0)}
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
                  <span className="text-sm text-gray-500">Порядок: {p.sort_order}</span>
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
  );
}
