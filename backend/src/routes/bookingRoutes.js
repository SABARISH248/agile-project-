const express = require('express');
const router = express.Router();
const {
  estimateCost,
  createBooking,
  getBookings,
  getBookingById,
  updateBooking,
  cancelBooking,
} = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.post('/estimate-cost', estimateCost);

router.route('/')
  .get(getBookings)
  .post(authorize('admin', 'manager'), createBooking);

router.route('/:id')
  .get(getBookingById)
  .put(authorize('admin', 'manager'), updateBooking);

router.patch('/:id/cancel', authorize('admin', 'manager'), cancelBooking);

module.exports = router;
