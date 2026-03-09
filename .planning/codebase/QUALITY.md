# Code Quality

**Analysis Date:** 2026-03-09

## Naming Patterns

**Files:**
- Lowercase with hyphens: `cafe-detail.html`, `cafe-detail.js`, `firebase-compat-config.js`
- Logical grouping: page-specific files named after their view
- Configuration: `*-config.js` pattern

**Variables:**
- camelCase for multi-word identifiers: `currentUser`, `currentDocId`, `isFavorite`
- Descriptive names: `filterCafes()`, `renderGrid()`, `loadBookings()`
- Single-letter in loops: `i` for index, `c` for cafe, `r` for review, `b` for booking
- Constants are NOT uppercase (inconsistent with convention)

**Functions:**
- camelCase: `loadCafes()`, `signOut()`, `toggleFavorite()`
- Prefixes used occasionally: `show*` (showToast, showEmptyState), `render*` (renderGrid, renderBookings)
- Event handlers: inline `onclick="functionName()"` or `onsubmit="functionName(event)"`

**Classes:**
- No class-based OOP (functional approach only)
- CSS classes use kebab-case: `.cafe-card`, `.detail-hero`, `.booking-status`

**Types:**
- No TypeScript (pure JavaScript)
- Implicit typing everywhere

## Code Style

**Formatting:**
- No automated formatter detected (no Prettier config)
- Consistent 2-space indentation in JavaScript
- HTML indentation: 2 spaces
- CSS indentation: 2 spaces
- Generally clean, readable formatting

**Spacing:**
- Blank lines between function definitions
- Blank lines after variable declarations
- Logical grouping with comments

**Quotes:**
- JavaScript: single quotes `'` throughout
- HTML attributes: double quotes `"`
- CSS: not applicable (no string literals)

**Line Length:**
- Most lines under 100 characters
- Some template literals exceed (up to ~150 chars) but acceptable

## Import Organization

**Not using ES modules:**
- All scripts loaded via `<script src="...">` in HTML
- No `import`/`export` except in unused `firebase-config.js` (ES module version)
- Global namespace pollution - all functions become `window.Window` properties

**Script loading order (index.html example):**
```html
<script src="firebase-compat-config.js"></script>   <!-- Firebase init -->
<script src="auth.js"></script>                     <!-- Auth functions -->
<script src="cafe-data.js"></script>               <!-- Cafe data -->
<script src="app.js"></script>                     <!-- Main logic -->
```
Key dependency: `firebase-compat-config.js` must load first (defines `firebase`, `auth`, `db`).

**Shared script inclusions:**
- `firebase-compat-config.js`: Included on every page (auth required)
- `auth.js`: Included on pages with auth functionality
- `cafe-data.js`: Included on pages needing cafe dataset
- Page-specific script: Last in order

## Error Handling

**Try-Catch Patterns:**
- Firebase operations wrapped in try-catch
- Fallback to local data when Firebase fails
- Alert dialogs for user-facing errors (basic UX)
- Console logging for debugging

**Example:**
```javascript
try {
  const snapshot = await db.collection('bookings').get();
  // process data
} catch (err) {
  console.error('Error loading bookings:', err);
  showErrorState('Failed to load: ' + err.message);
}
```

**Timeout Protection:**
- `bookings.js`: 15-second timeout on Firestore query
- Global fallback: 20-second timeout showing error if loading persists

**Validation:**
- Frontend only, no backend validation
- Form validation in `auth.js`:
```javascript
if (!email.trim()) { setErr('e-email', 'Email is required'); valid = false; }
if (!pass || pass.length < 6) { setErr('e-pass', 'Password must be at least 6 characters'); valid = false; }
```
- No server-side validation visible

## Logging

**Framework:** Native `console` API

**Patterns:**
- Initialization: `console.log('Firebase initialized')`
- Success messages: `console.log('✅ Cafes loaded from local data')`
- Errors: `console.error('Error loading cafes:', err)`
- No structured logging (simple strings)
- No log levels (debug/info/warn/error)

## Comments

**When to Comment:**
- File-level comments describing purpose
- Section comments: `// Load cafes from LOCAL data only (Firebase stores ONLY user credentials)`
- Inline explanation for complex logic (occasional)
- TODO/FIXME: None detected

**Documentation Comments (JSDoc):**
- None detected
- No function parameter or return type documentation
- No @param, @returns annotations

## Function Design

**Size:**
- Functions generally small (20-50 lines typical)
- Some larger functions: `renderGrid()` (50 lines), `loadBookings()` with timeout (50 lines)
- Most functions single-responsibility

**Parameters:**
- Few parameters per function (typically 0-3)
- Configuration passed via closure or global state

**Return Values:**
- Async functions return Promises (properly awaited)
- Synchronous functions return data or HTML strings
- Void functions for UI updates (no return)

**Side Effects:**
- Many functions modify DOM directly (tightly coupled)
- Functions often both compute and render

## Module Design

**Exports:**
- No ES module exports (all global)
- `firebase-config.js` has `export` but is not used (confusing)

**Barrel Files:**
- None (no index.js aggregating exports)

**Separation of Concerns:**
- Data access mixed with rendering (not pure)
- Example: `renderGrid()` both transforms data and updates DOM
- Better separation would improve testability

## Security Practices

**Firebase Security Rules:**
- Documented in `DATA_STRUCTURE.md` but must be manually added to Firestore
- Rules properly restrict access:
  - Users can only access their own data
  - Reviews public read, authenticated write
  - No admin claims implemented despite rule reference

**API Keys:**
- Firebase config committed (acceptable for Firebase as it's not secret)
- No hardcoded secrets (API keys are public identifiers)

**XSS Protection:**
- Template literals used with user data (potential XSS if data not sanitized)
- Example: `innerHTML = \`<div>\${c.name}</div>\` - if `c.name` contains HTML, it will be injected
- **Vulnerability identified**: No escaping of dynamic content before injection
- Mitigation: Data source is controlled (localStorage + trusted Firestore docs)

**Authentication:**
- Firebase Auth handles security
- Client-side route protection (redirects if not auth)
- No session management beyond Firebase

## Performance Considerations

**Cafe Data Loading:**
- All cafes loaded into memory on initial page load
- localStorage read is synchronous but fast for 19 items
- No pagination for cafes (assumes small dataset)

**Firestore Queries:**
- Reviews paginated (9 per page) with `limit()` and `startAfter()`
- Bookings: single query by userId (no pagination needed)
- Favorites: subcollection query then client-side mapping

**Offline Support:**
- `db.enablePersistence()` in `firebase-compat-config.js`
- localStorage fallback for cafe data
- No offline mutation queue for user data (bookings/reviews require connectivity)

**Rendering:**
- Full re-render on filter/sort (not virtualized)
- Acceptable for < 100 items (19 cafes)
- No debouncing on search input (`oninput` fires on every keystroke)

## Accessibility

**ARIA Attributes:**
- None detected (no `aria-*` attributes)
- Relies on semantic HTML

**Semantic HTML:**
- Headers: `<header>`, `<nav>`, `<h1>`-`<h3>` used
- Buttons: `<button>` elements (good)
- Forms: `<form>`, `<label>`, proper input types

**Keyboard Navigation:**
- Escape key closes modal (`document.addEventListener('keydown', e => { if (e.key === 'Escape') ... })`)
- Missing: trap focus in modals, skip links
- Form inputs focusable, but no visible focus styles

**Screen Reader:**
- Images have `alt` attributes (mostly)
- Empty `alt` when image fails: `onerror="this.style.display='none'"` (hides broken image but may leave empty container)
- No `aria-live` for dynamic content updates

## Code Smells / Issues

**1. Disabled Toast Functions:** Multiple files have:
```javascript
function showToast(msg) {
  // No-op; toast removed
}
```
Comment suggests feature was removed but function stubs remain. Should be deleted.

**2. Inconsistent Fallback Strategy:**
- App uses `localStorage` for cafes but Firestore for user data
- Could be simplified: either all local or all remote
- Current hybrid approach complicates code

**3. Repeated Code:**
- Auth state listener pattern duplicated across all pages:
```javascript
auth.onAuthStateChanged((user) => {
  if (user) {
    document.getElementById('user-display').textContent = user.displayName || user.email.split('@')[0];
  } else {
    document.getElementById('user-display').textContent = 'Guest';
  }
  // page-specific load...
});
```
Could be extracted to shared module.

**4. Global Functions:**
- All functions global (pollutes window namespace)
- Risk of naming collisions (unlikely but possible)
- No encapsulation

**5. Firebase Config Duplication:**
- `firebase-config.js` (ES6 module) and `firebase-compat-config.js` (Compat SDK)
- Only Compat version is used; ES6 version appears to be dead code
- Should remove unused `firebase-config.js`

**6. Magic Numbers:**
- `const REVIEWS_PER_PAGE = 9;` - good constant
- But `15-second` timeout inline: `setTimeout(() => reject(new Error('QUERY_TIMEOUT')), 15000)`
  - Should be `BOOKINGS_QUERY_TIMEOUT = 15000`

**7. Incomplete Security Rules Implementation:**
- Rules reference `admin` claim: `request.auth.token.admin == true`
- No code sets this claim anywhere
- Admin functionality not implemented

**8. Missing Error Recovery:**
- Network failures shown as alerts but no retry mechanism
- User must manually retry

**9. No Input Sanitization:**
- Review text and user names stored/displayed without sanitization
- Relies on Firebase security rules to prevent malicious data
- XSS risk if data source compromised

**10. Missing Loading States:**
- Some operations (favorite toggle, review submit) have no visual feedback
- Button doesn't disable during async operation → user may click multiple times

**11. Database Structure Mismatch:**
- `app.js` comment: "Note: Cafes are stored LOCALLY, not in Firebase"
- But documentation (README, DATA_STRUCTURE.md) describes `cafes` collection
- Could confuse developers

**12. Hardcoded Paths:**
- Image paths like `'/images/cafe_001.jpg'` hardcoded in data
- No image upload/storage mechanism
- Missing images will show broken state (handler hides them)

## Technical Debt

**High Priority:**
1. Security: XSS vulnerability from unsanitized innerHTML
2. Maintainability: Repeated auth state listener code
3. User Experience: Disabled toast notifications need removal

**Medium Priority:**
4. Refactor: Extract data fetching/rendering separation
5. Testing: No test suite (manual testing only)
6. Documentation: Inline code documentation minimal

**Low Priority:**
7. Code Cleanup: Remove unused `firebase-config.js`
8. Consistency: Standardize timeout constants
9. UX: Add loading indicators for async actions

## Recommendations

**Immediate:**
- Add DOMPurify or similar to sanitize rendered HTML
- Remove unused `firebase-config.js` and `showToast()` stubs
- Extract common auth UI update into utility function

**Short-term:**
- Implement consistent error handling with user-friendly messages
- Add loading states/button disabling during async operations
- Add retry logic for Firebase queries

**Long-term:**
- Consider migrating to framework (React/Vue) for better state management
- Add unit tests for pure functions
- Implement TypeScript for type safety
- Create proper component architecture
- Set up linting (ESLint) and formatting (Prettier)
