#!/bin/bash
set -e

# Activate venv if it exists
if [ -d "venv" ]; then
    source venv/bin/activate
fi

PORT=${PORT:-8000}
echo "Starting Saudi Real Estate Scraper API on http://localhost:$PORT"
echo "Swagger docs: http://localhost:$PORT/docs"
echo ""

uvicorn main:app --host 0.0.0.0 --port "$PORT" --reload
