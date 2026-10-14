const express = require('express');
const router = express.Router();
const {
  getMaintenanceRecords,
  createMaintenanceRecord,
  updateMaintenanceRecord,
} = require('../controllers/maintenanceController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);
router.use(authorize('admin', 'manager'));

router.route('/')
  .get(getMaintenanceRecords)
  .post(createMaintenanceRecord);

router.route('/:id')
  .put(updateMaintenanceRecord);

module.exports = router;
