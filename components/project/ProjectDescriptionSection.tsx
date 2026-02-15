"use client";

import type { ProjectDescriptionSection as SectionType } from "@/lib/project-page.types";
import "@/styles/project-page.css";

type ProjectDescriptionSectionProps = {
  section: SectionType;
};

export default function ProjectDescriptionSection({
  section,
}: ProjectDescriptionSectionProps) {
  const paragraphs = section.description.split(/\n\n+/).filter(Boolean);

  return (
    <section className="condensed-text project-section-dark text-white w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          <div className="lg:col-span-9">
            <div className="space-y-4 text-justify text-[#DBDBDB] text-base leading-relaxed tracking-wider">
              {paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
          <div className="lg:col-span-3">
            <dl className="space-y-4 text-right">
              {section.characteristics.map(({ key, value }) => (
                <div key={key} className="pb-1">
                  <dt className="text-orange text-base uppercase tracking-wider">
                    {key}:
                  </dt>
                  <dd className="text-white text-base uppercase">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
