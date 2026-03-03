"use client";

import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  listSocial,
  createSocial,
  updateSocial,
  deleteSocial,
  AUTH_REQUIRED,
  type FooterSocialAdmin,
} from "@/api/footer";
import { uploadFile } from "@/api/files";
import { getMediaUrl } from "../utils";

export type SocialSectionProps = {
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
  onClearMessages: () => void;
};

const inputClass =
  "px-3 py-2 rounded-lg bg-[#2a2e33] border border-[#53565B] text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#ff7d24]";
const buttonPrimaryClass =
  "px-4 py-2 rounded-lg bg-[#ff7d24] text-white font-medium hover:bg-[#e66f1a] disabled:opacity-50 disabled:cursor-not-allowed";

export function SocialSection({
  onError,
  onSuccess,
  onClearMessages,
}: SocialSectionProps) {
  const router = useRouter();
  const [list, setList] = useState<FooterSocialAdmin[]>([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [sortOrder, setSortOrder] = useState(0);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editingSortOrderId, setEditingSortOrderId] = useState<number | null>(null);
  const [editSortOrderValue, setEditSortOrderValue] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listSocial();
      setList(data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Ошибка загрузки соцсетей";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onClearMessages();
    let icon_path = "";
    if (iconFile) {
      setUploading(true);
      try {
        const res = await uploadFile(iconFile);
        icon_path = res.path;
      } catch (err) {
        onError(err instanceof Error ? err.message : "Ошибка загрузки иконки");
        setUploading(false);
        return;
      }
      setUploading(false);
    }
    if (!icon_path) {
      onError("Выберите файл иконки");
      return;
    }
    const nameTrimmed = name.trim();
    const urlTrimmed = url.trim();
    if (!nameTrimmed) {
      onError("Введите название");
      return;
    }
    if (!urlTrimmed) {
      onError("Введите URL");
      return;
    }
    setSubmitLoading(true);
    try {
      await createSocial({
        name: nameTrimmed,
        url: urlTrimmed,
        icon_path,
        sort_order: sortOrder,
      });
      onSuccess("Соцсеть добавлена");
      setName("");
      setUrl("");
      setIconFile(null);
      setSortOrder(
        list.length > 0 ? Math.max(...list.map((s) => s.sort_order), 0) + 1 : 0
      );
      const el = document.getElementById("social-icon-input");
      if (el instanceof HTMLInputElement) el.value = "";
      await load();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Ошибка добавления соцсети");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    onClearMessages();
    setDeletingId(id);
    try {
      await deleteSocial(id);
      onSuccess("Соцсеть удалена");
      await load();
      if (editingSortOrderId === id) setEditingSortOrderId(null);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Ошибка удаления");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSaveSortOrder = async (id: number) => {
    onClearMessages();
    try {
      await updateSocial(id, { sort_order: editSortOrderValue });
      onSuccess("Порядок сохранён");
      setEditingSortOrderId(null);
      await load();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Ошибка обновления");
    }
  };

  return (
    <section className="rounded-xl bg-[#3f444b] p-6 text-gray-300 mb-6">
      <h2 className="text-lg font-medium text-gray-100 mb-4">Соцсети</h2>

      <form onSubmit={handleSubmit} className="mb-6 flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Название</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Facebook"
            className={`w-36 ${inputClass}`}
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">URL</label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..."
            className={`w-64 ${inputClass}`}
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Иконка</label>
          <input
            id="social-icon-input"
            type="file"
            accept="image/*"
            onChange={(e) => setIconFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-gray-400 file:mr-2 file:py-2 file:px-3 file:rounded file:border-0 file:bg-[#53565B] file:text-gray-200"
          />
          {iconFile && (
            <p className="mt-1 text-xs text-gray-500">Выбран: {iconFile.name}</p>
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
          {uploading ? "Загрузка…" : submitLoading ? "Добавление…" : "Добавить соцсеть"}
        </button>
      </form>

      {loading ? (
        <p className="text-gray-500">Загрузка списка...</p>
      ) : list.length === 0 ? (
        <p className="text-gray-500">Соцсетей пока нет.</p>
      ) : (
        <ul className="space-y-3">
          {list.map((s) => (
            <li
              key={s.id}
              className="flex flex-wrap items-center gap-4 py-3 border-b border-[#53565B] last:border-0"
            >
              <div className="relative w-10 h-10 rounded overflow-hidden bg-[#2a2e33] shrink-0">
                <Image
                  src={getMediaUrl(s.icon_path)}
                  alt={s.name}
                  fill
                  className="object-contain"
                  unoptimized={s.icon_path.startsWith("http")}
                />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-gray-100">{s.name}</p>
                <p className="text-xs text-gray-500 truncate max-w-[240px]">{s.url}</p>
              </div>
              {editingSortOrderId === s.id ? (
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
                    onClick={() => handleSaveSortOrder(s.id)}
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
                  <span className="text-sm text-gray-500">Порядок: {s.sort_order}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingSortOrderId(s.id);
                      setEditSortOrderValue(s.sort_order);
                    }}
                    className="text-sm text-[#ff7d24] hover:underline"
                  >
                    Изменить
                  </button>
                </div>
              )}
              <button
                type="button"
                onClick={() => handleDelete(s.id)}
                disabled={deletingId === s.id}
                className="ml-auto px-3 py-1 rounded text-sm bg-red-900/50 text-red-200 hover:bg-red-900/70 disabled:opacity-50"
              >
                {deletingId === s.id ? "Удаление…" : "Удалить"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
