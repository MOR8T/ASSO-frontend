"use client";

import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  getStoredAccessToken,
  me,
  clearStoredTokens,
} from "@/api/login";
import {
  getHomeSliderList,
  getAdminSlide,
  createSlide,
  updateSlide,
  deleteSlide,
  AUTH_REQUIRED,
  type SlideAdmin,
  type SlideCreatePayload,
  type SourceItem,
} from "@/api/slider";
import { uploadFile } from "@/api/files";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getMediaUrl(path: string | null | undefined): string {
  if (!path || !path.trim()) return "";
  return path.startsWith("http") ? path : `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
}

function parseSourcesJson(
  value: string
): SourceItem[] | null | undefined {
  const trimmed = value.trim();
  if (!trimmed) return null;
  try {
    const parsed = JSON.parse(trimmed);
    if (!Array.isArray(parsed)) return null;
    return parsed.filter(
      (s): s is SourceItem =>
        s && typeof s.src === "string" && typeof s.type === "string"
    );
  } catch {
    return undefined;
  }
}

const emptyForm: SlideCreatePayload = {
  type: "image",
  src: "",
  alt: "",
  poster: null,
  sources: null,
  sort_order: 0,
  is_active: true,
};

export default function SliderAdminSection() {
  const router = useRouter();
  const [user, setUser] = useState<{ login: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [slides, setSlides] = useState<SlideAdmin[]>([]);
  const [slidesLoading, setSlidesLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [createForm, setCreateForm] = useState<SlideCreatePayload>(emptyForm);
  const [createSourcesRaw, setCreateSourcesRaw] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<SlideCreatePayload | null>(null);
  const [editSourcesRaw, setEditSourcesRaw] = useState("");
  const [uploading, setUploading] = useState<"create-src" | "create-poster" | "edit-src" | "edit-poster" | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const loadSlides = useCallback(async () => {
    setSlidesLoading(true);
    try {
      const list = await getHomeSliderList();
      const full = await Promise.all(
        list.map((s) => getAdminSlide(s.id).catch(() => null))
      );
      setSlides(full.filter((s): s is SlideAdmin => s !== null));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Ошибка загрузки слайдов";
      if (msg === AUTH_REQUIRED) {
        clearStoredTokens();
        router.replace("/login");
        return;
      }
      setError(msg);
    } finally {
      setSlidesLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const token = getStoredAccessToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    me(token)
      .then((data) => {
        setUser({ login: data.login, role: data.role });
        loadSlides();
      })
      .catch(() => {
        setError("Сессия недействительна");
        router.replace("/login");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [router, loadSlides]);

  const clearMessages = () => {
    setError(null);
    setSuccessMessage(null);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    const sources = parseSourcesJson(createSourcesRaw);
    if (createSourcesRaw.trim() && sources === undefined) {
      setError("sources: введите валидный JSON-массив [{ src, type }, ...]");
      return;
    }
    if (createForm.type === "video" && !(createForm.poster && createForm.poster.trim())) {
      setError("Для типа video поле poster обязательно");
      return;
    }
    if (createForm.type === "image" && createForm.poster?.trim()) {
      setError("Для типа image poster должен быть пустым");
      return;
    }
    setSubmitLoading(true);
    try {
      await createSlide({
        ...createForm,
        poster: createForm.poster?.trim() || null,
        sources: sources ?? null,
      });
      setSuccessMessage("Слайд создан");
      setCreateForm(emptyForm);
      setCreateSourcesRaw("");
      setCreateModalOpen(false);
      loadSlides();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Ошибка создания";
      if (msg === AUTH_REQUIRED) {
        clearStoredTokens();
        router.replace("/login");
        return;
      }
      setError(msg);
    } finally {
      setSubmitLoading(false);
    }
  };

  const startEdit = (slide: SlideAdmin) => {
    setEditingId(slide.id);
    setEditForm({
      type: slide.type,
      src: slide.src,
      alt: slide.alt,
      poster: slide.poster ?? null,
      sources: slide.sources ?? null,
      sort_order: slide.sort_order,
      is_active: slide.is_active,
    });
    setEditSourcesRaw(
      slide.sources?.length
        ? JSON.stringify(slide.sources, null, 2)
        : ""
    );
    clearMessages();
  };

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setEditForm(null);
    setEditSourcesRaw("");
  }, []);

  useEffect(() => {
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (createModalOpen) {
          setCreateModalOpen(false);
          setCreateForm(emptyForm);
          setCreateSourcesRaw("");
        }
        if (editingId != null) cancelEdit();
      }
    };
    document.addEventListener("keydown", onEscape);
    return () => document.removeEventListener("keydown", onEscape);
  }, [createModalOpen, editingId, cancelEdit]);

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId == null || !editForm) return;
    clearMessages();
    const sources = parseSourcesJson(editSourcesRaw);
    if (editSourcesRaw.trim() && sources === undefined) {
      setError("sources: введите валидный JSON-массив [{ src, type }, ...]");
      return;
    }
    if (editForm.type === "video" && !(editForm.poster && editForm.poster.trim())) {
      setError("Для типа video поле poster обязательно");
      return;
    }
    setSubmitLoading(true);
    try {
      await updateSlide(editingId, {
        ...editForm,
        poster: editForm.poster?.trim() || null,
        sources: sources ?? null,
      });
      setSuccessMessage("Слайд обновлён");
      cancelEdit();
      loadSlides();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Ошибка обновления";
      if (msg === AUTH_REQUIRED) {
        clearStoredTokens();
        router.replace("/login");
        return;
      }
      setError(msg);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (slide: SlideAdmin) => {
    if (!window.confirm(`Удалить слайд #${slide.id} («${slide.alt}»)?`)) return;
    clearMessages();
    setSubmitLoading(true);
    try {
      await deleteSlide(slide.id);
      setSuccessMessage("Слайд удалён");
      if (editingId === slide.id) cancelEdit();
      loadSlides();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Ошибка удаления";
      if (msg === AUTH_REQUIRED) {
        clearStoredTokens();
        router.replace("/login");
        return;
      }
      setError(msg);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleUploadCreateSrc = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    clearMessages();
    setUploading("create-src");
    try {
      const { path } = await uploadFile(file);
      setCreateForm((f) => ({ ...f, src: path }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Ошибка загрузки";
      if (msg === AUTH_REQUIRED) {
        clearStoredTokens();
        router.replace("/login");
        return;
      }
      setError(msg);
    } finally {
      setUploading(null);
      e.target.value = "";
    }
  };

  const handleUploadCreatePoster = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    clearMessages();
    setUploading("create-poster");
    try {
      const { path } = await uploadFile(file);
      setCreateForm((f) => ({ ...f, poster: path }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Ошибка загрузки";
      if (msg === AUTH_REQUIRED) {
        clearStoredTokens();
        router.replace("/login");
        return;
      }
      setError(msg);
    } finally {
      setUploading(null);
      e.target.value = "";
    }
  };

  const handleUploadEditSrc = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editForm) return;
    clearMessages();
    setUploading("edit-src");
    try {
      const { path } = await uploadFile(file);
      setEditForm((f) => (f ? { ...f, src: path } : f));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Ошибка загрузки";
      if (msg === AUTH_REQUIRED) {
        clearStoredTokens();
        router.replace("/login");
        return;
      }
      setError(msg);
    } finally {
      setUploading(null);
      e.target.value = "";
    }
  };

  const handleUploadEditPoster = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editForm) return;
    clearMessages();
    setUploading("edit-poster");
    try {
      const { path } = await uploadFile(file);
      setEditForm((f) => (f ? { ...f, poster: path } : f));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Ошибка загрузки";
      if (msg === AUTH_REQUIRED) {
        clearStoredTokens();
        router.replace("/login");
        return;
      }
      setError(msg);
    } finally {
      setUploading(null);
      e.target.value = "";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#31353b]">
        <p className="text-gray-400">Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#31353b] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-100 mb-2">
          Слайдер главной страницы
        </h1>
        {user && (
          <p className="text-gray-400 mb-6">
            Вы вошли как <span className="text-[#ff7d24]">{user.login}</span> (
            {user.role})
          </p>
        )}

        {error && (
          <div
            className="mb-4 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200 text-sm px-4 py-3"
            role="alert"
          >
            {error}
          </div>
        )}
        {successMessage && (
          <div
            className="mb-4 rounded-lg bg-green-500/20 border border-green-500/50 text-green-200 text-sm px-4 py-3"
            role="status"
          >
            {successMessage}
          </div>
        )}

        {/* Список слайдов с превью */}
        <section className="rounded-2xl bg-[#3a3f46] border border-[#4a5058] overflow-hidden shadow-lg">
          <div className="px-6 py-4 border-b border-[#4a5058] bg-[#343940] flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Слайды
              </h2>
              <p className="text-sm text-gray-400 mt-0.5">
                {slides.length === 0 && !slidesLoading ? "Нет слайдов" : `Всего: ${slides.length}`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => { clearMessages(); setCreateModalOpen(true); }}
              className="rounded-lg bg-[#ff7d24] px-4 py-2.5 text-white font-medium hover:bg-[#e66e1a] transition focus:ring-2 focus:ring-[#ff7d24] focus:ring-offset-2 focus:ring-offset-[#31353b]"
            >
              Создать слайд
            </button>
          </div>
          <div className="p-6">
            {slidesLoading ? (
              <p className="text-gray-400 py-4">Загрузка списка…</p>
            ) : slides.length === 0 ? (
              <p className="text-gray-500 py-6 text-center">Нет слайдов. Нажмите «Создать слайд».</p>
            ) : (
              <ul className="space-y-4">
                {slides.map((slide) => {
                  const thumbSrc = slide.type === "image"
                    ? getMediaUrl(slide.src)
                    : getMediaUrl(slide.poster) || getMediaUrl(slide.src);
                  return (
                    <li
                      key={slide.id}
                      className="flex flex-wrap sm:flex-nowrap items-stretch gap-4 rounded-xl border border-[#4a5058] bg-[#292d32] overflow-hidden hover:border-[#5a6068] transition"
                    >
                      <div className="w-full sm:w-32 h-28 sm:h-auto sm:min-h-[100px] shrink-0 bg-[#1e2126] flex items-center justify-center overflow-hidden">
                        {thumbSrc ? (
                          slide.type === "video" && !slide.poster ? (
                            <div className="w-full h-full flex items-center justify-center text-gray-500">
                              <span className="text-xs">Видео</span>
                            </div>
                          ) : (
                            <Image
                              src={thumbSrc}
                              alt={slide.alt}
                              width={128}
                              height={100}
                              className="w-full h-full object-cover"
                              unoptimized
                            />
                          )
                        ) : (
                          <div className="text-gray-500 text-xs">Нет превью</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 py-4 pr-4 flex flex-col justify-center">
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm">
                          <span className="text-[#ff7d24] font-medium">#{slide.id}</span>
                          <span className="text-gray-400">{slide.type === "image" ? "Изображение" : "Видео"}</span>
                          <span className="text-gray-500">порядок: {slide.sort_order}</span>
                          <span className={slide.is_active ? "text-green-400" : "text-gray-500"}>
                            {slide.is_active ? "активен" : "скрыт"}
                          </span>
                        </div>
                        <p className="mt-1 text-gray-300 truncate" title={slide.alt}>
                          {slide.alt}
                        </p>
                        <p className="mt-0.5 text-gray-500 text-xs truncate" title={slide.src}>
                          {slide.src}
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0 p-4 items-center border-t sm:border-t-0 sm:border-l border-[#4a5058]">
                        <button
                          type="button"
                          onClick={() => startEdit(slide)}
                          className="rounded-lg border border-[#5a6068] px-3 py-2 text-sm text-gray-300 hover:bg-[#3a3f46] transition"
                        >
                          Изменить
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(slide)}
                          disabled={submitLoading}
                          className="rounded-lg border border-red-500/60 px-3 py-2 text-sm text-red-300 hover:bg-red-500/20 disabled:opacity-50 transition"
                        >
                          Удалить
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>

        {/* Модальное окно: Создать слайд */}
        {createModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-modal-title"
            onClick={(e) => e.target === e.currentTarget && (setCreateModalOpen(false), setCreateForm(emptyForm), setCreateSourcesRaw(""))}
          >
            <div className="bg-[#3a3f46] border border-[#4a5058] rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-[#4a5058] bg-[#343940]">
                <h2 id="create-modal-title" className="text-lg font-semibold text-white">
                  Создать слайд
                </h2>
                <button
                  type="button"
                  onClick={() => { setCreateModalOpen(false); setCreateForm(emptyForm); setCreateSourcesRaw(""); }}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#4a5058] transition"
                  aria-label="Закрыть"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <form onSubmit={handleCreateSubmit} className="p-6 text-gray-300">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">Тип слайда</label>
                    <select
                      value={createForm.type}
                      onChange={(e) => setCreateForm((f) => ({ ...f, type: e.target.value as "image" | "video" }))}
                      className="w-full rounded-lg border border-[#4a5058] bg-[#292d32] px-3 py-2.5 text-gray-100 focus:border-[#ff7d24] focus:ring-1 focus:ring-[#ff7d24] outline-none transition"
                    >
                      <option value="image">Изображение</option>
                      <option value="video">Видео</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">Порядок показа</label>
                    <input
                      type="number"
                      min={0}
                      value={createForm.sort_order}
                      onChange={(e) => setCreateForm((f) => ({ ...f, sort_order: parseInt(e.target.value, 10) || 0 }))}
                      className="w-full rounded-lg border border-[#4a5058] bg-[#292d32] px-3 py-2.5 text-gray-100 focus:border-[#ff7d24] focus:ring-1 focus:ring-[#ff7d24] outline-none transition"
                    />
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-200 mb-2">Файл слайда <span className="text-[#ff7d24]">*</span></label>
                  <div className="flex flex-wrap items-center gap-3">
                    <input
                      type="text"
                      required
                      value={createForm.src}
                      onChange={(e) => setCreateForm((f) => ({ ...f, src: e.target.value }))}
                      placeholder={createForm.type === "image" ? "Путь или загрузите файл" : "Путь к видео или загрузите файл"}
                      className="flex-1 min-w-[160px] rounded-lg border border-[#4a5058] bg-[#292d32] px-3 py-2.5 text-gray-100 placeholder-gray-500 focus:border-[#ff7d24] focus:ring-1 focus:ring-[#ff7d24] outline-none transition"
                    />
                    <label className="shrink-0 inline-flex items-center gap-2 rounded-lg border border-[#4a5058] bg-[#292d32] px-4 py-2.5 text-sm text-gray-300 hover:bg-[#32363c] cursor-pointer transition">
                      <input type="file" accept={createForm.type === "image" ? "image/jpeg,image/png,image/gif,image/webp,image/avif" : "video/mp4,video/webm,video/quicktime"} onChange={handleUploadCreateSrc} disabled={!!uploading} className="sr-only" />
                      {uploading === "create-src" ? "Загрузка…" : "Выбрать файл"}
                    </label>
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-200 mb-2">Подпись (для доступности) <span className="text-[#ff7d24]">*</span></label>
                  <input
                    type="text"
                    required
                    value={createForm.alt}
                    onChange={(e) => setCreateForm((f) => ({ ...f, alt: e.target.value }))}
                    placeholder="Краткое описание слайда"
                    className="w-full rounded-lg border border-[#4a5058] bg-[#292d32] px-3 py-2.5 text-gray-100 placeholder-gray-500 focus:border-[#ff7d24] focus:ring-1 focus:ring-[#ff7d24] outline-none transition"
                  />
                </div>
                {createForm.type === "video" && (
                  <>
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-200 mb-2">Постер (превью видео) <span className="text-[#ff7d24]">*</span></label>
                      <div className="flex flex-wrap items-center gap-3">
                        <input
                          type="text"
                          value={createForm.poster ?? ""}
                          onChange={(e) => setCreateForm((f) => ({ ...f, poster: e.target.value || null }))}
                          placeholder="Заставка или загрузите файл"
                          className="flex-1 min-w-[160px] rounded-lg border border-[#4a5058] bg-[#292d32] px-3 py-2.5 text-gray-100 placeholder-gray-500 focus:border-[#ff7d24] focus:ring-1 focus:ring-[#ff7d24] outline-none transition"
                        />
                        <label className="shrink-0 inline-flex items-center gap-2 rounded-lg border border-[#4a5058] bg-[#292d32] px-4 py-2.5 text-sm text-gray-300 hover:bg-[#32363c] cursor-pointer transition">
                          <input type="file" accept="image/jpeg,image/png,image/gif,image/webp,image/avif" onChange={handleUploadCreatePoster} disabled={!!uploading} className="sr-only" />
                          {uploading === "create-poster" ? "Загрузка…" : "Постер"}
                        </label>
                      </div>
                    </div>
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-200 mb-2">Источники видео (JSON)</label>
                      <textarea
                        value={createSourcesRaw}
                        onChange={(e) => setCreateSourcesRaw(e.target.value)}
                        placeholder='[{"src":"/media/a.webm","type":"video/webm"},...]'
                        rows={2}
                        className="w-full rounded-lg border border-[#4a5058] bg-[#292d32] px-3 py-2 text-gray-100 font-mono text-sm placeholder-gray-500 focus:border-[#ff7d24] focus:ring-1 focus:ring-[#ff7d24] outline-none transition"
                      />
                    </div>
                  </>
                )}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={createForm.is_active} onChange={(e) => setCreateForm((f) => ({ ...f, is_active: e.target.checked }))} className="rounded border-gray-500 text-[#ff7d24] focus:ring-[#ff7d24]" />
                    <span className="text-sm text-gray-300">Показывать на сайте</span>
                  </label>
                  <button type="submit" disabled={submitLoading} className="rounded-lg bg-[#ff7d24] px-5 py-2.5 text-white font-medium hover:bg-[#e66e1a] disabled:opacity-60 transition focus:ring-2 focus:ring-[#ff7d24] focus:ring-offset-2 focus:ring-offset-[#31353b]">
                    {submitLoading ? "Сохранение…" : "Создать слайд"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Модальное окно: Редактировать слайд */}
        {editingId != null && editForm && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-modal-title"
            onClick={(e) => e.target === e.currentTarget && cancelEdit()}
          >
            <div className="bg-[#3a3f46] border border-[#4a5058] rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-[#4a5058] bg-[#343940]">
                <h2 id="edit-modal-title" className="text-lg font-semibold text-white">
                  Редактирование слайда #{editingId}
                </h2>
                <button type="button" onClick={cancelEdit} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#4a5058] transition" aria-label="Закрыть">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <form onSubmit={handleEditSubmit} className="p-6 space-y-4 text-gray-300">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-1">Тип слайда</label>
                    <select value={editForm.type} onChange={(e) => setEditForm((f) => f ? { ...f, type: e.target.value as "image" | "video" } : f)} className="w-full rounded-lg border border-[#4a5058] bg-[#292d32] px-3 py-2.5 text-gray-100 focus:border-[#ff7d24] focus:ring-1 focus:ring-[#ff7d24] outline-none transition">
                      <option value="image">Изображение</option>
                      <option value="video">Видео</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-1">Порядок показа</label>
                    <input type="number" value={editForm.sort_order} onChange={(e) => setEditForm((f) => f ? { ...f, sort_order: parseInt(e.target.value, 10) || 0 } : f)} className="w-full rounded-lg border border-[#4a5058] bg-[#292d32] px-3 py-2.5 text-gray-100 focus:border-[#ff7d24] focus:ring-1 focus:ring-[#ff7d24] outline-none transition" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-1">Файл слайда <span className="text-[#ff7d24]">*</span></label>
                  <div className="flex flex-wrap items-center gap-3">
                    <input type="text" required value={editForm.src} onChange={(e) => setEditForm((f) => f ? { ...f, src: e.target.value } : f)} className="flex-1 min-w-[160px] rounded-lg border border-[#4a5058] bg-[#292d32] px-3 py-2.5 text-gray-100 focus:border-[#ff7d24] focus:ring-1 focus:ring-[#ff7d24] outline-none transition" />
                    <label className="shrink-0 inline-flex items-center gap-2 rounded-lg border border-[#4a5058] bg-[#292d32] px-4 py-2.5 text-sm text-gray-300 hover:bg-[#32363c] cursor-pointer transition">
                      <input type="file" accept={editForm.type === "image" ? "image/jpeg,image/png,image/gif,image/webp,image/avif" : "video/mp4,video/webm,video/quicktime"} onChange={handleUploadEditSrc} disabled={!!uploading} className="sr-only" />
                      {uploading === "edit-src" ? "Загрузка…" : "Файл"}
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-1">Подпись (для доступности) <span className="text-[#ff7d24]">*</span></label>
                  <input type="text" required value={editForm.alt} onChange={(e) => setEditForm((f) => f ? { ...f, alt: e.target.value } : f)} className="w-full rounded-lg border border-[#4a5058] bg-[#292d32] px-3 py-2.5 text-gray-100 focus:border-[#ff7d24] focus:ring-1 focus:ring-[#ff7d24] outline-none transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-1">Постер {editForm.type === "video" ? <span className="text-[#ff7d24]">*</span> : ""}</label>
                  <div className="flex flex-wrap items-center gap-3">
                    <input type="text" value={editForm.poster ?? ""} onChange={(e) => setEditForm((f) => f ? { ...f, poster: e.target.value || null } : f)} className="flex-1 min-w-[160px] rounded-lg border border-[#4a5058] bg-[#292d32] px-3 py-2.5 text-gray-100 focus:border-[#ff7d24] focus:ring-1 focus:ring-[#ff7d24] outline-none transition" />
                    {editForm.type === "video" && (
                      <label className="shrink-0 inline-flex items-center gap-2 rounded-lg border border-[#4a5058] bg-[#292d32] px-4 py-2.5 text-sm text-gray-300 hover:bg-[#32363c] cursor-pointer transition">
                        <input type="file" accept="image/jpeg,image/png,image/gif,image/webp,image/avif" onChange={handleUploadEditPoster} disabled={!!uploading} className="sr-only" />
                        {uploading === "edit-poster" ? "Загрузка…" : "Постер"}
                      </label>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-1">Источники видео (JSON)</label>
                  <textarea value={editSourcesRaw} onChange={(e) => setEditSourcesRaw(e.target.value)} rows={2} className="w-full rounded-lg border border-[#4a5058] bg-[#292d32] px-3 py-2 text-gray-100 font-mono text-sm focus:border-[#ff7d24] focus:ring-1 focus:ring-[#ff7d24] outline-none transition" />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="edit-is_active" checked={editForm.is_active} onChange={(e) => setEditForm((f) => f ? { ...f, is_active: e.target.checked } : f)} className="rounded border-gray-500 text-[#ff7d24] focus:ring-[#ff7d24]" />
                  <label htmlFor="edit-is_active" className="text-sm text-gray-300">Показывать на сайте</label>
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="submit" disabled={submitLoading} className="rounded-lg bg-[#ff7d24] px-4 py-2.5 text-white font-medium hover:bg-[#e66e1a] disabled:opacity-60 transition focus:ring-2 focus:ring-[#ff7d24] focus:ring-offset-2 focus:ring-offset-[#31353b]">
                    {submitLoading ? "Сохранение…" : "Сохранить"}
                  </button>
                  <button type="button" onClick={cancelEdit} className="rounded-lg border border-[#5a6068] px-4 py-2.5 text-gray-300 hover:bg-[#3a3f46] transition">
                    Отмена
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

