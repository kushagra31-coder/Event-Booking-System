const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/bookingController');
const { verifyToken } = require('../middleware/auth');

// all booking routes require a logged-in user
router.use(verifyToken);

router.get('/',           ctrl.getUserBookings);
router.get('/:id',        ctrl.getBookingById);
router.post('/event/:eventId', ctrl.createBooking);
router.patch('/:id/cancel',   ctrl.cancelBooking);

module.exports = router;
