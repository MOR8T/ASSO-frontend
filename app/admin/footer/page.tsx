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
  getFooterVideo,
  putFooterVideo,
  listContacts,
  createContact,
  updateContact,
  deleteContact,
  AUTH_REQUIRED,
  type FooterPartnerAdmin,
  type FooterVideoAdmin,
  type FooterContactAdmin,
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

/** Извлечь YouTube video ID из URL */
function parseYouTubeId(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;
  try {
    const u = new URL(trimmed);
    if (u.hostname === "youtu.be" && u.pathname.slice(1)) return u.pathname.slice(1).split("?")[0];
    if (u.hostname?.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return v;
      const m = u.pathname.match(/^\/embed\/([^/?]+)/);
      if (m) return m[1];
    }
  } catch {
    return null;
  }
  return null;
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

  const [videoConfig, setVideoConfig] = useState<FooterVideoAdmin | null>(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoMode, setVideoMode] = useState<"external" | "uploaded">("external");
  const [videoExternalUrl, setVideoExternalUrl] = useState("");
  const [videoLabel, setVideoLabel] = useState("");
  const [videoVideoFile, setVideoVideoFile] = useState<File | null>(null);
  const [videoThumbFile, setVideoThumbFile] = useState<File | null>(null);
  const [videoSaving, setVideoSaving] = useState(false);

  const [contacts, setContacts] = useState<FooterContactAdmin[]>([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [contactCityCountry, setContactCityCountry] = useState("");
  const [contactAddress, setContactAddress] = useState("");
  const [contactContact, setContactContact] = useState("");
  const [contactSortOrder, setContactSortOrder] = useState(0);
  const [contactSubmitLoading, setContactSubmitLoading] = useState(false);
  const [contactDeletingId, setContactDeletingId] = useState<number | null>(null);
  const [contactEditingId, setContactEditingId] = useState<number | null>(null);
  const [contactEditCityCountry, setContactEditCityCountry] = useState("");
  const [contactEditAddress, setContactEditAddress] = useState("");
  const [contactEditContact, setContactEditContact] = useState("");
  const [contactEditSortOrder, setContactEditSortOrder] = useState(0);

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

  const loadVideo = useCallback(async () => {
    setVideoLoading(true);
    try {
      const v = await getFooterVideo();
      setVideoConfig(v);
      if (v) {
        setVideoMode(v.mode);
        setVideoLabel(v.label ?? "");
        if (v.mode === "external" && v.external_video_id) {
          setVideoExternalUrl(`https://www.youtube.com/watch?v=${v.external_video_id}`);
        }
      }
    } catch (e) {
      if ((e as Error).message === AUTH_REQUIRED) {
        router.replace("/login");
        return;
      }
      setError((e as Error).message);
    } finally {
      setVideoLoading(false);
    }
  }, [router]);

  const loadContacts = useCallback(async () => {
    setContactsLoading(true);
    try {
      const list = await listContacts();
      setContacts(list);
      setError(null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Ошибка загрузки контактов";
      if (msg === AUTH_REQUIRED) {
        router.replace("/login");
        return;
      }
      setError(msg);
    } finally {
      setContactsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const token = getStoredAccessToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    me(token)
      .then(async () => {
        await Promise.all([loadPartners(), loadVideo(), loadContacts()]);
      })
      .catch(() => {
        setError("Сессия недействительна");
        router.replace("/login");
      })
      .finally(() => setLoading(false));
  }, [router, loadPartners, loadVideo, loadContacts]);

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

  const handleSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setVideoSaving(true);
    try {
      let video_path: string | null = null;
      let thumbnail_path: string | null = null;
      let external_video_id: string | null = null;

      if (videoMode === "uploaded") {
        if (videoVideoFile) {
          const res = await uploadFile(videoVideoFile);
          video_path = res.path;
        } else if (videoConfig?.mode === "uploaded" && videoConfig?.video_path) {
          video_path = videoConfig.video_path;
        } else {
          setError("Выберите видеофайл");
          setVideoSaving(false);
          return;
        }
        if (videoThumbFile) {
          const res = await uploadFile(videoThumbFile);
          thumbnail_path = res.path;
        } else if (videoConfig?.thumbnail_path) {
          thumbnail_path = videoConfig.thumbnail_path;
        }
      } else {
        const id = parseYouTubeId(videoExternalUrl);
        if (!id) {
          setError("Введите ссылку на YouTube (youtube.com/watch?v=… или youtu.be/…)");
          setVideoSaving(false);
          return;
        }
        external_video_id = id;
        if (videoThumbFile) {
          const res = await uploadFile(videoThumbFile);
          thumbnail_path = res.path;
        } else if (videoConfig?.thumbnail_path) {
          thumbnail_path = videoConfig.thumbnail_path;
        }
      }

      await putFooterVideo({
        mode: videoMode,
        external_video_id: videoMode === "external" ? external_video_id : null,
        video_path: videoMode === "uploaded" ? video_path : null,
        thumbnail_path: thumbnail_path || null,
        label: videoLabel.trim() || null,
      });
      setSuccessMessage("Видео сохранено");
      setVideoVideoFile(null);
      setVideoThumbFile(null);
      await loadVideo();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка сохранения видео");
    } finally {
      setVideoSaving(false);
    }
  };

  const handleSubmitContact = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    const city_country = contactCityCountry.trim();
    if (!city_country) {
      setError("Введите город и страну");
      return;
    }
    setContactSubmitLoading(true);
    try {
      await createContact({
        city_country,
        address: contactAddress.trim() || null,
        contact: contactContact.trim() || null,
        sort_order: contactSortOrder,
      });
      setSuccessMessage("Контакт добавлен");
      setContactCityCountry("");
      setContactAddress("");
      setContactContact("");
      setContactSortOrder(contacts.length > 0 ? Math.max(...contacts.map((c) => c.sort_order), 0) + 1 : 0);
      await loadContacts();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка добавления контакта");
    } finally {
      setContactSubmitLoading(false);
    }
  };

  const handleDeleteContact = async (id: number) => {
    clearMessages();
    setContactDeletingId(id);
    try {
      await deleteContact(id);
      setSuccessMessage("Контакт удалён");
      await loadContacts();
      if (contactEditingId === id) setContactEditingId(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка удаления");
    } finally {
      setContactDeletingId(null);
    }
  };

  const handleStartEditContact = (c: FooterContactAdmin) => {
    setContactEditingId(c.id);
    setContactEditCityCountry(c.city_country);
    setContactEditAddress(c.address ?? "");
    setContactEditContact(c.contact ?? "");
    setContactEditSortOrder(c.sort_order);
  };

  const handleSaveContact = async (id: number) => {
    clearMessages();
    const city_country = contactEditCityCountry.trim();
    if (!city_country) {
      setError("Город и страна обязательны");
      return;
    }
    try {
      await updateContact(id, {
        city_country,
        address: contactEditAddress.trim() || null,
        contact: contactEditContact.trim() || null,
        sort_order: contactEditSortOrder,
      });
      setSuccessMessage("Контакт обновлён");
      setContactEditingId(null);
      await loadContacts();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка обновления контакта");
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

      {/* Промо-видео */}
      <section className="rounded-xl bg-[#3f444b] p-6 text-gray-300 mb-6">
        <h2 className="text-lg font-medium text-gray-100 mb-4">Промо-видео</h2>

        {videoLoading ? (
          <p className="text-gray-500">Загрузка...</p>
        ) : (
          <form onSubmit={handleSaveVideo} className="space-y-4 max-w-xl">
            <div>
              <span className="block text-sm text-gray-400 mb-2">Источник</span>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="videoMode"
                    checked={videoMode === "external"}
                    onChange={() => setVideoMode("external")}
                    className="text-[#ff7d24]"
                  />
                  <span>Ссылка (YouTube)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="videoMode"
                    checked={videoMode === "uploaded"}
                    onChange={() => setVideoMode("uploaded")}
                    className="text-[#ff7d24]"
                  />
                  <span>Загруженное видео</span>
                </label>
              </div>
            </div>

            {videoMode === "external" ? (
              <div>
                <label className="block text-sm text-gray-400 mb-1">URL видео (YouTube)</label>
                <input
                  type="url"
                  value={videoExternalUrl}
                  onChange={(e) => setVideoExternalUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-3 py-2 rounded-lg bg-[#2a2e33] border border-[#53565B] text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#ff7d24]"
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm text-gray-400 mb-1">Видеофайл</label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setVideoVideoFile(e.target.files?.[0] ?? null)}
                  className="block w-full text-sm text-gray-400 file:mr-2 file:py-2 file:px-3 file:rounded file:border-0 file:bg-[#53565B] file:text-gray-200"
                />
                {videoConfig?.mode === "uploaded" && videoConfig.video_path && !videoVideoFile && (
                  <p className="mt-1 text-xs text-gray-500">Текущий файл: {videoConfig.video_path}</p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm text-gray-400 mb-1">Превью (постер, необязательно)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setVideoThumbFile(e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-gray-400 file:mr-2 file:py-2 file:px-3 file:rounded file:border-0 file:bg-[#53565B] file:text-gray-200"
              />
              {videoConfig?.thumbnail_path && !videoThumbFile && (
                <p className="mt-1 text-xs text-gray-500">Текущее: {videoConfig.thumbnail_path}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Подпись</label>
              <input
                type="text"
                value={videoLabel}
                onChange={(e) => setVideoLabel(e.target.value)}
                placeholder="ПРОМО РОЛИК"
                className="w-full px-3 py-2 rounded-lg bg-[#2a2e33] border border-[#53565B] text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#ff7d24]"
              />
            </div>

            <button
              type="submit"
              disabled={videoSaving}
              className="px-4 py-2 rounded-lg bg-[#ff7d24] text-white font-medium hover:bg-[#e66f1a] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {videoSaving ? "Сохранение…" : "Сохранить видео"}
            </button>
          </form>
        )}
      </section>

      {/* Контакты */}
      <section className="rounded-xl bg-[#3f444b] p-6 text-gray-300 mb-6">
        <h2 className="text-lg font-medium text-gray-100 mb-4">Контакты</h2>

        <form onSubmit={handleSubmitContact} className="mb-6 flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Город и страна</label>
            <input
              type="text"
              value={contactCityCountry}
              onChange={(e) => setContactCityCountry(e.target.value)}
              placeholder="Москва, Россия"
              className="w-48 px-3 py-2 rounded-lg bg-[#2a2e33] border border-[#53565B] text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#ff7d24]"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Адрес</label>
            <input
              type="text"
              value={contactAddress}
              onChange={(e) => setContactAddress(e.target.value)}
              placeholder="ул. Примерная, 1"
              className="w-56 px-3 py-2 rounded-lg bg-[#2a2e33] border border-[#53565B] text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#ff7d24]"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Контакт</label>
            <input
              type="text"
              value={contactContact}
              onChange={(e) => setContactContact(e.target.value)}
              placeholder="+7 (495) 123-45-67"
              className="w-48 px-3 py-2 rounded-lg bg-[#2a2e33] border border-[#53565B] text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#ff7d24]"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Порядок</label>
            <input
              type="number"
              min={0}
              value={contactSortOrder}
              onChange={(e) => setContactSortOrder(Number(e.target.value) || 0)}
              className="w-20 px-3 py-2 rounded-lg bg-[#2a2e33] border border-[#53565B] text-gray-100 focus:outline-none focus:ring-1 focus:ring-[#ff7d24]"
            />
          </div>
          <button
            type="submit"
            disabled={contactSubmitLoading}
            className="px-4 py-2 rounded-lg bg-[#ff7d24] text-white font-medium hover:bg-[#e66f1a] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {contactSubmitLoading ? "Добавление…" : "Добавить контакт"}
          </button>
        </form>

        {contactsLoading ? (
          <p className="text-gray-500">Загрузка списка...</p>
        ) : contacts.length === 0 ? (
          <p className="text-gray-500">Контактов пока нет.</p>
        ) : (
          <ul className="space-y-3">
            {contacts.map((c) => (
              <li
                key={c.id}
                className="py-3 border-b border-[#53565B] last:border-0"
              >
                {contactEditingId === c.id ? (
                  <div className="flex flex-wrap items-end gap-3">
                    <input
                      type="text"
                      value={contactEditCityCountry}
                      onChange={(e) => setContactEditCityCountry(e.target.value)}
                      placeholder="Город и страна"
                      className="w-44 px-2 py-1.5 rounded bg-[#2a2e33] border border-[#53565B] text-gray-100 text-sm"
                    />
                    <input
                      type="text"
                      value={contactEditAddress}
                      onChange={(e) => setContactEditAddress(e.target.value)}
                      placeholder="Адрес"
                      className="w-44 px-2 py-1.5 rounded bg-[#2a2e33] border border-[#53565B] text-gray-100 text-sm"
                    />
                    <input
                      type="text"
                      value={contactEditContact}
                      onChange={(e) => setContactEditContact(e.target.value)}
                      placeholder="Контакт"
                      className="w-40 px-2 py-1.5 rounded bg-[#2a2e33] border border-[#53565B] text-gray-100 text-sm"
                    />
                    <input
                      type="number"
                      min={0}
                      value={contactEditSortOrder}
                      onChange={(e) => setContactEditSortOrder(Number(e.target.value) || 0)}
                      className="w-16 px-2 py-1.5 rounded bg-[#2a2e33] border border-[#53565B] text-gray-100 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveContact(c.id)}
                      className="text-sm text-[#ff7d24] hover:underline"
                    >
                      Сохранить
                    </button>
                    <button
                      type="button"
                      onClick={() => setContactEditingId(null)}
                      className="text-sm text-gray-500 hover:underline"
                    >
                      Отмена
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="min-w-0">
                      <p className="font-medium text-gray-100">{c.city_country}</p>
                      {c.address && <p className="text-sm text-gray-500">{c.address}</p>}
                      {c.contact && <p className="text-sm text-gray-500">{c.contact}</p>}
                    </div>
                    <span className="text-sm text-gray-500">Порядок: {c.sort_order}</span>
                    <button
                      type="button"
                      onClick={() => handleStartEditContact(c)}
                      className="text-sm text-[#ff7d24] hover:underline"
                    >
                      Изменить
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteContact(c.id)}
                      disabled={contactDeletingId === c.id}
                      className="ml-auto px-3 py-1 rounded text-sm bg-red-900/50 text-red-200 hover:bg-red-900/70 disabled:opacity-50"
                    >
                      {contactDeletingId === c.id ? "Удаление…" : "Удалить"}
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
