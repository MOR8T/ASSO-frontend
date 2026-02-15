import { ReactNode } from "react";

export default function Title({
  children,
  textClass = "",
}: {
  children: ReactNode;
  textClass?: string;
}) {
  return (
    <div className="max-w-7xl w-full mx-auto">
      <h1
        className={`text-[#DBDBDB] uppercase text-2xl font-extralight tracking-wider leading-none font-stretch-condensed mt-10 ${textClass}`}
      >
        {children}
      </h1>
    </div>
  );
}
