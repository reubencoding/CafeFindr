# BREW - Chennai's Café Guide

## What This Is

A full-stack web application for discovering, reviewing, and booking table reservations at cafés across Chennai. Built with vanilla HTML/CSS/JS and Firebase (Authentication + Firestore).

**Current State**: The app is functionally complete but has critical bugs preventing proper operation:
- JavaScript conflicts causing pages to break
- Reviews not displaying despite being in Firestore
- Bookings page stuck in loading state
- Authentication flows broken on non-auth pages

This project is in **maintenance/debug mode** to fix these issues and restore full functionality.

## Core Value

Users can reliably discover cafés, view details with reviews, book tables, and manage their reservations — without errors or broken features.

## Requirements

### Validated

- ✓ User can browse 19 Chennai cafés with search and filters — existing
- ✓ User can view individual café details with menus, amenities, and contact info — existing
- ✓ User can sign up/sign in with email/password or Google — existing
- ✓ User can add/remove cafés from favorites — existing
- ✓ User can write reviews for cafés — existing
- ✓ Responsive coffee-themed UI works on desktop and mobile — existing

### Active

#### FIX-01: Eliminate JavaScript Conflicts
- [ ] Remove duplicate `currentUser` variable declarations causing `Identifier 'currentUser' has already been declared` errors
- [ ] Refactor global variables to avoid collisions between pages loading multiple scripts
- [ ] Ensure each page's scripts execute without syntax/runtime errors

#### FIX-02: Repair Bookings System
- [ ] Fix bookings page loading loop (infinite spinner)
- [ ] Correct Firestore query to fetch bookings for current user
- [ ] Verify bookings display correctly with proper date/time formatting
- [ ] Ensure booking cancellation works
- [ ] Fix booking creation from café detail page (if broken)

#### FIX-03: Display Reviews on Café Detail Page
- [ ] Debug reviews query — ensure it fetches reviews for the correct `cafeId`
- [ ] Fix reviews not showing when Firestore data exists
- [ ] Verify review count updates when new reviews are added
- [ ] Ensure reviews display with proper formatting and star ratings

#### FIX-04: Clean Up Index Page UI
- [ ] Remove blank/empty component with close button at bottom of index.html
- [ ] Verify page layout is clean with no stray elements

#### FIX-05: General Stability
- [ ] Fix `auth.js` error: `Cannot set properties of null (setting 'innerHTML')` on non-auth pages
- [ ] Ensure `renderFields()` only executes on auth page
- [ ] Test all pages (auth, index, café detail, bookings, favorites, reviews) for console errors
- [ ] Verify Firebase initialization works correctly on all pages

### Out of Scope

- **Image assets**: The `/images/` folder and café photos will be handled separately; image paths are already correct
- **New features**: No feature additions — only bug fixes to restore existing functionality
- **UI redesign**: No visual/design changes beyond removing the stray component
- **Firebase rules changes**: Assuming rules from `DATA_STRUCTURE.md` are already deployed

## Context

The BREW app was built as a complete café discovery and booking platform. It includes:
- 19 pre-loaded Chennai cafés with full details (menus, amenities, contact info)
- Firebase Authentication for user management
- Firestore database for user-specific data (favorites, bookings, reviews)
- Responsive design with coffee-themed dark UI

The codebase is well-organized with separate HTML/JS files per page, centralized CSS, and localStorage fallback for café data.

**Known Issues (pre-fix):**
- JavaScript global scope pollution causing `currentUser` redeclaration errors
- Auth page code executing on non-auth pages where required DOM elements don't exist
- Reviews query potentially not filtering correctly by `cafeId`
- Bookings query potentially timing out or not executing due to syntax errors
- Stray UI component at bottom of index page

**Technical Environment:**
- Frontend: Vanilla ES6 JavaScript, CSS3 (Grid/Flexbox)
- Backend: Firebase (10.7.1) — Auth + Firestore
- Data: Café data stored in localStorage; user data in Firestore
- Running: Local development server (`python -m http.server`)

## Constraints

- **Must maintain existing functionality** — fixes should not break working features
- **No major refactoring** — targeted bug fixes only
- **Keep localStorage architecture** — café data remains local; Firebase only for user data
- **Preserve UI/UX** — no design changes beyond removing stray element
- **Firebase rules** must remain compatible with existing data structure

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Use GSD to track bug fixes | Need systematic approach to resolve multiple issues with verification | — In Progress |
| Fix JavaScript conflicts first | Syntax errors prevent any page from working properly | — Pending |
| Keep localStorage for café data | Architecture decision from previous work; working well | — Locked |
| Target Firebase 10.7.1 compatibility | Existing code uses compat SDK; don't upgrade mid-fix | — Locked |

---

*Last updated: 2026-03-09 after initial project setup*
