"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStoredAccessToken, me } from "@/api/login";
import {
  listIntroBlocks,
  createIntroBlock,
  updateIntroBlock,
  deleteIntroBlock,
  listTeamMembers,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
  AUTH_REQUIRED,
  type AboutIntroBlockAdmin,
  type AboutTeamMemberAdmin,
} from "@/api/about";
import { uploadFile } from "@/api/files";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
function teamPhotoUrl(path: string | null): string {
  if (!path?.trim()) return "";
  const base = API_BASE.replace(/\/$/, "");
  return path.startsWith("http") ? path : path.startsWith("/") ? `${base}${path}` : `${base}/media/${path}`;
}

const inputClass =
  "px-3 py-2 rounded-lg bg-[#2a2e33] border border-[#53565B] text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#ff7d24]";
const inputSmClass =
  "px-2 py-1.5 rounded bg-[#2a2e33] border border-[#53565B] text-gray-100 text-sm";
const buttonPrimaryClass =
  "px-4 py-2 rounded-lg bg-[#ff7d24] text-white font-medium hover:bg-[#e66f1a] disabled:opacity-50 disabled:cursor-not-allowed";

const STYLE_VARIANTS = [
  { value: "default", label: "Обычный" },
  { value: "lead", label: "Подзаголовок" },
] as const;

export default function AdminAboutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [blocks, setBlocks] = useState<AboutIntroBlockAdmin[]>([]);
  const [blocksLoading, setBlocksLoading] = useState(false);
  const [text, setText] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [styleVariant, setStyleVariant] = useState<string>("default");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [editSortOrder, setEditSortOrder] = useState(0);
  const [editStyleVariant, setEditStyleVariant] = useState<string>("default");

  const [team, setTeam] = useState<AboutTeamMemberAdmin[]>([]);
  const [teamLoading, setTeamLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [jobtitle, setJobtitle] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [teamSortOrder, setTeamSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [teamSubmitLoading, setTeamSubmitLoading] = useState(false);
  const [teamUploading, setTeamUploading] = useState(false);
  const [teamDeletingId, setTeamDeletingId] = useState<number | null>(null);
  const [teamEditingId, setTeamEditingId] = useState<number | null>(null);
  const [editFullName, setEditFullName] = useState("");
  const [editJobtitle, setEditJobtitle] = useState("");
  const [editPhotoFile, setEditPhotoFile] = useState<File | null>(null);
  const [editSortOrderTeam, setEditSortOrderTeam] = useState(0);
  const [editIsActive, setEditIsActive] = useState(true);
  const [editUploading, setEditUploading] = useState(false);

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

  const loadBlocks = useCallback(async () => {
    setBlocksLoading(true);
    try {
      const list = await listIntroBlocks();
      setBlocks(list);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Ошибка загрузки блоков";
      if (msg === AUTH_REQUIRED) {
        router.replace("/login");
        return;
      }
      setError(msg);
    } finally {
      setBlocksLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (!loading) loadBlocks();
  }, [loading, loadBlocks]);

  const loadTeam = useCallback(async () => {
    setTeamLoading(true);
    try {
      const list = await listTeamMembers();
      setTeam(list);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Ошибка загрузки сотрудников";
      if (msg === AUTH_REQUIRED) {
        router.replace("/login");
        return;
      }
      setError(msg);
    } finally {
      setTeamLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (!loading) loadTeam();
  }, [loading, loadTeam]);

  const clearMessages = () => {
    setError(null);
    setSuccessMessage(null);
  };

  const handleAddBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    const trimmed = text.trim();
    if (!trimmed) {
      setError("Введите текст блока");
      return;
    }
    setSubmitLoading(true);
    try {
      await createIntroBlock({
        text: trimmed,
        sort_order: sortOrder,
        style_variant: styleVariant,
      });
      setSuccessMessage("Блок добавлен");
      setText("");
      setSortOrder(blocks.length > 0 ? Math.max(...blocks.map((b) => b.sort_order), 0) + 1 : 0);
      await loadBlocks();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка добавления блока");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    clearMessages();
    setDeletingId(id);
    try {
      await deleteIntroBlock(id);
      setSuccessMessage("Блок удалён");
      await loadBlocks();
      if (editingId === id) setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка удаления");
    } finally {
      setDeletingId(null);
    }
  };

  const handleStartEdit = (b: AboutIntroBlockAdmin) => {
    setEditingId(b.id);
    setEditText(b.text);
    setEditSortOrder(b.sort_order);
    setEditStyleVariant(b.style_variant || "default");
  };

  const handleSaveEdit = async (id: number) => {
    clearMessages();
    const trimmed = editText.trim();
    if (!trimmed) {
      setError("Текст не может быть пустым");
      return;
    }
    try {
      await updateIntroBlock(id, {
        text: trimmed,
        sort_order: editSortOrder,
        style_variant: editStyleVariant,
      });
      setSuccessMessage("Блок обновлён");
      setEditingId(null);
      await loadBlocks();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка обновления блока");
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    const nameTrimmed = fullName.trim();
    const jobTrimmed = jobtitle.trim();
    if (!nameTrimmed) {
      setError("Введите ФИО");
      return;
    }
    if (!jobTrimmed) {
      setError("Введите должность");
      return;
    }
    let photo_path: string | null = null;
    if (photoFile) {
      setTeamUploading(true);
      try {
        const result = await uploadFile(photoFile);
        photo_path = result.path;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ошибка загрузки фото");
        setTeamUploading(false);
        return;
      }
      setTeamUploading(false);
    }
    setTeamSubmitLoading(true);
    try {
      await createTeamMember({
        full_name: nameTrimmed,
        jobtitle: jobTrimmed,
        photo_path,
        sort_order: teamSortOrder,
        is_active: isActive,
      });
      setSuccessMessage("Сотрудник добавлен");
      setFullName("");
      setJobtitle("");
      setPhotoFile(null);
      setTeamSortOrder(team.length > 0 ? Math.max(...team.map((m) => m.sort_order), 0) + 1 : 0);
      const input = document.getElementById("team-photo-input");
      if (input instanceof HTMLInputElement) input.value = "";
      await loadTeam();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка добавления сотрудника");
    } finally {
      setTeamSubmitLoading(false);
    }
  };

  const handleDeleteMember = async (id: number) => {
    clearMessages();
    setTeamDeletingId(id);
    try {
      await deleteTeamMember(id);
      setSuccessMessage("Сотрудник удалён");
      await loadTeam();
      if (teamEditingId === id) setTeamEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка удаления");
    } finally {
      setTeamDeletingId(null);
    }
  };

  const handleStartEditMember = (m: AboutTeamMemberAdmin) => {
    setTeamEditingId(m.id);
    setEditFullName(m.full_name);
    setEditJobtitle(m.jobtitle);
    setEditPhotoFile(null);
    setEditSortOrderTeam(m.sort_order);
    setEditIsActive(m.is_active);
    const input = document.getElementById(`team-edit-photo-${m.id}`);
    if (input instanceof HTMLInputElement) input.value = "";
  };

  const handleSaveEditMember = async (id: number) => {
    clearMessages();
    const nameTrimmed = editFullName.trim();
    const jobTrimmed = editJobtitle.trim();
    if (!nameTrimmed) {
      setError("Введите ФИО");
      return;
    }
    if (!jobTrimmed) {
      setError("Введите должность");
      return;
    }
    let photo_path: string | null | undefined = undefined;
    if (editPhotoFile) {
      setEditUploading(true);
      try {
        const result = await uploadFile(editPhotoFile);
        photo_path = result.path;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ошибка загрузки фото");
        setEditUploading(false);
        return;
      }
      setEditUploading(false);
    }
    try {
      await updateTeamMember(id, {
        full_name: nameTrimmed,
        jobtitle: jobTrimmed,
        ...(photo_path !== undefined && { photo_path }),
        sort_order: editSortOrderTeam,
        is_active: editIsActive,
      });
      setSuccessMessage("Сотрудник обновлён");
      setTeamEditingId(null);
      await loadTeam();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка обновления сотрудника");
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

      {/* Подраздел: Описание компании */}
      <section className="rounded-xl bg-[#3f444b] p-6 text-gray-300 mb-6">
        <h2 className="text-lg font-medium text-gray-100 mb-4">
          Описание компании
        </h2>

        <form onSubmit={handleAddBlock} className="mb-6 space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Текст</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Текст абзаца..."
              rows={3}
              className={`w-full max-w-2xl ${inputClass}`}
            />
          </div>
          <div className="flex flex-wrap items-end gap-4">
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
            <div>
              <label className="block text-sm text-gray-400 mb-1">Стиль</label>
              <select
                value={styleVariant}
                onChange={(e) => setStyleVariant(e.target.value)}
                className={inputClass}
              >
                {STYLE_VARIANTS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={submitLoading}
              className={buttonPrimaryClass}
            >
              {submitLoading ? "Добавление…" : "Добавить блок"}
            </button>
          </div>
        </form>

        {blocksLoading ? (
          <p className="text-gray-500">Загрузка списка...</p>
        ) : blocks.length === 0 ? (
          <p className="text-gray-500">Блоков пока нет. Добавьте первый.</p>
        ) : (
          <ul className="space-y-4">
            {blocks
              .slice()
              .sort((a, b) => a.sort_order - b.sort_order)
              .map((b) => (
                <li
                  key={b.id}
                  className="py-3 border-b border-[#53565B] last:border-0"
                >
                  {editingId === b.id ? (
                    <div className="space-y-3">
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        placeholder="Текст"
                        rows={3}
                        className={`w-full max-w-2xl ${inputSmClass}`}
                      />
                      <div className="flex flex-wrap items-center gap-3">
                        <input
                          type="number"
                          min={0}
                          value={editSortOrder}
                          onChange={(e) =>
                            setEditSortOrder(Number(e.target.value) || 0)
                          }
                          className={`w-20 ${inputSmClass}`}
                        />
                        <select
                          value={editStyleVariant}
                          onChange={(e) => setEditStyleVariant(e.target.value)}
                          className={inputSmClass}
                        >
                          {STYLE_VARIANTS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(b.id)}
                          className="text-sm text-[#ff7d24] hover:underline"
                        >
                          Сохранить
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="text-sm text-gray-500 hover:underline"
                        >
                          Отмена
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-start gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="text-gray-100 whitespace-pre-wrap">
                          {b.text}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Порядок: {b.sort_order}, стиль: {b.style_variant}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(b)}
                          className="text-sm text-[#ff7d24] hover:underline"
                        >
                          Изменить
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(b.id)}
                          disabled={deletingId === b.id}
                          className="px-3 py-1 rounded text-sm bg-red-900/50 text-red-200 hover:bg-red-900/70 disabled:opacity-50"
                        >
                          {deletingId === b.id ? "Удаление…" : "Удалить"}
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
          </ul>
        )}
      </section>

      {/* Подраздел: Наша команда */}
      <section className="rounded-xl bg-[#3f444b] p-6 text-gray-300 mb-6">
        <h2 className="text-lg font-medium text-gray-100 mb-4">Наша команда</h2>

        <form onSubmit={handleAddMember} className="mb-6 space-y-4">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">ФИО</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Иванов Иван Иванович"
                className={`w-56 ${inputClass}`}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Должность</label>
              <input
                type="text"
                value={jobtitle}
                onChange={(e) => setJobtitle(e.target.value)}
                placeholder="Главный архитектор"
                className={`w-48 ${inputClass}`}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Фото</label>
              <div className="flex items-center gap-2">
                <input
                  id="team-photo-input"
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp,image/avif"
                  onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
                  className="sr-only"
                />
                <label
                  htmlFor="team-photo-input"
                  className={`px-3 py-2 rounded-lg border border-[#53565B] text-sm cursor-pointer hover:bg-[#2a2e33] ${teamUploading ? "opacity-50 pointer-events-none" : ""}`}
                >
                  {teamUploading ? "Загрузка…" : photoFile ? photoFile.name : "Выбрать файл"}
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Порядок</label>
              <input
                type="number"
                min={0}
                value={teamSortOrder}
                onChange={(e) => setTeamSortOrder(Number(e.target.value) || 0)}
                className={`w-20 ${inputClass}`}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="team-is-active"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded border-[#53565B]"
              />
              <label htmlFor="team-is-active" className="text-sm">Показывать на сайте</label>
            </div>
          </div>
          <button
            type="submit"
            disabled={teamSubmitLoading || teamUploading}
            className={buttonPrimaryClass}
          >
            {teamUploading ? "Загрузка фото…" : teamSubmitLoading ? "Добавление…" : "Добавить сотрудника"}
          </button>
        </form>

        {teamLoading ? (
          <p className="text-gray-500">Загрузка списка...</p>
        ) : team.length === 0 ? (
          <p className="text-gray-500">Сотрудников пока нет. Добавьте первого.</p>
        ) : (
          <ul className="space-y-4">
            {team
              .slice()
              .sort((a, b) => a.sort_order - b.sort_order)
              .map((m) => (
                <li
                  key={m.id}
                  className="py-3 border-b border-[#53565B] last:border-0"
                >
                  {teamEditingId === m.id ? (
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-end gap-3">
                        <input
                          type="text"
                          value={editFullName}
                          onChange={(e) => setEditFullName(e.target.value)}
                          placeholder="ФИО"
                          className={`w-52 ${inputSmClass}`}
                        />
                        <input
                          type="text"
                          value={editJobtitle}
                          onChange={(e) => setEditJobtitle(e.target.value)}
                          placeholder="Должность"
                          className={`w-44 ${inputSmClass}`}
                        />
                        <div className="flex items-center gap-2">
                          <input
                            id={`team-edit-photo-${m.id}`}
                            type="file"
                            accept="image/jpeg,image/png,image/gif,image/webp,image/avif"
                            onChange={(e) => setEditPhotoFile(e.target.files?.[0] ?? null)}
                            className="sr-only"
                          />
                          <label
                            htmlFor={`team-edit-photo-${m.id}`}
                            className={`text-sm cursor-pointer hover:underline ${editUploading ? "opacity-50 pointer-events-none" : ""}`}
                          >
                            {editUploading ? "Загрузка…" : editPhotoFile ? editPhotoFile.name : "Новое фото"}
                          </label>
                        </div>
                        <input
                          type="number"
                          min={0}
                          value={editSortOrderTeam}
                          onChange={(e) => setEditSortOrderTeam(Number(e.target.value) || 0)}
                          className={`w-16 ${inputSmClass}`}
                        />
                        <label className="flex items-center gap-1 text-sm">
                          <input
                            type="checkbox"
                            checked={editIsActive}
                            onChange={(e) => setEditIsActive(e.target.checked)}
                            className="rounded border-[#53565B]"
                          />
                          Показывать
                        </label>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleSaveEditMember(m.id)}
                          className="text-sm text-[#ff7d24] hover:underline"
                        >
                          Сохранить
                        </button>
                        <button
                          type="button"
                          onClick={() => setTeamEditingId(null)}
                          className="text-sm text-gray-500 hover:underline"
                        >
                          Отмена
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center gap-4">
                      {m.photo_path && (
                        <img
                          src={teamPhotoUrl(m.photo_path)}
                          alt=""
                          className="w-12 h-12 rounded object-cover bg-[#2a2e33]"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-100">{m.full_name}</p>
                        <p className="text-sm text-gray-500">{m.jobtitle}</p>
                        <p className="text-xs text-gray-500">
                          Порядок: {m.sort_order} {!m.is_active && "· Скрыт"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleStartEditMember(m)}
                          className="text-sm text-[#ff7d24] hover:underline"
                        >
                          Изменить
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteMember(m.id)}
                          disabled={teamDeletingId === m.id}
                          className="px-3 py-1 rounded text-sm bg-red-900/50 text-red-200 hover:bg-red-900/70 disabled:opacity-50"
                        >
                          {teamDeletingId === m.id ? "Удаление…" : "Удалить"}
                        </button>
                      </div>
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
