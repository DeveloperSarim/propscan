#!/bin/bash
set -e

echo "================================================"
echo "  PropScan — Saudi Real Estate Scraper"
echo "================================================"
echo ""

# Check Docker
if ! command -v docker &>/dev/null; then
    echo "ERROR: Docker not found. Install Docker and re-run."
    exit 1
fi
if ! docker info &>/dev/null 2>&1; then
    echo "ERROR: Docker daemon not running. Start Docker and re-run."
    exit 1
fi

# Auto-create .env from template if missing
if [ ! -f .env ]; then
    cp .env.example .env
    echo "INFO: .env created from template — edit it if you want email notifications."
    echo ""
fi

# Stop old containers, build fresh, start in background
docker compose down 2>/dev/null || true
echo "Building PropScan (first run ~5-10 min, after that <30 sec)..."
echo ""
docker compose up -d --build

# Determine access URL
IP=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "localhost")
PORT_VAL=$(grep -E '^PORT=' .env 2>/dev/null | cut -d= -f2 | tr -d ' ')
PORT_VAL=${PORT_VAL:-8000}

echo ""
echo "Waiting for PropScan to be ready..."
for i in $(seq 1 40); do
    if curl -sf "http://localhost:$PORT_VAL/health" &>/dev/null; then
        echo ""
        echo "================================================"
        echo "  PropScan is RUNNING!"
        echo "  http://$IP:$PORT_VAL"
        echo "  Swagger: http://$IP:$PORT_VAL/docs"
        echo "================================================"
        echo ""
        echo "To stop:    docker compose down"
        echo "To restart: bash start.sh"
        echo "To logs:    docker compose logs -f"
        exit 0
    fi
    printf "."
    sleep 3
done

echo ""
echo "Taking longer than expected. Check logs:"
echo "  docker compose logs -f"
