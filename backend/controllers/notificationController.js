const db = require('../db');

// create a notification for a user — called internally after booking
async function createNotification(userId, message) {
  await db.query(
    'INSERT INTO notifications (user_id, message) VALUES (?, ?)',
    [userId, message]
  );
}

// get all notifications for the logged-in user
async function getNotifications(req, res) {
  const [rows] = await db.query(
    `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 30`,
    [req.user.id]
  );
  res.json(rows);
}

async function markAllRead(req, res) {
  await db.query(
    'UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0',
    [req.user.id]
  );
  res.json({ message: 'Marked as read' });
}

async function getUnreadCount(req, res) {
  const [rows] = await db.query(
    'SELECT COUNT(*) AS cnt FROM notifications WHERE user_id = ? AND is_read = 0',
    [req.user.id]
  );
  res.json({ count: rows[0].cnt });
}

// Admin: generate a booking summary report for one of their events
async function getEventReport(req, res) {
  const eventId = req.params.eventId;

  // make sure this event belongs to the requesting organizer
  const [evRows] = await db.query(
    'SELECT * FROM events WHERE id = ? AND organizer_id = ?',
    [eventId, req.user.id]
  );
  if (evRows.length === 0) {
    return res.status(404).json({ error: 'Event not found or not yours' });
  }

  const ev = evRows[0];

  const [bookings] = await db.query(
    `SELECT b.id, b.seats, b.total_amount, b.status, b.booked_at,
            u.name AS attendee_name, u.email AS attendee_email
     FROM bookings b
     JOIN users u ON b.user_id = u.id
     WHERE b.event_id = ?
     ORDER BY b.booked_at ASC`,
    [eventId]
  );

  const confirmed = bookings.filter(b => b.status === 'confirmed');
  const revenue   = confirmed.reduce((sum, b) => sum + parseFloat(b.total_amount), 0);

  res.json({
    event: {
      id:       ev.id,
      title:    ev.title,
      date:     ev.event_date,
      time:     ev.event_time,
      venue:    ev.venue,
      capacity: ev.capacity,
      tickets_booked: ev.tickets_booked
    },
    summary: {
      total_bookings:    bookings.length,
      confirmed_bookings: confirmed.length,
      cancelled_bookings: bookings.length - confirmed.length,
      total_revenue:     revenue
    },
    attendees: bookings
  });
}

module.exports = { createNotification, getNotifications, markAllRead, getUnreadCount, getEventReport };
