"use client";

import { useMemo, useState } from "react";
import type {
  ProjectPageResponse,
  ProjectPageBlock,
} from "@/lib/project-page.types";
import {
  collectGalleryImages,
  getGalleryStartIndices,
} from "@/lib/project-page-utils";
import ProjectHero from "@/components/project/ProjectHero";
import ProjectDescriptionSection from "@/components/project/ProjectDescriptionSection";
import BlockImage from "@/components/project/blocks/BlockImage";
import BlockDescription from "@/components/project/blocks/BlockDescription";
import BlockCta from "@/components/project/blocks/BlockCta";
import BlockGallery from "@/components/project/blocks/BlockGallery";
import ProjectPhotoGalleryModal from "@/components/modals/ProjectPhotoGalleryModal";

type ProjectPageContentProps = {
  project: ProjectPageResponse;
};

export default function ProjectPageContent({
  project,
}: ProjectPageContentProps) {
  const [modalIndex, setModalIndex] = useState<number | null>(null);

  const galleryImages = useMemo(() => collectGalleryImages(project), [project]);
  const galleryStartIndices = useMemo(
    () => getGalleryStartIndices(project),
    [project],
  );

  let blockImageIndex = 0;
  if (project.hero.mediaType === "image") blockImageIndex += 1;
  let galleryIndex = 0;

  const openModal = (index: number) => setModalIndex(index);
  const closeModal = () => setModalIndex(null);

  const renderBlock = (block: ProjectPageBlock) => {
    switch (block.type) {
      case "image": {
        const currentIndex = blockImageIndex;
        blockImageIndex += 1;
        return (
          <BlockImage
            key={block.id}
            data={block.data}
            onImageClick={() => openModal(currentIndex)}
          />
        );
      }
      case "description":
        return <BlockDescription key={block.id} data={block.data} />;
      case "cta":
        return <BlockCta key={block.id} data={block.data} />;
      case "gallery": {
        const startIndex = galleryStartIndices[galleryIndex] ?? 0;
        galleryIndex += 1;
        return (
          <BlockGallery
            key={block.id}
            data={block.data}
            startIndex={startIndex}
            onPhotoClick={openModal}
          />
        );
      }
      default:
        return null;
    }
  };

  return (
    <>
      <main className="min-h-screen">
        <ProjectHero
          hero={project.hero}
          onImageClick={
            project.hero.mediaType === "image" ? () => openModal(0) : undefined
          }
        />
        <ProjectDescriptionSection section={project.descriptionSection} />
        {project.blocks.map(renderBlock)}
      </main>

      {modalIndex !== null && galleryImages.length > 0 && (
        <ProjectPhotoGalleryModal
          images={galleryImages}
          initialIndex={Math.min(modalIndex, galleryImages.length - 1)}
          onClose={closeModal}
        />
      )}
    </>
  );
}
