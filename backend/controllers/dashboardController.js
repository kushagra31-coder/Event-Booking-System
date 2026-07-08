const db = require('../db');

// Summary stats for a logged-in user's dashboard
async function getUserStats(req, res) {
  const userId = req.user.id;

  const [summary] = await db.query(
    `SELECT
       COUNT(*)                                                        AS total_bookings,
       COALESCE(SUM(CASE WHEN status='confirmed' THEN seats       ELSE 0 END), 0) AS total_seats,
       COALESCE(SUM(CASE WHEN status='confirmed' THEN total_amount ELSE 0 END), 0) AS total_spent
     FROM bookings WHERE user_id = ?`,
    [userId]
  );

  const [upcoming] = await db.query(
    `SELECT COUNT(*) AS cnt
     FROM bookings b
     JOIN events e ON b.event_id = e.id
     WHERE b.user_id = ? AND b.status = 'confirmed' AND e.event_date >= CURDATE()`,
    [userId]
  );

  res.json({
    total_bookings: summary[0].total_bookings,
    total_seats:    summary[0].total_seats,
    total_spent:    summary[0].total_spent,
    upcoming:       upcoming[0].cnt
  });
}

// Analytics for an organizer — their events, booking counts, revenue, recent activity
async function getAdminStats(req, res) {
  const orgId = req.user.id;

  const [summary] = await db.query(
    `SELECT
       COUNT(DISTINCT e.id)                                   AS total_events,
       COALESCE(SUM(b.seats), 0)                              AS total_bookings,
       COALESCE(SUM(b.total_amount), 0)                       AS total_revenue,
       COUNT(DISTINCT b.user_id)                              AS unique_attendees
     FROM events e
     LEFT JOIN bookings b ON b.event_id = e.id AND b.status = 'confirmed'
     WHERE e.organizer_id = ?`,
    [orgId]
  );

  // top 5 events by seats booked — for the bar chart
  const [topEvents] = await db.query(
    `SELECT e.id, e.title, e.capacity, e.tickets_booked,
            COALESCE(SUM(b.total_amount), 0) AS revenue
     FROM events e
     LEFT JOIN bookings b ON b.event_id = e.id AND b.status = 'confirmed'
     WHERE e.organizer_id = ?
     GROUP BY e.id
     ORDER BY e.tickets_booked DESC
     LIMIT 5`,
    [orgId]
  );

  // 10 most recent bookings across all their events
  const [recentBookings] = await db.query(
    `SELECT b.id, b.seats, b.total_amount, b.booked_at, b.status,
            u.name AS user_name, e.title AS event_title
     FROM bookings b
     JOIN users  u ON b.user_id  = u.id
     JOIN events e ON b.event_id = e.id
     WHERE e.organizer_id = ?
     ORDER BY b.booked_at DESC
     LIMIT 10`,
    [orgId]
  );

  res.json({ summary: summary[0], topEvents, recentBookings });
}

module.exports = { getUserStats, getAdminStats };
