# Betrieb

## Veröffentlichung

Conventional Commits auf `main` werden nach erfolgreichen Tests von
semantic-release ausgewertet. Ein neues Release erzeugt ein versioniertes
GitHub Release und ein GHCR-Image mit Versions-, Commit- und `latest`-Tag.
Das Image wird vor dem Push auf bekannte hohe und kritische Schwachstellen
geprüft. SBOM und Build-Provenance werden zusammen mit dem Image publiziert.

## Überprüfung

- `GET /health` muss mit HTTP 200 und `{"status": "ok"}` antworten.
- Der Workflow `Availability` prüft `https://scruzzi.com` alle sechs Stunden.
- Ein Image kann über seinen unveränderlichen Digest oder
  `sha-<git-commit>` eindeutig einem Build zugeordnet werden.

## Rollback

1. Im GitHub Release oder in GHCR das zuletzt funktionierende Image bestimmen.
2. Im FluxCD/Kubernetes-Manifest den Image-Tag auf die vorherige Version oder
   vorzugsweise auf deren Digest setzen.
3. Die Änderung committen und die FluxCD-Synchronisierung abwarten.
4. `/health`, die Startseite und die Sicherheitsheader prüfen.
5. Ursache in einem separaten Fix beheben; `latest` nicht als Rollback-Ziel
   verwenden.

## Notfall

Wenn ein Scan den Release blockiert, wird das unsichere Image nicht
veröffentlicht. Nur nach dokumentierter Risikobewertung darf eine konkrete
Schwachstelle temporär ausgenommen werden.
