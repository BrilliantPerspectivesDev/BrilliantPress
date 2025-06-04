# Brilliant Perspectives Media Kit

A modern, responsive media kit website for the Brilliant Perspectives team, built with Next.js 15, TypeScript, Tailwind CSS, and Firebase.

## Features

- 🎨 **Beautiful, Responsive Design** - Mobile-first design with modern UI components
- 🔥 **Firebase Backend** - Real-time database with Firestore and image storage
- 👥 **Team Member Profiles** - Complete profiles with photos, bios, book links, and social media
- ⚡ **Admin Panel** - Full CRUD operations for managing team member profiles
- 📱 **Mobile Responsive** - Optimized for all screen sizes
- 🚀 **Next.js 15** - Latest features with App Router and TypeScript
- 🎯 **Form Validation** - Robust form handling with react-hook-form and Zod

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Backend**: Firebase (Firestore, Storage, Auth)
- **Forms**: React Hook Form, Zod validation
- **UI Components**: Radix UI, Lucide React icons
- **Styling**: Tailwind CSS with custom utilities

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase project

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd brilliant-perspectives-media-kit
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Firestore Database
   - Enable Firebase Storage
   - Enable Authentication (optional, for admin access)
   - Get your Firebase configuration

4. **Environment Variables**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── admin/             # Admin panel pages
│   └── page.tsx           # Main media kit page
├── components/            # React components
│   ├── admin/             # Admin-specific components
│   ├── Header.tsx         # Navigation header
│   ├── LoadingSpinner.tsx # Loading component
│   └── TeamMemberCard.tsx # Team member display card
├── lib/                   # Utility libraries
│   ├── firebase.ts        # Firebase configuration
│   ├── firestore.ts       # Database operations
│   └── utils.ts           # Helper functions
└── types/                 # TypeScript type definitions
    └── index.ts           # Main type definitions
```

## Usage

### Public Media Kit
- Visit the homepage to view all team member profiles
- Responsive grid layout showcases each team member
- Click on book links and social media links to visit external sites

### Admin Panel
- Navigate to `/admin` to access the admin panel
- Add new team members with the "Add Team Member" button
- Edit existing profiles by clicking the edit icon
- Delete profiles with the delete icon (with confirmation)
- Upload profile photos directly through the form

### Team Member Data Structure
Each team member profile includes:
- **Name**: Full name
- **Bio**: Professional biography
- **Photo**: Profile image (uploaded to Firebase Storage)
- **Book Links**: Array of book titles, URLs, and descriptions
- **Social Links**: Array of social media platforms and URLs

## Firebase Setup

### Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /team-members/{document} {
      allow read: if true;
      allow write: if true; // Configure based on your auth requirements
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
      allow read: if true;
      allow write: if true; // Configure based on your auth requirements
    }
  }
}
```

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- DigitalOcean App Platform

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please contact the development team.
