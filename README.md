# scruzzi-website

Persönliche Portfolio-Website – Plattformentwickler in Ausbildung.
Next.js (App Router) mit TypeScript, Tailwind CSS, GSAP/ScrollTrigger und
Lenis-Smooth-Scroll, ausgeliefert als Standalone-Node-Server im Container.

## Struktur

| Pfad | Zweck |
| --- | --- |
| `src/content/site.ts` | Alle Inhalte (Texte, Skills, Projekte, Links) an einer Stelle |
| `src/app/` | Layout, Startseite, 404, `robots.txt`, `sitemap.xml`, `/health` |
| `src/app/fonts/` | Selbst gehostete Schriften (Rajdhani, DM Sans; SIL OFL) |
| `src/components/` | Sektionen (Intro, Stats, Skills, Projekte, Betrieb, Pipeline, Über mich, Kontakt) und Effekte |
| `src/components/DitherPortrait.tsx` | RGB-Dot-Matrix-Visual; nimmt optional ein Foto über `src` |
| `src/lib/` | GSAP-Registrierung, Web-Audio-Sound |
| `src/proxy.ts` | Content-Security-Policy mit Nonce pro Request |
| `next.config.ts` | Standalone-Output und statische Security-Header |
| `public/` | Social-Preview-Bild |
| `tests/e2e/` | Playwright-Tests inkl. axe-Accessibility-Check |

## Lokal ausführen

```sh
npm ci
npm run dev
# → http://localhost:3000
```

Produktionsnah im Container:

```sh
docker build -t scruzzi-website .
docker run --rm --read-only --tmpfs /tmp -p 8085:8080 scruzzi-website
# → http://localhost:8085
```

## Tests & Lint

```sh
npm run lint
npm run typecheck
npx playwright install chromium
npm run test:e2e   # baut die App und startet sie auf Port 4173
```

## Release & Deployment

GitHub Actions führt Lint, Tests und CodeQL für Pull Requests sowie Pushes
auf `main` aus. Releases und Image-Builds laufen ausschließlich auf `main`:

```
Commit (Conventional Commits)
  → Pull Request: ESLint + tsc + Build + Container-Smoke-Test + Playwright + Commitlint + CodeQL
  → main: dieselben Prüfungen
  → isoliertes semantic-release: SemVer-Bump, CHANGELOG, Tag und Release
  → Trivy: Image-Scan auf hohe und kritische Schwachstellen
  → Buildx: AMD64-/ARM64-GHCR-Image mit SBOM und Provenance
  → Dependabot: wöchentliche Updates für Actions, Docker und npm
  → FluxCD rollt die neue Version im Cluster aus
```

- **Versionierung:** `fix:` → Patch, `feat:` → Minor,
  `BREAKING CHANGE:` → Major. Commits wie `chore:`/`docs:`/`ci:` lösen
  kein Release aus. `chore(deps):` erzeugt für ausgerollte
  Abhängigkeitsupdates automatisch einen Patch-Release.
- **Runtime:** Container lauscht auf Port **8080**, Health-Endpoint
  unter `GET /health` (`{"status": "ok"}`) – kompatibel mit dem
  bestehenden Kubernetes-Deployment.
- **Betrieb und Rollback:** siehe [OPERATIONS.md](OPERATIONS.md).
- **Architekturen:** veröffentlichte Images unterstützen `linux/amd64` und
  `linux/arm64`; beide Varianten werden vor dem Push separat gescannt.
- **Verfügbarkeit:** Der manuelle GitHub-Actions-Workflow prüft die
  Produktionsseite. Automatische GitHub-hosted Checks benötigen zunächst
  Netzwerkzugriff vom Runner zum Produktionshost.
