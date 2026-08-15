FROM python:3.14-alpine@sha256:05b2b8b732ecd268fee8727a369f936f022d1321b59befd13c30ede22769dcdc

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Runtime uses only the standard library. Removing pip also removes its vendored
# build-time packages and embedded third-party SBOM from the production image.
RUN rm -rf /usr/local/lib/python3.14/site-packages/pip +    /usr/local/lib/python3.14/site-packages/pip-*.dist-info +    /usr/local/bin/pip /usr/local/bin/pip3 /usr/local/bin/pip3.14

RUN addgroup -S app && adduser -S -G app app \
    && mkdir -p /app/public \
    && chown -R app:app /app

COPY --chown=app:app server.py /app/server.py
COPY --chown=app:app index.html /app/public/index.html
COPY --chown=app:app 404.html /app/public/404.html
COPY --chown=app:app style.css /app/public/style.css
COPY --chown=app:app main.js /app/public/main.js
COPY --chown=app:app theme.js /app/public/theme.js
COPY --chown=app:app favicon.svg /app/public/favicon.svg
COPY --chown=app:app robots.txt /app/public/robots.txt
COPY --chown=app:app sitemap.xml /app/public/sitemap.xml
COPY --chown=app:app social-preview.png /app/public/social-preview.png

USER app

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8080/health', timeout=3)" || exit 1

CMD ["python", "/app/server.py"]
