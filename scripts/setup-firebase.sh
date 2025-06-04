#!/bin/bash

echo "🔥 Setting up Firebase for Brilliant Perspectives Media Kit"
echo "=================================================="

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

echo "📋 Logging into Firebase..."
firebase login

echo "🎯 Setting Firebase project..."
firebase use movementpre

echo "📝 Deploying Firestore rules..."
firebase deploy --only firestore:rules

echo "🗂️ Deploying Storage rules..."
firebase deploy --only storage

echo "📊 Deploying Firestore indexes..."
firebase deploy --only firestore:indexes

echo "✅ Firebase setup complete!"
echo ""
echo "🚀 Your Firebase backend is now configured with:"
echo "   - Firestore database with security rules"
echo "   - Firebase Storage with security rules"
echo "   - Optimized database indexes"
echo ""
echo "📱 You can now run your application with:"
echo "   npm run dev" 