const express = require('express');
const router = express.Router();
const {
  getInvoices,
  getInvoiceById,
  updatePaymentStatus,
  downloadInvoicePDF,
} = require('../controllers/invoiceController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.route('/')
  .get(getInvoices);

router.route('/:id')
  .get(getInvoiceById);

router.patch('/:id/payment', authorize('admin', 'manager'), updatePaymentStatus);
router.get('/:id/pdf', downloadInvoicePDF);

module.exports = router;
