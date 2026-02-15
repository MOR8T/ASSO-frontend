import type {
  ProjectPageResponse,
  ProjectPageBlock,
  MediaImage,
} from "@/lib/project-page.types";

/**
 * Собирает все фотографии проекта для модалки галереи:
 * hero (если image) + изображения из блоков image + все фото из блоков gallery.
 */
export function collectGalleryImages(project: ProjectPageResponse): MediaImage[] {
  const images: MediaImage[] = [];

  if (project.hero.mediaType === "image") {
    images.push(project.hero.image);
  }

  for (const block of project.blocks) {
    if (block.type === "image") {
      images.push(block.data.image);
    } else if (block.type === "gallery") {
      for (const item of block.data.items) {
        images.push(item.image);
      }
    }
  }

  return images;
}

/**
 * Для каждого блока типа "gallery" возвращает стартовый индекс в общем массиве фото.
 * Порядок блоков совпадает с project.blocks.
 */
export function getGalleryStartIndices(project: ProjectPageResponse): number[] {
  const indices: number[] = [];
  let index = 0;

  if (project.hero.mediaType === "image") {
    index += 1;
  }

  for (const block of project.blocks) {
    if (block.type === "image") {
      index += 1;
    } else if (block.type === "gallery") {
      indices.push(index);
      index += block.data.items.length;
    }
  }

  return indices;
}
