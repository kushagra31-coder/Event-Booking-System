require('dotenv').config({ path: './backend/.env' });
const mysql = require('mysql2/promise');

async function setup() {
  console.log('Connecting to remote database...');
  const db = await mysql.createConnection({
    host:     process.env.DB_HOST,
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true // allow running the whole schema at once
  });

  const schema = `
    CREATE TABLE IF NOT EXISTS users (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        name        VARCHAR(100)    NOT NULL,
        email       VARCHAR(150)    NOT NULL UNIQUE,
        password    VARCHAR(255)    NOT NULL,
        role        ENUM('user','organizer') NOT NULL DEFAULT 'user',
        created_at  TIMESTAMP       DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS events (
        id              INT AUTO_INCREMENT PRIMARY KEY,
        title           VARCHAR(200)    NOT NULL,
        description     TEXT,
        venue           VARCHAR(200)    NOT NULL,
        event_date      DATE            NOT NULL,
        event_time      TIME            NOT NULL,
        capacity        INT             NOT NULL,
        tickets_booked  INT             NOT NULL DEFAULT 0,
        price           DECIMAL(8,2)    NOT NULL DEFAULT 0.00,
        banner_url      VARCHAR(300),
        organizer_id    INT             NOT NULL,
        status          ENUM('upcoming','ongoing','cancelled','past') DEFAULT 'upcoming',
        created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS bookings (
        id              INT AUTO_INCREMENT PRIMARY KEY,
        user_id         INT             NOT NULL,
        event_id        INT             NOT NULL,
        seats           INT             NOT NULL DEFAULT 1,
        total_amount    DECIMAL(8,2)    NOT NULL DEFAULT 0.00,
        status          ENUM('confirmed','cancelled') DEFAULT 'confirmed',
        booked_at       TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id)  REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS notifications (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        user_id     INT             NOT NULL,
        message     TEXT            NOT NULL,
        is_read     TINYINT(1)      DEFAULT 0,
        created_at  TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `;

  console.log('Creating tables...');
  await db.query(schema);
  console.log('Tables created successfully!');
  
  await db.end();

  console.log('Starting seed process...');
  // Require and run the seed script to populate data
  require('./seed.js');
}

setup().catch(err => {
  console.error('Failed to setup remote database:', err);
  process.exit(1);
});
