const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// serve uploaded event banners
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// serve the frontend (HTML/CSS/JS)
app.use(express.static(path.join(__dirname, '../frontend')));

// api routes — more will be mounted here as modules are added
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/events',    require('./routes/events'));
app.use('/api/bookings',  require('./routes/bookings'));
app.use('/api/dashboard', require('./routes/dashboard'));

// multer validation errors come through here; generic fallback below
app.use((err, req, res, next) => {
  if (err.message && err.message.includes('Only JPG')) {
    return res.status(400).json({ error: err.message });
  }
  console.error(err);
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
