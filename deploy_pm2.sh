#!/bin/bash
set -e


# Configuration
APP_DIR="/var/www/mohammad-al-qudah-platform" # Adjust this path as needed
PM2_APP_NAME="mohammad-al-qudah-platform"

echo "🚀 Starting Deployment for $PM2_APP_NAME..."

# 1. Pull latest changes
echo "📥 Pulling latest code..."
git pull origin main

# 2. Install dependencies
echo "📦 Installing dependencies..."
npm ci

# 3. Build application
echo "🛠️ Building Next.js application..."
npm run build

# 4. Prepare Standalone Build
echo "📂 Preparing standalone build..."
# Ensure destination directories exist
mkdir -p .next/standalone/public
mkdir -p .next/standalone/.next/static

# Copy public assets
cp -r public/* .next/standalone/public/

# Copy static assets (critical for styling and chunks)
cp -r .next/static .next/standalone/.next/
echo "✅ Assets copied to standalone directory."

# 5. Reload PM2
echo "🔄 Reloading PM2..."
pm2 reload ecosystem.config.js --env production

echo "🎉 Deployment Complete!"
