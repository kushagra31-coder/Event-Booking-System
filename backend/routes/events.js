const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/eventController');
const { verifyToken, requireOrganizer } = require('../middleware/auth');
const upload = require('../middleware/upload');

// public routes
router.get('/', ctrl.getAllEvents);
router.get('/my', verifyToken, requireOrganizer, ctrl.getMyEvents);  // must come before /:id
router.get('/:id', ctrl.getEventById);

// organizer-only routes
router.post('/',     verifyToken, requireOrganizer, upload.single('banner'), ctrl.createEvent);
router.put('/:id',   verifyToken, requireOrganizer, upload.single('banner'), ctrl.updateEvent);
router.delete('/:id', verifyToken, requireOrganizer, ctrl.deleteEvent);

module.exports = router;
