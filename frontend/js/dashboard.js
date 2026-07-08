const API = 'http://localhost:3000/api';

function getToken() { return localStorage.getItem('token'); }
function getUser() {
  try { return JSON.parse(localStorage.getItem('user')); }
  catch { return null; }
}

function logout() {
  localStorage.clear();
  window.location.href = '/login.html';
}

// guard: only regular users, not organizers
function guardUser() {
  const user = getUser();
  if (!user || !getToken()) { window.location.href = '/login.html'; return null; }
  if (user.role === 'organizer') { window.location.href = '/admin.html'; return null; }
  return user;
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatTime(t) {
  if (!t) return '';
  const [h, m] = t.split(':');
  const hr = parseInt(h);
  return `${hr > 12 ? hr - 12 : hr}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
}

function showDashAlert(msg, type = 'success') {
  const el = document.getElementById('dash-alert');
  el.className = `alert alert-${type}`;
  el.textContent = msg;
  el.style.display = 'block';
  setTimeout(() => el.style.display = 'none', 3500);
}

// ── Stats ──

async function loadStats() {
  try {
    const res  = await fetch(`${API}/dashboard/user`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    const data = await res.json();

    document.getElementById('s-total').textContent    = data.total_bookings;
    document.getElementById('s-upcoming').textContent = data.upcoming;
    document.getElementById('s-seats').textContent    = data.total_seats;
    document.getElementById('s-spent').textContent    = data.total_spent > 0
      ? `₹${parseFloat(data.total_spent).toFixed(0)}`
      : '₹0';
  } catch (err) {
    console.error('Stats load failed:', err);
  }
}

// ── Bookings ──

let allBookings = [];
let activeTab   = 'upcoming';

function classifyBooking(b) {
  if (b.status === 'cancelled') return 'cancelled';
  const eventDate = new Date(b.event_date);
  return eventDate >= new Date() ? 'upcoming' : 'past';
}

function renderBookings(filter) {
  const list = document.getElementById('booking-list');
  let filtered;

  if (filter === 'all') {
    filtered = allBookings;
  } else if (filter === 'upcoming') {
    filtered = allBookings.filter(b => b.status === 'confirmed' && new Date(b.event_date) >= new Date());
  } else if (filter === 'past') {
    filtered = allBookings.filter(b => b.status === 'confirmed' && new Date(b.event_date) < new Date());
  } else {
    filtered = allBookings.filter(b => b.status === 'cancelled');
  }

  if (filtered.length === 0) {
    list.innerHTML = `
      <div class="empty-bookings">
        <strong>No bookings here</strong>
        <p style="margin-top:8px;">
          ${filter === 'upcoming' ? '<a href="index.html">Browse upcoming events</a>' : 'Nothing to show for this filter.'}
        </p>
      </div>
    `;
    return;
  }

  list.innerHTML = filtered.map(b => {
    const isCancelled = b.status === 'cancelled';
    const isFuture    = new Date(b.event_date) >= new Date();
    const isFree      = parseFloat(b.total_amount) === 0;
    const amountHtml  = isFree
      ? `<div class="booking-amount free">Free</div>`
      : `<div class="booking-amount">₹${parseFloat(b.total_amount).toFixed(0)}</div>`;
    const cancelBtn   = (!isCancelled && isFuture)
      ? `<button class="btn-cancel" onclick="cancelBooking(${b.id})">Cancel</button>`
      : '';

    return `
      <div class="booking-row ${isCancelled ? 'cancelled' : ''}">
        <div>
          <div class="booking-event-title">
            <a href="/event-detail.html?id=${b.event_id}" style="color:inherit; text-decoration:none;">${b.title}</a>
          </div>
          <div class="booking-meta">
            <span>&#128197; ${formatDate(b.event_date)}</span>
            <span>&#128336; ${formatTime(b.event_time)}</span>
            <span>&#128205; ${b.venue}</span>
            <span>${b.seats} seat${b.seats > 1 ? 's' : ''}</span>
          </div>
        </div>
        <div class="booking-actions">
          ${amountHtml}
          <span class="badge badge-${isCancelled ? 'cancelled' : (isFuture ? 'upcoming' : 'past')}">
            ${isCancelled ? 'Cancelled' : (isFuture ? 'Confirmed' : 'Past')}
          </span>
          ${cancelBtn}
        </div>
      </div>
    `;
  }).join('');
}

async function loadBookings() {
  try {
    const res  = await fetch(`${API}/bookings`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    allBookings = await res.json();
    renderBookings(activeTab);
  } catch (err) {
    document.getElementById('booking-list').innerHTML =
      '<p style="color:var(--red);">Failed to load bookings.</p>';
  }
}

async function cancelBooking(bookingId) {
  if (!confirm('Cancel this booking? This cannot be undone.')) return;

  try {
    const res  = await fetch(`${API}/bookings/${bookingId}/cancel`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    const data = await res.json();

    if (!res.ok) {
      showDashAlert(data.error || 'Cancellation failed.', 'error');
      return;
    }

    showDashAlert('Booking cancelled.');
    // update local state without re-fetching
    const idx = allBookings.findIndex(b => b.id === bookingId);
    if (idx !== -1) allBookings[idx].status = 'cancelled';
    renderBookings(activeTab);
    loadStats(); // refresh spent / upcoming count
  } catch (err) {
    showDashAlert('Could not reach server.', 'error');
  }
}

// ── Tab switching ──

function setActiveTab(filter) {
  activeTab = filter;
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === filter);
  });
  renderBookings(filter);
}

// ── Init ──

const user = guardUser();
if (user) {
  document.getElementById('user-name-display').textContent = user.name.split(' ')[0];
  document.getElementById('nav-username').textContent      = user.name;
  document.getElementById('btn-logout').addEventListener('click', logout);

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => setActiveTab(btn.dataset.filter));
  });

  loadStats();
  loadBookings();
}
