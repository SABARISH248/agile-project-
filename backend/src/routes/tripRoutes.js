const express = require('express');
const router = express.Router();
const {
  createTrip,
  getTrips,
  getTripById,
  updateTripStatus,
  updateTripLocation,
  uploadProofOfDelivery,
} = require('../controllers/tripController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(protect);

router.route('/')
  .get(getTrips)
  .post(authorize('admin', 'manager'), createTrip);

router.route('/:id')
  .get(getTripById);

router.patch('/:id/status', updateTripStatus);
router.patch('/:id/location', updateTripLocation);
router.post('/:id/proof', upload.single('podFile'), uploadProofOfDelivery);

module.exports = router;
