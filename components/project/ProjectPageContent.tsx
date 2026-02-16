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

  // Для каждого блока — индекс в galleryImages (для image) или startIndex (для gallery).
  // Порядок совпадает с collectGalleryImages: hero → image-блоки и gallery по очереди.
  const blockModalInfo = useMemo(() => {
    const infos: Array<
      | { type: "image"; index: number }
      | { type: "gallery"; startIndex: number }
      | null
    > = [];
    let idx = project.hero.mediaType === "image" ? 1 : 0;
    let galleryOrdinal = 0;
    for (const block of project.blocks) {
      if (block.type === "image") {
        infos.push({ type: "image", index: idx });
        idx += 1;
      } else if (block.type === "gallery") {
        infos.push({
          type: "gallery",
          startIndex: galleryStartIndices[galleryOrdinal] ?? 0,
        });
        idx += block.data.items.length;
        galleryOrdinal += 1;
      } else {
        infos.push(null);
      }
    }
    return infos;
  }, [project, galleryStartIndices]);

  const openModal = (index: number) => setModalIndex(index);
  const closeModal = () => setModalIndex(null);

  const renderBlock = (block: ProjectPageBlock, blockIndex: number) => {
    const modalInfo = blockModalInfo[blockIndex];
    switch (block.type) {
      case "image": {
        const index = modalInfo?.type === "image" ? modalInfo.index : 0;
        return (
          <BlockImage
            key={block.id}
            data={block.data}
            onImageClick={() => openModal(index)}
          />
        );
      }
      case "description":
        return <BlockDescription key={block.id} data={block.data} />;
      case "cta":
        return <BlockCta key={block.id} data={block.data} />;
      case "gallery": {
        const startIndex =
          modalInfo?.type === "gallery" ? modalInfo.startIndex : 0;
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
        {project.blocks.map((block, i) => renderBlock(block, i))}
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
