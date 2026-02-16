import type { Employee } from "@/lib/employees.types";

/**
 * Возвращает список сотрудников. Пока — мок с тестовыми профилями.
 * Позже заменить на запрос к API.
 */
export async function getEmployees(): Promise<Employee[]> {
  await new Promise((resolve) => setTimeout(resolve, 80));

  const employees: Employee[] = [
    {
      id: 1,
      full_name: "Александр Волков",
      jobtitle: "Главный архитектор",
      icon: { src: "https://i.pravatar.cc/300?img=12" },
    },
    {
      id: 2,
      full_name: "Мария Соколова",
      jobtitle: "Дизайнер интерьеров",
      icon: { src: "https://i.pravatar.cc/300?img=23" },
    },
    {
      id: 3,
      full_name: "Дмитрий Козлов",
      jobtitle: "Архитектор",
      icon: { src: "https://i.pravatar.cc/300?img=33" },
    },
    {
      id: 4,
      full_name: "Елена Морозова",
      jobtitle: "Ландшафтный архитектор",
      icon: { src: "https://i.pravatar.cc/300?img=45" },
    },
    {
      id: 5,
      full_name: "Игорь Новиков",
      jobtitle: "Руководитель проектов",
      icon: { src: "https://i.pravatar.cc/300?img=51" },
    },
    {
      id: 6,
      full_name: "Анна Кузнецова",
      jobtitle: "Дизайнер интерьеров",
      icon: { src: "https://i.pravatar.cc/300?img=47" },
    },
    {
      id: 7,
      full_name: "Сергей Павлов",
      jobtitle: "Инженер-конструктор",
      icon: { src: "https://i.pravatar.cc/300?img=58" },
    },
    {
      id: 8,
      full_name: "Ольга Лебедева",
      jobtitle: "Визуализатор",
      icon: { src: "https://i.pravatar.cc/300?img=32" },
    },
    {
      id: 9,
      full_name: "Андрей Смирнов",
      jobtitle: "Архитектор",
      icon: { src: "https://i.pravatar.cc/300?img=68" },
    },
    {
      id: 10,
      full_name: "Наталья Орлова",
      jobtitle: "Дизайнер интерьеров",
      icon: { src: "https://i.pravatar.cc/300?img=41" },
    },
    {
      id: 11,
      full_name: "Михаил Федоров",
      jobtitle: "Главный инженер проекта",
      icon: { src: "https://i.pravatar.cc/300?img=69" },
    },
    {
      id: 12,
      full_name: "Татьяна Виноградова",
      jobtitle: "Архитектор",
      icon: { src: "https://i.pravatar.cc/300?img=44" },
    },
  ];

  return employees;
}
