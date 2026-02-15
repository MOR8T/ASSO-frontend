import Title from "@/components/title/Title";
import Projects from "@/components/cards/projects";
import type { ProjectItem } from "@/components/cards/projects";
import test_img from "@/public/images/test_slider.jpg";
import { getMenuData, getCategoryTitle } from "@/lib/menuData";

export default async function page({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const menu = await getMenuData();
  const categoryTitle = getCategoryTitle(menu, category);

  const projectsDataSource: ProjectItem[] = [
    {
      id: 1,
      title: "Софт минимализм",
      description: "Таджикистан, Душанбе",
      icon: { src: test_img.src },
    },
    {
      id: 2,
      title: "Софт минимализм",
      description: "Таджикистан, Душанбе",
      icon: { src: test_img.src },
    },
    {
      id: 3,
      title: "Софт минимализм",
      description: "Таджикистан, Душанбе",
      icon: { src: test_img.src },
    },
    {
      id: 4,
      title: "Софт минимализм",
      description: "Таджикистан, Душанбе",
      icon: { src: test_img.src },
    },
  ];

  return (
    <div>
      <Title textClass="text-2xl">{categoryTitle}</Title>
      <div className="pb-20"></div>
      <Projects projectsDataSource={projectsDataSource} />
      <div className="pb-40"></div>
    </div>
  );
}
