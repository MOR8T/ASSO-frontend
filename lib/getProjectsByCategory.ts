import type { ProjectItem } from "@/components/cards/projects";

/**
 * Имитация запроса: возвращает список проектов по категории.
 * Пока — мок. Позже заменить на запрос к API.
 */
export async function getProjectsByCategory(
  _category: string,
): Promise<ProjectItem[]> {
  // Имитация задержки сети
  await new Promise((resolve) => setTimeout(resolve, 100));

  const project_1 = {
    id: 1,
    title: "ЖК 1147",
    description: "Таджикистан, Душанбе",
    icon: { src: "/images/test-slider-1.jpeg" },
  };
  const project_2 = {
    id: 2,
    title: "ЖК СИТИ ПАРК",
    description: "Таджикистан, Душанбе",
    icon: { src: "/images/test-slider-2.jpg" },
  };
  const project_3 = {
    id: 3,
    title: "ЖК ЛЕФОРТОВО ПАРК",
    description: "Таджикистан, Душанбе",
    icon: { src: "/images/test-slider-3.jpg" },
  };

  // Мок: для любой категории возвращаем один и тот же набор (позже фильтровать по _category)
  const projects: ProjectItem[] = [
    project_1,
    project_2,
    project_3,
    project_2,
    project_1,
    project_3,
  ];

  return projects;
}
