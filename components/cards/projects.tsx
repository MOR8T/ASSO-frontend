"use client";

import { useState } from "react";
import Link from "next/link";
import "@/styles/cards.css";
import ProjectGalleryModal from "@/components/modals/ProjectGalleryModal";

export type ProjectItem = {
  id: number;
  title: string;
  description: string;
  icon: { src: string };
  href?: string;
};

type ProjectsProps = {
  projectsDataSource?: ProjectItem[];
};

export default function Projects({ projectsDataSource = [] }: ProjectsProps) {
  const [modalIndex, setModalIndex] = useState<number | null>(null);

  // const openModal = (index: number) => setModalIndex(index);
  const closeModal = () => setModalIndex(null);

  if (!projectsDataSource.length) {
    return (
      <div className="max-w-7xl mx-auto py-16 text-center">
        <p className="text-[#DBDBDB] text-lg uppercase font-stretch-condensed">
          Данные отсутствуют
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-x-16 gap-y-16 max-w-7xl mx-auto">
        {projectsDataSource.map((project) => {
          const content = (
            <div className="card-hover group">
              <div className="relative w-full h-[450px] overflow-hidden">
                <div
                  className="card-hover-image absolute inset-0 w-full h-full"
                  style={{
                    backgroundImage: `url(${project.icon.src})`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                    backgroundSize: "cover",
                  }}
                />
                <div
                  className="card-hover-image-fon absolute inset-0 bg-black/50"
                  aria-hidden
                />
                <div className="card-content absolute bottom-0 left-0 right-0 p-5 pr-6 pb-5 z-10 flex flex-col gap-0.5">
                  <h4 className="text-[#DBDBDB] text-[28px] uppercase leading-[38px] font-stretch-condensed font-medium">
                    {project.title}
                  </h4>
                  <p className="text-[#DBDBDB] font-extralight text-[15px] uppercase font-stretch-condensed tracking-wide">
                    {project.description}
                  </p>
                </div>
              </div>
            </div>
          );

          return (
            <Link
              key={project.id}
              href={`/project/${project.id}`}
              className="block"
            >
              {content}
            </Link>
          );
        })}
      </div>

      {modalIndex !== null && (
        <ProjectGalleryModal
          projects={projectsDataSource}
          initialIndex={modalIndex}
          onClose={closeModal}
        />
      )}
    </>
  );
}
