# EventHub — Event Booking System

A full-stack web application for discovering, booking, and managing campus events. Built as an internship capstone project for Skill Orbit.

**Live Demo:** [https://event-booking-system-3h1n.onrender.com](https://event-booking-system-3h1n.onrender.com)

---

## Tech Stack

| Layer    | Technology |
|----------|-----------|
| Backend  | Node.js + Express.js |
| Database | MySQL |
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Auth     | JWT (JSON Web Tokens) stored in localStorage |
| Deploy   | Render (Backend/Frontend) + FreeSQLDatabase (MySQL) |

---

## Project Structure

```
event-booking/
├── backend/
│   ├── controllers/       # Business logic per module
│   ├── middleware/        # JWT auth + Multer upload
│   ├── routes/            # Express route definitions
│   ├── db.js              # MySQL connection pool
│   ├── server.js          # Entry point (serves frontend & API)
│   └── .env.example
├── database/
│   ├── schema.sql         # Table definitions
│   ├── seed.js            # Local sample data script
│   └── setup-remote.js    # Remote DB initialization script
├── frontend/
│   ├── css/               # Stylesheets per module
│   ├── js/                # Vanilla JS per page
│   └── *.html             # Client-side Pages
└── README.md
```

---

## Key Features

- **Role-Based Access Control:** Separate dashboards and permissions for Students (booking) and Organizers (creation).
- **Concurrency Control:** Utilizes MySQL `SELECT ... FOR UPDATE` transactions to physically prevent "double-booking" of the last available seat.
- **Client-Side Live Search:** Instantly filters event listings on the homepage without reloading the page using DOM manipulation.
- **Data Export:** Organizers can instantly generate and download an Excel-ready `.csv` report of all their attendees using purely frontend JavaScript blobs.
- **Dynamic Capacity Management:** The system checks prevent organizers from shrinking an event's capacity below the number of tickets already sold.

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

### 2. Install dependencies
```bash
cd backend
npm install
```

### 3. Set up environment variables
Create a `.env` file inside the `backend` folder:
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=event_booking
JWT_SECRET=supersecretcapstonekey123
```

### 4. Create database and run schema
```bash
mysql -u root -p < database/schema.sql
```

### 5. Seed sample data
```bash
# From the project root
node database/seed.js
```

### 6. Start the server
```bash
cd backend
npm start
```
Open **http://localhost:3000** in your browser.

---

## Remote Deployment (100% Free)

This project is configured to run for free using **Render** (hosting) and **FreeSQLDatabase** (remote MySQL).

1. Get a free MySQL database from [freesqldatabase.com](https://www.freesqldatabase.com/).
2. Put the credentials they email you into your `backend/.env` file.
3. Run `node database/setup-remote.js` to automatically push all tables and seed data to your new remote database.
4. Go to [Render.com](https://render.com) and create a **Web Service**.
5. Connect your GitHub repository.
6. Set the **Root Directory** to `backend`.
7. Set the **Build Command** to `npm install` and **Start Command** to `npm start`.
8. Add your 4 database environment variables (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`) and `JWT_SECRET` to the Render Environment Variables tab.
9. Deploy! Render will serve both the backend API and the frontend HTML files automatically.

---

## Known Limitations

- No real payment processing — the "Pay & Confirm" button is a mock simulation.
- Email notifications are not implemented (in-app alert table only).
- Uploaded banner images will reset if the free Render server goes to sleep (ephemeral file system).

---

## Author

**Kushagra Tomar**  
B.Tech CSIT · Skill Orbit Capstone 2026
