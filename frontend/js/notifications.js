const API = '/api';

function getToken() { return localStorage.getItem('token'); }
function getUser() {
  try { return JSON.parse(localStorage.getItem('user')); }
  catch { return null; }
}

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60)   return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

// ──────────────────────────────────────────
// NOTIFICATION BELL — injected into navbar on any page that loads this file
// ──────────────────────────────────────────

function injectNotifBell() {
  const user = getUser();
  if (!user || !getToken()) return;

  // find the navbar user area (works on both admin and dashboard pages)
  const navbarUser = document.querySelector('.navbar-user') || document.querySelector('.navbar-links');
  if (!navbarUser) return;

  const bellWrapper = document.createElement('div');
  bellWrapper.style.position = 'relative';
  bellWrapper.innerHTML = `
    <button class="notif-btn" id="notif-bell" title="Notifications" aria-label="Notifications">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
      <span class="notif-badge" id="notif-count" style="display:none;"></span>
    </button>
    <div class="notif-dropdown" id="notif-dropdown" style="display:none;">
      <div class="notif-dropdown-header">
        <h4>Notifications</h4>
        <button class="notif-mark-read" id="btn-mark-read">Mark all read</button>
      </div>
      <div class="notif-list" id="notif-list">
        <div class="notif-empty">Loading…</div>
      </div>
    </div>
  `;

  // insert before first child of navbar-user
  navbarUser.insertBefore(bellWrapper, navbarUser.firstChild);

  document.getElementById('notif-bell').addEventListener('click', toggleDropdown);
  document.getElementById('btn-mark-read').addEventListener('click', markAllRead);

  // close dropdown when clicking outside
  document.addEventListener('click', function (e) {
    if (!bellWrapper.contains(e.target)) {
      document.getElementById('notif-dropdown').style.display = 'none';
    }
  });

  loadUnreadCount();
}

async function loadUnreadCount() {
  try {
    const res  = await fetch(`${API}/notifications/unread`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    const data = await res.json();
    const badge = document.getElementById('notif-count');
    if (data.count > 0) {
      badge.textContent = data.count > 9 ? '9+' : data.count;
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }
  } catch (err) {
    // silently fail — notifications aren't critical
  }
}

async function toggleDropdown() {
  const dropdown = document.getElementById('notif-dropdown');
  const isOpen   = dropdown.style.display === 'block';

  if (isOpen) {
    dropdown.style.display = 'none';
  } else {
    dropdown.style.display = 'block';
    await loadNotifications();
  }
}

async function loadNotifications() {
  const list = document.getElementById('notif-list');
  try {
    const res   = await fetch(`${API}/notifications`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    const items = await res.json();

    if (items.length === 0) {
      list.innerHTML = '<div class="notif-empty">No notifications yet.</div>';
      return;
    }

    list.innerHTML = items.map(n => `
      <div class="notif-item ${n.is_read ? '' : 'unread'}">
        <div class="notif-dot ${n.is_read ? 'read' : ''}"></div>
        <div>
          <div class="notif-text">${n.message}</div>
          <div class="notif-time">${timeAgo(n.created_at)}</div>
        </div>
      </div>
    `).join('');
  } catch (err) {
    list.innerHTML = '<div class="notif-empty">Could not load notifications.</div>';
  }
}

async function markAllRead() {
  try {
    await fetch(`${API}/notifications/read-all`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    // update UI without re-fetching
    document.querySelectorAll('.notif-item.unread').forEach(el => {
      el.classList.remove('unread');
      el.querySelector('.notif-dot').classList.add('read');
    });
    const badge = document.getElementById('notif-count');
    if (badge) badge.style.display = 'none';
  } catch (err) {
    console.error('markAllRead failed:', err);
  }
}

// ──────────────────────────────────────────
// REPORT PAGE (report.html)
// ──────────────────────────────────────────

const reportContent = document.getElementById('report-content');
if (reportContent) {
  const user = getUser();
  if (!user || user.role !== 'organizer') {
    window.location.href = '/login.html';
  } else {
    const params  = new URLSearchParams(window.location.search);
    const eventId = params.get('event');

    if (!eventId) {
      reportContent.innerHTML = '<p style="color:var(--red);">No event ID specified. <a href="admin.html">Go back</a></p>';
    } else {
      loadReport(eventId);
    }
  }
}

async function loadReport(eventId) {
  try {
    const res  = await fetch(`${API}/notifications/report/${eventId}`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    const data = await res.json();

    if (!res.ok) {
      document.getElementById('report-content').innerHTML =
        `<p style="color:var(--red);">${data.error || 'Could not load report.'}</p>`;
      return;
    }

    renderReport(data);
  } catch (err) {
    document.getElementById('report-content').innerHTML =
      '<p style="color:var(--red);">Server error loading report.</p>';
  }
}

function renderReport(data) {
  const { event, summary, attendees } = data;

  const formatDate = d => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  const formatTime = t => {
    const [h, m] = t.split(':');
    const hr = parseInt(h);
    return `${hr > 12 ? hr - 12 : hr}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
  };

  const fillPct = Math.round((event.tickets_booked / event.capacity) * 100);

  document.getElementById('report-content').innerHTML = `
    <div class="report-header-card">
      <div>
        <h2>${event.title}</h2>
        <div class="r-meta">${formatDate(event.date)} &middot; ${formatTime(event.time)} &middot; ${event.venue}</div>
      </div>
      <div style="text-align:right; color:#9e9890; font-size:13px;">
        ${event.tickets_booked} / ${event.capacity} seats filled<br>
        <span style="color:var(--red); font-weight:600;">${fillPct}% capacity</span>
      </div>
    </div>

    <div class="report-stats">
      <div class="report-stat">
        <div class="rs-label">Total Bookings</div>
        <div class="rs-val">${summary.total_bookings}</div>
      </div>
      <div class="report-stat">
        <div class="rs-label">Confirmed</div>
        <div class="rs-val" style="color:var(--success);">${summary.confirmed_bookings}</div>
      </div>
      <div class="report-stat">
        <div class="rs-label">Cancelled</div>
        <div class="rs-val" style="color:var(--red);">${summary.cancelled_bookings}</div>
      </div>
      <div class="report-stat">
        <div class="rs-label">Revenue</div>
        <div class="rs-val">${summary.total_revenue > 0 ? '&#8377;' + parseFloat(summary.total_revenue).toFixed(0) : 'Free'}</div>
      </div>
    </div>

    <h3 style="font-size:16px; font-weight:700; margin-bottom:14px;">Attendee List</h3>
    ${attendees.length === 0
      ? '<p style="color:var(--muted);">No bookings yet for this event.</p>'
      : `<table class="attendee-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Attendee</th>
              <th>Email</th>
              <th>Seats</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Booked at</th>
            </tr>
          </thead>
          <tbody>
            ${attendees.map((b, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>${b.attendee_name}</td>
                <td style="color:var(--muted);">${b.attendee_email}</td>
                <td>${b.seats}</td>
                <td>${parseFloat(b.total_amount) > 0 ? '&#8377;' + parseFloat(b.total_amount).toFixed(0) : 'Free'}</td>
                <td><span class="badge badge-${b.status === 'confirmed' ? 'upcoming' : 'cancelled'}">${b.status}</span></td>
                <td style="color:var(--muted);">${new Date(b.booked_at).toLocaleDateString('en-IN')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>`
    }
  `;
}

// ── Auto-inject bell on pages that have a .navbar-user ──
injectNotifBell();
