"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  listIntroBlocks,
  createIntroBlock,
  updateIntroBlock,
  deleteIntroBlock,
  AUTH_REQUIRED,
  type AboutIntroBlockAdmin,
} from "@/api/about";
import { inputClass, inputSmClass, buttonPrimaryClass, sectionClass, STYLE_VARIANTS } from "../constants";

export type IntroSectionProps = {
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
  onClearMessages: () => void;
};

export function IntroSection({ onError, onSuccess, onClearMessages }: IntroSectionProps) {
  const router = useRouter();
  const [blocks, setBlocks] = useState<AboutIntroBlockAdmin[]>([]);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [styleVariant, setStyleVariant] = useState<string>("default");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [editSortOrder, setEditSortOrder] = useState(0);
  const [editStyleVariant, setEditStyleVariant] = useState<string>("default");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await listIntroBlocks();
      setBlocks(list);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Ошибка загрузки блоков";
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
    const trimmed = text.trim();
    if (!trimmed) {
      onError("Введите текст блока");
      return;
    }
    setSubmitLoading(true);
    try {
      await createIntroBlock({
        text: trimmed,
        sort_order: sortOrder,
        style_variant: styleVariant,
      });
      onSuccess("Блок добавлен");
      setText("");
      setSortOrder(blocks.length > 0 ? Math.max(...blocks.map((b) => b.sort_order), 0) + 1 : 0);
      await load();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Ошибка добавления блока");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    onClearMessages();
    setDeletingId(id);
    try {
      await deleteIntroBlock(id);
      onSuccess("Блок удалён");
      await load();
      if (editingId === id) setEditingId(null);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Ошибка удаления");
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
    onClearMessages();
    const trimmed = editText.trim();
    if (!trimmed) {
      onError("Текст не может быть пустым");
      return;
    }
    try {
      await updateIntroBlock(id, {
        text: trimmed,
        sort_order: editSortOrder,
        style_variant: editStyleVariant,
      });
      onSuccess("Блок обновлён");
      setEditingId(null);
      await load();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Ошибка обновления блока");
    }
  };

  return (
    <section className={sectionClass}>
      <h2 className="text-lg font-medium text-gray-100 mb-4">Описание компании</h2>

      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
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

      {loading ? (
        <p className="text-gray-500">Загрузка списка...</p>
      ) : blocks.length === 0 ? (
        <p className="text-gray-500">Блоков пока нет. Добавьте первый.</p>
      ) : (
        <ul className="space-y-4">
          {blocks
            .slice()
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((b) => (
              <li key={b.id} className="py-3 border-b border-[#53565B] last:border-0">
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
                        onChange={(e) => setEditSortOrder(Number(e.target.value) || 0)}
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
                      <p className="text-gray-100 whitespace-pre-wrap">{b.text}</p>
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
  );
}
