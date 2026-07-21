# scruzzi-website

Persönliche Portfolio-Website – Plattformentwickler in Ausbildung.
Statisches HTML/CSS/JS, ausgeliefert von einem minimalen Python-Server
(stdlib only, kein Framework, kein Build-Step).

## Struktur

| Datei         | Zweck                                             |
| ------------- | ------------------------------------------------- |
| `index.html`  | Die gesamte Seite (One-Pager)                     |
| `style.css`   | Design (Dark Mode als Standard, Light-Toggle)     |
| `theme.js`    | Blocking Theme-Init (kein Farb-Flackern)          |
| `main.js`     | Theme-Toggle + Scroll-Reveal                      |
| `server.py`   | Statischer Fileserver auf `:8080` mit `/health`   |

## Lokal ausführen

```sh
docker build -t scruzzi-website .
docker run --rm -p 8085:8080 scruzzi-website
# → http://localhost:8085
```

## Deployment

- **CI:** GitLab CI baut das Image mit Kaniko und pusht `latest` +
  Commit-SHA in die Registry (siehe `.gitlab-ci.yml`).
- **Runtime:** Container lauscht auf Port **8080**, Health-Endpoint
  unter `GET /health` (`{"status": "ok"}`) – kompatibel mit dem
  bestehenden Kubernetes-Deployment.
