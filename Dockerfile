FROM python:3.13-alpine

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

USER app

EXPOSE 8080

CMD ["python", "/app/server.py"]
