#!/bin/bash

# Pull latest changes
echo "Pulling latest changes..."
git pull origin main

# Stop existing container
echo "Stopping existing containers..."
docker-compose down

# Build and start new container
echo "Building and starting new container..."
docker-compose up -d --build

# Clean up unused images
echo "Cleaning up unused images..."
docker image prune -f

echo "Deployment complete!"
