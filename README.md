# nice-bauch

Ein minimalistisches Single-Page-Setup mit modernem Design und serverseitiger Geräte-Speicherung.

## Features
- **Modernes Design**: Glassmorphism-Stil mit Space Grotesk Font.
- **Ready-to-run**: Inklusive Bash-Skript für den schnellen Start.
- **Sicher & Leicht**: Läuft als unprivilegierter Python-Container auf Alpine-Basis.
- **Interaktiv**: Speichert das Nice-Level pro Gerät serverseitig in SQLite.
- **Ohne Login**: Jedes Gerät bekommt automatisch eine zufällige Browser-ID.

## Starten
Einfach das mitgelieferte Skript ausführen (erfordert Docker & Docker Compose):
```bash
./run-nice-bauch.sh
```
Das Skript zieht das aktuelle Image aus der GitHub Container Registry und startet es lokal.
Der Server ist dann standardmäßig unter Port **8085** erreichbar: `http://localhost:8085`.

Die SQLite-Datenbank liegt im Docker-Volume `nice-bauch-data` und bleibt bei Container-Neustarts erhalten.

## Versionierung
Jeder Push erzeugt automatisch ein GitHub Release im Format `vYYYY.MM.DD.<run-number>` und veröffentlicht ein passend getaggtes Docker Image.
Der `latest`-Tag wird nur bei Pushes auf `main` aktualisiert.
