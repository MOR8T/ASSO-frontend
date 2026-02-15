"use client";

import type { BlockDescription as BlockDescriptionType } from "@/lib/project-page.types";
import "@/styles/project-page.css";

type BlockDescriptionProps = {
  data: BlockDescriptionType["data"];
};

export default function BlockDescription({ data }: BlockDescriptionProps) {
  const paragraphs = data.content.split(/\n\n+/).filter(Boolean);

  return (
    <section className="condensed-text project-section-dark text-white w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-6">
        <div className="text-justify text-base tracking-wider space-y-4 text-[#DBDBDB] leading-relaxed">
          {paragraphs.map((p, i) => (
            <p className="text-justify" key={i}>
              {p}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
