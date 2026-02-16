import Link from "next/link";
import Title from "../title/Title";
import type { ProjectItem } from "./projects";

type OurWorksProps = {
  projects: ProjectItem[];
};

export default function OurWorks({ projects }: OurWorksProps) {
  return (
    <div className="w-full max-min-h flex flex-col lg:items-center lg:justify-between">
      <Title>Наши работы</Title>
      <div className="flex flex-wrap py-5 lg:items-center justify-center gap-12.5 ">
        {projects.map((project) => (
          <Link
            key={project.id}
            href={`/project/${project.id}`}
            className="flex flex-col items-center gap-5 text-center cursor-pointer"
          >
            <div className="p-4 border-2 border-[#5b626b] transition-all duration-300 ease-out hover:border-[#DBDBDB] hover:scale-[1.02]">
              <div
                className="w-[350px] h-[350px]"
                style={{
                  backgroundImage: `url(${project.icon.src})`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                  backgroundSize: "cover",
                }}
              ></div>
            </div>
            <div className="flex flex-col ">
              <h4 className="text-[#DBDBDB] text-[28px] uppercase leading-[38px] font-stretch-condensed">
                {project.title}
              </h4>
              <p className="text-[#DBDBDB] font-extralight text-[15px] uppercase max-w-62.5 font-stretch-condensed">
                {project.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
      <div className="w-full h-9"></div>
    </div>
  );
}
