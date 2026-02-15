import type { DrawerItem } from "@/components/drawer-menu/DrawerMenu";

/** Имитация ответа бэкенда: задержка + данные меню */
const MOCK_DELAY_MS = 100;

const menuData: DrawerItem[] = [
  {
    id: "1",
    title: "АРХИТЕКТУРНЫЕ ПРОЕКТЫ",
    url: "archetectur_project",
    children: [
      { id: "1-1", title: "ЧАСТНЫЕ ДОМА", url: "design" },
      { id: "1-2", title: "ОБЩЕСТВЕННЫЕ ЗДАНИЯ", url: "public_buildings" },
    ],
  },
  {
    id: "2",
    title: "ДИЗАЙН ИНТЕРЬЕРЫ",
    url: "interior_design",
    children: [
      { id: "2-1", title: "ДОМА И КОТТЕДЖИ", url: "houses_and_cottages" },
      { id: "2-2", title: "КВАРТИРЫ", url: "apartments" },
      { id: "2-3", title: "ОБЩЕСТВЕННЫЕ ИНТЕРЬЕРЫ", url: "public_interiors" },
    ],
  },
  {
    id: "3",
    title: "Мебель и освешение",
    url: "furniture_and_decoration",
    children: [],
  },
];

/**
 * Имитация запроса к бэкенду: возвращает данные меню категорий/подкатегорий.
 * Используется в Header и на страницах проектов.
 */
export async function getMenuData(): Promise<DrawerItem[]> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
  return menuData;
}

/**
 * Возвращает название категории по slug (url). Если не найдено — сам slug.
 */
export function getCategoryTitle(menu: DrawerItem[], categorySlug: string): string {
  const item = menu.find((m) => m.url === categorySlug);
  return item?.title ?? categorySlug;
}

/**
 * Возвращает название подкатегории по slug категории и подкатегории. Если не найдено — сам slug.
 */
export function getSubCategoryTitle(
  menu: DrawerItem[],
  categorySlug: string,
  subCategorySlug: string
): string {
  const category = menu.find((m) => m.url === categorySlug);
  const child = category?.children?.find((c) => c.url === subCategorySlug);
  return child?.title ?? subCategorySlug;
}
