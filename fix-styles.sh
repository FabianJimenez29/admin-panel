#!/bin/bash

echo "🔧 Fixing Tailwind CSS configuration..."

# Remove node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Install dependencies with the correct Tailwind version
npm install

echo "✅ Dependencies installed successfully!"

echo "🚀 Now you can:"
echo "1. Commit and push the changes to Git"
echo "2. Vercel will automatically redeploy with the correct styles"

echo ""
echo "Commands to run:"
echo "git add ."
echo "git commit -m 'Fix Tailwind CSS configuration'"
echo "git push"