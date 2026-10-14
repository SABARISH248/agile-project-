const express = require('express');
const router = express.Router();
const {
  getDrivers,
  getAvailableDrivers,
  getDriverById,
  createDriver,
  updateDriver,
  deleteDriver,
} = require('../controllers/driverController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/available', authorize('admin', 'manager'), getAvailableDrivers);

router.route('/')
  .get(authorize('admin', 'manager'), getDrivers)
  .post(authorize('admin', 'manager'), createDriver);

router.route('/:id')
  .get(getDriverById)
  .put(authorize('admin', 'manager'), updateDriver)
  .delete(authorize('admin'), deleteDriver);

module.exports = router;
