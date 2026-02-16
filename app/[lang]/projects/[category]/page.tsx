import Title from "@/components/title/Title";
import Projects from "@/components/cards/projects";
import { getMenuData, getCategoryTitle } from "@/lib/menuData";
import { getProjectsByCategory } from "@/lib/getProjectsByCategory";

export default async function page({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const menu = await getMenuData();
  const categoryTitle = getCategoryTitle(menu, category);

  const projectsDataSource = await getProjectsByCategory(category);

  return (
    <div>
      <Title textClass="text-2xl">{categoryTitle}</Title>
      <div className="pb-20"></div>
      <Projects projectsDataSource={projectsDataSource} />
      <div className="pb-40"></div>
    </div>
  );
}
