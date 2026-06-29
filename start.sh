#!/bin/bash
set -e

echo "================================================"
echo "  PropScan — Saudi Real Estate Scraper"
echo "================================================"
echo ""

# Check Docker
if ! command -v docker &>/dev/null; then
    echo "ERROR: Docker not found."
    echo ""
    echo "Mac:   https://www.docker.com/products/docker-desktop/"
    echo "Linux: curl -fsSL https://get.docker.com | sh"
    exit 1
fi
if ! docker info &>/dev/null 2>&1; then
    echo "ERROR: Docker is not running."
    echo "Open Docker Desktop and wait for it to start, then run this again."
    exit 1
fi

# Auto-create .env from template if missing
if [ ! -f .env ]; then
    cp .env.example .env
    echo "INFO: .env created from template."
    echo ""
fi

# Stop old containers, build fresh, start in background
docker compose down 2>/dev/null || true
echo "Building PropScan (first run ~5-10 min, after that <30 sec)..."
echo ""
docker compose up -d --build

# Read port from .env (default 4823)
PORT_VAL=$(grep -E '^PORT=' .env 2>/dev/null | cut -d= -f2 | tr -d ' ')
PORT_VAL=${PORT_VAL:-4823}

# Detect OS for correct IP
if [[ "$(uname)" == "Darwin" ]]; then
    IP="localhost"
else
    IP=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "localhost")
fi

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
        # Auto-open browser on Mac
        if [[ "$(uname)" == "Darwin" ]]; then
            open "http://localhost:$PORT_VAL"
        fi
        exit 0
    fi
    printf "."
    sleep 3
done

echo ""
echo "Taking longer than expected. Check logs:"
echo "  docker compose logs -f"
