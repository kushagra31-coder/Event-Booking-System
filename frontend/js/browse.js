const API = '/api';

function getUser() {
  try { return JSON.parse(localStorage.getItem('user')); }
  catch { return null; }
}

// update the navbar based on login state
function setupNavbar() {
  const user  = getUser();
  const links = document.getElementById('nav-links');

  if (user) {
    const dashLink = user.role === 'organizer' ? '/admin.html' : '/dashboard.html';
    links.innerHTML = `
      <li><a href="${dashLink}">My Dashboard</a></li>
      <li>
        <button class="btn btn-outline" onclick="doLogout()"
          style="font-size:13px; padding:6px 14px;">Log out</button>
      </li>
    `;
  } else {
    links.innerHTML = `
      <li><a href="login.html">Log in</a></li>
      <li><a href="register.html" class="btn btn-primary" style="font-size:13px; padding:6px 16px;">Register</a></li>
    `;
  }
}

function doLogout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.reload();
}

function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatDateBadge(dateStr) {
  const d = new Date(dateStr);
  const day  = d.toLocaleDateString('en-IN', { day: '2-digit' });
  const mon  = d.toLocaleDateString('en-IN', { month: 'short' });
  return `${day}<br>${mon}`;
}

function formatTime(t) {
  if (!t) return '';
  const [h, m] = t.split(':');
  const hour = parseInt(h);
  return `${hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
}

function renderCard(ev) {
  const seatsLeft  = ev.seats_left;
  const seatsClass = seatsLeft <= 10 ? 'low' : '';
  const seatsText  = seatsLeft <= 0 ? 'Sold out' : `${seatsLeft} seats left`;

  const priceHtml = ev.price > 0
    ? `<span class="event-price">₹${parseFloat(ev.price).toFixed(0)}</span>`
    : `<span class="event-price free">Free</span>`;

  const safeTitle = escapeHTML(ev.title);
  const safeVenue = escapeHTML(ev.venue);
  
  const bannerHtml = ev.banner_url
    ? `<img src="${escapeHTML(ev.banner_url)}" alt="${safeTitle}" loading="lazy" />`
    : `<div class="banner-placeholder">${safeTitle.charAt(0)}</div>`;

  // booking button — wired up in Module 3
  const bookBtn = seatsLeft <= 0
    ? `<button class="btn btn-ghost" disabled>Sold out</button>`
    : `<a href="event-detail.html?id=${ev.id}" class="btn btn-primary">Book Now</a>`;

  return `
    <div class="event-card">
      <div class="event-card-banner">
        ${bannerHtml}
        <div class="event-date-badge">${formatDateBadge(ev.event_date)}</div>
      </div>
      <div class="event-card-body">
        <h3>${safeTitle}</h3>
        <div class="event-meta">
          <div class="event-meta-row">&#128205; ${safeVenue}</div>
          <div class="event-meta-row">&#128336; ${formatTime(ev.event_time)}</div>
        </div>
        <div class="event-card-footer">
          <div>
            ${priceHtml}
            <div class="seats-left ${seatsClass}">${seatsText}</div>
          </div>
          ${bookBtn}
        </div>
      </div>
    </div>
  `;
}

let allEvents = [];

function applyFilters() {
  const q      = document.getElementById('search-input').value.toLowerCase().trim();
  const status = document.getElementById('status-filter').value;

  const filtered = allEvents.filter(ev => {
    const matchText   = !q || ev.title.toLowerCase().includes(q) || ev.venue.toLowerCase().includes(q);
    const matchStatus = status === 'all' || ev.status === status;
    return matchText && matchStatus;
  });

  const grid = document.getElementById('events-grid');
  if (filtered.length === 0) {
    grid.innerHTML = `<div class="no-events"><strong>No events found</strong><p>Try a different search or filter.</p></div>`;
  } else {
    grid.innerHTML = filtered.map(renderCard).join('');
  }
}

async function loadEvents() {
  const grid = document.getElementById('events-grid');
  try {
    const res  = await fetch(`${API}/events`);
    allEvents  = await res.json();
    applyFilters();
  } catch (err) {
    grid.innerHTML = `<div class="no-events"><p>Could not load events — is the server running?</p></div>`;
  }
}

// ── Init ──

setupNavbar();
loadEvents();

document.getElementById('search-input').addEventListener('input', applyFilters);
document.getElementById('status-filter').addEventListener('change', applyFilters);
document.getElementById('btn-clear-filter').addEventListener('click', () => {
  document.getElementById('search-input').value = '';
  document.getElementById('status-filter').value = 'all';
  applyFilters();
});
