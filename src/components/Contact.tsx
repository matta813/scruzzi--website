import { contact, site } from "@/content/site";

export function Contact() {
  return (
    <footer id="kontakt" data-surface="lime" aria-labelledby="contact-title" className="relative z-10 bg-lime text-ink">
      <div className="grid gap-12 px-4 pt-28 pb-12 md:grid-cols-5 md:px-8 md:pt-32">
        <div className="md:col-span-2">
          <h2 id="contact-title" className="display text-[clamp(3rem,6vw,5.5rem)]">
            {contact.title.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h2>
          <p className="mt-6 max-w-[28rem] text-ink/75">{contact.text}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={`mailto:${site.contactEmail}`} className="hud-btn hud-btn-dark tracking-[0.06em] normal-case">
              {site.contactEmail}
            </a>
            <a href={site.sourceUrl} rel="noopener noreferrer" className="hud-btn hud-btn-outline">
              Quellcode dieser Website
            </a>
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-8 self-end md:col-span-3 md:col-start-3">
          <div>
            <dt className="micro text-ink/65">Profil</dt>
            <dd className="mt-2">
              <a className="font-display font-semibold tracking-[0.14em] uppercase hover:underline" href={site.socials[0].href} rel="noopener noreferrer">
                LinkedIn <span aria-hidden="true">↗</span>
              </a>
            </dd>
          </div>
          <div>
            <dt className="micro text-ink/65">Code</dt>
            <dd className="mt-2">
              <a className="font-display font-semibold tracking-[0.14em] uppercase hover:underline" href={site.socials[1].href} rel="noopener noreferrer">
                GitHub <span aria-hidden="true">↗</span>
              </a>
            </dd>
          </div>
        </dl>
      </div>

      <p aria-hidden="true" className="dot-text overflow-hidden px-2 text-center text-[11.6vw] leading-[0.82] whitespace-nowrap [--dot-color:var(--color-ink)] [--dot-size:0.5vw]">
        {contact.wordmark}
      </p>

      <div className="flex flex-wrap justify-between gap-2 border-t border-ink/20 px-4 py-5 md:px-8">
        <p className="micro text-ink/70">© {new Date().getFullYear()} {site.fullName}</p>
        <p className="micro text-ink/70">Läuft auf eigener Hardware</p>
      </div>
    </footer>
  );
}
