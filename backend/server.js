const express = require('express');
const path = require('path');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Security: Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window`
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per `window` for auth
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts, please try again after 15 minutes.' }
});

// Apply general rate limiting to all requests
app.use(generalLimiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// serve uploaded event banners
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// serve the frontend (HTML/CSS/JS)
app.use(express.static(path.join(__dirname, '../frontend')));

// api routes — more will be mounted here as modules are added
app.use('/api/auth',          authLimiter, require('./routes/auth'));
app.use('/api/events',        require('./routes/events'));
app.use('/api/bookings',      require('./routes/bookings'));
app.use('/api/dashboard',     require('./routes/dashboard'));
app.use('/api/notifications', require('./routes/notifications'));

// global error handler (hides stack traces from users)
app.use((err, req, res, next) => {
  if (err.message && err.message.includes('Only JPG')) {
    return res.status(400).json({ error: err.message });
  }
  // log the real error server-side for debugging
  console.error('[Server Error]', err);
  // return a generic, safe error message to the client
  res.status(500).json({ error: 'Internal server error' });
});

// catch-all: anything that's not an API route gets the frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
