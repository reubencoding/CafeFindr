---
phase: phase-2
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - bookings.js
  - cafe-detail.js
autonomous: false
requirements:
  - BOOK-01
  - BOOK-02
  - BOOK-03
  - BOOK-04
  - BOOK-05
must_haves:
  truths:
    - "Bookings page loads within 5 seconds and displays the user's reservations (no infinite spinner)"
    - "Each booking displays formatted date, time, café name, and guest count with proper pluralization"
    - "Cancellation works: booking status changes to 'cancelled' and UI updates immediately"
    - "Creating a new booking from café detail page succeeds and appears in bookings list"
    - "Firestore query correctly filters to show only current user's bookings"
  artifacts:
    - path: "bookings.js"
      provides: "Robust loadBookings with auth checks, query timeout, error handling; cancellation logic; display rendering"
      contains:
        - "loadBookings: shows loading, checks auth, queries with 15s timeout, renders"
        - "confirmCancel: updates Firestore and local state"
        - "renderBookings: formats date/time and guest count"
    - path: "cafe-detail.js"
      provides: "submitBooking function that creates booking document with proper fields"
      contains:
        - "Form validation and submission handler"
        - "Fields: userId, cafeId, cafeName, date, time, guests, notes, status, createdAt"
  key_links:
    - from: "bookings.js loadBookings"
      to: "Firestore bookings collection"
      via: "db.collection('bookings').where('userId', '==', currentUser.uid).get()"
      pattern: "collection\\(['\"]bookings['\"]\\)\\.where\\(['\"]userId['\"]"
    - from: "bookings.js confirmCancel"
      to: "Firestore booking document"
      via: "doc(bookingToCancel).update({status:'cancelled'})"
      pattern: "confirmCancel\\(\\)"
    - from: "cafe-detail.js submitBooking"
      to: "Firestore bookings collection"
      via: "db.collection('bookings').add({userId: currentUser.uid, cafeId: currentDocId, ...})"
      pattern: "collection\\(['\"]bookings['\"]\\)\\.add\\("
    - from: "cafe-detail.js submitBooking"
      to: "bookings.html"
      via: "window.location.href = 'bookings.html'"
      pattern: "window\\.location\\.href = ['\"]bookings\\.html['\"]"
---

<objective>
Fix the Bookings System to eliminate infinite loading, ensure correct display and cancellation of reservations, and verify booking creation from café detail pages.

**Purpose:** Users must reliably view their reservations, see all details (date, time, café, guests), cancel bookings, and create new bookings without encountering loading loops or data errors.

**Output:** Updated `bookings.js` with robust error handling, reliable Firestore queries, correct cancellation and display; updated `cafe-detail.js` with validated booking submissions.
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

# Current implementation patterns from Phase 1
- Global `currentUser` is provided by auth.js (single declaration)
- `db` and `auth` are globals from firebase-compat-config.js
- Pages use safe guards and no duplicate declarations

# Relevant source files to be modified
@bookings.js
@cafe-detail.js
</context>

<interfaces>
<!-- Key types and contracts from existing code -->

From auth.js (global scope):
```javascript
let currentUser = null; // Global user object, set by auth.onAuthStateChanged
function signOut() { /* redirects to auth.html */ }
// showToast is no-op
```

From firebase-compat-config.js:
```javascript
const db = firebase.firestore(); // Firestore instance
const auth = firebase.auth(); // Auth instance
```

From bookings.js (current):
- `loadBookings()`: async; loads from Firestore, populates `bookings` array, calls `filterAndRenderBookings()`.
- `bookings`: array of booking objects with fields: id, userId, userName, cafeId, cafeName, cafeEmoji, cafeColor, date, time, guests, notes, status, createdAt.
- `confirmCancel()`: async; updates booking status to 'cancelled', then calls `loadBookings()`.
- `renderBookings(bookingsList)`: renders HTML for each booking card.

From cafe-detail.js (current):
- `submitBooking(e)`: async; reads form values and adds document to `bookings` collection.
- `currentUser`: local copy of auth user (set by own onAuthStateChanged).
- `currentCafe`: current café object from localStorage.
```

</interfaces>

<tasks>

<task type="auto">
  <name>Task 1: Fix bookings page loading, display, and cancellation</name>
  <files>
    bookings.js
  </files>
  <action>
    Perform a comprehensive fix of bookings.js to address infinite loading, correct rendering, and cancellation.

    **A. Diagnose and fix loadBookings:**
    1. Review the current flow: the function shows loading, checks `currentUser` and `db`, then runs query with Promise.race timeout.
    2. Ensure that if `currentUser` is falsy when `loadBookings` is called (should not happen, but defensive), we call a helper `showSignInPrompt()` that sets the container to the signed-out empty state and return.
    3. Add detailed console logging at key steps: entry, auth check, db check, before query, after snapshot, during render, and in catch.
    4. Verify the 15-second timeout is properly implemented and that any error (timeout, network, permission) is caught and passed to `showErrorState()`.
    5. In `showErrorState()`, ensure it does not throw if `container` is null (add guard).
    6. Keep the global 20-second fallback timer, but also consider that `loadBookings()` may be called multiple times; ensure previous fallback timers are cleared (there is a `fallbackTimer` variable but it's not used for the 20s timer; the 20s timer is a one-off set at file bottom. That's okay).
    7. Ensure after a successful query, `bookings` is populated, sorted, and `filterAndRenderBookings()` is called.

    **B. Improve cancellation (confirmCancel):**
    1. After `await db.collection('bookings').doc(bookingToCancel).update(...)`, also update the local `bookings` array: find the booking by id and set its `status` to 'cancelled'. Then call `filterAndRenderBookings()` to refresh UI instantly.
    2. If update fails, show `alert('Error: ' + err.message)`. Do not leave modal open? The current code closes modal before refresh; keep that.
    3. Clear `bookingToCancel` after operation.

    **C. Ensure display formatting:**
    1. In `renderBookings()`, verify date formatting: `new Date(booking.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })`. If `booking.date` is invalid, fallback to showing the raw string.
    2. Time display: directly use `booking.time` (expected "HH:MM").
    3. Guest count: ensure it's a number; use pluralization as currently written.
    4. Add defensive: if any field missing, provide placeholder (e.g., "TBD").
    5. Remove any temporary debug logs before finalizing.

    **D. General:**
    - Keep existing code style and comments.
    - Do not introduce breaking changes elsewhere.
  </action>
  <verify>
    <automated>
      node -e "const fs=require('fs'); const b=fs.readFileSync('bookings.js','utf8'); if(!b.includes('if (!currentUser || !currentUser.uid)')) throw new Error('Missing proper currentUser check'); if(!b.includes('filterAndRenderBookings()')) throw new Error('render call missing'); if(!b.includes('booking.status = \\'cancelled\\'')) throw new Error('Local cancel update missing'); if(!b.includes('toLocaleDateString')) throw new Error('Date formatting missing'); console.log('✅ bookings.js has required fixes')"
    </automated>
  </verify>
  <done>
    - loadBookings no longer leaves spinner indefinitely; shows data or error/empty state quickly.
    - Cancellation updates local UI immediately after server confirmation.
    - All booking cards show date, time, café name, and correctly pluralized guest count.
    - No console errors on bookings page (verified manually in checkpoint).
    - Debug logs optionally removed or kept minimal.
  </done>
</task>

<task type="auto">
  <name>Task 2: Ensure booking creation from café detail works reliably</name>
  <files>
    cafe-detail.js
  </files>
  <action>
    Review and enhance the `submitBooking` function in cafe-detail.js to guarantee successful creation and clear feedback.

    1. Add client-side validation before submission:
       - Date must be a valid future date (>= today).
       - Time must be selected (non-empty).
       - Guests must be a number >= 1.
       - If validation fails, `alert('Please select a valid date, time, and guest count')` and return.

    2. Confirm `currentUser` is truthy; if not, `showToast('Please sign in to book a table')` and redirect after 1.5s (already present). Keep this.

    3. Ensure the Firestore `add()` call includes all required fields exactly as expected by the bookings display:
       - `userId: currentUser.uid`
       - `userName: currentUser.displayName || currentUser.email.split('@')[0]`
       - `cafeId: currentDocId`
       - `cafeName: currentCafe.name`
       - `cafeEmoji: currentCafe.emoji`
       - `cafeColor: currentCafe.color`
       - `date: date` (string from input, format YYYY-MM-DD)
       - `time: time` (string "HH:MM")
       - `guests: parseInt(guests, 10)` (ensure integer)
       - `notes: notes` (string, may be empty)
       - `status: 'confirmed'`
       - `createdAt: firebase.firestore.FieldValue.serverTimestamp()`

    4. On successful `add()`:
       - Optionally `showToast('Booking confirmed!')` (though toast is no-op; could use alert or redirect immediately).
       - Close any modal? Actually the modal is the booking modal; after submission, we close it via `closeBookingModalBtn()` (present).
       - Redirect to `bookings.html` to view the new booking.

    5. On error:
       - Show `alert('Error creating booking: ' + err.message)`.
       - Keep the modal open for user to retry or correct.

    6. Ensure the form is reset after successful submission (line 308 already closes modal; could reset form too).

    7. Add console logging for debugging (can be removed later).

    The goal: User fills out the booking form, clicks confirm, and is taken to the bookings page where the new reservation appears.
  </action>
  <verify>
    <automated>
      node -e "const fs=require('fs'); const c=fs.readFileSync('cafe-detail.js','utf8'); if(!c.includes('if (!date || !time || guests < 1)')) throw new Error('Validation missing'); if(!c.includes('parseInt(guests')) throw new Error('Guests not parsed to int'); if(!c.includes('status: \\'confirmed\\'')) throw new Error('Status missing'); if(!c.includes('window.location.href = \\'bookings.html\\'')) throw new Error('Redirect missing'); console.log('✅ cafe-detail.js booking submission validated')"
    </automated>
  </verify>
  <done>
    - Booking form validates inputs before submission.
    - On success, booking is created in Firestore and user is redirected to bookings page.
    - Errors are clearly communicated.
    - No console errors during submission flow.
  </done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>
    Fixed bookings system: infinite loading resolved, display/cancellation improved, and booking creation validated.
  </what-built>
  <how-to-verify>
    1. Ensure Phase 1 is complete (no console errors on any page). Start local server and sign in.
    2. **Bookings page load**: Go to bookings.html. Verify the page shows either your existing bookings, an empty state, or an error with retry — but never a permanent spinner. Loading should resolve within 5-10 seconds.
    3. **Display**: On the bookings list, check each card shows:
       - Date like "Mon, Mar 10"
       - Time like "14:30" (24-hour format)
       - Café name and emoji
       - Guest count: "1 Guest" or "2 Guests"
    4. **Cancellation**: For an upcoming booking, click "Cancel", confirm. The booking should disappear from the Upcoming tab and (if you have a Cancelled tab) appear there, or the card should show cancelled status.
    5. **Create a booking**:
       - Go to any café detail page (e.g., cafe-detail.html?id=cafe_001).
       - Click "Book a Table", fill date (tomorrow), time (e.g., 14:00), guests (2), optional notes.
       - Click "Confirm Booking". Should get success (redirect to bookings.html).
       - On the bookings page, confirm the new booking appears in the Upcoming tab.
    6. **Error handling**:
       - Try creating a booking with missing fields; confirm validation alerts.
       - Test cancellation error: simulate network offline, try cancel, should show error alert.
    7. Open DevTools console on each page: zero JavaScript errors.
    8. Refresh pages and verify no infinite loading reappears.

    Note: If any step fails, note the exact behavior and console output.
  </how-to-verify>
  <resume-signal>Type "approved" if all verification steps pass; otherwise describe the failed step(s) and observed errors.</resume-signal>
</task>

</tasks>

<verification>
Automated checks confirm the presence of critical guards, formatting, and cancellation updates. The human-verify checkpoint validates end-to-end user experience across all booking workflows.
</verification>

<success_criteria>
Phase 2 (Bookings System) is complete when:
- BOOK-01: Bookings page loads reliably within 5 seconds with no infinite spinner (either shows data, empty state, or error with retry).
- BOOK-02: All bookings show date, time, café name, and guest count with correct pluralization.
- BOOK-03: Cancellation immediately updates booking status to 'cancelled' and refreshes the UI.
- BOOK-04: Creating a new booking from a café detail page succeeds and redirects to the bookings page, where the new booking appears.
- BOOK-05: Firestore query filters bookings by the logged-in user's `userId` (only user's bookings appear).
- Additionally: Zero console errors on any page during these operations.
</success_criteria>

<output>
After completion, create `.planning/phases/phase-2/SUMMARY.md` documenting the changes, verification results, and any manual test notes from the checkpoint.
</output>
