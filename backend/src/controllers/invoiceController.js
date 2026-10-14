const Invoice = require('../models/Invoice');
const Booking = require('../models/Booking');
const { generateInvoicePDF } = require('../utils/pdfInvoice');

// @desc    Get all invoices with filtering & search
// @route   GET /api/invoices
// @access  Private (Admin, Manager)
const getInvoices = async (req, res, next) => {
  try {
    const { paymentStatus, search, page = 1, limit = 50 } = req.query;
    const query = {};

    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (search) {
      query.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { 'customer.name': { $regex: search, $options: 'i' } },
        { 'customer.companyName': { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Invoice.countDocuments(query);
    const invoices = await Invoice.find(query)
      .populate('booking')
      .populate('trip', 'tripNumber status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: invoices,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single invoice details
// @route   GET /api/invoices/:id
// @access  Private
const getInvoiceById = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('booking')
      .populate('trip');

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    res.json({ success: true, data: invoice });
  } catch (err) {
    next(err);
  }
};

// @desc    Update invoice payment status
// @route   PATCH /api/invoices/:id/payment
// @access  Private (Admin, Manager)
const updatePaymentStatus = async (req, res, next) => {
  try {
    const { paymentStatus, paidAmount, paymentMethod, paymentReference } = req.body;
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    if (paidAmount !== undefined) {
      invoice.paidAmount = Number(paidAmount);
      invoice.balanceDue = Math.max(0, invoice.totalAmount - invoice.paidAmount);
    }

    if (paymentStatus) invoice.paymentStatus = paymentStatus;
    if (paymentMethod) invoice.paymentMethod = paymentMethod;
    if (paymentReference) invoice.paymentReference = paymentReference;

    if (invoice.paymentStatus === 'paid' || invoice.balanceDue === 0) {
      invoice.paymentStatus = 'paid';
      invoice.paidAt = new Date();
    } else if (invoice.paidAmount > 0) {
      invoice.paymentStatus = 'partial';
    }

    await invoice.save();

    res.json({
      success: true,
      message: 'Invoice payment status updated successfully',
      data: invoice,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Download generated Invoice PDF
// @route   GET /api/invoices/:id/pdf
// @access  Private
const downloadInvoicePDF = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('booking')
      .populate('trip');

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    const pdfBuffer = await generateInvoicePDF(invoice);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${invoice.invoiceNumber}.pdf`
    );
    res.send(pdfBuffer);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getInvoices,
  getInvoiceById,
  updatePaymentStatus,
  downloadInvoicePDF,
};
