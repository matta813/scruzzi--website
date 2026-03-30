# Schlankes, unprivilegiertes Nginx-Image als Basis (Sicherheit)
FROM nginxinc/nginx-unprivileged:alpine

# Kopiere die statischen Dateien in das Nginx-Verzeichnis
COPY index.html /usr/share/nginx/html/index.html
COPY style.css /usr/share/nginx/html/style.css
COPY main.js /usr/share/nginx/html/main.js

# Exponiere Port 8080 (Standard für unprivileged Nginx)
EXPOSE 8080
