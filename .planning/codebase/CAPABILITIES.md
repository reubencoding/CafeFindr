# Capabilities

**Analysis Date:** 2026-03-09

## Overview

BREW (CafeFindr) is a full-stack café discovery and booking web application focused on Chennai, India. It combines client-side local storage for café data with Firebase backend for user accounts and interactions.

## Current Features

### User Authentication

**Email/Password Registration:**
- Sign up with email and password (minimum 6 characters)
- Full name collection
- User profile created in Firestore `users` collection
- Validation: required fields, password length

**Email/Password Sign-In:**
- Sign in with registered credentials
- Redirects to discover page on success
- Error display via alert

**Google Sign-In:**
- OAuth via Google
- Auto-creates user profile if doesn't exist
- Uses display name and photo from Google

**Session Management:**
- Persistent login via Firebase Auth
- Sign out redirects to auth page
- User display name shown in header

**Protected Routes:**
- `index.html` (Discover) - requires auth
- `bookings.html` - requires auth
- `favorites.html` - requires auth
- Public routes: `auth.html`, `cafe-detail.html`, `reviews.html`

### Café Discovery (index.html)

**Cafe Dataset:**
- 19 pre-loaded cafés from Chennai
- Data stored in `cafe-data.js` as `sampleCafes` array
- Cached in localStorage for offline access
- Each cafe includes:
  - Name, location, rating, tables
  - Address, phone, hours, price range
  - Description, tags, amenities
  - Menu items with prices
  - Emoji icon and theme color
  - Image path (referenced images may not exist)

**Search:**
- Real-time search via input field
- Matches against cafe name only (case-insensitive)
- Live filtering as user types
- No debounce (fires on every keystroke)

**Location Filter:**
- Dynamic location pills generated from cafe data
- Locations include: T. Nagar, Velachery, Mylapore, Adyar, Kilpauk, Nungambakkam, San Thome, Besant Nagar, Alwarpet, Egmore, Anna Nagar, etc.
- "All" option to show all cafes
- Single selection, persists across search

**Sorting:**
- Sort by: Rating (high→low), Most Reviewed, Price Low→High, Price High→Low, Name A-Z
- Sort order not preserved in URL or state persistence
- Combined with search and location filter

**Results Display:**
- Responsive grid: `repeat(auto-fill, minmax(300px, 1fr))`
- Cafe cards with:
  - Cafe icon (emoji) with themed background
  - Star rating display
  - Review count
  - Name, location, price range
  - Short description
  - Tags
  - Hours and "VIEW →" indicator
- Click card → navigate to detail page

**Result Count:**
- Shows number of cafes after filtering
- "1 café found" or "X cafés found"

**Empty States:**
- "No cafés found" when filters match nothing
- Allows user to adjust search

### Café Detail (cafe-detail.html)

**Cafe Information Display:**
- Hero section with large emoji/name/address
- Action buttons: Book Table, Favorite, Share
- Stats grid: Rating, Review Count, Tables, Location
- About section: Full description + tags
- Menu Preview: 4 sample menu items (name + price)
- Reviews section: Last 5 reviews (from Firestore)
- Sidebar:
  - Hours
  - Contact (phone with "Call Now" button)
  - Map placeholder (coming soon)
  - Amenities list

**Booking System:**
- Requires authentication
- Modal with form:
  - Date picker (min tomorrow, default tomorrow)
  - Time slots: 8:00 AM - 10:00 PM in 30-minute increments
  - Guest count: 1-7+ (dropdown)
  - Special requests textarea
- Submit creates document in `bookings` collection
- Success → redirect to bookings page

**Review Writing:**
- Requires authentication
- Modal with star rating selector (1-5 stars, clickable)
- Review text textarea (required)
- Submit creates document in `reviews` collection
- Increments cafe's review count in localStorage
- Shows success toast (commented out, currently no-op)

**Favorites:**
- Requires authentication
- Toggle button (Add/Remove)
- Heart emoji state change (🤍/❤️)
- Subcollection: `users/{uid}/favorites/{cafeId}`
- Stores cafeId and cafeName with timestamp

**Sharing:**
- Uses Web Share API if available
- Falls back to clipboard copy
- Shares current page URL and cafe name

**Mobile Calling:**
- "Call Now" button uses `tel:` URI
- Triggers phone app on mobile devices

### My Bookings (bookings.html)

**Tabbed Interface:**
- Three tabs: Upcoming, Past, Cancelled
- Status-based filtering:
  - Upcoming: `status !== 'cancelled'` and date in future
  - Past: `status !== 'cancelled'` and date in past
  - Cancelled: `status === 'cancelled'`

**Booking List:**
- Chronological order (newest first)
- Each booking card shows:
  - Cafe emoji icon with themed background
  - Cafe name
  - Date and time
  - Guest count
  - Notes indicator if present
  - Status badge (confirmed/pending/cancelled/completed)
  - Cancel button (for upcoming confirmed only)

**Cancellation:**
- Confirmation modal before cancelling
- Updates booking status to 'cancelled'
- Sets `cancelledAt` timestamp
- Refreshes list after cancellation

**Error Handling:**
- Timeout after 15 seconds if query hangs
- Retry button shown on error
- Error messages display connection/troubleshooting info

**Empty States:**
- Sign-in prompt for non-authenticated users
- "No bookings yet" for authenticated users with zero bookings

### My Favorites (favorites.html)

**Favorites Grid:**
- Same card layout as discover page
- Shows full cafe info (image, rating, description, tags, hours)
- "REMOVE" button on each card
- Click card → detail page

**Management:**
- Remove favorite via button click (prevents event bubbling)
- Deletes from `users/{uid}/favorites/{cafeId}` subcollection
- Updates UI immediately

**Empty States:**
- Sign-in prompt for guests
- "No favorites yet" for authenticated users

### Community Reviews (reviews.html)

**Stats Dashboard:**
- Total reviews count
- Average rating (computed from all reviews)
- Most reviewed café (name extracted)

**Filtering & Sorting:**
- Filter by café (dropdown populated from localStorage cafes)
- Sort by: Newest first, Highest rated, Lowest rated
- Reset filters by selecting "All Cafés"

**Reviews Grid:**
- Paginated display: 9 reviews per page
- "Load More" button if more reviews available
- Review cards show:
  - Cafe name (link to detail page)
  - Star rating
  - Author name
  - Date
  - Review text

**Empty States:**
- "No reviews yet" when collection empty
- "No reviews found" when filter matches nothing

**Public Access:**
- No authentication required (authenticated users see their own name, guests see same data)

### Setup & Configuration

**Firebase Setup Helper (setup.html):**
- Interactive 5-step wizard
- Step 1: Create Firebase project
- Step 2: Add web app
- Step 3: Paste config → validates JSON, generates download
- Step 4: Enable services (Auth + Firestore)
- Step 5: Done!
- Pre-filled with project config for convenience
- Downloads `firebase-compat-config.js` automatically

**Local Mode Documentation (LOCAL_MODE.md):**
- Explains running without Firebase
- Features that work/break in local-only mode
- Server setup instructions

**Data Structure Documentation (DATA_STRUCTURE.md):**
- Defines all Firestore collections and document schemas
- Includes security rules reference
- Example queries for common operations
- Complete field descriptions

## Data Model

### Firestore Collections

**`users` (Collection)**
- Document ID: Firebase UID
- Fields: `name`, `email`, `photoURL` (optional), `createdAt`

**`users/{userId}/favorites` (Subcollection)**
- Document ID: Cafe ID (`cafe_001`, etc.)
- Fields: `cafeId`, `cafeName`, `addedAt`

**`bookings` (Collection)**
- Document ID: Auto-generated
- Fields:
  - `userId` (string)
  - `userName` (string)
  - `cafeId` (string)
  - `cafeName` (string)
  - `cafeEmoji` (string)
  - `cafeColor` (string)
  - `date` (string, YYYY-MM-DD)
  - `time` (string, HH:MM)
  - `guests` (number)
  - `notes` (string, optional)
  - `status` (string: confirmed/pending/cancelled/completed)
  - `createdAt` (timestamp)

**`reviews` (Collection)**
- Document ID: Auto-generated
- Fields:
  - `userId` (string)
  - `userName` (string)
  - `userPhoto` (string, optional)
  - `cafeId` (string)
  - `cafeName` (string)
  - `rating` (number 1-5)
  - `text` (string)
  - `createdAt` (timestamp)

**`cafes` (Collection)**
- **NOT USED** - Cafes stored locally instead
- Documented in `DATA_STRUCTURE.md` but not implemented

### localStorage

**Key: `'cafes'`**
- Value: JSON stringified array of cafe objects
- 19 entries matching `sampleCafes` from `cafe-data.js`
- Structure matches Firestore schema but without timestamps
- Read on app init, updated locally (not synced to Firebase)

## User Experience

**Design System:**
- Dark coffee theme: background `#1A0F0A`, text `#F5E6D3`, accent `#C8853A`
- Typography: Playfair Display (headings) + Lato (body)
- Responsive breakpoints: 900px, 768px, 600px
- Glass-morphism: semi-transparent backgrounds with blur
- Gradient accents for buttons and highlights
- Custom scrollbar styling

**Responsive Behavior:**
- Desktop: Multi-column grid, horizontal navigation
- Tablet (≤900px): Single-column layouts, stacked sidebars
- Mobile (≤600px): Collapsible filters, single-column grid, simplified header

**Interactions:**
- Hover effects: card lift, button highlights, border glow
- Smooth transitions (0.3s ease)
- Loading spinners during async operations
- Modal overlays for forms
- Active state indication on navigation

**Feedback:**
- Loading states show spinners
- Error states display retry options
- Toast notifications exist but are disabled (no-op functions)
- Form validation shows inline error messages
- Success redirects or button state changes

## Offline Capabilities

**Available Offline:**
- Browse all cafes (from localStorage)
- Search and filter cafes
- View cafe details
- See previously loaded reviews (cached in Firestore offline persistence)

**Unavailable Offline:**
- Authentication (Firebase requires network)
- Favorites (writes to Firestore, reads from local cache don't work without real query)
- Bookings (writes to Firestore)
- Reviews (writes to Firestore)
- User-specific data loading

## Integration Points

**Firebase Authentication:**
- Email/password sign-in/sign-up
- Google OAuth provider
- Auth state persistence across page reloads
- User profile management

**Firestore Database:**
- CRUD operations on bookings, reviews, favorites
- Query with filters and ordering
- Server timestamps for createdAt
- Offline persistence layer

**Web Share API:**
- Native sharing on mobile/supported browsers
- Fallback to clipboard API

**Tel URI Scheme:**
- Click-to-call functionality on mobile

**Google Fonts:**
- Loads Playfair Display and Lato fonts from CDN

## Known Limitations

1. **No café management UI**: Cafes cannot be CRUD through the app (hardcoded)
2. **No admin panel**: Admin flag referenced in rules but not implemented
3. **Images may be missing**: Image paths point to `/images/` but assets not present in repo
4. **No pagination for cafes**: All cafes loaded at once (scales to ~100 only)
5. **Toast notifications disabled**: `showToast()` is no-op
6. **No real-time updates**: Reviews don't refresh automatically when new ones added
7. **No search indexing**: Only name search, not tags/description
8. **No booking management by staff**: Cafés cannot view/modify bookings
9. **No café owner views**: No interface for cafe owners to manage their listing
10. **Security rules require manual setup**: Must be copy-pasted to Firestore

## Configuration Options

**Adjustable:**
- Firebase project (change config in `firebase-compat-config.js`)
- Number of reviews shown: `REVIEWS_PER_PAGE = 9` in `reviews.js`
- Time slot generation: 8-22 with 30-minute intervals in `cafe-detail.js`
- Query timeout: 15000ms in `bookings.js`

**Not Configurable:**
- Theme colors (hardcoded in CSS)
- Dataset size (fixed 19 cafes)
- Font families (Google Fonts hardcoded)
