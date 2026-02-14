import user_icon from "../../public/images/icons/user.svg";
import profile_img from '../../public/images/footer_video.png'
import Image from "next/image";

export default function Employees() {
  const employees = [
    {
      id: 1,
      full_name: "Имя Фамилия",
      jobtitle: "Архитектор",
      icon: null,
    },
    {
      id: 2,
      full_name: "Имя Фамилия",
      jobtitle: "Дизайнер",
      icon: profile_img,
    },
    {
      id: 3,
      full_name: "Имя Фамилия",
      jobtitle: "Архитектор",
      icon: profile_img,
    },
    {
      id: 4,
      full_name: "Имя Фамилия",
      jobtitle: "Архитектор",
      icon: profile_img,
    },
    {
      id: 5,
      full_name: "Имя Фамилия",
      jobtitle: "Дизайнер",
      icon: null,
    },
    {
      id: 6,
      full_name: "Имя Фамилия",
      jobtitle: "Архитектор",
      icon: null,
    },
    {
      id: 7,
      full_name: "Имя Фамилия",
      jobtitle: "Архитектор",
      icon: null,
    },
    {
      id: 8,
      full_name: "Имя Фамилия",
      jobtitle: "Дизайнер",
      icon: null,
    },
    {
      id: 9,
      full_name: "Имя Фамилия",
      jobtitle: "Архитектор",
      icon: null,
    },
    {
      id: 10,
      full_name: "Имя Фамилия",
      jobtitle: "Архитектор",
      icon: null,
    },
    {
      id: 11,
      full_name: "Имя Фамилия",
      jobtitle: "Дизайнер",
      icon: null,
    },
    {
      id: 12,
      full_name: "Имя Фамилия",
      jobtitle: "Архитектор",
      icon: null,
    },
  ];

  return (
    <div className="w-full min-h-[700px] flex flex-col gap-20 items-center">
      <div className="max-w-7xl w-full mx-auto">
        <h1 className="text-[#DBDBDB] uppercase text-4xl font-extralight tracking-wider leading-none font-stretch-condensed mt-10">
          Наша команда
        </h1>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-12.5 max-w-6xl mb-40">
        {employees.map((item) => (
          <div key={item.id}>
            <div className="flex flex-col items-center gap-5 text-center z-20">
              <div className="p-4 border-[2px] border-[#5b626b]">
                {item?.icon?.src ? (
                  <div
                    className="w-[300px] h-[300px]"
                    style={{
                      backgroundImage: `url(${item?.icon?.src})`,
                      backgroundRepeat: "no-repeat",
                      //   backgroundOrigin:'border-box'
                      backgroundPosition: "center",
                      backgroundSize: "cover",
                    }}
                  ></div>
                ) : (
                  <div className="w-[300px] h-[300px] bg-[rgba(79,83,92,0.2)] grid place-content-center">
                    <Image
                      src={user_icon}
                      alt={item.full_name}
                      className="w-[180px] h-[180px]"
                      width={180}
                      height={180}
                    />
                  </div>
                )}
              </div>
              <div className="flex flex-col ">
                <h4 className="text-[#DBDBDB] text-[28px] uppercase leading-[38px] font-stretch-condensed">
                  {item.full_name}
                </h4>
                <p className="text-[#DBDBDB] font-extralight text-[15px] uppercase max-w-62.5 font-stretch-condensed">
                  {item.jobtitle}
                </p>
              </div>
            </div>
            <div className="relative z-10 mt-[-200px] mb-[200px]">
              <div className="z-10 w-[150%] ml-[-25%] h-8 rounded-[50%] bg-[rgba(0,0,)] shadow-black shadow-[0px_140px_100px]"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
