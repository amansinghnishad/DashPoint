#!/bin/bash

# DashPoint AI Agent Startup Script (POSIX)
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="${ROOT_DIR}/app"
VENV_DIR="${ROOT_DIR}/venv"

PYTHON_BIN="${PYTHON:-python3}"
if ! command -v "${PYTHON_BIN}" >/dev/null 2>&1; then
    PYTHON_BIN=python
fi

if [ ! -d "${VENV_DIR}" ]; then
    echo "Creating virtual environment..."
    "${PYTHON_BIN}" -m venv "${VENV_DIR}"
fi

echo "Activating virtual environment..."
# shellcheck disable=SC1090
source "${VENV_DIR}/bin/activate"

echo "Installing dependencies (may take a minute on first run)..."
pip install --upgrade pip >/dev/null
pip install -r "${ROOT_DIR}/requirements.txt"

if [ ! -f "${APP_DIR}/.env" ] && [ -f "${APP_DIR}/.env.example" ]; then
    cp "${APP_DIR}/.env.example" "${APP_DIR}/.env"
    echo "Created ${APP_DIR}/.env. Populate your API keys before using AI features."
fi

echo "Starting DashPoint AI Agent on port 8000..."
cd "${APP_DIR}"
exec uvicorn main:app --host 0.0.0.0 --port 8000
