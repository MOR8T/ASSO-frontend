"use client";

import { useState } from "react";
import type { BlockCta as BlockCtaType } from "@/lib/project-page.types";
import "@/styles/project-page.css";

type BlockCtaProps = {
  data: BlockCtaType["data"];
};

export default function BlockCta({ data }: BlockCtaProps) {
  const { text, downloadUrl, fileName } = data;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!downloadUrl) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(downloadUrl, { mode: "cors" });
      if (!res.ok) throw new Error(`Ошибка загрузки: ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download =
        fileName ??
        new URL(downloadUrl).pathname.split("/").pop() ??
        "download";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось скачать файл");
    } finally {
      setIsLoading(false);
    }
  };

  const buttonClass =
    "inline-flex items-center gap-3 px-1 py-1 border-2 border-[#e85d04] text-white font-medium uppercase tracking-wide hover:bg-[#e85d04]/10 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#e85d04] focus:ring-offset-2 focus:ring-offset-[#292d32] disabled:opacity-60 disabled:cursor-not-allowed";

  return (
    <section className="condensed-text project-section-dark text-white w-full">
      <div className="max-w-7xl mx-auto px-4 text-base sm:px-6 lg:px-8 py-2 md:py-4 flex flex-col gap-2 items-start">
        <button
          type="button"
          onClick={handleDownload}
          disabled={isLoading}
          className={buttonClass}
        >
          {isLoading ? (
            <>
              <svg
                className="w-5 h-5 shrink-0 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeDasharray="32"
                  strokeDashoffset="12"
                />
              </svg>
              Загрузка…
            </>
          ) : (
            <>
              <svg
                width="20"
                height="20"
                viewBox="0 0 6 8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1.4259 0V3.7688H0L2.8517 7.53784L5.7033 3.7688H4.2775V0H1.4259Z"
                  fill="#FF7700"
                />
              </svg>
              {text}
            </>
          )}
        </button>
        {error && (
          <p className="text-sm text-red-400" role="alert">
            {error}
          </p>
        )}
      </div>
    </section>
  );
}
