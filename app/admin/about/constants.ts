/** Общие стили и константы для админки «О нас» */

export const inputClass =
  "px-3 py-2 rounded-lg bg-[#2a2e33] border border-[#53565B] text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#ff7d24]";

export const inputSmClass =
  "px-2 py-1.5 rounded bg-[#2a2e33] border border-[#53565B] text-gray-100 text-sm";

export const buttonPrimaryClass =
  "px-4 py-2 rounded-lg bg-[#ff7d24] text-white font-medium hover:bg-[#e66f1a] disabled:opacity-50 disabled:cursor-not-allowed";

export const sectionClass = "rounded-xl bg-[#3f444b] p-6 text-gray-300 mb-6";

export const STYLE_VARIANTS = [
  { value: "default", label: "Обычный" },
  { value: "lead", label: "Подзаголовок" },
] as const;

export const IMAGE_ACCEPT = "image/jpeg,image/png,image/gif,image/webp,image/avif";
