const express = require('express');
const router = express.Router();
const {
  getVehicles,
  getAvailableVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} = require('../controllers/vehicleController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/available', authorize('admin', 'manager'), getAvailableVehicles);

router.route('/')
  .get(getVehicles)
  .post(authorize('admin', 'manager'), createVehicle);

router.route('/:id')
  .get(getVehicleById)
  .put(authorize('admin', 'manager'), updateVehicle)
  .delete(authorize('admin'), deleteVehicle);

module.exports = router;
