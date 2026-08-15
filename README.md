# scruzzi-website

Persönliche Portfolio-Website – Plattformentwickler in Ausbildung.
Statisches HTML/CSS/JS, ausgeliefert von einem minimalen Python-Server
(stdlib only, kein Framework, kein Build-Step).

## Struktur

| Datei          | Zweck                                             |
| -------------- | ------------------------------------------------- |
| `index.html`   | Die gesamte Seite (One-Pager)                     |
| `404.html`     | Eigene Fehlerseite für unbekannte Routen          |
| `style.css`    | Design (Dark Mode als Standard, Light-Toggle)     |
| `theme.js`     | Blocking Theme-Init (kein Farb-Flackern)          |
| `main.js`      | Theme-Toggle + Scroll-Reveal                      |
| `server.py`    | Statischer Fileserver auf `:8080` mit `/health`   |
| `favicon.svg`  | Favicon (auch unter `/favicon.ico` ausgeliefert)  |
| `social-preview.png` | Vorschaubild für LinkedIn/Open Graph       |
| `robots.txt` / `sitemap.xml` | Crawler- und Suchmaschinen-Metadaten |
| `tests/`       | pytest-Suite für Server und Website               |

## Lokal ausführen

```sh
docker build -t scruzzi-website .
docker run --rm -p 8085:8080 scruzzi-website
# → http://localhost:8085
```

## Tests & Lint

```sh
python3 -m pip install -r requirements-dev.txt
ruff check server.py tests/
python3 -m pytest tests/ -v
npm ci
```

## Release & Deployment

GitHub Actions führt Lint, Tests und CodeQL für Pull Requests sowie Pushes
auf `main` aus. Releases und Image-Builds laufen ausschließlich auf `main`:

```
Commit (Conventional Commits)
  → Pull Request: Ruff + pytest + Commitlint + CodeQL
  → main: dieselben Prüfungen
  → semantic-release: SemVer-Bump, CHANGELOG.md, Tag und GitHub Release
  → Buildx: Image-Build und Push nach GHCR (:X.Y.Z, :sha-<commit>, :latest)
  → Dependabot: wöchentliche Updates für Actions, Docker, Python und npm
  → FluxCD rollt die neue Version im Cluster aus
```

- **Versionierung:** `fix:` → Patch, `feat:` → Minor,
  `BREAKING CHANGE:` → Major. Commits wie `chore:`/`docs:`/`ci:` lösen
  kein Release aus. `chore(deps):` erzeugt für ausgerollte
  Abhängigkeitsupdates automatisch einen Patch-Release.
- **Runtime:** Container lauscht auf Port **8080**, Health-Endpoint
  unter `GET /health` (`{"status": "ok"}`) – kompatibel mit dem
  bestehenden Kubernetes-Deployment.
