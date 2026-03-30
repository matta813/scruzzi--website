# Schlankes, unprivilegiertes Nginx-Image als Basis (Sicherheit)
FROM nginxinc/nginx-unprivileged:alpine

# Kopiere die statische Datei in das Nginx-Verzeichnis
COPY index.html /usr/share/nginx/html/index.html

# Exponiere Port 8080 (Standard für unprivileged Nginx)
EXPOSE 8080
