#!/bin/bash
set -e

echo "================================================"
echo "  PropScan — Saudi Real Estate Scraper"
echo "================================================"
echo ""

# Check Docker installed
if ! command -v docker &>/dev/null; then
    echo "ERROR: Docker is not installed."
    echo ""
    echo "Download Docker Desktop from:"
    echo "  https://www.docker.com/products/docker-desktop/"
    echo ""
    echo "Install it, open it, wait for the whale icon in menu bar, then run this again."
    exit 1
fi

# Check Docker daemon is running
if ! docker info &>/dev/null 2>&1; then
    echo "ERROR: Docker Desktop is not running."
    echo ""
    echo "Open Docker Desktop from Applications folder."
    echo "Wait for the whale icon to appear in the menu bar, then run this again."
    exit 1
fi

# Stop any old PropScan containers (ignore errors if none running)
echo "Stopping any old containers..."
docker compose down 2>/dev/null || true
echo ""

# Build fresh and start
echo "Building PropScan (FIRST run: 5-10 min, after that: <30 sec)..."
echo ""
docker compose up --build -d

echo ""
echo "Waiting for PropScan to be ready..."
for i in $(seq 1 40); do
    if curl -sf http://localhost:8000/health &>/dev/null; then
        echo ""
        echo "================================================"
        echo "  PropScan is RUNNING!"
        echo "  Browser: http://localhost:8000"
        echo "================================================"
        echo ""
        echo "To stop:   docker compose down"
        echo "To restart: bash start.sh"
        echo ""
        open "http://localhost:8000"
        exit 0
    fi
    printf "."
    sleep 3
done

echo ""
echo "Taking longer than expected. Check logs:"
echo "  docker compose logs -f"
