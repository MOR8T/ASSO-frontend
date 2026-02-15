import type { ProjectPageResponse } from "@/lib/project-page.types";
import sampleProject from "@/data/sample-project-response.json";

/**
 * Возвращает данные проекта по id. Пока — мок из sample JSON.
 * Позже заменить на запрос к API.
 */
export async function getProject(id: string): Promise<ProjectPageResponse | null> {
  // Мок: для любого id возвращаем один и тот же пример
  return sampleProject as ProjectPageResponse;
}
