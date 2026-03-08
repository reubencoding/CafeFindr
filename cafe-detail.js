// Cafe Detail Page Logic

let currentCafe = null;
let currentDocId = null;
let isFavorite = false;
let currentUser = null;

// Initialize
auth.onAuthStateChanged((user) => {
  currentUser = user;
  if (user) {
    document.getElementById('user-display').textContent = user.displayName || user.email.split('@')[0];
  } else {
    document.getElementById('user-display').textContent = 'Guest';
  }
  loadCafeDetail();
});

// Load café details - LOCAL DATA ONLY (Firebase stores only user credentials)
async function loadCafeDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  currentDocId = urlParams.get('id');

  if (!currentDocId) {
    showNotFound();
    return;
  }

  try {
    // Load from LOCAL data - cafes are NOT stored in Firebase
    // Firebase is used ONLY for user authentication
    const savedCafes = localStorage.getItem('cafes');
    let cafes;
    if (savedCafes) {
      cafes = JSON.parse(savedCafes);
    } else {
      // Use sample data directly (from cafe-data.js)
      cafes = sampleCafes;
      // Initialize localStorage for other pages
      localStorage.setItem('cafes', JSON.stringify(sampleCafes));
    }

    currentCafe = cafes.find(c => c.docId === currentDocId || c.id === currentDocId);

    if (currentCafe) {
      renderCafeDetail();
      checkFavorite();
      loadReviews();
    } else {
      showNotFound();
    }
  } catch (err) {
    console.error('Error loading café:', err);
    showNotFound();
  }
}

// Show not found state
function showNotFound() {
  const loading = document.getElementById('detail-loading');
  const notFound = document.getElementById('detail-not-found');
  const content = document.getElementById('detail-content');

  if (loading) loading.style.display = 'none';
  if (notFound) notFound.style.display = 'block';
  if (content) content.style.display = 'none';
}

// Render café details
function renderCafeDetail() {
  const loading = document.getElementById('detail-loading');
  const content = document.getElementById('detail-content');
  const notFound = document.getElementById('detail-not-found');

  if (loading) loading.style.display = 'none';
  if (content) content.style.display = 'block';
  if (notFound) notFound.style.display = 'none';

  const c = currentCafe;

  // Hero section
  const emojiEl = document.getElementById('detail-emoji');
  const nameEl = document.getElementById('detail-name');
  const addressEl = document.getElementById('detail-address');
  const bookingCafeNameEl = document.getElementById('booking-cafe-name');

  if (emojiEl) emojiEl.textContent = c.emoji;
  if (nameEl) nameEl.textContent = c.name;
  if (addressEl) addressEl.textContent = '📍 ' + c.address;
  if (bookingCafeNameEl) bookingCafeNameEl.textContent = c.name;

  // Stats - updated to show user's fields
  const statsEl = document.getElementById('detail-stats');
  if (statsEl) {
    statsEl.innerHTML = `
      <div class="detail-stat">
        <div class="detail-stat-value">★ ${c.rating}</div>
        <div class="detail-stat-label">Rating</div>
      </div>
      <div class="detail-stat">
        <div class="detail-stat-value">${c.reviews.toLocaleString()}</div>
        <div class="detail-stat-label">Reviews</div>
      </div>
      <div class="detail-stat">
        <div class="detail-stat-value">${c.tables}</div>
        <div class="detail-stat-label">Tables</div>
      </div>
      <div class="detail-stat">
        <div class="detail-stat-value">${c.location}</div>
        <div class="detail-stat-label">Location</div>
      </div>
    `;
  }

  // About
  const descEl = document.getElementById('detail-description');
  const tagsEl = document.getElementById('detail-tags');

  if (descEl) descEl.textContent = c.description;
  if (tagsEl) {
    tagsEl.innerHTML = c.tags.map(t =>
      `<span class="tag">${t}</span>`
    ).join('');
  }

  // Menu
  const menuEl = document.getElementById('menu-items');
  if (menuEl) {
    const menuItems = c.menu.length > 0 ? c.menu : [
      {name: 'Coffee', price: '₹100+'},
      {name: 'Snacks', price: '₹150+'},
      {name: 'Meals', price: '₹250+'}
    ];
    menuEl.innerHTML = menuItems.map(item => `
      <div class="menu-item">
        <span class="menu-item-name">${item.name}</span>
        <span class="menu-item-price">${item.price}</span>
      </div>
    `).join('');
  }

  // Sidebar
  const hoursEl = document.getElementById('sidebar-hours');
  const phoneEl = document.getElementById('sidebar-phone');
  const amenitiesEl = document.getElementById('amenities-list');

  if (hoursEl) hoursEl.textContent = c.hours;
  if (phoneEl) phoneEl.textContent = c.phone || 'Not available';

  if (amenitiesEl) {
    const amenities = c.amenities.length > 0 ? c.amenities : ['WiFi', 'Air Conditioned', 'Parking'];
    amenitiesEl.innerHTML = amenities.map(a =>
      `<li>${a}</li>`
    ).join('');
  }

  // Generate time slots
  generateTimeSlots();
}

// Generate time slots for booking
function generateTimeSlots() {
  const select = document.getElementById('booking-time');
  if (!select) return;

  const slots = [];
  for (let hour = 8; hour <= 22; hour++) {
    const time = `${hour.toString().padStart(2, '0')}:00`;
    slots.push(`<option value="${time}">${time}</option>`);
    if (hour < 22) {
      const time30 = `${hour.toString().padStart(2, '0')}:30`;
      slots.push(`<option value="${time30}">${time30}</option>`);
    }
  }
  select.innerHTML = slots.join('');

  // Set default date to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateInput = document.getElementById('booking-date');
  if (dateInput) {
    dateInput.value = tomorrow.toISOString().split('T')[0];
    dateInput.min = new Date().toISOString().split('T')[0];
  }
}

// Check if café is favorite
async function checkFavorite() {
  if (!currentUser || !currentDocId) return;

  try {
    const doc = await db.collection('users')
      .doc(currentUser.uid)
      .collection('favorites')
      .doc(currentDocId)
      .get();

    isFavorite = doc.exists;
    updateFavoriteButton();
  } catch (err) {
    console.error('Error checking favorite:', err);
  }
}

// Update favorite button
function updateFavoriteButton() {
  const btn = document.getElementById('favorite-btn');
  if (!btn) return;

  if (isFavorite) {
    btn.innerHTML = '❤️ Saved to Favorites';
    btn.style.background = 'rgba(200,133,58,0.2)';
  } else {
    btn.innerHTML = '🤍 Add to Favorites';
    btn.style.background = 'transparent';
  }
}

// Toggle favorite
async function toggleFavorite() {
  if (!currentUser) {
    showToast('Please sign in to save favorites');
    setTimeout(() => window.location.href = 'auth.html', 1500);
    return;
  }

  const favRef = db.collection('users')
    .doc(currentUser.uid)
    .collection('favorites')
    .doc(currentDocId);

  try {
    if (isFavorite) {
      await favRef.delete();
      isFavorite = false;
      showToast('Removed from favorites');
    } else {
      await favRef.set({
        cafeId: currentDocId,
        cafeName: currentCafe.name,
        addedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      isFavorite = true;
      showToast('Added to favorites! ☕');
    }
    updateFavoriteButton();
  } catch (err) {
    showToast('Error: ' + err.message);
  }
}

// Open booking modal
function openBookingModal() {
  if (!currentUser) {
    showToast('Please sign in to book a table');
    setTimeout(() => window.location.href = 'auth.html', 1500);
    return;
  }
  const modal = document.getElementById('booking-modal');
  if (modal) modal.classList.add('open');
}

// Close booking modal
function closeBookingModal(e) {
  if (e.target === document.getElementById('booking-modal')) {
    closeBookingModalBtn();
  }
}

function closeBookingModalBtn() {
  const modal = document.getElementById('booking-modal');
  if (modal) modal.classList.remove('open');
}

// Submit booking
async function submitBooking(e) {
  e.preventDefault();

  const date = document.getElementById('booking-date').value;
  const time = document.getElementById('booking-time').value;
  const guests = document.getElementById('booking-guests').value;
  const notes = document.getElementById('booking-notes').value;

  try {
    await db.collection('bookings').add({
      userId: currentUser.uid,
      userName: currentUser.displayName || currentUser.email.split('@')[0],
      cafeId: currentDocId,
      cafeName: currentCafe.name,
      cafeEmoji: currentCafe.emoji,
      cafeColor: currentCafe.color,
      date: date,
      time: time,
      guests: parseInt(guests),
      notes: notes,
      status: 'confirmed',
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    closeBookingModalBtn();
    // Redirect to bookings page to view the booking
    window.location.href = 'bookings.html';
  } catch (err) {
    alert('Error: ' + err.message);
  }
}

// Open review modal
function openReviewModal() {
  if (!currentUser) {
    showToast('Please sign in to write a review');
    setTimeout(() => window.location.href = 'auth.html', 1500);
    return;
  }
  const modal = document.getElementById('review-modal');
  if (modal) {
    modal.classList.add('open');
    setupStarRating();
  }
}

// Close review modal
function closeReviewModal(e) {
  if (e.target === document.getElementById('review-modal')) {
    closeReviewModalBtn();
  }
}

function closeReviewModalBtn() {
  const modal = document.getElementById('review-modal');
  if (modal) modal.classList.remove('open');
}

// Setup star rating
function setupStarRating() {
  const stars = document.querySelectorAll('#star-rating .star');
  const ratingInput = document.getElementById('review-rating');

  stars.forEach(star => {
    star.addEventListener('click', () => {
      const rating = parseInt(star.dataset.rating);
      if (ratingInput) ratingInput.value = rating;
      stars.forEach((s, i) => {
        s.classList.toggle('active', i < rating);
      });
    });
  });

  // Default to 5 stars
  stars.forEach(s => s.classList.add('active'));
}

// Submit review
async function submitReview(e) {
  e.preventDefault();

  const ratingInput = document.getElementById('review-rating');
  const textInput = document.getElementById('review-text');

  const rating = ratingInput ? parseInt(ratingInput.value) : 5;
  const text = textInput ? textInput.value : '';

  if (!text.trim()) {
    showToast('Please write a review');
    return;
  }

  try {
    await db.collection('reviews').add({
      userId: currentUser.uid,
      userName: currentUser.displayName || currentUser.email.split('@')[0],
      userPhoto: currentUser.photoURL,
      cafeId: currentDocId,
      cafeName: currentCafe.name,
      rating: rating,
      text: text,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    // Update café review count in localStorage (Firebase stores only user credentials)
    const savedCafes = localStorage.getItem('cafes');
    if (savedCafes) {
      const cafes = JSON.parse(savedCafes);
      const cafeIndex = cafes.findIndex(c => c.docId === currentDocId || c.id === currentDocId);
      if (cafeIndex !== -1) {
        cafes[cafeIndex].reviews = (cafes[cafeIndex].reviews || 0) + 1;
        localStorage.setItem('cafes', JSON.stringify(cafes));
      }
    }

    closeReviewModalBtn();
    showToast('Review posted! ☕');
    document.getElementById('review-form')?.reset();

    // Small delay to ensure Firestore has indexed the new review before querying
    setTimeout(() => {
      loadReviews();
    }, 300);
  } catch (err) {
    showToast('Error: ' + err.message);
  }
}

// Load reviews
async function loadReviews() {
  if (!currentDocId) return;

  try {
    const snapshot = await db.collection('reviews')
      .where('cafeId', '==', currentDocId)
      .orderBy('createdAt', 'desc')
      .limit(5)
      .get();

    const reviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderReviews(reviews);
  } catch (err) {
    console.error('Error loading reviews:', err);
    const reviewsList = document.getElementById('reviews-list');
    if (reviewsList) {
      reviewsList.innerHTML = '<p class="review-text">No reviews yet. Be the first to review!</p>';
    }
  }
}

// Render reviews
function renderReviews(reviews) {
  const container = document.getElementById('reviews-list');
  if (!container) return;

  if (!reviews.length) {
    container.innerHTML = '<p class="review-text">No reviews yet. Be the first to review!</p>';
    return;
  }

  container.innerHTML = reviews.map(r => {
    const date = r.createdAt?.toDate ? r.createdAt.toDate().toLocaleDateString() : 'Recently';
    return `
      <div class="review-item">
        <div class="review-header">
          <span class="review-author">${r.userName}</span>
          <span class="review-date">${date}</span>
        </div>
        <div class="review-rating">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</div>
        <p class="review-text">${r.text}</p>
      </div>
    `;
  }).join('');
}

// Call café
function callCafe() {
  if (currentCafe?.phone) {
    window.location.href = `tel:${currentCafe.phone}`;
  }
}

// Share café
async function shareCafe() {
  if (navigator.share) {
    try {
      await navigator.share({
        title: currentCafe.name,
        text: `Check out ${currentCafe.name} on BREW!`,
        url: window.location.href
      });
    } catch (err) {
      console.log('Share cancelled');
    }
  } else {
    navigator.clipboard.writeText(window.location.href);
    showToast('Link copied to clipboard!');
  }
}

// Toast (disabled - component removed)
function showToast(msg) {
  // No-op; toast removed
}

// Sign out
function signOut() {
  auth.signOut().then(() => {
    window.location.href = 'auth.html';
  });
}
