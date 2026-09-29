import { skills } from "@/content/site";
import { SectionHead } from "./SectionHead";

export function Skills() {
  return (
    <section id="skills" aria-labelledby="skills-title" className="relative px-4 py-24 md:px-8 md:py-36">
      <SectionHead id="skills-title" chip="Stack" title="Womit ich arbeite" />
      <div className="grid gap-px sm:grid-cols-2 lg:grid-cols-3">
        {skills.map((skill, index) => (
          <article
            key={skill.title}
            className="cut group relative flex min-h-64 flex-col justify-between bg-panel p-6 transition-colors duration-500 hover:bg-lime md:p-8"
          >
            <div className="flex items-start justify-between">
              <span className="micro group-hover:text-ink">{String(index + 1).padStart(2, "0")}</span>
              <span className="micro group-hover:text-ink" aria-hidden="true">
                {skill.items.length} Tools
              </span>
            </div>
            <div>
              <h3 className="display mb-5 text-[2.2rem] leading-[0.95] text-bone group-hover:text-ink">{skill.title}</h3>
              <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
                {skill.items.map((item) => (
                  <li key={item} className="micro text-bone/80 group-hover:text-ink">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
