const express = require('express');
const router = express.Router();
const {
  getExpenses,
  createExpense,
  updateExpenseStatus,
  deleteExpense,
} = require('../controllers/expenseController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(protect);

router.route('/')
  .get(getExpenses)
  .post(upload.single('receipt'), createExpense);

router.patch('/:id/status', authorize('admin', 'manager'), updateExpenseStatus);
router.delete('/:id', authorize('admin', 'manager'), deleteExpense);

module.exports = router;
