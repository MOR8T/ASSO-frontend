"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getFooterVideo,
  putFooterVideo,
  AUTH_REQUIRED,
  type FooterVideoAdmin,
} from "@/api/footer";
import { uploadFile } from "@/api/files";
import { parseYouTubeId } from "../utils";

export type VideoSectionProps = {
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
  onClearMessages: () => void;
};

const inputClass =
  "px-3 py-2 rounded-lg bg-[#2a2e33] border border-[#53565B] text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#ff7d24]";
const buttonPrimaryClass =
  "px-4 py-2 rounded-lg bg-[#ff7d24] text-white font-medium hover:bg-[#e66f1a] disabled:opacity-50 disabled:cursor-not-allowed";

export function VideoSection({
  onError,
  onSuccess,
  onClearMessages,
}: VideoSectionProps) {
  const router = useRouter();
  const [config, setConfig] = useState<FooterVideoAdmin | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"external" | "uploaded">("external");
  const [externalUrl, setExternalUrl] = useState("");
  const [label, setLabel] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbFile, setThumbFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const v = await getFooterVideo();
      setConfig(v);
      if (v) {
        setMode(v.mode);
        setLabel(v.label ?? "");
        if (v.mode === "external" && v.external_video_id) {
          setExternalUrl(`https://www.youtube.com/watch?v=${v.external_video_id}`);
        }
      }
    } catch (e) {
      if ((e as Error).message === AUTH_REQUIRED) {
        router.replace("/login");
        return;
      }
      onError((e as Error).message);
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
    setSaving(true);
    try {
      let video_path: string | null = null;
      let thumbnail_path: string | null = null;
      let external_video_id: string | null = null;

      if (mode === "uploaded") {
        if (videoFile) {
          const res = await uploadFile(videoFile);
          video_path = res.path;
        } else if (config?.mode === "uploaded" && config?.video_path) {
          video_path = config.video_path;
        } else {
          onError("Выберите видеофайл");
          setSaving(false);
          return;
        }
        if (thumbFile) {
          const res = await uploadFile(thumbFile);
          thumbnail_path = res.path;
        } else if (config?.thumbnail_path) {
          thumbnail_path = config.thumbnail_path;
        }
      } else {
        const id = parseYouTubeId(externalUrl);
        if (!id) {
          onError("Введите ссылку на YouTube (youtube.com/watch?v=… или youtu.be/…)");
          setSaving(false);
          return;
        }
        external_video_id = id;
        if (thumbFile) {
          const res = await uploadFile(thumbFile);
          thumbnail_path = res.path;
        } else if (config?.thumbnail_path) {
          thumbnail_path = config.thumbnail_path;
        }
      }

      await putFooterVideo({
        mode,
        external_video_id: mode === "external" ? external_video_id : null,
        video_path: mode === "uploaded" ? video_path : null,
        thumbnail_path: thumbnail_path || null,
        label: label.trim() || null,
      });
      onSuccess("Видео сохранено");
      setVideoFile(null);
      setThumbFile(null);
      await load();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Ошибка сохранения видео");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-xl bg-[#3f444b] p-6 text-gray-300 mb-6">
      <h2 className="text-lg font-medium text-gray-100 mb-4">Промо-видео</h2>

      {loading ? (
        <p className="text-gray-500">Загрузка...</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
          <div>
            <span className="block text-sm text-gray-400 mb-2">Источник</span>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="videoMode"
                  checked={mode === "external"}
                  onChange={() => setMode("external")}
                  className="text-[#ff7d24]"
                />
                <span>Ссылка (YouTube)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="videoMode"
                  checked={mode === "uploaded"}
                  onChange={() => setMode("uploaded")}
                  className="text-[#ff7d24]"
                />
                <span>Загруженное видео</span>
              </label>
            </div>
          </div>

          {mode === "external" ? (
            <div>
              <label className="block text-sm text-gray-400 mb-1">URL видео (YouTube)</label>
              <input
                type="url"
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className={`w-full ${inputClass}`}
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm text-gray-400 mb-1">Видеофайл</label>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-gray-400 file:mr-2 file:py-2 file:px-3 file:rounded file:border-0 file:bg-[#53565B] file:text-gray-200"
              />
              {config?.mode === "uploaded" && config.video_path && !videoFile && (
                <p className="mt-1 text-xs text-gray-500">Текущий файл: {config.video_path}</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-400 mb-1">Превью (постер, необязательно)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setThumbFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-gray-400 file:mr-2 file:py-2 file:px-3 file:rounded file:border-0 file:bg-[#53565B] file:text-gray-200"
            />
            {config?.thumbnail_path && !thumbFile && (
              <p className="mt-1 text-xs text-gray-500">Текущее: {config.thumbnail_path}</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Подпись</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="ПРОМО РОЛИК"
              className={`w-full ${inputClass}`}
            />
          </div>

          <button type="submit" disabled={saving} className={buttonPrimaryClass}>
            {saving ? "Сохранение…" : "Сохранить видео"}
          </button>
        </form>
      )}
    </section>
  );
}
