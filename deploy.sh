#!/bin/bash
# Simple deployment script for ChainView

echo "Starting ChainView deployment..."

# Check if git is installed
if ! command -v git &> /dev/null; then
  echo "Git is not installed. Please install git to continue."
  exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
  echo "npm is not installed. Please install Node.js and npm to continue."
  exit 1
fi

# Ensure all dependencies are installed
echo "Installing dependencies..."
npm install

# Run build if needed
echo "Building project..."
npm run build

# Check if Heroku CLI is installed for Heroku deployment
if command -v heroku &> /dev/null; then
  read -p "Deploy to Heroku? (y/n): " deploy_heroku
  if [ "$deploy_heroku" = "y" ]; then
    echo "Deploying to Heroku..."
    git push heroku main
  fi
fi

# Check if Vercel CLI is installed for Vercel deployment
if command -v vercel &> /dev/null; then
  read -p "Deploy to Vercel? (y/n): " deploy_vercel
  if [ "$deploy_vercel" = "y" ]; then
    echo "Deploying to Vercel..."
    vercel --prod
  fi
fi

# Publish to npm
read -p "Publish CLI to npm? (y/n): " publish_npm
if [ "$publish_npm" = "y" ]; then
  echo "Publishing to npm..."
  npm publish
fi

echo "Deployment complete!" 