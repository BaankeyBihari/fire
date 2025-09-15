#!/bin/bash

# NEXTAUTH_SECRET Rotation Script for Vercel
# This script rotates the NEXTAUTH_SECRET environment variable

set -e  # Exit on any error

echo "🔄 Starting NEXTAUTH_SECRET rotation..."

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed. Please install it first:"
    echo "   npm i -g vercel"
    exit 1
fi

# Check if user is logged in to Vercel
if ! vercel whoami &> /dev/null; then
    echo "❌ Not logged in to Vercel. Please login first:"
    echo "   vercel login"
    exit 1
fi

# Generate new secret
echo "🔑 Generating new secret..."
NEW_SECRET=$(openssl rand -base64 32)

if [ -z "$NEW_SECRET" ]; then
    echo "❌ Failed to generate new secret"
    exit 1
fi

echo "✅ New secret generated"

# Confirm before proceeding
echo "⚠️  WARNING: This will invalidate all existing user sessions!"
echo "   All users will need to sign in again."
echo ""
read -p "Do you want to continue? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Operation cancelled"
    exit 1
fi

# Remove old secret
echo "🗑️  Removing old NEXTAUTH_SECRET..."
if vercel env rm NEXTAUTH_SECRET production --yes 2>/dev/null; then
    echo "✅ Old secret removed"
else
    echo "⚠️  No existing secret found or removal failed"
fi

# Add new secret
echo "➕ Adding new NEXTAUTH_SECRET..."
if echo "$NEW_SECRET" | vercel env add NEXTAUTH_SECRET production; then
    echo "✅ New secret added"
else
    echo "❌ Failed to add new secret"
    exit 1
fi

# Trigger redeployment
echo "🚀 Triggering redeployment..."
if vercel --prod; then
    echo "✅ Redeployment triggered"
else
    echo "❌ Redeployment failed"
    exit 1
fi

echo ""
echo "🎉 Secret rotation completed successfully!"
echo ""
echo "📝 IMPORTANT NOTES:"
echo "   - All user sessions have been invalidated"
echo "   - Users will need to sign in again"
echo "   - Monitor your application for any authentication issues"
echo "   - Store the new secret securely for your records"
echo ""
echo "🔐 New secret (store securely): $NEW_SECRET"
echo ""
