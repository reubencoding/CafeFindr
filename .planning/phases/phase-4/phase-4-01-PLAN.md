---
phase: phase-4
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - reviews.js
  - favorites.js
  - cafe-detail.js
autonomous: true
requirements:
  - GEN-01
  - GEN-02
  - GEN-03
  - GEN-04
user_setup: []
must_haves:
  truths:
    - "All six pages load with zero JavaScript errors in console"
    - "Firebase Authentication and Firestore initialize successfully on every page without timeout"
    - "User remains signed in across page navigation and browser sessions"
    - "No Firestore queries time out after 15 seconds (all return within reasonable time)"
  artifacts:
    - path: "reviews.js"
      provides: "Timeout protection on loadReviews() and updateStats() Firestore queries"
      min_lines: 1
      contains: ["withTimeout", "loadReviews", "updateStats"]
    - path: "favorites.js"
      provides: "Timeout protection on loadFavorites() Firestore query"
      min_lines: 1
      contains: ["withTimeout", "loadFavorites"]
    - path: "cafe-detail.js"
      provides: "Timeout protection on checkFavorite() Firestore query"
      min_lines: 1
      contains: ["withTimeout", "checkFavorite"]
  key_links:
    - from: "reviews.js loadReviews()"
      to: "db.collection('reviews').get()"
      via: "wrapped in withTimeout"
      pattern: "withTimeout.*query\\.get"
    - from: "reviews.js updateStats()"
      to: "db.collection('reviews').get()"
      via: "wrapped in withTimeout"
      pattern: "withTimeout.*db\\.collection\\('reviews'\\)\\.get"
    - from: "favorites.js loadFavorites()"
      to: "db.collection('users').doc().collection('favorites').get()"
      via: "wrapped in withTimeout"
      pattern: "withTimeout.*db\\.collection\\('users'\\)"
    - from: "cafe-detail.js checkFavorite()"
      to: "db.collection('users').doc().collection('favorites').doc().get()"
      via: "wrapped in withTimeout"
      pattern: "withTimeout.*db\\.collection\\('users'\\)"
---

<objective>
Add 15-second timeout protection to all remaining Firestore queries to prevent indefinite hanging and ensure consistent performance across all pages.

Purpose: While bookings.js already has a 15s timeout, reviews.js, favorites.js, and cafe-detail.js lack timeout protection. This violates GEN-04 and could cause queries to hang indefinitely if Firestore is slow or encounters network issues. We'll add a reusable withTimeout() helper and wrap all Firestore queries consistently.

Output: All Firestore queries across the app now have uniform timeout protection, meeting GEN-04 requirement. No queries will hang longer than 15 seconds.
</objective>

<execution_context>
@C:/Users/xende/.claude/get-shit-done/workflows/execute-plan.md
@C:/Users/xende/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/phase-1/SUMMARY.md
@.planning/phases/phase-2/SUMMARY.md
@.planning/phases/phase-3/SUMMARY.md

# Key patterns established:
- Phase 1: Removed duplicate declarations, made auth.js safe
- Phase 2: Added 15s timeout to bookings.js (reference implementation)
- Phase 3: Added error handling and diagnostics to cafe-detail.js reviews
- All pages load firebase-compat-config.js first
- All pages use auth.onAuthStateChanged consistently
- Defensive coding: guard checks, try-catch, error states
- Firestore queries access via global `db` from firebase-compat-config.js

# Current state:
- reviews.js: loadReviews() and updateStats() have NO timeout
- favorites.js: loadFavorites() has NO timeout
- cafe-detail.js: checkFavorite() has NO timeout (loadReviews already fixed in Phase 3)

# Timeout pattern from bookings.js (to replicate):
```
function withTimeout(promise, timeout = 15000) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Query timeout after 15 seconds')), timeout)
    )
  ]);
}

// Usage:
const snapshot = await withTimeout(query.get());
```
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add withTimeout utility and protect reviews.js queries</name>
  <files>reviews.js</files>
  <action>
    - Add the withTimeout() helper function at top of reviews.js (after variable declarations)
    - Wrap loadReviews() Firestore query: replace `const snapshot = await query.get();` with `const snapshot = await withTimeout(query.get());`
    - Wrap updateStats() first query: replace `const totalSnapshot = await db.collection('reviews').get();` with `const totalSnapshot = await withTimeout(db.collection('reviews').get());`
    - Ensure error handling catches timeout errors and displays appropriate error messages (existing catch blocks already handle errors; timeout will be caught as Error with message 'Query timeout after 15 seconds')
    - Add diagnostic console.log in catch to show timeout occurred
  </action>
  <verify>Open reviews.html, check browser console for no errors, verify reviews load successfully. For long-running query test (optional), artificially increase timeout or simulate slow query.</verify>
  <done>Reviews page loads without errors; all Firestore queries have timeout protection; error message displays if query times out</done>
</task>

<task type="auto">
  <name>Task 2: Add timeout protection to favorites.js</name>
  <files>favorites.js</files>
  <action>
    - Copy the withTimeout() helper function from reviews.js (or add it if not present)
    - In loadFavorites(), wrap the Firestore query: replace `const snapshot = await db.collection('users')...get();` with `const snapshot = await withTimeout(db.collection('users')...get());`
    - Ensure existing catch block will handle timeout errors (already displays console.error, should now catch timeout error)
  </action>
  <verify>Open favorites.html while signed in, verify favorites load without errors. Check console for no uncaught errors.</verify>
  <done>Favorites page loads user's favorites successfully with timeout protection active</done>
</task>

<task type="auto">
  <name>Task 3: Add timeout protection to cafe-detail.js checkFavorite()</name>
  <files>cafe-detail.js</files>
  <action>
    - Ensure withTimeout() helper exists (add if missing)
    - In checkFavorite(), wrap the Firestore get() call: replace `const doc = await db.collection('users')...get();` with `const doc = await withTimeout(db.collection('users')...get());`
    - Existing catch block will handle timeout errors appropriately (console.error)
    - Note: loadReviews() in cafe-detail.js already has robust error handling but no timeout — consider adding if not conflicts with Phase 3 changes; however check if already has timeout from previous work
  </action>
  <verify>Open any cafe-detail page while signed in, verify favorite button state loads correctly, check console for no errors.</verify>
  <done>Cafe detail page loads favorite status without hanging; timeout protection active on checkFavorite query</done>
</task>

</tasks>

<verification>
**Automated checks (run after all tasks):**

1. Verify timeout helpers exist:
   - Grep for `function withTimeout` in reviews.js, favorites.js, cafe-detail.js

2. Verify queries wrapped:
   - reviews.js: `withTimeout(query.get())` in loadReviews
   - reviews.js: `withTimeout(db.collection('reviews').get())` in updateStats
   - favorites.js: `withTimeout(db.collection('users')...get())` in loadFavorites
   - cafe-detail.js: `withTimeout(db.collection('users')...get())` in checkFavorite

3. Manual verification:
   - Open each page (auth, index, cafe-detail, bookings, reviews, favorites)
   - Check browser console: zero errors
   - Verify data loads (reviews, favorites, bookings)
   - Sign in/out, navigate between pages, refresh — auth state persists (GEN-03)
   - All queries complete within 15s (observed behavior)

**Success criteria:**
- All four GEN requirements are satisfied as observable behaviors
- No Firestore query hangs indefinitely
- All pages error-free
- Auth persists across navigation and refresh
</verification>

<success_criteria>
**Phase 4 complete when:**

1. ✅ All six pages load with zero JavaScript console errors (GEN-01)
2. ✅ Firebase initializes successfully on every page (GEN-02)
3. ✅ User authentication state persists across navigation and browser sessions (GEN-03)
4. ✅ All Firestore queries have 15-second timeout protection (GEN-04):
   - reviews.js: loadReviews() and updateStats()
   - favorites.js: loadFavorites()
   - cafe-detail.js: checkFavorite()

**Measurable verification:**
- Automated grep checks confirm withTimeout wrappers present on all key queries
- Manual browser testing shows no errors, data loads quickly, auth persists on refresh
- No query hangs >15 seconds (timeout throws error with clear message)
</success_criteria>

<output>
After completion, create `.planning/phases/phase-4/phase-4-01-SUMMARY.md` documenting:
- Timeout implementation details
- Files modified and queries protected
- Any issues encountered (e.g., conflicts with existing error handling)
- Verification results from testing each page
</output>
