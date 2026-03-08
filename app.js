// Main App Logic - Café Discovery

// Initial sample data matching the user's data structure
// Collection: cafes
// Document ID: cafe_001, cafe_002, etc.

let cafes = [];
let locations = ['All'];
let currentLocation = 'All';
let currentSort = 'rating';

// Initialize
auth.onAuthStateChanged((user) => {
  if (user) {
    document.getElementById('user-display').textContent = user.displayName || user.email.split('@')[0];
  } else {
    document.getElementById('user-display').textContent = 'Guest';
  }
  loadCafes();
});

// Load cafes from LOCAL data only (Firebase stores ONLY user credentials)
async function loadCafes() {
  try {
    // Use local sample data - cafes are NOT stored in Firebase
    // Firebase is used ONLY for user authentication
    cafes = sampleCafes.map(c => ({ ...c, id: c.docId }));

    // Extract unique locations for filter
    locations = ['All', ...new Set(cafes.map(c => c.location))];

    localStorage.setItem('cafes', JSON.stringify(cafes));
    buildLocationPills();
    filterCafes();

    console.log('✅ Cafes loaded from local data (Firebase not used for cafe data)');

  } catch (err) {
    console.error('Error loading cafes:', err);
    // Fallback to sample data
    cafes = sampleCafes.map(c => ({ ...c, id: c.docId }));
    locations = ['All', ...new Set(cafes.map(c => c.location))];
    buildLocationPills();
    renderGrid(cafes);
  }
}

// Note: Cafes are stored LOCALLY, not in Firebase
// Firebase is used ONLY for user authentication
// User-specific data (favorites, bookings) can be stored in Firestore if needed

// Build location filter pills
function buildLocationPills() {
  const container = document.getElementById('area-pills');
  if (!container) return;

  container.innerHTML = locations.map((loc, i) =>
    `<button class="area-pill${i===0?' active':''}" onclick="selectLocation('${loc}', this)">${loc}</button>`
  ).join('');
}

// Select location
function selectLocation(location, btn) {
  currentLocation = location;
  document.querySelectorAll('.area-pill').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  filterCafes();
}

// Sort cafes
function sortCafes() {
  currentSort = document.getElementById('sort-select').value;
  filterCafes();
}

// Filter and sort cafes
function filterCafes() {
  const q = document.getElementById('search-input')?.value.toLowerCase() || '';

  let filtered = cafes.filter(c => {
    const matchLocation = currentLocation === 'All' || c.location === currentLocation;
    const matchQ = !q || c.name.toLowerCase().includes(q);
    return matchLocation && matchQ;
  });

  // Sort
  switch(currentSort) {
    case 'rating':
      filtered.sort((a, b) => b.rating - a.rating);
      break;
    case 'reviews':
      filtered.sort((a, b) => b.reviews - a.reviews);
      break;
    case 'price-low':
      filtered.sort((a, b) => a.price.length - b.price.length);
      break;
    case 'price-high':
      filtered.sort((a, b) => b.price.length - a.price.length);
      break;
    case 'name':
      filtered.sort((a, b) => a.name.localeCompare(b.name));
      break;
  }

  renderGrid(filtered);
}

// Render cafe grid
function renderGrid(list) {
  const grid = document.getElementById('cafe-grid');
  if (!grid) return;
  // Clear any existing loading content to prevent spinner linger
  grid.textContent = '';

  const countEl = document.getElementById('result-count');
  if (countEl) {
    countEl.textContent = list.length + (list.length === 1 ? ' café found' : ' cafés found');
  }

  if (!list.length) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="cup">☕</div>
        <h3>No cafés found</h3>
        <p>Try a different search or location</p>
      </div>`;
    return;
  }

  grid.innerHTML = list.map(c => `
    <div class="cafe-card" onclick="openCafeDetail('${c.docId}')">
      <div class="card-top">
        <div class="card-icon" style="background:${c.color}40; border: 1.5px solid ${c.color}60">${c.emoji}</div>
        <div class="card-rating">
          <div class="stars">${'★'.repeat(Math.floor(c.rating))}${'☆'.repeat(5-Math.floor(c.rating))}</div>
          <div class="rev-count">${c.reviews.toLocaleString()} reviews</div>
        </div>
      </div>
      <h3 class="card-name">${c.name}</h3>
      <p class="card-meta">📍 ${c.location} · ${c.price} · ${c.tables} tables</p>
      <p class="card-desc">${c.description}</p>
      <div class="tags">${c.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
      <div class="card-footer">
        <span class="card-hours">🕐 ${c.hours}</span>
        <span class="card-view">VIEW →</span>
      </div>
    </div>
  `).join('');
}

// Navigate to cafe detail
function openCafeDetail(docId) {
  window.location.href = `cafe-detail.html?id=${docId}`;
}

// Open modal (kept for compatibility)
function openModal(id) {
  openCafeDetail(id);
}

// Close modal
function closeModal(e) {
  if (e.target === document.getElementById('modal-overlay')) closeModalBtn();
}

function closeModalBtn() {
  const modal = document.getElementById('modal-overlay');
  if (modal) modal.classList.remove('open');
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

// Keyboard shortcuts
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModalBtn();
});
