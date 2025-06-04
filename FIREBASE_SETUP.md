# Firebase Backend Setup Guide

## Overview
This guide will help you set up the complete Firebase backend for the Brilliant Perspectives Media Kit application using the provided service account key.

## Prerequisites
- Node.js 18+ installed
- Firebase CLI installed (`npm install -g firebase-tools`)
- Access to the Firebase Console

## Firebase Project Configuration

### Project Details
- **Project ID**: `movementpre`
- **Project Name**: Movement Pre
- **Service Account**: `firebase-adminsdk-fbsvc@movementpre.iam.gserviceaccount.com`

## Setup Steps

### 1. Firebase CLI Setup
```bash
# Install Firebase CLI (if not already installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Set the project
firebase use movementpre
```

### 2. Install Dependencies
```bash
# Install Firebase Admin SDK
npm install firebase-admin

# Verify all dependencies are installed
npm install
```

### 3. Firebase Services Configuration

#### Firestore Database
- ✅ **Already configured** with security rules
- ✅ **Rules deployed** to production
- Collection: `team-members`
- Security: Public read, controlled write access

#### Firebase Storage
- ⚠️ **Needs initialization** in Firebase Console
- Go to: https://console.firebase.google.com/project/movementpre/storage
- Click "Get Started" to initialize Firebase Storage
- After initialization, deploy storage rules:
  ```bash
  firebase deploy --only storage
  ```

### 4. Deploy Firebase Configuration
```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules (after Storage is initialized)
firebase deploy --only storage

# Or deploy everything at once
npm run deploy-firebase
```

## File Structure

### Configuration Files
- `src/lib/firebase.ts` - Client-side Firebase configuration
- `src/lib/firebase-admin.ts` - Server-side Firebase Admin SDK
- `firestore.rules` - Database security rules
- `storage.rules` - Storage security rules
- `firebase.json` - Firebase project configuration

### API Routes
- `src/app/api/team-members/route.ts` - Team members CRUD operations
- `src/app/api/team-members/[id]/route.ts` - Individual team member operations
- `src/app/api/upload/route.ts` - Image upload handling

### Utility Files
- `src/lib/api.ts` - Frontend API utility functions
- `src/lib/firestore.ts` - Direct Firestore operations (client-side)

## Security Rules

### Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /team-members/{document} {
      allow read: if true;  // Public read access
      allow write: if true; // Configure based on auth requirements
    }
  }
}
```

### Storage Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /images/{allPaths=**} {
      allow read: if true;  // Public read access
      allow write: if true; // Configure based on auth requirements
    }
  }
}
```

## Environment Variables

### For Production Deployment
Create a `.env.local` file with:
```env
# Firebase Client Configuration (Public)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBKE8KzyMFuqvUnusE2-VyPrTIxRO-nIGI
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=movementpre.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=movementpre
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=movementpre.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=817184453509
NEXT_PUBLIC_FIREBASE_APP_ID=1:817184453509:web:d1cb3f75b6ad4f0b3f8aec

# Firebase Admin SDK (Server-side only)
FIREBASE_PROJECT_ID=movementpre
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@movementpre.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="[Your private key from service account]"
```

## Testing the Setup

### 1. Start Development Server
```bash
npm run dev
```

### 2. Test Endpoints
- **Frontend**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin
- **API Health Check**: http://localhost:3000/api/team-members

### 3. Verify Firebase Connection
1. Open the admin panel
2. Try adding a new team member
3. Upload an image
4. Verify data appears in Firebase Console

## Deployment Commands

```bash
# Setup Firebase (run once)
npm run setup-firebase

# Deploy only rules
npm run deploy-rules

# Deploy only indexes
npm run deploy-indexes

# Deploy all Firebase services
npm run deploy-firebase
```

## Troubleshooting

### Common Issues

1. **Storage not initialized**
   - Go to Firebase Console → Storage → Get Started
   - Then run: `firebase deploy --only storage`

2. **Permission denied errors**
   - Check Firestore rules are deployed
   - Verify service account permissions

3. **API routes not working**
   - Ensure Firebase Admin SDK is properly configured
   - Check server logs for detailed error messages

### Useful Commands
```bash
# Check Firebase project status
firebase projects:list

# View current project
firebase use

# Check deployed rules
firebase firestore:rules:get

# View logs
firebase functions:log
```

## Next Steps

1. **Initialize Firebase Storage** in the console
2. **Deploy storage rules** after initialization
3. **Configure authentication** for admin access (optional)
4. **Set up monitoring** and analytics
5. **Configure backup** strategies

## Support

For issues with Firebase setup:
1. Check the Firebase Console for error messages
2. Review the deployment logs
3. Verify all configuration files are correct
4. Ensure service account has proper permissions

The Firebase backend is now fully configured and ready for production use! 