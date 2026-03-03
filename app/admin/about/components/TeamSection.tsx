"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  listTeamMembers,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
  AUTH_REQUIRED,
  type AboutTeamMemberAdmin,
} from "@/api/about";
import { uploadFile } from "@/api/files";
import { inputClass, inputSmClass, buttonPrimaryClass, sectionClass, IMAGE_ACCEPT } from "../constants";
import { teamPhotoUrl } from "../utils";

export type TeamSectionProps = {
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
  onClearMessages: () => void;
};

export function TeamSection({ onError, onSuccess, onClearMessages }: TeamSectionProps) {
  const router = useRouter();
  const [team, setTeam] = useState<AboutTeamMemberAdmin[]>([]);
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [jobtitle, setJobtitle] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editFullName, setEditFullName] = useState("");
  const [editJobtitle, setEditJobtitle] = useState("");
  const [editPhotoFile, setEditPhotoFile] = useState<File | null>(null);
  const [editSortOrder, setEditSortOrder] = useState(0);
  const [editIsActive, setEditIsActive] = useState(true);
  const [editUploading, setEditUploading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await listTeamMembers();
      setTeam(list);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Ошибка загрузки сотрудников";
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
    const nameTrimmed = fullName.trim();
    const jobTrimmed = jobtitle.trim();
    if (!nameTrimmed) {
      onError("Введите ФИО");
      return;
    }
    if (!jobTrimmed) {
      onError("Введите должность");
      return;
    }
    let photo_path: string | null = null;
    if (photoFile) {
      setUploading(true);
      try {
        const result = await uploadFile(photoFile);
        photo_path = result.path;
      } catch (err) {
        onError(err instanceof Error ? err.message : "Ошибка загрузки фото");
        setUploading(false);
        return;
      }
      setUploading(false);
    }
    setSubmitLoading(true);
    try {
      await createTeamMember({
        full_name: nameTrimmed,
        jobtitle: jobTrimmed,
        photo_path,
        sort_order: sortOrder,
        is_active: isActive,
      });
      onSuccess("Сотрудник добавлен");
      setFullName("");
      setJobtitle("");
      setPhotoFile(null);
      setSortOrder(team.length > 0 ? Math.max(...team.map((m) => m.sort_order), 0) + 1 : 0);
      const input = document.getElementById("team-photo-input");
      if (input instanceof HTMLInputElement) input.value = "";
      await load();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Ошибка добавления сотрудника");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    onClearMessages();
    setDeletingId(id);
    try {
      await deleteTeamMember(id);
      onSuccess("Сотрудник удалён");
      await load();
      if (editingId === id) setEditingId(null);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Ошибка удаления");
    } finally {
      setDeletingId(null);
    }
  };

  const handleStartEdit = (m: AboutTeamMemberAdmin) => {
    setEditingId(m.id);
    setEditFullName(m.full_name);
    setEditJobtitle(m.jobtitle);
    setEditPhotoFile(null);
    setEditSortOrder(m.sort_order);
    setEditIsActive(m.is_active);
    const input = document.getElementById(`team-edit-photo-${m.id}`);
    if (input instanceof HTMLInputElement) input.value = "";
  };

  const handleSaveEdit = async (id: number) => {
    onClearMessages();
    const nameTrimmed = editFullName.trim();
    const jobTrimmed = editJobtitle.trim();
    if (!nameTrimmed) {
      onError("Введите ФИО");
      return;
    }
    if (!jobTrimmed) {
      onError("Введите должность");
      return;
    }
    let photo_path: string | null | undefined = undefined;
    if (editPhotoFile) {
      setEditUploading(true);
      try {
        const result = await uploadFile(editPhotoFile);
        photo_path = result.path;
      } catch (err) {
        onError(err instanceof Error ? err.message : "Ошибка загрузки фото");
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
        sort_order: editSortOrder,
        is_active: editIsActive,
      });
      onSuccess("Сотрудник обновлён");
      setEditingId(null);
      await load();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Ошибка обновления сотрудника");
    }
  };

  return (
    <section className={sectionClass}>
      <h2 className="text-lg font-medium text-gray-100 mb-4">Наша команда</h2>

      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
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
                accept={IMAGE_ACCEPT}
                onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
                className="sr-only"
              />
              <label
                htmlFor="team-photo-input"
                className={`px-3 py-2 rounded-lg border border-[#53565B] text-sm cursor-pointer hover:bg-[#2a2e33] ${uploading ? "opacity-50 pointer-events-none" : ""}`}
              >
                {uploading ? "Загрузка…" : photoFile ? photoFile.name : "Выбрать файл"}
              </label>
            </div>
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
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="team-is-active"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded border-[#53565B]"
            />
            <label htmlFor="team-is-active" className="text-sm">
              Показывать на сайте
            </label>
          </div>
        </div>
        <button
          type="submit"
          disabled={submitLoading || uploading}
          className={buttonPrimaryClass}
        >
          {uploading ? "Загрузка фото…" : submitLoading ? "Добавление…" : "Добавить сотрудника"}
        </button>
      </form>

      {loading ? (
        <p className="text-gray-500">Загрузка списка...</p>
      ) : team.length === 0 ? (
        <p className="text-gray-500">Сотрудников пока нет. Добавьте первого.</p>
      ) : (
        <ul className="space-y-4">
          {team
            .slice()
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((m) => (
              <li key={m.id} className="py-3 border-b border-[#53565B] last:border-0">
                {editingId === m.id ? (
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
                          accept={IMAGE_ACCEPT}
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
                        value={editSortOrder}
                        onChange={(e) => setEditSortOrder(Number(e.target.value) || 0)}
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
                        onClick={() => handleSaveEdit(m.id)}
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
                        onClick={() => handleStartEdit(m)}
                        className="text-sm text-[#ff7d24] hover:underline"
                      >
                        Изменить
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(m.id)}
                        disabled={deletingId === m.id}
                        className="px-3 py-1 rounded text-sm bg-red-900/50 text-red-200 hover:bg-red-900/70 disabled:opacity-50"
                      >
                        {deletingId === m.id ? "Удаление…" : "Удалить"}
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
        </ul>
      )}
    </section>
  );
}
