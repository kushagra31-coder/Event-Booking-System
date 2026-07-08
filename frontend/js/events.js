const API = 'http://localhost:3000/api';

// ── session helpers (same pattern as auth.js) ──

function getToken() { return localStorage.getItem('token'); }

function getUser() {
  try { return JSON.parse(localStorage.getItem('user')); }
  catch { return null; }
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login.html';
}

// redirect if not logged in or not an organizer
function guardOrganizer() {
  const user = getUser();
  if (!user || !getToken()) {
    window.location.href = '/login.html';
    return false;
  }
  if (user.role !== 'organizer') {
    window.location.href = '/index.html';
    return false;
  }
  return true;
}

// ── UI helpers ──

function showTableAlert(msg, type = 'error') {
  const el = document.getElementById('table-alert');
  el.className = `alert alert-${type}`;
  el.textContent = msg;
  el.style.display = 'block';
  setTimeout(() => el.style.display = 'none', 4000);
}

function showModalAlert(msg, type = 'error') {
  const el = document.getElementById('modal-alert');
  el.className = `alert alert-${type}`;
  el.textContent = msg;
  el.style.display = 'block';
}

function hideModalAlert() {
  document.getElementById('modal-alert').style.display = 'none';
}

function setSubmitLoading(loading) {
  const btn = document.getElementById('modal-submit-btn');
  btn.disabled = loading;
  btn.textContent = loading ? 'Saving…' : btn.dataset.label;
}

// ── Format helpers ──

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatTime(t) {
  if (!t) return '';
  const [h, m] = t.split(':');
  const hour = parseInt(h);
  return `${hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
}

function badgeHtml(status) {
  return `<span class="badge badge-${status}">${status}</span>`;
}

// ── Stats ──

function updateStats(events) {
  document.getElementById('stat-total').textContent    = events.length;
  document.getElementById('stat-upcoming').textContent = events.filter(e => e.status === 'upcoming').length;
  document.getElementById('stat-booked').textContent   = events.reduce((sum, e) => sum + e.tickets_booked, 0);
  document.getElementById('stat-capacity').textContent = events.reduce((sum, e) => sum + e.capacity, 0);
}

// ── Event table ──

function renderTable(events) {
  const tbody = document.getElementById('events-tbody');

  if (events.length === 0) {
    tbody.innerHTML = `
      <tr><td colspan="7">
        <div class="empty-state">
          <strong>No events yet</strong>
          <p>Click "New Event" to create your first one.</p>
        </div>
      </td></tr>
    `;
    return;
  }

  tbody.innerHTML = events.map(ev => {
    const booked  = ev.tickets_booked;
    const cap     = ev.capacity;
    const pct     = Math.round((booked / cap) * 100);
    const price   = ev.price > 0 ? `₹${parseFloat(ev.price).toFixed(0)}` : 'Free';

    return `
      <tr>
        <td class="event-title-cell">
          <strong>${ev.title}</strong>
        </td>
        <td>${formatDate(ev.event_date)}<br><span style="font-size:12px;color:var(--muted)">${formatTime(ev.event_time)}</span></td>
        <td>${ev.venue}</td>
        <td>
          <div class="cap-bar-wrap">
            <div class="cap-bar">
              <div class="cap-bar-fill" style="width:${pct}%"></div>
            </div>
            <span style="font-size:12px;">${booked}/${cap}</span>
          </div>
        </td>
        <td>${price}</td>
        <td>${badgeHtml(ev.status)}</td>
        <td>
          <button class="btn-edit" onclick="openEditModal(${ev.id})">Edit</button>
          <button class="btn-del"  onclick="confirmDelete(${ev.id}, '${ev.title.replace(/'/g, "\\'")}')">Delete</button>
        </td>
      </tr>
    `;
  }).join('');
}

async function loadMyEvents() {
  try {
    const res  = await fetch(`${API}/events/my`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    const data = await res.json();

    if (!res.ok) {
      showTableAlert(data.error || 'Failed to load events');
      return;
    }

    renderTable(data);
    updateStats(data);
  } catch (err) {
    console.error('Load events error:', err);
    showTableAlert('Could not reach the server.');
  }
}

// ── Modal: open / close ──

function openModal() {
  document.getElementById('event-modal').style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('event-modal').style.display = 'none';
  document.body.style.overflow = '';
  document.getElementById('event-form').reset();
  document.getElementById('edit-id').value = '';
  document.getElementById('current-banner').textContent = '';
  document.getElementById('status-group').style.display = 'none';
  document.getElementById('modal-title').textContent = 'Create Event';
  hideModalAlert();
}

function openCreateModal() {
  closeModal(); // reset first
  openModal();
}

async function openEditModal(eventId) {
  closeModal();

  try {
    const res  = await fetch(`${API}/events/${eventId}`);
    const ev   = await res.json();

    document.getElementById('modal-title').textContent  = 'Edit Event';
    document.getElementById('edit-id').value            = ev.id;
    document.getElementById('ev-title').value           = ev.title;
    document.getElementById('ev-desc').value            = ev.description || '';
    document.getElementById('ev-venue').value           = ev.venue;
    document.getElementById('ev-date').value            = ev.event_date.split('T')[0]; // strip time part from ISO
    document.getElementById('ev-time').value            = ev.event_time.substring(0, 5);
    document.getElementById('ev-capacity').value        = ev.capacity;
    document.getElementById('ev-price').value           = ev.price;
    document.getElementById('ev-status').value          = ev.status;
    document.getElementById('status-group').style.display = 'block';

    if (ev.banner_url) {
      document.getElementById('current-banner').textContent = `Current banner: ${ev.banner_url.split('/').pop()}`;
    }

    openModal();
  } catch (err) {
    showTableAlert('Failed to load event data for editing.');
  }
}

// ── Submit: create or update ──

async function submitEventForm(e) {
  e.preventDefault();
  hideModalAlert();

  const editId   = document.getElementById('edit-id').value;
  const isEdit   = !!editId;

  const title    = document.getElementById('ev-title').value.trim();
  const venue    = document.getElementById('ev-venue').value.trim();
  const date     = document.getElementById('ev-date').value;
  const time     = document.getElementById('ev-time').value;
  const capacity = document.getElementById('ev-capacity').value;

  if (!title || !venue || !date || !time || !capacity) {
    showModalAlert('Please fill in all required fields.');
    return;
  }

  const formData = new FormData();
  formData.append('title',       title);
  formData.append('description', document.getElementById('ev-desc').value.trim());
  formData.append('venue',       venue);
  formData.append('event_date',  date);
  formData.append('event_time',  time);
  formData.append('capacity',    capacity);
  formData.append('price',       document.getElementById('ev-price').value || '0');

  if (isEdit) {
    formData.append('status', document.getElementById('ev-status').value);
  }

  const bannerFile = document.getElementById('ev-banner').files[0];
  if (bannerFile) formData.append('banner', bannerFile);

  setSubmitLoading(true);

  try {
    const url    = isEdit ? `${API}/events/${editId}` : `${API}/events`;
    const method = isEdit ? 'PUT' : 'POST';

    const res  = await fetch(url, {
      method,
      headers: { 'Authorization': `Bearer ${getToken()}` },
      body: formData
      // no Content-Type header — browser sets it with the multipart boundary
    });
    const data = await res.json();

    if (!res.ok) {
      showModalAlert(data.error || 'Something went wrong.');
      return;
    }

    closeModal();
    showTableAlert(isEdit ? 'Event updated.' : 'Event created!', 'success');
    loadMyEvents();
  } catch (err) {
    showModalAlert('Could not reach the server.');
  } finally {
    setSubmitLoading(false);
  }
}

// ── Delete ──

async function confirmDelete(eventId, title) {
  if (!confirm(`Delete "${title}"? This will also remove all its bookings.`)) return;

  try {
    const res  = await fetch(`${API}/events/${eventId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    const data = await res.json();

    if (!res.ok) {
      showTableAlert(data.error || 'Delete failed.');
      return;
    }

    showTableAlert('Event deleted.', 'success');
    loadMyEvents();
  } catch (err) {
    showTableAlert('Delete request failed — is the server running?');
  }
}

// ── Analytics ──

async function loadAnalytics() {
  try {
    const res  = await fetch(`${API}/dashboard/admin`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    const data = await res.json();
    if (!res.ok) return;

    const section = document.getElementById('analytics-section');
    section.style.display = 'block';

    // CSS bar chart — max bar is always 100%, others are proportional
    const maxBooked = Math.max(...data.topEvents.map(e => e.tickets_booked), 1);
    document.getElementById('bar-chart').innerHTML = data.topEvents.length === 0
      ? '<p style="color:var(--muted);font-size:13px;">No bookings yet.</p>'
      : data.topEvents.map(ev => {
          const pct = Math.round((ev.tickets_booked / maxBooked) * 100);
          const label = ev.title.length > 20 ? ev.title.substring(0, 19) + '\u2026' : ev.title;
          return `
            <div class="bar-row">
              <span class="bar-label" title="${ev.title}">${label}</span>
              <div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>
              <span class="bar-val">${ev.tickets_booked}</span>
            </div>
          `;
        }).join('');

    // recent bookings list
    document.getElementById('recent-bookings').innerHTML = data.recentBookings.length === 0
      ? '<p style="color:var(--muted);font-size:13px;">No bookings yet.</p>'
      : data.recentBookings.map(b => {
          const ago = new Date(b.booked_at).toLocaleDateString('en-IN', { day:'2-digit', month:'short' });
          const amt = parseFloat(b.total_amount) > 0 ? `\u20b9${parseFloat(b.total_amount).toFixed(0)}` : 'Free';
          return `
            <div class="recent-item">
              <div>
                <div class="r-name">${b.user_name}</div>
                <div class="r-event">${b.event_title}</div>
              </div>
              <div style="text-align:right;">
                <div style="font-weight:600; font-size:13px;">${amt}</div>
                <div class="r-seats">${b.seats} seat${b.seats > 1 ? 's' : ''} &middot; ${ago}</div>
              </div>
            </div>
          `;
        }).join('');
  } catch (err) {
    // analytics failing shouldn't block the rest of the page
    console.error('Analytics load error:', err);
  }
}

// ── Init ──

if (!guardOrganizer()) {
  // already redirected
} else {
  const user = getUser();
  document.getElementById('nav-username').textContent = user.name;

  document.getElementById('btn-logout').addEventListener('click', logout);

  document.getElementById('btn-new-event').addEventListener('click', openCreateModal);
  document.getElementById('modal-close').addEventListener('click', closeModal);

  // close modal on overlay click
  document.getElementById('event-modal').addEventListener('click', function (e) {
    if (e.target === this) closeModal();
  });

  document.getElementById('event-form').addEventListener('submit', submitEventForm);

  loadMyEvents();
  loadAnalytics();
}
