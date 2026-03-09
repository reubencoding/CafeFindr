# Requirements: BREW Bug Fixes

**Defined:** 2026-03-09
**Core Value:** Users can reliably discover cafés, view details with reviews, book tables, and manage their reservations without errors or broken features

## v1 Requirements

### JavaScript Stability

- [ ] **JS-01**: Eliminate duplicate variable declaration errors (`currentUser` redeclaration)
- [ ] **JS-02**: Fix `Cannot set properties of null` error on non-auth pages (auth.js)
- [ ] **JS-03**: Ensure no console errors on any page when running on local server
- [ ] **JS-04**: Remove stray blank component with close button from index.html

### Bookings System

- [ ] **BOOK-01**: Bookings page loads successfully (no infinite loading)
- [ ] **BOOK-02**: Bookings display correctly with date, time, café name, and guest count
- [ ] **BOOK-03**: Cancellation of bookings works (status changes to 'cancelled')
- [ ] **BOOK-04**: Creating a new booking from café detail page succeeds
- [ ] **BOOK-05**: Firestore query correctly filters bookings by logged-in user's `userId`

### Reviews Display

- [ ] **REV-01**: Reviews load correctly when viewing a café detail page
- [ ] **REV-02**: Reviews display with proper formatting: author, date, star rating, text
- [ ] **REV-03**: Review count on café card updates when new reviews are added
- [ ] **REV-04**: Query filters reviews by exact `cafeId` match (case-sensitive, exact string)
- [ ] **REV-05**: Empty state shows "No reviews yet" only when café truly has no reviews

### General

- [ ] **GEN-01**: All pages (auth, index, café-detail, bookings, favorites, reviews) load without JavaScript errors
- [ ] **GEN-02**: Firebase initialization succeeds on all pages
- [ ] **GEN-03**: User authentication state persists correctly across page navigation
- [ ] **GEN-04**: No 15-second timeouts on Firestore queries (bookings, reviews)

## v2 Requirements

*(None — all focus on v1 bug fixes)*

## Out of Scope

| Feature | Reason |
|---------|--------|
| Café image assets | Images folder and photo files will be added separately; image paths are already correct |
| New features | Only fixing broken functionality, no enhancements |
| UI redesign | No visual changes beyond removing stray component |
| Firebase rules modification | Assuming existing rules from DATA_STRUCTURE.md are deployed |
| LocalStorage architecture change | Café data remains local; Firebase only for user data |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| JS-01 | Phase 1 | Pending |
| JS-02 | Phase 1 | Pending |
| JS-03 | Phase 1 | Pending |
| JS-04 | Phase 1 | Pending |
| BOOK-01 | Phase 2 | Pending |
| BOOK-02 | Phase 2 | Pending |
| BOOK-03 | Phase 2 | Pending |
| BOOK-04 | Phase 2 | Pending |
| BOOK-05 | Phase 2 | Pending |
| REV-01 | Phase 3 | Pending |
| REV-02 | Phase 3 | Pending |
| REV-03 | Phase 3 | Pending |
| REV-04 | Phase 3 | Pending |
| REV-05 | Phase 3 | Pending |
| GEN-01 | Phase 4 | Pending |
| GEN-02 | Phase 4 | Pending |
| GEN-03 | Phase 4 | Pending |
| GEN-04 | Phase 4 | Pending |

---

*Requirements defined: 2026-03-09*
*Last updated: 2026-03-09 after roadmap creation*
