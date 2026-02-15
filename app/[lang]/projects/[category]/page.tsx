import Title from "@/components/title/Title";

export default async function page({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  return (
    <div>
      <Title textClass="text-3xl">{category}</Title>
      <div className="pb-40"></div>
    </div>
  );
}
