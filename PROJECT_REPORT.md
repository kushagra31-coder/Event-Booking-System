# Internship Project Report: Event Booking System
**Submitted by:** Kushagra Tomar (B.Tech CSIT)
**Organization:** Skill Orbit
**Year:** 2026

**Project Links:**
* **Live Deployment:** [https://event-booking-system-3h1n.onrender.com](https://event-booking-system-3h1n.onrender.com)
* **GitHub Repository:** [https://github.com/kushagra31-coder/Event-Booking-System](https://github.com/kushagra31-coder/Event-Booking-System)

---

## 1. Introduction
For my Skill Orbit capstone project, I built a web-based Event Booking System. The main goal was to create a platform where students can find and book college events (like fests or hackathons), and organizers can manage those events and track who is coming.

I wanted to focus on getting the core functionality right rather than adding too many confusing features. Because of the time limit, I skipped integrating a real payment gateway (like Razor pay) and instead built a simulated "Pay & Confirm" button. My main priority was making sure the database and booking logic worked perfectly without breaking.

## 2. Technology Stack
I decided to use a standard Node.js stack because it's lightweight and good for full-stack projects:
* **Frontend:** HTML, CSS, and plain JavaScript. I didn't use React or big CSS frameworks because I wanted to keep the code simple and prove I can manipulate the DOM manually.
* **Backend:** Node.js with Express.js.
* **Database:** MySQL.
* **Authentication:** JWT (JSON Web Tokens) stored in local storage, plus bcrypt to encrypt passwords before saving them.

## 3. Database Design
I kept the MySQL database relational and straightforward. It has four main tables:
* **users:** Stores the user's name, email, hashed password, and whether they are a 'student' or an 'organizer'.
* **events:** Stores event info (time, venue, capacity). It links back to the user table so we know which organizer created it.
* **bookings:** Tracks who booked what. It links the user ID to the event ID.
* **notifications:** A simple table to store alert messages for the user.

## 4. How the Modules Work

### Authentication
When a user signs up, I use bcrypt to hash their password so it isn't stored in plain text. When they log in, the server creates a JWT. The frontend saves this token and sends it back to the server in the HTTP headers whenever the user tries to do something secure, like booking a ticket.

### Event Management (Admin)
Organizers have a dashboard where they can create or delete events. They can also upload event banner images using a library called multer. One issue I ran into early on was that an organizer could accidentally lower an event's capacity to less than the number of tickets already sold. I wrote a backend check to prevent this from happening.

### Ticket Booking
This was the hardest part of the project. If two students try to book the last available ticket at the exact same time, the system might accidentally sell it to both of them. To fix this, I used a MySQL Transaction with a SELECT ... FOR UPDATE lock. This basically forces the database to put the second person in a queue for a millisecond to check if the seat is still actually available before confirming the booking.

### Dashboard & CSV Export
Instead of making the server do all the work, I wrote JavaScript on the frontend to filter the user's bookings (Upcoming vs Past) instantly without reloading the page. For the organizers, I added a feature on the event report page where they can click a button to download the attendee list as a .csv file. I used JavaScript Blob for this so it generates right in the browser.

## 5. Design Choices
A lot of modern websites use heavy gradients and glass effects, but I wanted this to look like a practical, functional campus tool. I stuck to a simple red and dark-grey colour scheme. I also added a live search bar on the homepage so users can type and instantly filter the events, which makes the site feel a lot faster.

## 6. Conclusion
Building this project taught me a lot about how the frontend and backend actually communicate. Managing the database locks for the booking system was tricky, but getting it to work was really rewarding. The final system meets all the capstone requirements and is fully functional.
