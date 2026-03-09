# Architecture

**Analysis Date:** 2026-03-09

## Pattern Overview

**Overall:** Multi-Page Application (MPA) with Vanilla JavaScript and Firebase Backend

**Key Characteristics:**
- Page-based navigation (HTML files per view)
- Client-side rendering with DOM manipulation
- Firebase for authentication and data persistence
- LocalStorage for offline cafe data caching
- Event-driven architecture with global auth state listener

## Pages / Views

**`index.html` (Discover Page):**
- Purpose: Main cafe discovery and browsing
- Location: `/index.html`
- Protected: Yes (redirects to auth.html if not signed in)
- Features: Search, filter by location, sort by various criteria, display cafe grid
- Scripts: `app.js`, `cafe-data.js`, `auth.js`

**`auth.html` (Authentication):**
- Purpose: User sign-in and sign-up
- Location: `/auth.html`
- Protected: No (landing page)
- Features: Email/password auth, Google OAuth, toggle between sign-in/sign-up modes
- Scripts: `auth.js`

**`cafe-detail.html` (Cafe Detail):**
- Purpose: Individual cafe information, booking, reviews
- Location: `/cafe-detail.html`
- Protected: No (public, but booking/review require auth)
- Features: View cafe details, book table, write review, toggle favorites
- Scripts: `cafe-detail.js`, `cafe-data.js`

**`bookings.html` (My Bookings):**
- Purpose: User's table reservations
- Location: `/bookings.html`
- Protected: Yes (redirects to auth.html if not signed in)
- Features: View upcoming/past/cancelled bookings, cancel bookings
- Scripts: `bookings.js`, `auth.js`

**`favorites.html` (My Favorites):**
- Purpose: Saved favorite cafes
- Location: `/favorites.html`
- Protected: Yes (redirects to auth.html if not signed in)
- Features: View and remove favorite cafes
- Scripts: `favorites.js`, `cafe-data.js`, `auth.js`

**`reviews.html` (Community Reviews):**
- Purpose: Browse all community reviews
- Location: `/reviews.html`
- Protected: No (public)
- Features: Filter by cafe, sort reviews, view stats
- Scripts: `reviews.js`

**`setup.html` (Firebase Setup Helper):**
- Purpose: Interactive Firebase configuration guide
- Location: `/setup.html`
- Protected: No
- Features: Step-by-step setup, config generator, downloads firebase-compat-config.js

## Layers

**Presentation Layer (HTML/CSS):**
- Located: `.html` files and `styles.css`
- Purpose: UI markup, styling, layout
- Responsive design with mobile-first approach
- Coffee-themed dark aesthetic (#1A0F0A background, #C8853A gold accents)
- CSS Grid and Flexbox layouts

**Application Logic Layer (JavaScript):**
- Located: `*.js` files (each page has its own)
- Purpose: Page-specific functionality, event handlers, data binding
- Each page handles its own initialization and rendering
- Direct DOM manipulation (no framework)

**Data Layer (Firebase):**
- Firebase Firestore: `db` collection access
- Firebase Auth: `auth` user management
- Location: `firebase-compat-config.js` (initialization)
- Used for: User accounts, favorites, bookings, reviews

**Local Cache Layer (localStorage):**
- Key: `'cafes'` - stores complete cafe dataset
- Purpose: Offline access to cafe information, faster loading
- Populated by `cafe-data.js` on first load
- Independent of Firebase (Firebase does NOT store cafe data)

## Data Flow

**Cafe Discovery Flow (index.html):**
1. Page loads → `app.js` initializes
2. Auth state change listener fires → `loadCafes()`
3. `loadCafes()` reads from `localStorage` (or `sampleCafes` fallback)
4. Cafes stored in memory (`cafe` array)
5. `buildLocationPills()` creates filter UI
6. `filterCafes()` applies search/filter/sort
7. `renderGrid()` generates HTML for cafe cards
8. User clicks card → navigates to `cafe-detail.html?id={docId}`

**Authentication Flow:**
1. User visits `auth.html`
2. `auth.js` checks `onAuthStateChanged`
3. If authenticated → redirect to `index.html`
4. Sign-in form submission → `handleAuth()` → `auth.signInWithEmailAndPassword()`
5. Sign-up → `createUserWithEmailAndPassword()` → update profile → create user doc
6. Google sign-in → `auth.signInWithPopup(provider)` → check/create user doc
7. Success → redirect to `index.html`

**Cafe Detail & Booking Flow:**
1. URL param `?id={docId}` extracted
2. Load cafe from `localStorage` (or `sampleCafes`)
3. `renderCafeDetail()` populates UI
4. `checkFavorite()` queries Firestore subcollection if authenticated
5. "Book a Table" → checks auth → opens modal → form submit → `db.collection('bookings').add()`
6. "Write Review" → checks auth → opens modal → form submit → `db.collection('reviews').add()`
7. "Favorite" button → toggles Firestore `users/{uid}/favorites/{cafeId}`

**Bookings Management Flow:**
1. Protected page → auth check redirects if needed
2. `loadBookings()` queries `db.collection('bookings').where('userId', '==', uid)`
3. 15-second timeout wrapper prevents indefinite loading
4. Bookings sorted by `createdAt` descending
5. `switchTab()` filters by status (upcoming/past/cancelled) based on date
6. Cancel → confirmation modal → `db.collection('bookings').doc(id).update({status: 'cancelled'})`

**Favorites Flow:**
1. Protected page → auth check
2. `loadFavorites()` queries `users/{uid}/favorites` subcollection
3. Gets cafe IDs → maps to full cafe objects from `localStorage`
4. Render grid of favorite cafe cards
5. Remove → `db.collection('users').doc(uid).collection('favorites').doc(cafeId).delete()`

**Reviews Flow:**
1. Public page → loads all reviews from `db.collection('reviews')` (paginated)
2. `loadCafeFilter()` populates dropdown from `localStorage` cafes
3. `filterReviews()` applies cafe filter and/or sort order
4. `updateStats()` calculates total reviews, average rating, most reviewed cafe
5. Within cafe detail page, loads last 5 reviews for that cafe

## State Management

- No centralized state store
- Each page maintains its own state in local variables
- Shared state via:
  - **localStorage**: `cafes` key holds all cafe data (shared across pages)
  - **Firestore**: User-specific data (favorites, bookings, reviews)
  - **URL params**: `cafe-detail.html` receives `id` param
  - **Global `auth` object**: Firebase auth state available to all pages

## Entry Points

**Browser Entry:** Each HTML file is directly navigable

**Code Entry Points:**
- `auth.onAuthStateChanged()`: Central auth state listener (every page)
- `DOMContentLoaded` event listeners: Page-specific initialization
- Inline `onclick` handlers: UI interactions mapped to functions
- `window.location.href`: Navigation between pages

## Error Handling

**Pattern:**
- Try-catch blocks around Firebase operations
- Toast notifications commented out (disabled)
- Fallback to local data if Firebase fails
- Timeout protection for queries (bookings.js: 15s)
- Loading states and empty states in UI
- Alert dialogs for errors (basic)

**Examples:**
```javascript
// app.js loadCafes() fallback
try {
  cafes = sampleCafes.map(...);
} catch (err) {
  console.error('Error loading cafes:', err);
  cafes = sampleCafes.map(...);  // fallback
}

// bookings.js timeout wrapper
const timeoutPromise = new Promise((_, reject) =>
  setTimeout(() => reject(new Error('QUERY_TIMEOUT')), 15000)
);
const queryPromise = db.collection('bookings').where(...).get();
const snapshot = await Promise.race([queryPromise, timeoutPromise]);
```

## Cross-Cutting Concerns

**Authentication:**
- `onAuthStateChanged` listener on every page
- Redirects for protected pages (`index.html`, `bookings.html`, `favorites.html`)
- UI updates: `user-display` element shows user name/email
- Sign out: `auth.signOut()` → redirect to `auth.html`

**Responsive Design:**
- Media queries at 900px, 768px, 600px breakpoints
- Mobile-optimized layouts with stacked grids
- Flexible typography with `clamp()` for hero heading

**Offline Support:**
- Cafe data in `localStorage` persists and works offline
- Firestore offline persistence enabled in `firebase-compat-config.js`: `db.enablePersistence()`
- User data requires online connection for CRUD operations

**Navigation:**
- Full page reloads between views (no SPA routing)
- Consistent header navigation on all pages except auth
- Active nav link highlighting based on page
