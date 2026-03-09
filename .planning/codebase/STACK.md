# Technology Stack

**Analysis Date:** 2026-03-09

## Languages

**Primary:**
- **HTML5** - Page structure and content (`*.html` files)
- **CSS3** - Styling with custom properties, Grid, Flexbox (`styles.css`)
- **JavaScript (ES6+)** - Application logic (`*.js` files, no framework)

**Secondary:**
- **JavaScript (JSX/TSX not used)** - N/A
- **SQL** - Not used

## Runtime

**Environment:**
- **Browser** (Client-side JavaScript)
- Requires modern browser with ES6+ support
- No Node.js runtime needed for production

**Package Manager:**
- None (vanilla JavaScript, no dependencies via npm/yarn)
- Firebase SDK loaded via CDN
- Google Fonts loaded from CDN

## Frameworks

**Core:**
- **None** - Pure vanilla JavaScript, HTML, CSS
- Zero framework dependencies
- Custom DOM manipulation and event handling

**Testing:**
- None detected
- No Jest, Vitest, or other testing frameworks
- No test files present

**Build/Dev:**
- None (no build process)
- No Webpack, Vite, Parcel, or bundlers
- No transpilation required
- Direct browser execution

**Compatibility Layer:**
- **Firebase Compat SDK v10.7.1** - Firebase services with simpler API
  - `firebase-app-compat.js`
  - `firebase-auth-compat.js`
  - `firebase-firestore-compat.js`
  - Loaded from CDN: `https://www.gstatic.com/firebasejs/10.7.1/`

## Key Dependencies

**Critical:**
- **Firebase JS SDK v10.7.1** - Core backend services (via CDN)
  - Authentication
  - Firestore database
  - Analytics (initialized but not actively used)
- **localStorage API** - Client-side data persistence for cafe dataset

**Infrastructure:**
- **Google Fonts API** - Font loading (Playfair Display, Lato)
- **Firebase Hosting** (implied) - Production deployment target

**No NPM packages** are used; all dependencies are CDN-based.

## Configuration

**Environment:**
- Firebase configuration hardcoded in `firebase-compat-config.js`:
```javascript
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
- Note: Firebase config values are committed (this is a demo/setup project)

**Build:**
- No build configuration files (no `webpack.config.js`, `vite.config.js`, etc.)
- No transpilation steps
- No minification/uglification

**Local Development:**
- Requires local HTTP server (file:// protocol has CORS/Firebase limitations)
- Provided helper scripts:
  - `start-server.bat` (likely starts Python http.server)
  - `setup.html` (interactive Firebase setup wizard)
- Recommended: VS Code Live Server, `python -m http.server`, or `npx http-server`

## Platform Requirements

**Development:**
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Local server for Firebase functionality
- Text editor/IDE
- Firebase project (free tier)

**Production:**
- Static web hosting (Firebase Hosting, GitHub Pages, Netlify, Vercel, etc.)
- Firebase project with:
  - Authentication enabled (Email/Password, Google)
  - Firestore database created
  - Security rules configured
- HTTPS required for OAuth flows

## Data Storage

**Firestore Collections:**
- `cafes` - NOT USED (cafe data stored locally instead)
- `users` - User profile documents (keyed by Firebase UID)
- `users/{userId}/favorites` - Subcollection of user's favorite cafes
- `bookings` - Table reservations
- `reviews` - Cafe reviews

**localStorage:**
- Key: `'cafes'` - Serialized array of all cafe objects (19 entries)
- Purpose: Offline-first cafe data (not stored in Firebase)
- Populated by `cafe-data.js` on first load and persisted across sessions

## External Services

**Firebase:**
- Authentication service (user sign-up/sign-in)
- Firestore database (user data, bookings, reviews)
- Analytics (initialized but not used)

**Third-Party APIs:**
- None (no Stripe, Supabase, AWS, etc.)
- Google OAuth via Firebase

## Browser APIs

- **Geolocation** - Not used
- **Web Share API** - Used in `cafe-detail.js` `shareCafe()` for native sharing
- **localStorage** - Data persistence
- **sessionStorage** - Not used
- **IndexedDB** - Firestore offline persistence (automatic)
- **Clipboard API** - Fallback for sharing when Web Share unavailable
- **Tel URI** - `tel:` links for call functionality

## Code Organization

- **No module system** - All scripts loaded via `<script src="...">`
- **Global namespace pollution** - All functions defined globally (`window` scope)
- **Page-specific JS files** - Each page loads only the scripts it needs
- **Shared data** - `cafe-data.js` included on pages that need cafe dataset

## Potential Build Tools (if added)

The project would benefit from:
- **Bundler**: Vite, Parcel, or esbuild for module support
- **Linter**: ESLint for code quality
- **Formatter**: Prettier for consistent formatting
- **Type Safety**: TypeScript for better DX
- **Testing**: Vitest/Jest for unit tests

**Current status:** No such tools configured (zero configuration files).
