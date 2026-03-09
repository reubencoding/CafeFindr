# Integrations

**Analysis Date:** 2026-03-09

## APIs & External Services

### Firebase (Primary)

**Services Used:**
- **Firebase Authentication** - User identity and access management
- **Cloud Firestore** - NoSQL document database
- **Firebase Analytics** - Initialized but NOT actively used

**SDK/Client:**
- Firebase JS SDK v10.7.1 (Compat version)
- Loaded via CDN: `https://www.gstatic.com/firebasejs/10.7.1/firebase-*.js`
- Compat SDK: simpler API for vanilla JS (no tree-shaking)

**Configuration:**
```javascript
// firebase-compat-config.js
const firebaseConfig = {
  apiKey: "AIzaSyCCE5D-s4osZN9J7dhesbI5CGWkPxSi0Tw",
  authDomain: "cafe-5b867.firebaseapp.com",
  projectId: "cafe-5b867",
  storageBucket: "cafe-5b867.firebasestorage.app",
  messagingSenderId: "922765379923",
  appId: "1:922765379923:web:a1c362a9514eba941239a6",
  measurementId: "G-R7K624GCEH"
};
```
- Project ID: `cafe-5b867`
- All Firebase services tied to this project

**Authentication Provider:**
- Email/Password
- Google OAuth 2.0

**Firestore Database:**
- Collections: `bookings`, `reviews`, `users`, and subcollections
- **NOT used for cafes**: Cafe data stored locally instead
- Security rules required (see separate section)

**Initialization:**
```javascript
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.firestore();
db.enablePersistence({ synchronizeTabs: true });
```

### Google OAuth

**Implementation:**
- Via Firebase Authentication Google provider
- No direct Google API usage
- Scopes: default profile + email

**Setup Required:**
- Enable "Google" provider in Firebase Console → Authentication → Sign-in method
- Add authorized domains (localhost, 127.0.0.1 for development)

**User Data:**
- Display name
- Email
- Photo URL (stored but not displayed)

### Google Fonts

**Fonts Used:**
- Playfair Display (headings, serif)
- Lato (body, sans-serif)

**Loading:**
```html
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Lato:wght@300;400;700&display=swap" rel="stylesheet" />
```

**Fallbacks:**
- If fonts fail to load, system fonts render (Times New Roman for serif, Arial/Helvetica for sans)
- CSS font-family stacks defined in `styles.css`:
  - Headings: `'Playfair Display', serif`
  - Body: `'Lato', sans-serif`

## Browser APIs

**Web Share API:**
- Used in `cafe-detail.js`: `navigator.share()`
- Fallback to clipboard copy API if not available
- Shares cafe name and page URL

**Clipboard API:**
- `navigator.clipboard.writeText()`
- Used when Web Share unavailable
- Requires HTTPS in production

**Tel URI Scheme:**
- `window.location.href = 'tel:${phone}'`
- Opens phone dialer on mobile devices

**localStorage:**
- Key: `'cafes'` - cached cafe dataset
- API: `localStorage.getItem()`, `localStorage.setItem()`
- Persists across browser sessions
- Not synced across devices

**Firestore Offline Persistence:**
- Enabled: `db.enablePersistence({ synchronizeTabs: true })`
- IndexedDB backend (automatic)
- Syncs when back online

**Console Logging:**
- `console.log()`, `console.error()` for debugging
- No structured logging

## Configuration & Secrets

**Environment Configuration:**

**Required Variables (none):**
- No `.env` file
- No environment variable loading
- Firebase config hardcoded in `firebase-compat-config.js`

**Secrets Location:**
- **None** - Firebase config values are not secret (public identifiers)
- `firebase-compat-config.js` is committed to repo
- Production recommendations: use Firebase Hosting env config or re-build on deploy

**Sensitive Operations:**
- All security enforced via Firebase Security Rules (must be configured)
- No server-side validation (client-side only)

## Data Storage

### Firestore Collections

**`users` (Collection)**
- Document ID: Firebase Auth UID
- Purpose: User profile
- Fields: `name`, `email`, `photoURL?`, `createdAt`
- Access: User can read/write own document only (rule)
- Created on sign-up or first Google sign-in

**`users/{userId}/favorites` (Subcollection)**
- Document ID: Cafe ID (e.g., `cafe_001`)
- Purpose: User's saved cafes
- Fields: `cafeId`, `cafeName`, `addedAt`
- Access: User can read/write own favorites only
- Queried: `db.collection('users').doc(uid).collection('favorites').orderBy('addedAt', 'desc')`

**`bookings` (Collection)**
- Document ID: Auto-generated Firestore ID
- Purpose: Table reservations
- Fields:
  ```javascript
  {
    userId, userName,
    cafeId, cafeName, cafeEmoji, cafeColor,
    date, time, guests, notes?,
    status: 'confirmed' | 'pending' | 'cancelled' | 'completed',
    createdAt
  }
  ```
- Access:
  - Read: User can read their own bookings, admins (with claim) can read all
  - Create: Authenticated users
  - Update: User can update own bookings
- Queried: `db.collection('bookings').where('userId', '==', uid)`

**`reviews` (Collection)**
- Document ID: Auto-generated Firestore ID
- Purpose: User reviews for cafes
- Fields:
  ```javascript
  {
    userId, userName, userPhoto?,
    cafeId, cafeName,
    rating: 1-5,
    text,
    createdAt
  }
  ```
- Access:
  - Read: Public (anyone)
  - Create: Authenticated users
  - Update/Delete: Author only
- Queried: By cafeId, optionally with rating sort

**`cafes` (Collection)**
- **NOT CREATED OR USED**
- Documented for reference only
- App uses localStorage instead

### localStorage

**Key: `'cafes'`**
- Value: `JSON.stringify(sampleCafes)`
- 19 cafe objects
- Initialized by `cafe-data.js` `initializeCafes()` on first load
- Persists until cleared by user/browser
- **Not synchronized with Firebase**

**Purpose:**
- Eliminates need to upload cafe data to Firestore
- Faster loading (no network request)
- Offline-first experience for cafe browsing
- Simplified setup (no Firebase cafes collection needed)

**Data Integrity:**
- Can be manually edited via browser devtools
- No validation on read
- Refresh page retains changes (until localStorage cleared)

## Security Rules

**Location:** Firestore Database → Rules tab

**Required Rules (from DATA_STRUCTURE.md):**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Cafes - public read, admin write (NOT USED)
    match /cafes/{cafeId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }

    // User data - users can only read/write their own
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      // Favorites subcollection
      match /favorites/{favoriteId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }

    // Bookings
    match /bookings/{bookingId} {
      allow read: if request.auth != null &&
        (request.auth.uid == resource.data.userId ||
         request.auth.token.admin == true);
      allow create: if request.auth != null;
      allow update: if request.auth != null &&
        (request.auth.uid == resource.data.userId ||
         request.auth.token.admin == true);
    }

    // Reviews
    match /reviews/{reviewId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null &&
        request.auth.uid == resource.data.userId;
    }
  }
}
```

**Note:** `admin` claim is referenced but not set anywhere. Admin functionality unimplemented.

## CI/CD & Deployment

**No CI/CD Configured:**
- No GitHub Actions, GitLab CI, Jenkins, etc.
- Manual deployment process

**Recommended Hosting:**

**Firebase Hosting (Native):**
```bash
npm install -g firebase-tools
firebase login
firebase init hosting  # link to project cafe-5b867
firebase deploy
```

**Static Host Alternatives:**
- GitHub Pages
- Netlify
- Vercel
- Any static file host supporting SPA (though this is MPA)

**Requirements:**
- HTTPS for OAuth (Google sign-in)
- `firebase-compat-config.js` must be deployed with correct project config
- CORS headers not required (static files)

**Build Step:**
- None (copy files to host)
- No transpilation
- No minification

## Webhooks & Callbacks

**Incoming:**
- None (no webhook endpoints)
- Firebase Auth triggers could be added but not configured

**Outgoing:**
- None (no third-party API calls from backend)
- All Firebase calls are SDK-based (client SDK)

## Authentication Flow Details

**Sign-Up (Email/Password):**
```
1. User enters name, email, password
2. Validation: non-empty, password ≥6 chars
3. auth.createUserWithEmailAndPassword(email, pass)
4. On success: user.updateProfile({ displayName: name })
5. Create user doc: db.collection('users').doc(uid).set({name, email, createdAt})
6. Redirect to index.html
```

**Sign-In (Email/Password):**
```
1. User enters email, password
2. Validation: non-empty
3. auth.signInWithEmailAndPassword(email, pass)
4. onAuthStateChanged fires → redirect to index.html
```

**Google Sign-In:**
```
1. User clicks "Continue with Google"
2. Create provider: new firebase.auth.GoogleAuthProvider()
3. auth.signInWithPopup(provider)
4. On success: check if user doc exists in 'users'
5. If not exists: create with displayName, email, photoURL
6. Redirect to index.html
```

**Sign-Out:**
```
auth.signOut()
→ onAuthStateChanged fires
→ redirect to auth.html
```

**Auth State Persistence:**
- Firebase default: local persistence (survives tab close)
- Controlled by `auth.setPersistence()` (not customized)

## Error Handling Integration

**Firebase Errors:**
- Displayed via `alert(err.message)`
- Common errors:
  - `auth/email-already-in-use` (sign-up collision)
  - `auth/invalid-credential` (wrong password)
  - `auth/user-not-found` (sign-in non-existent)
  - `auth/network-request-failed` (offline)
  - `FirebaseError: [code=permission-denied]` (rules violation)
  - `FirebaseError: [code=unavailable]` (Firebase down)

**Network Timeout:**
- Bookings page: 15s timeout
- Generic: No retry, user must manually retry

**Firestore Offline:**
- App catches `unavailable` errors
- Shows error state, suggests checking connection

## Monitoring & Observability

**Error Tracking:**
- None
- Only `console.error()` and UI alerts
- No Sentry, LogRocket, Firebase Crashlytics

**Analytics:**
- Firebase Analytics initialized but NOT used
- No `logEvent()` calls in code
- No custom events tracked

**Performance:**
- No performance monitoring
- No RUM (Real User Monitoring)

## Platform Limits & Quotas

**Firebase Free Tier (Spark):**
- Authentication: Unlimited users
- Firestore:
  - 1 GiB storage
  - 50,000 reads/day
  - 20,000 writes/day
  - 20,000 deletes/day
- Bandwidth: 10 GiB/month

**Potential Issues:**
- No pagination on cafes reads (entire dataset loaded each time)
- No query optimization (can exceed read quota if dataset grows)
- 19 cafes × multiple users = multiply reads

## Dependencies Summary

| Dependency | Type | Version | Purpose |
|------------|------|---------|---------|
| Firebase JS SDK (Compat) | CDN | 10.7.1 | Auth + Firestore |
| Google Fonts API | CDN | N/A | Typography |
| Web Share API | Native | N/A | Sharing (if supported) |
| localStorage | Native | N/A | Cafe data cache |
| IndexedDB | Native | N/A | Firestore offline persistence |

**Zero NPM packages** used.
