# Event Booking System - PPT Outline

*You can copy and paste this text directly into your PowerPoint slides. Keep the text on the slides short, and use the "Speaker Notes" for what you actually want to say during the presentation.*

---

## Slide 1: Title Slide
**Title:** Event Booking System  
**Subtitle:** SkillOrbit Capstone Project 2024  
**Presented by:** Kushagra Tomar (B.Tech CSE, 2nd Year)  

---

## Slide 2: Objective
**Heading: Why I Built This**
*   **The Goal:** To create a centralized web platform for college students to discover and book campus events.
*   **The Audience:** 
    *   *Students:* Need an easy way to see events and reserve seats.
    *   *Organizers:* Need a dashboard to manage events and track attendance.
*   **Focus Area:** Building a secure, functional backend booking system rather than just a flashy UI.

---

## Slide 3: Tech Stack
**Heading: Tools & Technologies**
*   **Frontend:** HTML5, CSS3, Vanilla JavaScript (No React/frameworks, proving raw DOM skills).
*   **Backend:** Node.js, Express.js.
*   **Database:** MySQL.
*   **Authentication:** JWT (JSON Web Tokens) + bcrypt for password security.

---

## Slide 4: Key Features
**Heading: What the App Can Do**
*   **Role-Based Login:** Separate dashboards for Students and Organizers.
*   **Live Search:** Instantly filter events on the homepage without reloading.
*   **Safe Booking:** The system prevents organizers from shrinking capacity below sold tickets.
*   **Data Export:** Organizers can download an Excel/CSV file of all attendees with one click.
*   **In-App Alerts:** A notification bell confirms your booking status instantly.

---

## Slide 5: Database Architecture
**Heading: How the Data is Stored**
*(Tip: Add a screenshot of your 4 tables here or a simple flowchart)*
*   **Users Table:** Stores credentials and roles.
*   **Events Table:** Stores event details and links to the Organizer who created it.
*   **Bookings Table:** The bridge table linking a Student to an Event.
*   **Notifications Table:** Stores the alert messages.

---

## Slide 6: Biggest Challenge & Solution
**Heading: Solving the "Double-Booking" Problem**
*   **The Problem:** What if two students try to book the exact same, final seat at the same millisecond?
*   **The Solution:** I used a MySQL Transaction with a `SELECT ... FOR UPDATE` lock. 
*   **How it Works:** It forces the database to pause and queue the second booking request, ensuring nobody accidentally gets a ticket for a seat that doesn't exist.

---

## Slide 7: Live Demo
**Heading: System Demonstration**
*(Tip: Just put a nice screenshot of the homepage here, and switch to your browser or play your video to show it working!)*
*   Show logging in.
*   Show booking a ticket.
*   Show the organizer downloading the CSV report.

---

## Slide 8: Future Enhancements
**Heading: What I Would Add Next**
*   **Payment Gateway Integration:** Upgrading the simulated payment button to use a real API like Razorpay.
*   **Email Notifications:** Sending booking confirmation emails using Nodemailer instead of just in-app alerts.
*   **QR Code Scanner:** Allowing organizers to actually scan the tickets at the door using a phone camera.

---

## Slide 9: Q&A
**Heading: Thank You!**
*   Questions?
