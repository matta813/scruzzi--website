FROM python:3.14-alpine@sha256:c6ead215bfd31f1e433d968853b7a769989117115b728874824e6c0a27cb96fc AS asset-compressor

RUN apk add --no-cache brotli

WORKDIR /assets

COPY style.css main.js theme.js ./

RUN brotli --best --force style.css main.js theme.js

FROM python:3.14-alpine@sha256:c6ead215bfd31f1e433d968853b7a769989117115b728874824e6c0a27cb96fc

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Apply the fixed Alpine package before removing Python's build tooling. The
# pinned base image currently contains a vulnerable libuuid release.
RUN apk upgrade --no-cache libuuid \
    && rm -rf /usr/local/lib/python3.14/site-packages/pip \
        /usr/local/lib/python3.14/site-packages/pip-*.dist-info \
        /usr/local/bin/pip \
        /usr/local/bin/pip3 \
        /usr/local/bin/pip3.14

RUN addgroup -S app && adduser -S -G app app \
    && mkdir -p /app/public \
    && chown -R app:app /app

COPY --chown=app:app server.py /app/server.py
COPY --chown=app:app index.html /app/public/index.html
COPY --chown=app:app 404.html /app/public/404.html
COPY --chown=app:app style.css /app/public/style.css
COPY --chown=app:app main.js /app/public/main.js
COPY --chown=app:app theme.js /app/public/theme.js
COPY --from=asset-compressor --chown=app:app /assets/style.css.br /app/public/style.css.br
COPY --from=asset-compressor --chown=app:app /assets/main.js.br /app/public/main.js.br
COPY --from=asset-compressor --chown=app:app /assets/theme.js.br /app/public/theme.js.br
COPY --chown=app:app favicon.svg /app/public/favicon.svg
COPY --chown=app:app robots.txt /app/public/robots.txt
COPY --chown=app:app sitemap.xml /app/public/sitemap.xml
COPY --chown=app:app social-preview.png /app/public/social-preview.png

USER app

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8080/health', timeout=3)" || exit 1

CMD ["python", "/app/server.py"]
