const db = require('../db');

async function createBooking(req, res) {
  const userId  = req.user.id;
  const eventId = parseInt(req.params.eventId);
  const seats   = parseInt(req.body.seats);

  if (!seats || seats < 1 || seats > 10) {
    return res.status(400).json({ error: 'Seat count must be between 1 and 10' });
  }

  // get a dedicated connection so we can run a transaction
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // FOR UPDATE locks this row until we commit — prevents two requests from
    // both seeing "5 seats left" and both booking successfully
    const [rows] = await conn.query(
      `SELECT capacity, tickets_booked, price, title, status
       FROM events WHERE id = ? FOR UPDATE`,
      [eventId]
    );

    if (rows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: 'Event not found' });
    }

    const ev = rows[0];

    if (ev.status === 'cancelled' || ev.status === 'past') {
      await conn.rollback();
      return res.status(400).json({ error: `This event is ${ev.status} and no longer accepting bookings` });
    }

    const seatsLeft = ev.capacity - ev.tickets_booked;
    if (seats > seatsLeft) {
      await conn.rollback();
      return res.status(400).json({
        error: seatsLeft === 0
          ? 'This event is sold out'
          : `Only ${seatsLeft} seat${seatsLeft === 1 ? '' : 's'} remaining`
      });
    }

    const totalAmount = seats * parseFloat(ev.price);

    const [result] = await conn.query(
      'INSERT INTO bookings (user_id, event_id, seats, total_amount) VALUES (?, ?, ?, ?)',
      [userId, eventId, seats, totalAmount]
    );

    await conn.query(
      'UPDATE events SET tickets_booked = tickets_booked + ? WHERE id = ?',
      [seats, eventId]
    );

    await conn.commit();

    // TODO: create in-app notification (Module 5)

    res.status(201).json({
      bookingId: result.insertId,
      message: 'Booking confirmed',
      seats,
      totalAmount
    });
  } catch (err) {
    await conn.rollback();
    throw err; // let the express error handler deal with it
  } finally {
    conn.release();
  }
}

async function getUserBookings(req, res) {
  const [rows] = await db.query(
    `SELECT b.*, e.title, e.venue, e.event_date, e.event_time,
            e.banner_url, e.status AS event_status
     FROM bookings b
     JOIN events e ON b.event_id = e.id
     WHERE b.user_id = ?
     ORDER BY b.booked_at DESC`,
    [req.user.id]
  );
  res.json(rows);
}

async function getBookingById(req, res) {
  const [rows] = await db.query(
    `SELECT b.*, e.title, e.venue, e.event_date, e.event_time,
            e.banner_url, e.status AS event_status, u.name AS organizer_name
     FROM bookings b
     JOIN events e  ON b.event_id  = e.id
     JOIN users  u  ON e.organizer_id = u.id
     WHERE b.id = ? AND b.user_id = ?`,
    [req.params.id, req.user.id]
  );
  if (rows.length === 0) return res.status(404).json({ error: 'Booking not found' });
  res.json(rows[0]);
}

async function cancelBooking(req, res) {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.query(
      'SELECT * FROM bookings WHERE id = ? AND user_id = ? FOR UPDATE',
      [req.params.id, req.user.id]
    );

    if (rows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = rows[0];

    if (booking.status === 'cancelled') {
      await conn.rollback();
      return res.status(400).json({ error: 'This booking is already cancelled' });
    }

    // check event is still upcoming before allowing cancel
    const [evRows] = await conn.query('SELECT status FROM events WHERE id = ?', [booking.event_id]);
    if (evRows.length > 0 && evRows[0].status === 'past') {
      await conn.rollback();
      return res.status(400).json({ error: 'Cannot cancel a booking for a past event' });
    }

    await conn.query('UPDATE bookings SET status = ? WHERE id = ?', ['cancelled', booking.id]);
    await conn.query(
      'UPDATE events SET tickets_booked = tickets_booked - ? WHERE id = ?',
      [booking.seats, booking.event_id]
    );

    await conn.commit();
    res.json({ message: 'Booking cancelled' });
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

module.exports = { createBooking, getUserBookings, getBookingById, cancelBooking };
