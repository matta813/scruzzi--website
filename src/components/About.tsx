import { about } from "@/content/site";

export function About() {
  return (
    <section id="ueber-mich" aria-labelledby="about-title" className="relative px-4 py-24 md:px-8 md:py-36">
      <div className="grid gap-14 md:grid-cols-5">
        <header className="md:col-span-2 md:pr-10">
          <p className="chip">Über mich</p>
          <h2 id="about-title" className="display mt-5 text-[clamp(3rem,6vw,5.6rem)] text-bone">
            {about.title}
          </h2>
          <dl className="mt-12 grid gap-5">
            {about.facts.map((fact) => (
              <div key={fact.label} className="border-l-2 border-lime pl-4">
                <dt className="micro">{fact.label}</dt>
                <dd className="mt-1 text-bone">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </header>

        <div className="md:col-span-3 md:pl-4">
          <p className="display text-justify text-[clamp(1.9rem,3.2vw,3rem)] leading-[1] text-bone [text-align-last:left]">
            {about.lead}
          </p>
          <div className="mt-12 grid gap-6 text-mute md:grid-cols-2 md:gap-10">
            {about.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 20)} className="leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
