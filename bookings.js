// Bookings Page Logic

// Wait for auth state to be ready
let currentUser = null;
let currentTab = 'upcoming';
let bookings = [];
let bookingToCancel = null;
let fallbackTimer = null;

// Helper: Wrap promises with 15-second timeout
function withTimeout(promise, timeout = 15000) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Query timeout after 15 seconds')), timeout)
    )
  ]);
}

// Ensure no modal is left open on page load
document.getElementById('cancel-modal')?.classList.remove('open');

// Initialize
auth.onAuthStateChanged((user) => {
  console.log('[auth] state changed:', user ? 'signed in' : 'signed out');
  if (user) {
    currentUser = user;
    const userDisplay = document.getElementById('user-display');
    if (userDisplay) {
      userDisplay.textContent = user.displayName || user.email.split('@')[0];
    }
    loadBookings();
  } else {
    const userDisplay = document.getElementById('user-display');
    if (userDisplay) {
      userDisplay.textContent = 'Guest';
    }
    const container = document.getElementById('bookings-container');
    if (container) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="cup">🔒</div>
          <h3>Please sign in</h3>
          <p>Sign in to view your bookings</p>
          <a href="auth.html" class="brew-btn">Sign In</a>
        </div>
      `;
    }
  }
});

// Fallback: if auth state hasn't fired within 2 seconds, try loading anyway
setTimeout(() => {
  if (!currentUser) {
    console.warn('[bookings] Auth state not yet determined, attempting loadBookings() as fallback');
    loadBookings();
  }
}, 2000);

// Load bookings
function showErrorState(message) {
  const container = document.getElementById('bookings-container');
  if (!container) {
    console.error('bookings-container not found');
    return;
  }
  container.innerHTML = `
    <div class="empty-state">
      <div class="cup">⚠️</div>
      <h3>Unable to load bookings</h3>
      <p>${message}</p>
      <button class="brew-btn" onclick="loadBookings()">Retry</button>
    </div>
  `;
}

async function loadBookings() {
  console.log('[loadBookings] called');

  // Clear any existing fallback timer
  if (fallbackTimer) {
    clearTimeout(fallbackTimer);
    fallbackTimer = null;
  }

  // Auth check - wait for auth state to be ready
  if (!currentUser || !currentUser.uid) {
    console.warn('[loadBookings] No currentUser — showing sign-in prompt');
    const container = document.getElementById('bookings-container');
    if (container) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="cup">🔒</div>
          <h3>Please sign in</h3>
          <p>Sign in to view your bookings</p>
          <a href="auth.html" class="brew-btn">Sign In</a>
        </div>
      `;
    }
    return;
  }

  // Check Firebase availability
  if (typeof db === 'undefined' || db === null) {
    console.error('[loadBookings] Firebase db not available');
    showErrorState('Firebase is not available. Please check your connection.');
    return;
  }

  try {
    // Set fallback timer BEFORE any async work
    fallbackTimer = setTimeout(() => {
      const container = document.getElementById('bookings-container');
      const loadingState = container?.querySelector('.loading-state');
      if (loadingState) {
        showErrorState('Loading is taking too long. Please refresh the page or try again.');
      }
    }, 20000);

    // Show loading state
    const container = document.getElementById('bookings-container');
    if (!container) {
      console.error('[loadBookings] bookings-container not found');
      throw new Error('bookings-container not found');
    }
    container.innerHTML = `
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Loading your bookings...</p>
      </div>
    `;

    console.log('[loadBookings] Querying bookings for userId:', currentUser.uid);
    // Wrap query with 15-second timeout using withTimeout
    const snapshot = await withTimeout(
      db.collection('bookings')
        .where('userId', '==', currentUser.uid)
        .get()
    );
    console.log('[loadBookings] Query returned', snapshot.docs.length, 'bookings');

    // Clear fallback timer on success
    if (fallbackTimer) {
      clearTimeout(fallbackTimer);
      fallbackTimer = null;
    }

    bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Sort by createdAt descending (client-side)
    bookings.sort((a, b) => {
      const aTime = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
      const bTime = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
      return bTime - aTime;
    });

    console.log('[loadBookings] rendering bookings');
    filterAndRenderBookings();

  } catch (err) {
    console.error('[loadBookings] Error:', err);
    if (fallbackTimer) {
      clearTimeout(fallbackTimer);
      fallbackTimer = null;
    }
    if (err.message === 'Query timeout after 15 seconds' || err.message === 'QUERY_TIMEOUT') {
      showErrorState('Request timed out after 15 seconds. Please check your connection and try again.');
    } else {
      showErrorState('Failed to load bookings: ' + err.message);
    }
  }
}

// Switch tab
function switchTab(tab) {
  currentTab = tab;
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.textContent.toLowerCase().includes(tab));
  });
  filterAndRenderBookings();
}

// Filter and render bookings
function filterAndRenderBookings() {
  const now = new Date();

  let filtered = bookings.filter(b => {
    // Combine date and time to get the full booking datetime
    // b.time is expected in "HH:MM" format (e.g., "14:30")
    let bookingDate;
    if (b.time) {
      const [hours, minutes] = b.time.split(':').map(Number);
      bookingDate = new Date(b.date);
      bookingDate.setHours(hours, minutes, 0, 0);
    } else {
      // Fallback to date only if time is missing
      bookingDate = new Date(b.date);
    }
    const isPast = bookingDate < now;

    switch(currentTab) {
      case 'upcoming':
        return b.status !== 'cancelled' && !isPast;
      case 'past':
        return b.status !== 'cancelled' && isPast;
      case 'cancelled':
        return b.status === 'cancelled';
      default:
        return true;
    }
  });

  renderBookings(filtered);
}

// Render bookings
function renderBookings(bookingsList) {
  const container = document.getElementById('bookings-container');
  const emptyState = document.getElementById('empty-state');

  if (!container) {
    console.error('renderBookings: bookings-container not found');
    return;
  }

  if (!bookingsList.length) {
    container.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

  container.innerHTML = bookingsList.map(booking => {
    let dateStr = 'TBD';
    if (booking.date) {
      try {
        const date = new Date(booking.date);
        // Check if date is valid
        if (!isNaN(date.getTime())) {
          dateStr = date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
          });
        } else {
          dateStr = String(booking.date);
        }
      } catch (e) {
        dateStr = String(booking.date);
      }
    }

    const statusClass = {
      'confirmed': 'confirmed',
      'pending': 'pending',
      'cancelled': 'cancelled',
      'completed': 'completed'
    }[booking.status] || 'pending';

    const showCancel = booking.status === 'confirmed' && currentTab === 'upcoming';

    return `
      <div class="booking-card">
        <div class="booking-emoji" style="background:${booking.cafeColor}40;">
          ${booking.cafeEmoji}
        </div>
        <div class="booking-info">
          <h4>${booking.cafeName}</h4>
          <p>${dateStr} at ${booking.time}</p>
          <div class="booking-meta">
            <span>${booking.guests || 0} Guest${(booking.guests || 0) > 1 ? 's' : ''}</span>
            ${booking.notes ? '<span>Has notes</span>' : ''}
          </div>
        </div>
        <div class="booking-status">
          <span class="status-badge ${statusClass}">${booking.status}</span>
          ${showCancel ? `<button class="cancel-btn" onclick="openCancelModal('${booking.id}')">Cancel</button>` : ''}
        </div>
      </div>
    `;
  }).join('');
}

// Open cancel modal
function openCancelModal(bookingId) {
  bookingToCancel = bookingId;
  document.getElementById('cancel-modal').classList.add('open');
}

// Close cancel modal
function closeCancelModal(e) {
  if (e.target === document.getElementById('cancel-modal')) {
    document.getElementById('cancel-modal').classList.remove('open');
    bookingToCancel = null;
  }
}

function closeCancelModalBtn() {
  document.getElementById('cancel-modal').classList.remove('open');
  bookingToCancel = null;
}

// Confirm cancel
async function confirmCancel() {
  if (!bookingToCancel) return;

  try {
    await db.collection('bookings').doc(bookingToCancel).update({
      status: 'cancelled',
      cancelledAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    // Update local state for immediate UI feedback
    const booking = bookings.find(b => b.id === bookingToCancel);
    if (booking) {
      booking.status = 'cancelled';
    }

    closeCancelModalBtn();
    // Re-render immediately with updated local state
    filterAndRenderBookings();

    // Optional: Reload from server after a short delay to ensure sync
    setTimeout(loadBookings, 1000);
  } catch (err) {
    alert('Error: ' + err.message);
  }
}

