#!/bin/bash
set -e

echo "=== Saudi Real Estate Scraper API — Setup ==="

# Check Python
if ! command -v python3 &>/dev/null; then
    echo "ERROR: Python 3 not found. Install from https://python.org"
    exit 1
fi

PYTHON=$(command -v python3)
echo "Using Python: $($PYTHON --version)"

# Create virtual environment
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    $PYTHON -m venv venv
fi

# Activate
source venv/bin/activate

# Install dependencies
echo "Installing Python dependencies..."
pip install --upgrade pip -q
pip install -r requirements.txt -q

# Install Chromium
echo "Installing Playwright Chromium..."
playwright install chromium

# Copy .env if not exists
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "Created .env from .env.example — edit it if needed"
fi

echo ""
echo "=== Setup complete! ==="
echo ""
echo "Start the API:"
echo "  source venv/bin/activate"
echo "  uvicorn main:app --host 0.0.0.0 --port 8000 --reload"
echo ""
echo "Or just run:  bash run.sh"
