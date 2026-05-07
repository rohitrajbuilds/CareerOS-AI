FROM python:3.11-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PIP_NO_CACHE_DIR=1

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends build-essential curl \
  && rm -rf /var/lib/apt/lists/*

RUN useradd --create-home --shell /usr/sbin/nologin appuser

COPY pyproject.toml ./
COPY app ./app
COPY docker/entrypoint.sh ./docker/entrypoint.sh

RUN pip install --upgrade pip \
  && pip install . \
  && chmod +x ./docker/entrypoint.sh

EXPOSE 8000

USER appuser

ENTRYPOINT ["./docker/entrypoint.sh"]
