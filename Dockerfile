FROM python:3.13-alpine

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    NICE_BAUCH_DB=/data/nice-bauch.sqlite

WORKDIR /app

RUN addgroup -S app && adduser -S -G app app \
    && mkdir -p /app/public /data \
    && chown -R app:app /app /data

COPY server.py /app/server.py
COPY index.html /app/public/index.html
COPY style.css /app/public/style.css
COPY main.js /app/public/main.js

USER app

EXPOSE 8080

CMD ["python", "/app/server.py"]
