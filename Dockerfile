# ── Stage 1: Build React frontend ────────────────────────────────────────────
FROM node:20-slim AS frontend-builder
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm ci --quiet
COPY frontend/ ./
RUN npm run build

# ── Stage 2: Official Playwright image (Chromium + all deps pre-installed) ────
# Version matches playwright==1.44.0 in requirements.txt
FROM mcr.microsoft.com/playwright/python:v1.44.0-jammy
WORKDIR /app

# setuptools needed by playwright-stealth (pkg_resources)
RUN pip install --no-cache-dir setuptools

# Python deps
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# App source
COPY . .

# Built frontend from stage 1
COPY --from=frontend-builder /frontend/dist ./frontend/dist

EXPOSE 8000
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
