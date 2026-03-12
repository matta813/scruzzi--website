# Schlankes Nginx-Image als Basis
FROM nginx:alpine

# Kopiere die statische Datei in das Nginx-Verzeichnis
COPY index.html /usr/share/nginx/html/index.html

# Exponiere Port 80 (Standard für Nginx)
EXPOSE 80

# Nginx läuft automatisch im Vordergrund
