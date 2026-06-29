#!/bin/bash
set -e

echo "=== Saudi Real Estate Scraper API — Setup ==="

# ── Auto-install python3-venv on Debian/Ubuntu VPS ───────────────────────────
if ! python3 -m ensurepip --version &>/dev/null 2>&1; then
    echo "Installing python3-venv (requires sudo/root)..."
    apt-get update -q && apt-get install -y python3-venv python3-pip
fi

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
playwright install-deps chromium

# Copy .env if not exists
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo ""
    echo "⚠  .env created from template — fill in SMTP credentials before starting."
fi

echo ""
echo "=== Setup complete! ==="
echo ""
echo "Start the API:  bash run.sh"
