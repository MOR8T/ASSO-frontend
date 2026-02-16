import test_img from "@/public/images/test_slider.jpg";
import Title from "../title/Title";

export default function OurWorks() {
  const services = [
    {
      id: 1,
      title: "Софт минимализм",
      description: "Таджикистан, Душанбе",
      icon: test_img,
    },
    {
      id: 2,
      title: "Софт минимализм",
      description: "Таджикистан, Душанбе",
      icon: test_img,
    },
    {
      id: 3,
      title: "Софт минимализм",
      description: "Таджикистан, Душанбе",
      icon: test_img,
    },
  ];

  return (
    <div className="w-full max-min-h flex flex-col lg:items-center lg:justify-between">
      <Title>Наши работы</Title>
      <div className="flex flex-wrap py-5 lg:items-center justify-center gap-12.5 ">
        {services.map((service) => (
          <div
            key={service.id}
            className="flex flex-col items-center gap-5 text-center"
          >
            <div className="p-4 border-2 border-[#5b626b] transition-all duration-300 ease-out hover:border-[#DBDBDB] hover:scale-[1.02]">
              <div
                className="w-[350px] h-[350px]"
                style={{
                  backgroundImage: `url(${service.icon.src})`,
                  backgroundRepeat: "no-repeat",
                  //   backgroundOrigin:'border-box'
                  backgroundPosition: "center",
                  backgroundSize: "cover",
                }}
              ></div>
              {/* <Image
                src={service.icon.src}
                alt={service.title}
                className="w-[350px] h-[350px]"
                width={350}
                height={350}
              /> */}
            </div>
            <div className="flex flex-col ">
              <h4 className="text-[#DBDBDB] text-[28px] uppercase leading-[38px] font-stretch-condensed">
                {service.title}
              </h4>
              <p className="text-[#DBDBDB] font-extralight text-[15px] uppercase max-w-62.5 font-stretch-condensed">
                {service.description}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="w-full h-9"></div>
    </div>
  );
}
