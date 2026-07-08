// API base — change this when deploying
const API = '/api';

// ── helpers ──

function showAlert(id, msg, type = 'error') {
  const el = document.getElementById(id);
  if (!el) return;
  el.className = `alert alert-${type}`;
  el.textContent = msg;
  el.style.display = 'block';
}

function hideAlert(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = 'none';
}

function setLoading(btnId, loading) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.disabled = loading;
  btn.textContent = loading ? 'Please wait…' : btn.dataset.label;
}

// store token + basic user info in localStorage
function saveSession(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

function getUser() {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    return null;
  }
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login.html';
}

// redirect if already logged in
function redirectIfLoggedIn() {
  const token = localStorage.getItem('token');
  if (!token) return;
  const user = getUser();
  if (user && user.role === 'organizer') {
    window.location.href = '/admin.html';
  } else {
    window.location.href = '/index.html';
  }
}

// ── Login form ──

const loginForm = document.getElementById('login-form');
if (loginForm) {
  redirectIfLoggedIn();

  // store the button label so setLoading can restore it
  document.getElementById('login-btn').dataset.label = 'Log in';

  loginForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    hideAlert('login-alert');

    const email    = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !password) {
      showAlert('login-alert', 'Please fill in both fields.');
      return;
    }

    setLoading('login-btn', true);

    try {
      const res  = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (!res.ok) {
        showAlert('login-alert', data.error || 'Login failed.');
        return;
      }

      saveSession(data.token, data.user);

      if (data.user.role === 'organizer') {
        window.location.href = '/admin.html';
      } else {
        window.location.href = '/index.html';
      }
    } catch (err) {
      showAlert('login-alert', 'Could not reach the server. Is it running?');
    } finally {
      setLoading('login-btn', false);
    }
  });
}

// ── Register form ──

const registerForm = document.getElementById('register-form');
if (registerForm) {
  redirectIfLoggedIn();

  document.getElementById('register-btn').dataset.label = 'Create account';

  // role toggle buttons
  const toggleBtns = document.querySelectorAll('#role-toggle button');
  const roleInput  = document.getElementById('role');

  toggleBtns.forEach(btn => {
    btn.addEventListener('click', function () {
      toggleBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      roleInput.value = this.dataset.role;
    });
  });

  registerForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    hideAlert('register-alert');

    const name     = document.getElementById('name').value.trim();
    const email    = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const role     = document.getElementById('role').value;

    if (!name || !email || !password) {
      showAlert('register-alert', 'All fields are required.');
      return;
    }

    if (password.length < 6) {
      showAlert('register-alert', 'Password must be at least 6 characters.');
      return;
    }

    setLoading('register-btn', true);

    try {
      const res  = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
      });
      const data = await res.json();

      if (!res.ok) {
        showAlert('register-alert', data.error || 'Registration failed.');
        return;
      }

      saveSession(data.token, data.user);
      showAlert('register-alert', 'Account created! Redirecting…', 'success');

      setTimeout(() => {
        if (data.user.role === 'organizer') {
          window.location.href = '/admin.html';
        } else {
          window.location.href = '/index.html';
        }
      }, 800);
    } catch (err) {
      showAlert('register-alert', 'Could not reach the server. Is it running?');
    } finally {
      setLoading('register-btn', false);
    }
  });
}
