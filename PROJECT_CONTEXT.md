# Project Context: Event Booking System (SkillOrbit Capstone)

## Who this is for
Kushagra, second-year B.Tech CSE student, building this as an internship capstone deliverable. Also active in cybersecurity + full-stack Java work, but this specific project uses Node/Express, not JSP. Comfortable with Git, VS Code, MySQL basics. Prefers concise communication and one-file-at-a-time delivery — don't dump entire codebases in a single response.

## Project overview
A web-based Event Booking System. Users discover and book event tickets; organizers/admins create and manage events; the system tracks bookings and shows analytics. This mirrors real-world platforms like ticketing sites or college fest management systems.

## Tech stack (fixed — do not substitute)
- **Frontend:** HTML, CSS, vanilla JavaScript. Bootstrap is fine for grid/utility only — not for full component styling.
- **Backend:** Node.js + Express.js
- **Database:** MySQL
- **Deployment target:** Render or Vercel (backend), doesn't need to be live during dev
- **Auth:** Simple session-based or JWT — build fresh, do not over-engineer. No OAuth, no third-party auth providers.

## Required modules (build in this order)

### 1. User Authentication
- Register (name, email, password, role: user/organizer)
- Login / logout
- Password validation + hashing (bcrypt)
- Session management

### 2. Event Management (admin/organizer)
- Create, edit, delete events
- Upload event banner/image
- Set date, time, venue, ticket capacity

### 3. Ticket Booking (user)
- Browse/view available events
- Select seat count
- Book ticket
- Receive booking confirmation

### 4. Dashboard & Analytics
- User: upcoming events, booking history
- Admin: event stats, total bookings, user activity

### 5. Notifications & Reports
- Booking confirmation display
- Event/registration summary reports
- Email notifications: optional, skip unless asked

## Explicit scope limits — do NOT build
- No real payment gateway (mock/fake "Pay & Confirm" button is fine)
- No multi-vendor or multi-tenant architecture
- No large-scale cloud infra (no microservices, no Kubernetes, no message queues)
- Keep it a single admin role + single user role, single database

## Evaluation weighting (for priority when time-constrained)
Functionality 30% > Backend/DB 25% > Frontend/UI 20% > Booking Workflow 10% ≈ Deployment 10% > Documentation 5%. If something has to be cut for time, cut UI polish before cutting backend correctness.

---

## Anti-AI-Pattern Rules (critical — read carefully)

The goal is a project that looks and reads like it was built by a student, not generated wholesale by an LLM. This applies to both visual design and code style.

### Visual / design rules
1. **No purple-to-blue gradient defaults.** If gradients are used, they must come from an intentional 2-color palette I specify per page, not a generic violet→indigo→blue sweep.
2. **No uniform glassmorphism everywhere.** Use frosted/blur cards selectively (e.g. hero section, stat cards) — regular pages should use flat cards or simple borders, not the same `.glass-card` class pasted on every element.
3. **No floating/bouncing/pulsing icons without purpose.** Animation must serve a specific function (loading state, success confirmation, count-up stat) — never decorative idle motion.
4. **No emoji as icons.** Use a proper icon set (Lucide, Feather, or Font Awesome) if icons are needed, and use it sparingly.
5. **Avoid uniform border-radius everywhere.** Vary radius intentionally between component types (e.g. buttons vs cards vs inputs) rather than 8px/12px on literally everything.
6. **Avoid perfectly centered, evenly-split layouts by default.** Real UIs have asymmetry — e.g. a dashboard with a wider main panel and a narrower sidebar, not a 50/50 grid everywhere.
7. **Typography: pick one display font + one body font, and use size/weight contrast deliberately** — not just different colors for hierarchy.
8. **No generic stock "AI SaaS" hero pattern** (giant centered gradient headline + subtext + two pill buttons + abstract blob graphic). Keep the landing/events page more information-dense and utilitarian, matching what an actual college-project booking site would look like.

### Code style rules
1. **Comments should be sparse and functional**, explaining *why*, not *what* — not a comment above every single line restating the obvious.
2. **Don't wrap every operation in identical try/catch + console.log("Error: " + e) boilerplate.** Vary error handling slightly between files — some functions can let errors bubble up, some can have specific messages, matching how a student's code evolves over a project rather than being generated in one pass.
3. **Function/variable naming should be reasonably consistent but not robotically uniform** — avoid naming everything `handleX`, `fetchX`, `processX` in a rigid pattern across the entire codebase.
4. **Avoid excessive defensive programming** (null-checking every possible edge case on every input) unless the input is genuinely user-facing and risky (e.g. auth forms). A student project doesn't need production-grade hardening everywhere.
5. **File structure should be reasonably organized but doesn't need to be a textbook enterprise folder structure** (no need for repository/service/DTO layering for a project this size — routes + controllers + models is enough).
6. **It's fine — even good — to leave small TODOs or slightly rough edges** in less-critical parts (e.g. `// TODO: add email later` on the optional notification feature) rather than making everything appear fully finished and polished.

### General principle
When in doubt, choose the more specific, slightly imperfect, context-appropriate option over the generic "safe" AI default. A slightly quirky but clearly intentional design choice reads as human; a smooth, symmetric, fully-optimized default reads as generated.

---

## Deliverables required at the end
- Source code (organized repo)
- Project report (can be drafted separately, not code)
- PPT presentation (drafted separately)
- GitHub repository
- Deployment link
- Demo video (recorded separately, not part of Antigravity's job)
- Database schema (SQL file, part of Antigravity's job)

## 25-day reference timeline (for pacing, not enforcement)
Days 1-3 planning, 4-7 auth, 8-12 event management, 13-17 booking, 18-21 dashboard, 22-23 notifications/testing, 24 bug fixing, 25 deployment + presentation.
