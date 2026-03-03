import AboutTitleSection from "@/components/sections/AboutTitleSection";
import Employees from "@/components/cards/employees";
import { getAbout, toAbsoluteAboutPhotoUrl } from "@/api/about";
import { getEmployees } from "@/lib/getEmployees";
import type { Employee } from "@/lib/employees.types";
import type { AboutIntroBlockPublic } from "@/api/about";

const FALLBACK_INTRO: AboutIntroBlockPublic[] = [
  {
    id: 0,
    text: "Asso Architects стремится продолжать развивать и изучать новые тенденции в мировой архитектуре и дизайне. Мы твёрдо убеждены, что каждый проект должен быть уникальным и индивидуальным, отражающим мечты и устремления наших заказчиков. Наши проекты — результат тесного сотрудничества с клиентами, в ходе которого мы стремимся понять и воплотить их видение идеального пространства. Используя новейшие технологии и материалы, мы создаём уникальные и функциональные здания и интерьеры, которые преображают жизнь наших клиентов, делая её более комфортной и гармоничной. Мы гордимся своими усилиями и творческим подходом к созданию уникальных архитектурных решений. Именно поэтому мы с уверенностью можем сказать, что наши проекты меняют жизнь клиентов к лучшему и воплощают их мечты в реальность.",
    sort_order: 0,
    style_variant: "default",
  },
  {
    id: 1,
    text: "Наша команда — это коллектив единомышленников, объединённых общей страстью к архитектуре и дизайну. В команду входят талантливые архитекторы, дизайнеры и инженеры, каждый из которых имеет значительный опыт и привносит уникальный взгляд в проекты. Мы гордимся тем, что в нашей команде есть люди разных языков и культур, что придаёт нашему творчеству характер и глубину. Это культурное разнообразие вдохновляет на новые творческие идеи и нестандартные подходы и позволяет создавать выдающиеся архитектурные решения.",
    sort_order: 1,
    style_variant: "default",
  },
];

function mapTeamToEmployees(
  team: { id: number; full_name: string; jobtitle: string; photo_url: string | null }[]
): Employee[] {
  return team.map((m) => ({
    id: m.id,
    full_name: m.full_name,
    jobtitle: m.jobtitle,
    icon: m.photo_url ? { src: toAbsoluteAboutPhotoUrl(m.photo_url) } : null,
  }));
}

export default async function AboutPage() {
  let intro: AboutIntroBlockPublic[] = FALLBACK_INTRO;
  let employees: Employee[];

  try {
    const data = await getAbout();
    intro = data.intro;
    employees = mapTeamToEmployees(data.team);
  } catch {
    employees = await getEmployees();
  }

  return (
    <div>
      <AboutTitleSection intro={intro} />
      <Employees employees={employees} />
    </div>
  );
}
