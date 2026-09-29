type Props = {
  id?: string;
  chip: string;
  title: string;
  align?: "left" | "center";
  tone?: "dark" | "lime";
};

export function SectionHead({ id, chip, title, align = "left", tone = "dark" }: Props) {
  return (
    <header className={`mb-12 md:mb-20 ${align === "center" ? "text-center" : ""}`}>
      <p className={`chip ${tone === "lime" ? "chip-dark" : ""}`}>{chip}</p>
      <h2
        id={id}
        className={`display mt-5 text-[clamp(3rem,7vw,6.5rem)] ${tone === "lime" ? "text-ink" : "text-bone"}`}
      >
        {title}
      </h2>
    </header>
  );
}
