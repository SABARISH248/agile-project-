const Expense = require('../models/Expense');
const Trip = require('../models/Trip');
const Driver = require('../models/Driver');
const Notification = require('../models/Notification');
const { emitToRole, emitToUser } = require('../config/socket');

// @desc    Get all expenses
// @route   GET /api/expenses
// @access  Private
const getExpenses = async (req, res, next) => {
  try {
    const { status, category, tripId, page = 1, limit = 50 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (category) query.category = category;
    if (tripId) query.trip = tripId;

    // If driver, only show their own logged expenses
    if (req.user.role === 'driver') {
      const driverRecord = await Driver.findOne({ user: req.user._id });
      if (driverRecord) {
        query.driver = driverRecord._id;
      }
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Expense.countDocuments(query);
    const expenses = await Expense.find(query)
      .populate('trip', 'tripNumber status')
      .populate({ path: 'driver', populate: { path: 'user', select: 'name email phone avatar' } })
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: expenses,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new expense (by driver or manager)
// @route   POST /api/expenses
// @access  Private (Driver, Manager, Admin)
const createExpense = async (req, res, next) => {
  try {
    const { tripId, category, amount, description, fuelDetails } = req.body;

    const trip = await Trip.findById(tripId).populate('driver');
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    let driverId;
    if (req.user.role === 'driver') {
      const driverRecord = await Driver.findOne({ user: req.user._id });
      if (!driverRecord) {
        return res.status(404).json({ success: false, message: 'Driver profile not found' });
      }
      driverId = driverRecord._id;
    } else {
      driverId = trip.driver._id;
    }

    let receiptUrl = '';
    if (req.file) {
      receiptUrl = `/uploads/${req.file.filename}`;
    }

    // Auto-approve if manager/admin creates it, pending if driver creates it
    const isAutoApproved = ['admin', 'manager'].includes(req.user.role);

    const expense = await Expense.create({
      trip: trip._id,
      driver: driverId,
      category,
      amount: Number(amount),
      description: description || '',
      receiptUrl,
      fuelDetails: fuelDetails ? JSON.parse(fuelDetails) : {},
      status: isAutoApproved ? 'approved' : 'pending',
      approvedBy: isAutoApproved ? req.user._id : null,
      expenseDate: new Date(),
    });

    if (isAutoApproved) {
      await Trip.findByIdAndUpdate(trip._id, {
        $inc: { totalExpenses: Number(amount) },
      });
    } else {
      // Notify managers about pending expense
      const notif = await Notification.create({
        role: 'manager',
        title: 'New Trip Expense Submitted',
        message: `Driver submitted ${category} expense of $${Number(amount).toFixed(2)} on trip ${trip.tripNumber}.`,
        type: 'expense',
        link: '/expenses',
      });
      emitToRole('manager', 'notification', notif);
    }

    const populated = await Expense.findById(expense._id)
      .populate('trip', 'tripNumber status')
      .populate({ path: 'driver', populate: { path: 'user', select: 'name email phone avatar' } });

    res.status(201).json({
      success: true,
      message: 'Expense recorded successfully',
      data: populated,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Approve or reject expense
// @route   PATCH /api/expenses/:id/status
// @access  Private (Admin, Manager)
const updateExpenseStatus = async (req, res, next) => {
  try {
    const { status, rejectionReason } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be approved or rejected' });
    }

    const expense = await Expense.findById(req.params.id).populate('driver');
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    const previousStatus = expense.status;
    expense.status = status;
    expense.approvedBy = req.user._id;
    if (rejectionReason) expense.rejectionReason = rejectionReason;

    await expense.save();

    // Adjust trip total expenses
    if (status === 'approved' && previousStatus !== 'approved') {
      await Trip.findByIdAndUpdate(expense.trip, {
        $inc: { totalExpenses: expense.amount },
      });
    } else if (status === 'rejected' && previousStatus === 'approved') {
      await Trip.findByIdAndUpdate(expense.trip, {
        $inc: { totalExpenses: -expense.amount },
      });
    }

    // Notify driver
    if (expense.driver?.user) {
      const notif = await Notification.create({
        recipient: expense.driver.user,
        role: 'driver',
        title: `Expense ${status.toUpperCase()}`,
        message: `Your ${expense.category} expense of $${expense.amount.toFixed(2)} has been ${status}.`,
        type: 'expense',
        link: '/driver-dashboard',
      });
      emitToUser(expense.driver.user.toString(), 'notification', notif);
    }

    res.json({
      success: true,
      message: `Expense ${status} successfully`,
      data: expense,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private (Admin, Manager)
const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    if (expense.status === 'approved') {
      await Trip.findByIdAndUpdate(expense.trip, {
        $inc: { totalExpenses: -expense.amount },
      });
    }

    await Expense.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Expense deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getExpenses,
  createExpense,
  updateExpenseStatus,
  deleteExpense,
};
