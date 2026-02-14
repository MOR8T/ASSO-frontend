import service_ison_1 from "../../public/images/icons/architecture.svg";
import service_ison_2 from "../../public/images/icons/interior_design.svg";
import service_ison_3 from "../../public/images/icons/construction.svg";
import Image from "next/image";

export default function OurServices() {
  const services = [
    {
      id: 1,
      title: "architecture",
      description: "DEVELOPMENT OF ARCHITECTURAL AND STRUCTURAL SOLUTIONS",
      icon: service_ison_1,
    },
    {
      id: 2,
      title: "interior design",
      description: "DESIGN OF RESIDENTIAL AND COMMERCIAL PREMISES",
      icon: service_ison_2,
    },
    {
      id: 3,
      title: "construction",
      description: "REALISATION OF REPAIR AND CONSTRUCTION WORKS",
      icon: service_ison_3,
    },
  ];

  return (
    <div className="w-full max-min-h h-screen flex flex-col items-center justify-between">
      <div className="max-w-7xl w-full mx-auto">
        <h1 className="text-[#DBDBDB] uppercase text-4xl font-extralight tracking-wider leading-none font-stretch-condensed mt-10">
          Наши услуги
        </h1>
      </div>
      <div className="flex items-center justify-center gap-12.5 ">
        {services.map((service) => (
          <div
            key={service.id}
            className="flex flex-col items-center gap-10 bg-[rgba(79,83,92,0.2)] p-[50px_20px] text-center"
          >
            <div className="w-[170px] h-[170px] grid place-content-center border-3 border-[#DBDBDB]">
              <Image
                src={service.icon.src}
                alt={service.title}
                className="w-[120px] h-[120px]"
                width={100}
                height={100}
              />
            </div>
            <h2 className="text-[#FF7D24] text-[28px] uppercase">
              {service.title}
            </h2>
            <div className="w-3 h-3 bg-[#DBDBDB] rounded-[50%]"></div>
            <p className="text-[#DBDBDB] text-[15px] uppercase max-w-62.5">
              {service.description}
            </p>
          </div>
        ))}
      </div>
      <div className="w-full h-9"></div>
    </div>
  );
}
