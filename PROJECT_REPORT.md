# Project Report: Event Booking System
**Course / Capstone Project 2024**
**Student:** Kushagra Tomar
**Program:** B.Tech CSE (SkillOrbit Internship)

---

## 1. Introduction
### 1.1 Objective
The objective of this project is to develop a comprehensive, full-stack Event Booking System that facilitates the discovery, management, and booking of campus events, workshops, and seminars. The platform serves two primary user roles: **Students (Users)**, who browse and reserve tickets, and **Organizers (Admins)**, who create events and track attendance through an analytics dashboard.

### 1.2 Scope Limitations
To ensure a clean, maintainable, and highly functional core platform, the system was scoped to exclude third-party payment gateway integrations (transactions are simulated), multi-vendor complexities, and advanced cloud-native architectures. The focus was strictly placed on robust database transactions, secure authentication, and a seamless User Interface (UI).

---

## 2. Technology Stack
The project was developed using a modern, lightweight web stack to ensure fast execution and straightforward deployment:
*   **Frontend:** HTML5, CSS3 (Vanilla, custom UI system), Vanilla JavaScript (DOM manipulation, Fetch API).
*   **Backend:** Node.js, Express.js.
*   **Database:** MySQL (Relational structure ensuring data integrity).
*   **Authentication:** JSON Web Tokens (JWT) & bcrypt for password hashing.
*   **File Uploads:** Multer (handling multipart/form-data for event banners).

---

## 3. System Architecture
The application follows a standard Client-Server architecture. The frontend communicates with the backend exclusively via RESTful API endpoints. 

### 3.1 Database Schema (MySQL)
The relational database consists of four core tables:
1.  **users:** Stores credentials, hashed passwords, and roles (`user` or `organizer`).
2.  **events:** Stores event details, capacities, venue information, and banner images. Foreign key links to the `users` table (organizer).
3.  **bookings:** Tracks ticket reservations. Links users to specific events.
4.  **notifications:** A lightweight table for storing in-app alerts when a booking is confirmed or cancelled.

---

## 4. Key Modules & Implementation Details

### 4.1 Module 1: User Authentication
Authentication is entirely stateless. When a user registers, their password is mathematically salted and hashed using `bcrypt` before database insertion. Upon login, the Express server generates a JWT containing the user's ID and Role. The client stores this token in `localStorage` and attaches it as a `Bearer` token to the `Authorization` header of all subsequent secure requests.

### 4.2 Module 2: Event Management (Admin Panel)
Organizers have access to a secure admin dashboard where they can perform CRUD (Create, Read, Update, Delete) operations on events. 
*   **Capacity Safety:** The backend validates capacity updates, actively preventing organizers from lowering an event's capacity below the number of seats already sold.
*   **File Handling:** Banners are processed by `multer` and served statically by Express.

### 4.3 Module 3: Ticket Booking Engine
The booking workflow includes critical backend safeguards to prevent "race conditions" (e.g., two students trying to book the final remaining seat at the exact same millisecond). 
*   **Implementation:** The booking endpoint uses a MySQL Transaction (`BEGIN`, `COMMIT`, `ROLLBACK`) combined with a `SELECT ... FOR UPDATE` row-level lock. This guarantees atomicity and prevents overselling tickets.
*   **UI Integration:** The frontend dynamically calculates total prices based on seat count selection without requiring page reloads.

### 4.4 Module 4: Dashboard & Analytics
The application provides customized dashboard views based on the JWT role:
*   **Student Dashboard:** Displays upcoming, past, and cancelled bookings. Filtering is handled client-side via JavaScript array manipulation to reduce server load.
*   **Organizer Dashboard:** Features a custom CSS-only proportional bar chart displaying the top events by booking volume, alongside aggregate statistics (Total Revenue, Total Bookings).

### 4.5 Module 5: Notifications & Reports
*   **In-App Alerts:** A universal bell widget dynamically injects into the navigation bar, alerting users to successful bookings. The notification dispatch logic operates in a "fire-and-forget" `.catch()` block on the server, ensuring that a notification failure never breaks the core booking transaction.
*   **Data Export:** Organizers can view detailed attendee lists per event and export the data directly to a `.csv` file using a client-side JavaScript `Blob` generator.

---

## 5. UI / UX Design Philosophy
The frontend avoids generic "AI SaaS" templates (e.g., heavy glassmorphism, gradient sweeps). Instead, it utilizes a strictly functional, high-contrast aesthetic (Warm Red `#c0392b` and Near-Black `#1e1b18`). 
*   Interactive elements feature subtle hover states.
*   The Live Search feature uses client-side DOM filtering for instant feedback.
*   Visual hierarchy is established through strong typography rather than excessive bordering or shadow effects.

---

## 6. Conclusion
The Event Booking System successfully fulfills all capstone requirements. It demonstrates practical knowledge of full-stack web development, secure REST API design, transactional database management, and responsive frontend implementation. The resulting platform is scalable, inspectable, and production-ready.
