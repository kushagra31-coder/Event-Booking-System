# EventHub — Event Booking System

A full-stack web application for discovering, booking, and managing campus events. Built as an internship capstone project for SkillOrbit.

**Live demo:** _link after deployment_

---

## Tech Stack

| Layer    | Technology |
|----------|-----------|
| Backend  | Node.js + Express |
| Database | MySQL |
| Frontend | HTML + CSS + Vanilla JS |
| Auth     | JWT (stored in localStorage) |
| Deploy   | Railway (app + DB) |

---

## Project Structure

```
event-booking/
├── backend/
│   ├── controllers/       # Business logic per module
│   ├── middleware/         # JWT auth + Multer upload
│   ├── routes/            # Express route definitions
│   ├── db.js              # MySQL connection pool
│   ├── server.js          # Entry point
│   └── .env.example
├── database/
│   ├── schema.sql         # Table definitions (run first)
│   └── seed.js            # Sample data script
├── frontend/
│   ├── css/               # Stylesheets per module
│   ├── js/                # Vanilla JS per page
│   └── *.html             # Pages
└── README.md
```

---

## Modules Built

| # | Module | Pages |
|---|--------|-------|
| 1 | **Auth** | login.html, register.html |
| 2 | **Event Management** | admin.html (organizer CRUD + analytics) |
| 3 | **Ticket Booking** | index.html, event-detail.html, booking-confirm.html |
| 4 | **Dashboard** | dashboard.html (user), analytics section on admin |
| 5 | **Notifications & Reports** | Bell widget (all pages), report.html |

---

## Local Setup

### Prerequisites
- Node.js ≥ 18
- MySQL ≥ 8

### 1. Clone the repo

```bash
git clone https://github.com/kushagra31-coder/Event-Booking-System.git
cd Event-Booking-System
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env
# Open .env and fill in your MySQL credentials and a JWT secret
```

### 4. Create database and run schema

```bash
mysql -u root -p
```
```sql
source database/schema.sql
```
Or pipe it directly:
```bash
mysql -u root -p < database/schema.sql
```

### 5. Seed sample data (optional but recommended)

```bash
# From the project root
node database/seed.js
```

This creates:
- **Organizer:** `admin@eventhub.com` / `organizer123`
- **Student:** `aisha@student.edu` / `student123`

### 6. Start the server

```bash
cd backend
npm run dev     # uses nodemon (auto-restart on changes)
# or
npm start       # plain node
```

Open **http://localhost:3000** in your browser.

---

## API Routes

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register` | — | Register new account |
| POST | `/api/auth/login` | — | Login, returns JWT |
| GET | `/api/auth/me` | ✓ | Current user info |
| GET | `/api/events` | — | List all events (search + filter) |
| GET | `/api/events/:id` | — | Single event detail |
| GET | `/api/events/my` | Organizer | Organizer's own events |
| POST | `/api/events` | Organizer | Create event (multipart) |
| PUT | `/api/events/:id` | Organizer | Update event |
| DELETE | `/api/events/:id` | Organizer | Delete event |
| GET | `/api/bookings` | User | User's booking history |
| GET | `/api/bookings/:id` | User | Single booking |
| POST | `/api/bookings/event/:eventId` | User | Book seats (transactional) |
| PATCH | `/api/bookings/:id/cancel` | User | Cancel booking |
| GET | `/api/dashboard/user` | User | User stats |
| GET | `/api/dashboard/admin` | Organizer | Analytics + recent bookings |
| GET | `/api/notifications` | ✓ | User's notifications |
| GET | `/api/notifications/unread` | ✓ | Unread count |
| PATCH | `/api/notifications/read-all` | ✓ | Mark all read |
| GET | `/api/notifications/report/:eventId` | Organizer | Event booking report |

---

## Deployment (Railway)

Railway runs both the Node.js app and MySQL in one project — easiest option for this stack.

### Step 1: Create a Railway project

1. Go to [railway.app](https://railway.app) → **New Project**
2. Select **Deploy from GitHub repo** → pick `Event-Booking-System`
3. Set **Root Directory** to `backend`
4. Railway will auto-detect Node.js

### Step 2: Add a MySQL service

1. In your Railway project → **+ New** → **Database** → **MySQL**
2. Click the MySQL service → **Variables** tab → copy the values:
   - `MYSQL_HOST`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQLPASSWORD`, `MYSQL_DATABASE`

### Step 3: Set environment variables on the web service

Go to your web service → **Variables** → add:

```
DB_HOST      = (from MySQL service MYSQL_HOST)
DB_USER      = (from MySQL service MYSQL_USER)
DB_PASSWORD  = (from MySQL service MYSQL_PASSWORD)
DB_NAME      = (from MySQL service MYSQL_DATABASE)
JWT_SECRET   = (any long random string — generate one at random.org)
PORT         = 3000
```

### Step 4: Run the schema

In Railway → MySQL service → **Query** tab (or connect via a DB client):

```sql
-- paste the contents of database/schema.sql
```

### Step 5: Deploy

Railway auto-deploys on every push to `master`. Your app will be live at the URL shown in the Railway dashboard.

> **Note on file uploads:** Railway's free tier uses ephemeral storage — uploaded banner images reset on each deploy. For a persistent demo, either skip banner uploads or upgrade to a paid tier with a volume. All other functionality (auth, events, bookings, dashboard) works fine.

---

## Known Limitations

- No real payment processing — the "Pay & Confirm" button is a mock
- Banner images don't persist on free-tier Railway (ephemeral disk)
- Email notifications are not implemented (in-app only)
- Single admin role — no multi-organizer permission system

---

## Author

Kushagra Tomar · B.Tech CSE · SkillOrbit Capstone 2024
