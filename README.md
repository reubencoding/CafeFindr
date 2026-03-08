# ☕ CafeFindr (formerly BREW) — Chennai's Café Guide

A full-stack café discovery and booking web application for Chennai, built with **vanilla HTML/CSS/JS** and **Firebase** (free tier).

**Repository**: https://github.com/reubencoding/CafeFindr

---

## 🚀 Features

### Core Features
- **Café Discovery** — Browse 12+ handpicked cafés across Chennai
- **Search & Filter** — Search by name, area, or vibe; filter by neighborhood
- **Detailed Pages** — Each café has its own page with menu, reviews, and booking
- **Favorites** — Save cafés to your personal list
- **Table Booking** — Book tables at your favorite cafés
- **Reviews** — Read and write reviews for cafés
- **Responsive Design** — Works on desktop, tablet, and mobile

### Backend Features (Firebase)
- **Authentication** — Email/password and Google sign-in
- **Real-time Database** — Firestore for cafés, bookings, reviews, and favorites
- **Offline Support** — Data persists offline and syncs when online
- **User Profiles** — Each user has their own favorites and bookings

---

## 📁 Project Structure

```
cafe/
├── auth.html           # Login/signup page (default landing page)
├── index.html          # Main discovery page (protected, redirects to auth.html if not signed in)
├── cafe-detail.html    # Individual café page (public)
├── bookings.html       # My bookings page (protected)
├── favorites.html      # My favorites page (protected)
├── reviews.html        # Community reviews page (public)
├── styles.css          # All styles
├── firebase-config.js  # Firebase configuration
├── app.js              # Main app logic
├── auth.js             # Authentication logic
├── cafe-detail.js      # Café detail page logic
├── bookings.js         # Bookings page logic
├── favorites.js        # Favorites page logic
├── reviews.js          # Reviews page logic
└── README.md           # This file
```

---

## 🛠️ Setup Instructions

### Step 1: Create a Firebase Project (FREE)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and name it "brew-chennai" (or any name)
3. Disable Google Analytics (or enable if you want)
4. Click "Create project"

### Step 2: Register Your Web App

1. In your Firebase project, click the web icon (`</>`) to add a web app
2. Give it a nickname (e.g., "brew-web")
3. Click "Register app"
4. **Copy the Firebase config object** that looks like this:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

### Step 3: Update firebase-config.js

1. Open `firebase-config.js` in your code editor
2. Replace the placeholder values with your actual Firebase config
3. Save the file

### Step 4: Enable Authentication

1. In Firebase Console, go to **Build → Authentication**
2. Click "Get started"
3. Enable **Email/Password** provider
4. Enable **Google** provider (add your support email)
5. Save

### Step 5: Set Up Firestore Database

1. In Firebase Console, go to **Build → Firestore Database**
2. Click "Create database"
3. Choose **Start in test mode** (allows read/write for 30 days)
4. Select a location (e.g., "asia-south1" for India)
5. Click "Enable"

---

## 🔐 Authentication Flow

- **Default landing page**: `auth.html` (login/signup)
- If an unauthenticated user tries to access `index.html` directly, they are automatically redirected to `auth.html`
- **Public pages** (accessible without authentication):
  - `auth.html` - Login/signup
  - `cafe-detail.html` - View café details (requires sign-in only for bookings/reviews)
  - `reviews.html` - Community reviews
- **Protected pages** (require authentication):
  - `index.html` - Main discovery page
  - `bookings.html` - My bookings
  - `favorites.html` - My favorites
- After successful authentication, users are redirected to `index.html`
- After sign out, users are redirected to `auth.html`

---

### Step 6: Create Security Rules

1. Go to **Firestore Database → Rules** tab
2. Replace the rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to all users
    match /cafes/{cafeId} {
      allow read: if true;
    }

    // Allow users to read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      match /favorites/{favoriteId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }

    // Allow authenticated users to create bookings and reviews
    match /bookings/{bookingId} {
      allow read: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
      allow update: if request.auth != null && request.auth.uid == resource.data.userId;
    }

    match /reviews/{reviewId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

3. Click "Publish"

---

## 🖥️ Running the App

### Option 1: Open Directly (No Server Required)

1. Simply open `auth.html` in your browser
2. The app will work with localStorage as a fallback

### Option 2: Use a Local Server (Recommended)

For the best experience with Firebase:

**Using VS Code:**
1. Install "Live Server" extension
2. Right-click on `auth.html` → "Open with Live Server"

**Using Python:**
```bash
cd cafe
python -m http.server 8080
# Open http://localhost:8080/auth.html
```

**Using Node.js:**
```bash
npm install -g http-server
cd cafe
http-server -p 8080
# Open http://localhost:8080/auth.html
```

---

## 🔧 Alternative Backend Options (No Firebase)

If you don't want to use Firebase, here are other **free** backend options:

### Option 1: Supabase (Recommended Alternative)
- PostgreSQL database
- Real-time subscriptions
- Auth included
- Free tier: 500MB database, 2GB bandwidth
- Website: [supabase.com](https://supabase.com)

### Option 2: Appwrite
- Open source backend
- Auth, database, storage
- Self-host or use cloud
- Website: [appwrite.io](https://appwrite.io)

### Option 3: LocalStorage Only (No Backend)
- The app already has localStorage fallback
- Data won't sync between devices
- No user accounts

---

## 📝 Features Checklist

- [x] Responsive design with beautiful coffee-themed aesthetics
- [x] Multi-page architecture (Home, Auth, Detail, Bookings, Favorites, Reviews)
- [x] Firebase Authentication (Email/Password + Google)
- [x] Firestore database for cafés, bookings, reviews, favorites
- [x] Search and filter functionality
- [x] Café detail pages with menu and amenities
- [x] Table booking system
- [x] Review system with ratings
- [x] Favorites functionality
- [x] Offline support with localStorage fallback

---

## 🐛 Troubleshooting

### "Firebase is not defined" error
- Make sure you're running the app on a local server (not just opening the file)
- Check that the Firebase CDN scripts loaded correctly

### Google Sign-in "unauthorized-domain" error
This error occurs when the domain you're running your app on is not added to Firebase's authorized domains list. To fix it:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Authentication → Settings** (or **Authentication → Sign-in method** → **Settings** tab)
4. Click "Authorized domains"
5. Add the following domains:
   - `localhost`
   - `127.0.0.1`
   - Any custom domain you're using (e.g., `your-app.github.io`)
6. Click "Save"

**Note:** This is required for Google OAuth to work locally. Without it, Google Sign-in will fail with an "unauthorized-domain" error.

### "Permission denied" error
- Check your Firestore security rules
- Make sure the user is signed in

### Data not loading
- Check your internet connection
- Open browser console (F12) for error messages
- Try refreshing the page

---

## 🎨 Customization

### Add More Cafés
Edit the `sampleCafes` array in `app.js` to add more cafés. The format is:

```javascript
{
  id: '13',
  name: 'Your Café Name',
  address: 'Full Address',
  area: 'Neighborhood',
  rating: 4.5,
  reviews: 0,
  price: '₹₹',
  hours: '9:00 AM – 10:00 PM',
  phone: '+91 98765 43210',
  tags: ['Tag1', 'Tag2', 'Tag3'],
  description: 'Description here',
  emoji: '☕',
  color: '#6B3A2A',
  menu: [
    {name: 'Item 1', price: '₹100'},
    {name: 'Item 2', price: '₹200'}
  ],
  amenities: ['WiFi', 'Parking', 'Air Conditioned']
}
```

### Change Colors
Edit the CSS variables in `styles.css` to change the color scheme.

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## ☕ Credits

Created for coffee lovers in Chennai. Enjoy exploring the city's café culture!
