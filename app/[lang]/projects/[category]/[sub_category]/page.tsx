import Title from "@/components/title/Title";

export default async function page({
  params,
}: {
  params: Promise<{ sub_category: string; category: string }>;
}) {
  const { sub_category, category } = await params;
  return (
    <div>
      <Title textClass="text-2xl">
        {category} / {sub_category}
      </Title>
      <div className="pb-40"></div>
    </div>
  );
}
