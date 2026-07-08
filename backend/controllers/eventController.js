const db = require('../db');

async function getAllEvents(req, res) {
  const { search, status } = req.query;

  let sql = `
    SELECT e.*, u.name AS organizer_name,
           (e.capacity - e.tickets_booked) AS seats_left
    FROM events e
    JOIN users u ON e.organizer_id = u.id
    WHERE 1=1
  `;
  const params = [];

  if (search) {
    sql += ' AND (e.title LIKE ? OR e.venue LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  if (status && status !== 'all') {
    sql += ' AND e.status = ?';
    params.push(status);
  }

  sql += ' ORDER BY e.event_date ASC';

  const [rows] = await db.query(sql, params);
  res.json(rows);
}

async function getEventById(req, res) {
  const [rows] = await db.query(
    `SELECT e.*, u.name AS organizer_name,
            (e.capacity - e.tickets_booked) AS seats_left
     FROM events e
     JOIN users u ON e.organizer_id = u.id
     WHERE e.id = ?`,
    [req.params.id]
  );
  if (rows.length === 0) return res.status(404).json({ error: 'Event not found' });
  res.json(rows[0]);
}

// events belonging to the logged-in organizer only
async function getMyEvents(req, res) {
  const [rows] = await db.query(
    `SELECT *, (capacity - tickets_booked) AS seats_left
     FROM events WHERE organizer_id = ? ORDER BY created_at DESC`,
    [req.user.id]
  );
  res.json(rows);
}

async function createEvent(req, res) {
  const { title, description, venue, event_date, event_time, capacity, price } = req.body;

  if (!title || !venue || !event_date || !event_time || !capacity) {
    return res.status(400).json({ error: 'Title, venue, date, time and capacity are all required' });
  }

  const cap = parseInt(capacity);
  if (isNaN(cap) || cap < 1) {
    return res.status(400).json({ error: 'Capacity must be a positive integer' });
  }

  const banner_url = req.file ? `/uploads/${req.file.filename}` : null;

  const [result] = await db.query(
    `INSERT INTO events
       (title, description, venue, event_date, event_time, capacity, price, banner_url, organizer_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      title,
      description || null,
      venue,
      event_date,
      event_time,
      cap,
      parseFloat(price) || 0,
      banner_url,
      req.user.id
    ]
  );

  res.status(201).json({ id: result.insertId, message: 'Event created' });
}

async function updateEvent(req, res) {
  const eventId = req.params.id;

  const [existing] = await db.query(
    'SELECT * FROM events WHERE id = ? AND organizer_id = ?',
    [eventId, req.user.id]
  );
  if (existing.length === 0) {
    return res.status(404).json({ error: 'Event not found or you do not own it' });
  }

  const ev = existing[0];
  const { title, description, venue, event_date, event_time, capacity, price, status } = req.body;

  const newCap = capacity ? parseInt(capacity) : ev.capacity;
  // guard: can't shrink capacity below what's already booked
  if (newCap < ev.tickets_booked) {
    return res.status(400).json({
      error: `Capacity can't go below ${ev.tickets_booked} — that many seats are already booked`
    });
  }

  const banner_url = req.file ? `/uploads/${req.file.filename}` : ev.banner_url;

  await db.query(
    `UPDATE events
     SET title=?, description=?, venue=?, event_date=?, event_time=?,
         capacity=?, price=?, banner_url=?, status=?
     WHERE id=?`,
    [
      title       || ev.title,
      description !== undefined ? description : ev.description,
      venue       || ev.venue,
      event_date  || ev.event_date,
      event_time  || ev.event_time,
      newCap,
      price !== undefined ? parseFloat(price) : ev.price,
      banner_url,
      status      || ev.status,
      eventId
    ]
  );

  res.json({ message: 'Event updated' });
}

async function deleteEvent(req, res) {
  const [existing] = await db.query(
    'SELECT id FROM events WHERE id = ? AND organizer_id = ?',
    [req.params.id, req.user.id]
  );
  if (existing.length === 0) {
    return res.status(404).json({ error: 'Event not found or not yours' });
  }

  await db.query('DELETE FROM events WHERE id = ?', [req.params.id]);
  res.json({ message: 'Event deleted' });
}

module.exports = { getAllEvents, getEventById, getMyEvents, createEvent, updateEvent, deleteEvent };
