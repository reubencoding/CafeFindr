# BREW Bug Fixes - Project Roadmap

**Created:** 2026-03-09
**Granularity:** Coarse (3-5 phases)
**Mode:** YOLO
**Parallelization:** Enabled

## Phases

- [ ] **Phase 1: JavaScript Stability** - Eliminate conflicts and syntax errors blocking all pages
- [ ] **Phase 2: Bookings System** - Restore functional booking creation and management
- [ ] **Phase 3: Reviews Display** - Fix review fetching and rendering on café detail pages
- [ ] **Phase 4: General Stability & UI Cleanup** - Cross-page polish and error elimination

## Phase Details

### Phase 1: JavaScript Stability

**Goal:** All pages execute without JavaScript syntax or runtime errors, enabling reliable user interaction.

**Depends on:** None (foundational)

**Requirements:** JS-01, JS-02, JS-03, JS-04

**Success Criteria** (what must be TRUE):
1. No `Identifier 'currentUser' has already been declared` errors in console on any page
2. `Cannot set properties of null` error eliminated from non-auth pages (auth.js safe execution)
3. Zero console errors on all pages (auth, index, café-detail, bookings, favorites, reviews) when signed in or signed out
4. Stray blank component with close button removed from index.html page

**Plans:** 1 plan

Plans:
- [ ] PLAN.md — Fix JavaScript stability: remove duplicate global declarations, make auth.js safe on all pages, remove stray modal from index.html.

---

### Phase 2: Bookings System

**Goal:** Users can create, view, and cancel table reservations without infinite loading or data errors.

**Depends on:** Phase 1

**Requirements:** BOOK-01, BOOK-02, BOOK-03, BOOK-04, BOOK-05

**Success Criteria** (what must be TRUE):
1. Bookings page loads within 5 seconds and displays user's reservations (no infinite spinner)
2. Each booking shows date, time, café name, and guest count with proper formatting
3. Cancellation functionality works: booking status changes to 'cancelled' and UI updates immediately
4. Creating a new booking from café detail page succeeds and appears in bookings list
5. Firestore query correctly filters to show only current user's bookings (based on `userId`)

**Plans:** 1 plan

Plans:
- [ ] PLAN.md — Fix bookings system: resolve infinite loading, ensure correct reservation display and cancellation, and validate booking creation.

---

### Phase 3: Reviews Display

**Goal:** Reviews are visible on café detail pages with correct data, formatting, and real-time count updates.

**Depends on:** Phase 1

**Requirements:** REV-01, REV-02, REV-03, REV-04, REV-05

**Success Criteria** (what must be TRUE):
1. Reviews load successfully when viewing any café detail page (no empty reviews section when data exists)
2. Each review displays author name, date, star rating, and text with proper visual formatting
3. Review count on café card/info updates immediately when a new review is added
4. Query filters reviews correctly: only reviews matching exact `cafeId` are shown
5. Empty state "No reviews yet" appears ONLY for cafés with zero reviews in Firestore

**Plans:** 1 plan

Plans:
- [ ] phase-3-01-PLAN.md — Fix reviews display with diagnostics, proper error states, and count updates.

---

### Phase 4: General Stability & UI Cleanup

**Goal:** All pages maintain error-free operation with consistent Firebase initialization and persistent auth state.

**Depends on:** Phase 1

**Requirements:** GEN-01, GEN-02, GEN-03, GEN-04

**Success Criteria** (what must be TRUE):
1. All six pages (auth, index, café-detail, bookings, favorites, reviews) load with zero JavaScript errors in console
2. Firebase Authentication and Firestore initialize successfully on every page without timeout
3. User remains signed in across page navigation and browser sessions (auth state persists)
4. No Firestore queries time out after 15 seconds (bookings, reviews, favorites all return within reasonable time)

**Plans:** 1 plan

Plans:
- [x] phase-4-01-PLAN.md — Add 15-second timeout protection to all remaining Firestore queries (reviews, favorites, cafe-detail) to ensure consistent performance and prevent indefinite hanging. (Completed 2026-03-09)

---

## Coverage

**Total v1 Requirements:** 18
**Mapped to Phases:** 18 ✓

| Requirement | Phase | Status |
|-------------|-------|--------|
| JS-01 | 1 | Pending |
| JS-02 | 1 | Pending |
| JS-03 | 1 | Pending |
| JS-04 | 1 | Pending |
| BOOK-01 | 2 | Pending |
| BOOK-02 | 2 | Pending |
| BOOK-03 | 2 | Pending |
| BOOK-04 | 2 | Pending |
| BOOK-05 | 2 | Pending |
| REV-01 | 3 | Pending |
| REV-02 | 3 | Pending |
| REV-03 | 3 | Pending |
| REV-04 | 3 | Pending |
| REV-05 | 3 | Pending |
| GEN-01 | 4 | Pending |
| GEN-02 | 4 | Pending |
| GEN-03 | 4 | Pending |
| GEN-04 | 4 | Pending |

## Execution Notes

- **Phase 1 is blocking**: No other phases can reliably execute until JavaScript conflicts are resolved
- **Phases 2, 3, and 4** may run in parallel after Phase 1 completes (they touch different features)
- All success criteria are observable from user perspective or verifiable via browser console
- No architectural changes permitted — targeted bug fixes only
