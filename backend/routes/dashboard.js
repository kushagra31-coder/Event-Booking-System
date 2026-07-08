const express = require('express');
const router  = express.Router();
const { getUserStats, getAdminStats } = require('../controllers/dashboardController');
const { verifyToken, requireOrganizer } = require('../middleware/auth');

router.get('/user',  verifyToken,                        getUserStats);
router.get('/admin', verifyToken, requireOrganizer,      getAdminStats);

module.exports = router;
