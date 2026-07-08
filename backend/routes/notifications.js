const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/notificationController');
const { verifyToken, requireOrganizer } = require('../middleware/auth');

router.use(verifyToken);

router.get('/',           ctrl.getNotifications);
router.get('/unread',     ctrl.getUnreadCount);
router.patch('/read-all', ctrl.markAllRead);

// organizer-only: per-event report
router.get('/report/:eventId', requireOrganizer, ctrl.getEventReport);

module.exports = router;
