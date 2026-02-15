import { getProject } from "@/lib/getProject";
import ProjectPageContent from "@/components/project/ProjectPageContent";

type PageProps = {
  params: Promise<{ lang: string; id: string }>;
};

export default async function ProjectPage({ params }: PageProps) {
  const { id } = await params;
  const project = await getProject(id);

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <p className="text-lg">Проект не найден</p>
      </div>
    );
  }

  return (
    <div>
      <ProjectPageContent project={project} />
      <div className="pb-40 project-section-dark"></div>
    </div>
  );
}
