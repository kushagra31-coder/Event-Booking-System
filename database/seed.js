/**
 * Seed script — run once to populate the database with sample data.
 * Usage: node database/seed.js
 * Requires the backend .env to be present (reads DB credentials from it).
 */

require('dotenv').config({ path: './backend/.env' });
const bcrypt = require('bcrypt');
const mysql  = require('mysql2/promise');

async function seed() {
  const db = await mysql.createConnection({
    host:     process.env.DB_HOST,
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  console.log('Connected. Seeding...\n');

  // ── Sample accounts ──
  const orgHash  = await bcrypt.hash('organizer123', 10);
  const userHash = await bcrypt.hash('student123', 10);

  await db.query(
    `INSERT IGNORE INTO users (name, email, password, role) VALUES
     ('TechFest Admin',  'admin@eventhub.com',   ?, 'organizer'),
     ('Aisha Patel',     'aisha@student.edu',     ?, 'user'),
     ('Rohan Mehra',     'rohan@student.edu',     ?, 'user')`,
    [orgHash, userHash, userHash]
  );

  const [[org]] = await db.query(
    'SELECT id FROM users WHERE email = ?', ['admin@eventhub.com']
  );

  // ── Sample events ──
  const events = [
    {
      title:       'TechFest 2024 — Opening Ceremony',
      description: 'Kick off the biggest college tech festival of the year. Featuring keynotes from industry leaders, live coding demos, and a networking dinner.',
      venue:       'Main Auditorium, Block A',
      event_date:  '2024-09-15',
      event_time:  '10:00:00',
      capacity:    500,
      price:       0.00,
      banner_url:  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80'
    },
    {
      title:       'Web Dev Workshop: Build a Full-Stack App',
      description: 'A hands-on 3-hour workshop where you build a real Express + MySQL application from scratch. Bring your laptop. Beginner-friendly.',
      venue:       'CS Lab 2, Block B',
      event_date:  '2024-09-20',
      event_time:  '14:00:00',
      capacity:    40,
      price:       199.00,
      banner_url:  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80'
    },
    {
      title:       'Hackathon 36 — Open Innovation Track',
      description: '36-hour hackathon with tracks in AI/ML, Cybersecurity, and Open Innovation. Teams of 2-4. Prizes worth ₹50,000.',
      venue:       'Innovation Hub, Ground Floor',
      event_date:  '2024-10-05',
      event_time:  '09:00:00',
      capacity:    200,
      price:       99.00,
      banner_url:  'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80'
    },
    {
      title:       'DevTalk: Cloud & Containers 101',
      description: 'An evening talk series covering Docker, Kubernetes fundamentals, and how companies use them day-to-day. Q&A session included.',
      venue:       'Seminar Hall 3',
      event_date:  '2024-09-28',
      event_time:  '17:30:00',
      capacity:    80,
      price:       0.00,
      banner_url:  'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&q=80'
    },
    {
      title:       'Cybersecurity CTF Challenge',
      description: 'Capture The Flag competition with 30+ challenges across web exploitation, reverse engineering, forensics, and cryptography.',
      venue:       'Computer Centre, Room 101',
      event_date:  '2024-10-12',
      event_time:  '11:00:00',
      capacity:    60,
      price:       49.00,
      banner_url:  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80'
    }
  ];

  for (const ev of events) {
    await db.query(
      `INSERT IGNORE INTO events
         (title, description, venue, event_date, event_time, capacity, price, banner_url, organizer_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [ev.title, ev.description, ev.venue, ev.event_date, ev.event_time, ev.capacity, ev.price, ev.banner_url, org.id]
    );
  }

  await db.end();

  console.log('Seed complete!\n');
  console.log('Test accounts:');
  console.log('  Organizer  →  admin@eventhub.com  /  organizer123');
  console.log('  Student    →  aisha@student.edu   /  student123');
  console.log('  Student    →  rohan@student.edu   /  student123');
}

seed().catch(err => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
