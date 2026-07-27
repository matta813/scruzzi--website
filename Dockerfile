FROM python:3.13-alpine@sha256:399babc8b49529dabfd9c922f2b5eea81d611e4512e3ed250d75bd2e7683f4b0

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

RUN addgroup -S app && adduser -S -G app app \
    && mkdir -p /app/public \
    && chown -R app:app /app

COPY server.py /app/server.py
COPY index.html /app/public/index.html
COPY style.css /app/public/style.css
COPY main.js /app/public/main.js
COPY theme.js /app/public/theme.js
COPY favicon.svg /app/public/favicon.svg
COPY robots.txt /app/public/robots.txt

USER app

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8080/health', timeout=3)" || exit 1

CMD ["python", "/app/server.py"]
