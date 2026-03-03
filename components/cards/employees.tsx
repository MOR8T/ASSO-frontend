import user_icon from "../../public/images/icons/user.svg";
import Image from "next/image";
import Title from "../title/Title";
import type { Employee } from "@/lib/employees.types";

type EmployeesProps = {
  employees: Employee[];
};

export default function Employees({ employees }: EmployeesProps) {
  return (
    <div className="w-full min-h-[700px] flex flex-col gap-20 items-center">
      <Title>Наша команда</Title>
      <div className="flex flex-wrap items-center justify-center gap-12.5 max-w-6xl mb-40">
        {employees.map((item) => (
          <div key={item.id}>
            <div className="flex flex-col items-center gap-5 text-center z-20">
              <div className="p-4 border-2 border-[#5b626b] transition-all duration-300 ease-out hover:border-[#DBDBDB] hover:scale-[1.02]">
                {item?.icon?.src ? (
                  <div
                    className="w-[300px] h-[300px] transition-transform duration-300 ease-out"
                    style={{
                      backgroundImage: `url(${item?.icon?.src})`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "center",
                      backgroundSize: "cover",
                    }}
                  />
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
