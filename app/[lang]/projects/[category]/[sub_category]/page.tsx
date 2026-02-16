import Projects from "@/components/cards/projects";
import Title from "@/components/title/Title";
import { getMenuData, getCategoryTitle, getSubCategoryTitle } from "@/lib/menuData";
import { getProjectsByCategory } from "@/lib/getProjectsByCategory";
import Link from "next/link";

export default async function page({
  params,
}: {
  params: Promise<{ sub_category: string; category: string }>;
}) {
  const { sub_category, category } = await params;
  const menu = await getMenuData();
  const categoryTitle = getCategoryTitle(menu, category);
  const subCategoryTitle = getSubCategoryTitle(menu, category, sub_category);
  const projectsDataSource = await getProjectsByCategory(category);

  return (
    <div>
      <Title textClass="text-2xl">
        <Link href={`/projects/${category}`}>{categoryTitle}</Link> / <span style={{ color: "#FF7D24" }}>{subCategoryTitle}</span>
      </Title>
      <div className="pb-20"></div>
      <Projects projectsDataSource={projectsDataSource} />
      <div className="pb-40"></div>
    </div>
  );
}
