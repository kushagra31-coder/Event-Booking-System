const API = 'http://localhost:3000/api';

function getToken() { return localStorage.getItem('token'); }
function getUser() {
  try { return JSON.parse(localStorage.getItem('user')); }
  catch { return null; }
}

function setupNavbar() {
  const user  = getUser();
  const links = document.getElementById('nav-links');
  if (!links) return;

  if (user) {
    const dashLink = user.role === 'organizer' ? '/admin.html' : '/dashboard.html';
    links.innerHTML = `
      <li><a href="${dashLink}">Dashboard</a></li>
      <li><button class="btn btn-ghost" onclick="doLogout()"
          style="font-size:13px;padding:6px 14px;">Log out</button></li>
    `;
  } else {
    links.innerHTML = `
      <li><a href="login.html">Log in</a></li>
      <li><a href="register.html" class="btn btn-primary" style="font-size:13px;padding:6px 16px;">Register</a></li>
    `;
  }
}

function doLogout() {
  localStorage.clear();
  window.location.href = '/login.html';
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function formatTime(t) {
  if (!t) return '';
  const [h, m] = t.split(':');
  const hour = parseInt(h);
  return `${hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
}

// ──────────────────────────────────────────
// EVENT DETAIL PAGE
// ──────────────────────────────────────────

const detailContent = document.getElementById('event-content');
if (detailContent) {
  setupNavbar();

  const params  = new URLSearchParams(window.location.search);
  const eventId = params.get('id');

  if (!eventId) {
    detailContent.innerHTML = '<p style="color:var(--red);">No event ID in URL.</p>';
  } else {
    initDetailPage(eventId);
  }
}

async function initDetailPage(eventId) {
  let ev;
  try {
    const res = await fetch(`${API}/events/${eventId}`);
    if (!res.ok) throw new Error('not found');
    ev = await res.json();
  } catch {
    document.getElementById('event-content').innerHTML =
      '<p style="color:var(--red);">Event not found.</p>';
    return;
  }

  // banner
  const bannerEl = document.getElementById('event-banner');
  const placeholder = document.getElementById('banner-placeholder');
  if (ev.banner_url) {
    bannerEl.innerHTML = `<img src="${ev.banner_url}" alt="${ev.title}" />`;
  } else {
    placeholder.textContent = ev.title.charAt(0);
  }

  document.title = `${ev.title} — EventHub`;

  // main content
  document.getElementById('event-content').innerHTML = `
    <h1>${ev.title}</h1>
    <div class="detail-meta">
      <div class="detail-meta-item">
        <span class="meta-label">Date</span>
        <span class="meta-value">${formatDate(ev.event_date)}</span>
      </div>
      <div class="detail-meta-item">
        <span class="meta-label">Time</span>
        <span class="meta-value">${formatTime(ev.event_time)}</span>
      </div>
      <div class="detail-meta-item">
        <span class="meta-label">Venue</span>
        <span class="meta-value">${ev.venue}</span>
      </div>
      <div class="detail-meta-item">
        <span class="meta-label">Status</span>
        <span class="meta-value" style="text-transform:capitalize;">${ev.status}</span>
      </div>
    </div>
    ${ev.description
      ? `<div class="detail-description">
           <h2>About this event</h2>
           <p>${ev.description.replace(/\n/g, '<br>')}</p>
         </div>`
      : ''}
    <div class="by-organizer">Organised by <strong>${ev.organizer_name}</strong></div>
  `;

  // booking widget
  populateWidget(ev);
}

function populateWidget(ev) {
  const widget = document.getElementById('booking-widget');
  widget.style.display = 'block';

  const seatsLeft = ev.seats_left;
  const isFree    = parseFloat(ev.price) === 0;

  // price display
  document.getElementById('widget-price-area').innerHTML = isFree
    ? `<div class="widget-price free-event">Free Entry</div>`
    : `<div class="widget-price">₹${parseFloat(ev.price).toFixed(0)} <span class="per-ticket">/ ticket</span></div>`;

  // seats indicator
  const seatsEl = document.getElementById('seats-indicator');
  if (seatsLeft <= 0) {
    seatsEl.textContent = 'Sold out';
    seatsEl.classList.add('low-seats');
  } else if (seatsLeft <= 10) {
    seatsEl.textContent = `Only ${seatsLeft} seat${seatsLeft === 1 ? '' : 's'} left!`;
    seatsEl.classList.add('low-seats');
  } else {
    seatsEl.textContent = `${seatsLeft} seats available`;
  }

  // hide booking form if unavailable
  if (ev.status !== 'upcoming' && ev.status !== 'ongoing' || seatsLeft <= 0) {
    document.getElementById('booking-form-area').style.display = 'none';
    return;
  }

  // seat counter state
  let seatCount = 1;
  const maxSeats = Math.min(seatsLeft, 10);
  const price    = parseFloat(ev.price);

  function updateTotal() {
    document.getElementById('seat-count-display').textContent = seatCount;
    document.getElementById('btn-dec').disabled = seatCount <= 1;
    document.getElementById('btn-inc').disabled = seatCount >= maxSeats;
    document.getElementById('total-display').textContent = isFree
      ? 'Free'
      : `₹${(seatCount * price).toFixed(0)}`;
  }

  updateTotal();

  document.getElementById('btn-dec').addEventListener('click', () => {
    if (seatCount > 1) { seatCount--; updateTotal(); }
  });

  document.getElementById('btn-inc').addEventListener('click', () => {
    if (seatCount < maxSeats) { seatCount++; updateTotal(); }
  });

  document.getElementById('btn-book').addEventListener('click', () => doBooking(ev.id, seatCount));
}

async function doBooking(eventId, seats) {
  const user = getUser();
  if (!user) {
    // not logged in — send to login, come back after
    window.location.href = `/login.html?next=/event-detail.html?id=${eventId}`;
    return;
  }

  if (user.role === 'organizer') {
    showWidgetAlert('Organizer accounts cannot book tickets. Use a student account.', 'error');
    return;
  }

  const btn = document.getElementById('btn-book');
  btn.disabled  = true;
  btn.textContent = 'Processing…';
  hideWidgetAlert();

  try {
    const res  = await fetch(`${API}/bookings/event/${eventId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify({ seats })
    });
    const data = await res.json();

    if (!res.ok) {
      showWidgetAlert(data.error || 'Booking failed.');
      btn.disabled    = false;
      btn.textContent = btn.dataset.label;
      return;
    }

    // success — go to confirmation
    window.location.href = `/booking-confirm.html?id=${data.bookingId}`;
  } catch (err) {
    showWidgetAlert('Could not reach the server.');
    btn.disabled    = false;
    btn.textContent = btn.dataset.label;
  }
}

function showWidgetAlert(msg, type = 'error') {
  const el = document.getElementById('widget-alert');
  if (!el) return;
  el.className   = `alert alert-${type}`;
  el.textContent = msg;
  el.style.display = 'block';
}

function hideWidgetAlert() {
  const el = document.getElementById('widget-alert');
  if (el) el.style.display = 'none';
}

// ──────────────────────────────────────────
// BOOKING CONFIRMATION PAGE
// ──────────────────────────────────────────

const confirmCard = document.getElementById('confirm-card');
if (confirmCard) {
  setupNavbar();

  const params     = new URLSearchParams(window.location.search);
  const bookingId  = params.get('id');

  if (!bookingId || !getToken()) {
    confirmCard.innerHTML = '<p style="color:var(--red);">Invalid confirmation link. <a href="/">Go home</a></p>';
  } else {
    loadConfirmation(bookingId);
  }
}

async function loadConfirmation(bookingId) {
  try {
    const res  = await fetch(`${API}/bookings/${bookingId}`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });

    if (!res.ok) {
      document.getElementById('confirm-card').innerHTML =
        '<p style="color:var(--red);">Booking not found. <a href="/">Go home</a></p>';
      return;
    }

    const b = await res.json();
    renderConfirmation(b);
  } catch (err) {
    document.getElementById('confirm-card').innerHTML =
      '<p style="color:var(--red);">Could not load booking details.</p>';
  }
}

function renderConfirmation(b) {
  const card     = document.getElementById('confirm-card');
  const isFree   = parseFloat(b.total_amount) === 0;
  const amount   = isFree ? 'Free' : `₹${parseFloat(b.total_amount).toFixed(2)}`;

  card.innerHTML = `
    <div class="confirm-icon"></div>
    <h2>Booking Confirmed!</h2>
    <p class="booking-ref">Reference: <strong>#${b.id}</strong></p>

    <table class="detail-table">
      <tr><td>Event</td><td>${b.title}</td></tr>
      <tr><td>Date</td><td>${formatDate(b.event_date)}</td></tr>
      <tr><td>Time</td><td>${formatTime(b.event_time)}</td></tr>
      <tr><td>Venue</td><td>${b.venue}</td></tr>
      <tr><td>Seats</td><td>${b.seats}</td></tr>
      <tr><td>Amount paid</td><td>${amount}</td></tr>
      <tr><td>Booked at</td><td>${new Date(b.booked_at).toLocaleString('en-IN')}</td></tr>
    </table>

    <div class="confirm-actions">
      <a href="dashboard.html" class="btn btn-primary">My Bookings</a>
      <a href="index.html"     class="btn btn-ghost">Browse Events</a>
    </div>
  `;
}
