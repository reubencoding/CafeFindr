// Authentication Logic
let currentMode = 'signin';
let currentUser = null;

// Check auth state on page load
auth.onAuthStateChanged((user) => {
  if (user) {
    currentUser = user;
    // If on auth page, redirect to index
    if (window.location.pathname.includes('auth.html')) {
      window.location.href = 'index.html';
    }
  } else {
    currentUser = null;
    // If not on auth page, redirect to auth (except for public pages)
    const publicPages = ['cafe-detail.html', 'reviews.html'];
    const isPublicPage = publicPages.some(page => window.location.pathname.includes(page));
    if (!isPublicPage && !window.location.pathname.includes('auth.html')) {
      window.location.href = 'auth.html';
    }
  }
});

// Switch between signin/signup
function switchMode(mode) {
  currentMode = mode;
  document.getElementById('btn-signin').classList.toggle('active', mode === 'signin');
  document.getElementById('btn-signup').classList.toggle('active', mode === 'signup');
  document.getElementById('auth-submit').textContent =
    mode === 'signin' ? 'Enter the Café ☕' : 'Join the Community ✨';
  renderFields();
}

// Render form fields
function renderFields() {
  const container = document.getElementById('fields');
  if (currentMode === 'signup') {
    container.innerHTML = `
      <div class="field-wrap">
        <input class="input-field" id="f-name" placeholder="Full Name" type="text"/>
        <span class="err-msg" id="e-name"></span>
      </div>
      <div class="field-wrap">
        <input class="input-field" id="f-email" placeholder="Email" type="email"/>
        <span class="err-msg" id="e-email"></span>
      </div>
      <div class="field-wrap">
        <input class="input-field" id="f-pass" placeholder="Password (min 6 chars)" type="password"/>
        <span class="err-msg" id="e-pass"></span>
      </div>`;
  } else {
    container.innerHTML = `
      <div class="field-wrap">
        <input class="input-field" id="f-email" placeholder="Email" type="email"/>
        <span class="err-msg" id="e-email"></span>
      </div>
      <div class="field-wrap">
        <input class="input-field" id="f-pass" placeholder="Password" type="password"/>
        <span class="err-msg" id="e-pass"></span>
      </div>`;
  }
}

// Clear error message
function clearErr(id) {
  const el = document.getElementById(id);
  if (el) el.textContent = '';
}

// Set error message
function setErr(id, msg) {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = msg;
    const inp = document.getElementById(id.replace('e-', 'f-'));
    if (inp) inp.classList.add('error');
  }
}

// Handle email/password auth
document.addEventListener('DOMContentLoaded', () => {
  renderFields();
  document.getElementById('auth-submit').addEventListener('click', handleAuth);
});

function handleAuth() {
  let valid = true;
  ['e-name', 'e-email', 'e-pass'].forEach(id => clearErr(id));
  ['f-name', 'f-email', 'f-pass'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('error');
  });

  const email = (document.getElementById('f-email') || {}).value || '';
  const pass = (document.getElementById('f-pass') || {}).value || '';

  if (!email.trim()) { setErr('e-email', 'Email is required'); valid = false; }
  if (!pass || pass.length < 6) { setErr('e-pass', 'Password must be at least 6 characters'); valid = false; }

  if (currentMode === 'signup') {
    const name = (document.getElementById('f-name') || {}).value || '';
    if (!name.trim()) { setErr('e-name', 'Name is required'); valid = false; }

    if (valid) {
      const btn = document.getElementById('auth-submit');
      btn.disabled = true;
      btn.textContent = 'Creating account...';

      auth.createUserWithEmailAndPassword(email, pass)
        .then((cred) => {
          return cred.user.updateProfile({ displayName: name });
        })
        .then(() => {
          // Create user document in Firestore
          return db.collection('users').doc(auth.currentUser.uid).set({
            name: name,
            email: email,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
          });
        })
        .then(() => {
          window.location.href = 'index.html';
        })
        .catch((err) => {
          alert('Error: ' + err.message);
          btn.disabled = false;
          btn.textContent = 'Join the Community ✨';
        });
    }
  } else {
    if (valid) {
      const btn = document.getElementById('auth-submit');
      btn.disabled = true;
      btn.textContent = 'Signing in...';

      auth.signInWithEmailAndPassword(email, pass)
        .then(() => {
          window.location.href = 'index.html';
        })
        .catch((err) => {
          alert('Error: ' + err.message);
          btn.disabled = false;
          btn.textContent = 'Enter the Café ☕';
        });
    }
  }
}

// Google Sign In
function googleSignIn() {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider)
    .then((result) => {
      const user = result.user;
      // Check if user document exists, if not create it
      return db.collection('users').doc(user.uid).get()
        .then((doc) => {
          if (!doc.exists) {
            return db.collection('users').doc(user.uid).set({
              name: user.displayName,
              email: user.email,
              photoURL: user.photoURL,
              createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
          }
        });
    })
    .then(() => {
      window.location.href = 'index.html';
    })
    .catch((err) => {
      alert('Error: ' + err.message);
    });
}

// Sign Out
function signOut() {
  auth.signOut()
    .then(() => {
      window.location.href = 'auth.html';
    })
    .catch((err) => {
      alert('Error: ' + err.message);
    });
}

// Toast notification (disabled - component removed)
function showToast(msg) {
  // No-op; toast removed
}
