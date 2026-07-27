FROM python:3.14-alpine@sha256:26730869004e2b9c4b9ad09cab8625e81d256d1ce97e72df5520e806b1709f92

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

RUN addgroup -S app && adduser -S -G app app \
    && mkdir -p /app/public \
    && chown -R app:app /app

COPY --chown=app:app server.py /app/server.py
COPY --chown=app:app index.html /app/public/index.html
COPY --chown=app:app style.css /app/public/style.css
COPY --chown=app:app main.js /app/public/main.js
COPY --chown=app:app theme.js /app/public/theme.js
COPY --chown=app:app favicon.svg /app/public/favicon.svg
COPY --chown=app:app robots.txt /app/public/robots.txt

USER app

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8080/health', timeout=3)" || exit 1

CMD ["python", "/app/server.py"]
