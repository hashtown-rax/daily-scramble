#!/bin/bash
set -e

# Build frontend
cd frontend
npm install
npx vite build
cd ..

# Copy build output to backend/static
rm -rf backend/static
cp -r frontend/dist backend/static

# Install backend deps
cd backend
pip install -r requirements.txt

echo "Build complete. Run: uvicorn app.main:app"
