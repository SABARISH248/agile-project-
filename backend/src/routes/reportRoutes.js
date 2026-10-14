const express = require('express');
const router = express.Router();
const { getDashboardAnalytics } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);
router.use(authorize('admin', 'manager'));

router.get('/analytics', getDashboardAnalytics);

module.exports = router;
