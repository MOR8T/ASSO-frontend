import Employees from "@/components/cards/employees";
import AboutTitleSection from "@/components/sections/AboutTitleSection";

export default function page() {
  return (
    <div>
      <AboutTitleSection />
      <Employees />
    </div>
  );
}
