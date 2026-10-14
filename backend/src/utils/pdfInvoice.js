const PDFDocument = require('pdfkit');

const generateInvoicePDF = (invoice) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const buffers = [];

      doc.on('data', (data) => buffers.push(data));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      // Primary Brand Header
      doc
        .fillColor('#0f172a')
        .fontSize(24)
        .text('TRACELY LOGISTICS TMS', 50, 45, { bold: true })
        .fontSize(10)
        .fillColor('#64748b')
        .text('Enterprise Freight & Fleet Transport Management', 50, 75)
        .text('contact@tracely.com | +1 (800) 555-TRACELY', 50, 90)
        .text('100 Logistics Boulevard, Suite 500', 50, 105);

      // Status & Invoice Meta Box
      doc
        .fontSize(20)
        .fillColor('#0284c7')
        .text('TAX INVOICE', 350, 45, { align: 'right' })
        .fontSize(10)
        .fillColor('#334155')
        .text(`Invoice #: ${invoice.invoiceNumber}`, 350, 75, { align: 'right' })
        .text(`Date: ${new Date(invoice.issueDate).toLocaleDateString()}`, 350, 90, { align: 'right' })
        .text(`Status: ${invoice.paymentStatus.toUpperCase()}`, 350, 105, { align: 'right' });

      doc.moveTo(50, 130).lineTo(550, 130).strokeColor('#e2e8f0').stroke();

      // Bill To Section
      doc
        .fontSize(12)
        .fillColor('#0f172a')
        .text('BILL TO:', 50, 145, { bold: true })
        .fontSize(10)
        .fillColor('#334155')
        .text(invoice.customer.name, 50, 165)
        .text(invoice.customer.companyName || 'N/A', 50, 180)
        .text(invoice.customer.email, 50, 195)
        .text(invoice.customer.phone || '', 50, 210)
        .text(invoice.customer.address || '', 50, 225);

      // Shipment Route Summary
      if (invoice.booking) {
        doc
          .fontSize(12)
          .fillColor('#0f172a')
          .text('SHIPMENT DETAILS:', 320, 145, { bold: true })
          .fontSize(10)
          .fillColor('#334155')
          .text(`Booking #: ${invoice.booking.bookingNumber || 'N/A'}`, 320, 165)
          .text(`From: ${invoice.booking.pickupLocation?.city || 'Origin'}`, 320, 180)
          .text(`To: ${invoice.booking.dropLocation?.city || 'Destination'}`, 320, 195)
          .text(`Weight: ${invoice.booking.weightTons || 0} Tons | Cargo: ${invoice.booking.cargoType || 'General'}`, 320, 210);
      }

      doc.moveTo(50, 255).lineTo(550, 255).strokeColor('#cbd5e1').stroke();

      // Items Table Header
      let y = 270;
      doc
        .rect(50, y - 5, 500, 22)
        .fill('#f1f5f9');
      
      doc
        .fillColor('#0f172a')
        .fontSize(10)
        .text('DESCRIPTION', 60, y, { bold: true })
        .text('QTY', 320, y, { bold: true })
        .text('UNIT PRICE', 380, y, { bold: true })
        .text('TOTAL', 480, y, { bold: true, align: 'right' });

      y += 28;

      // Line Items
      invoice.lineItems.forEach((item) => {
        doc
          .fillColor('#334155')
          .fontSize(9)
          .text(item.description, 60, y, { width: 250 })
          .text(String(item.quantity || 1), 320, y)
          .text(`$${Number(item.unitPrice).toFixed(2)}`, 380, y)
          .text(`$${Number(item.total).toFixed(2)}`, 480, y, { align: 'right' });
        y += 22;
      });

      doc.moveTo(50, y).lineTo(550, y).strokeColor('#e2e8f0').stroke();
      y += 15;

      // Summary Totals
      doc
        .fontSize(10)
        .fillColor('#475569')
        .text('Subtotal:', 350, y)
        .text(`$${Number(invoice.subtotal).toFixed(2)}`, 480, y, { align: 'right' });

      y += 18;
      doc
        .text(`Tax (${invoice.taxRate || 18}% GST/VAT):`, 350, y)
        .text(`$${Number(invoice.taxAmount).toFixed(2)}`, 480, y, { align: 'right' });

      y += 22;
      doc
        .rect(340, y - 4, 210, 26)
        .fill('#f8fafc');

      doc
        .fontSize(12)
        .fillColor('#0f172a')
        .text('TOTAL AMOUNT:', 350, y + 2, { bold: true })
        .text(`$${Number(invoice.totalAmount).toFixed(2)}`, 480, y + 2, { bold: true, align: 'right' });

      // Footer
      doc
        .fontSize(9)
        .fillColor('#94a3b8')
        .text('Payment Terms: Net 15 days. Interest of 1.5% per month charged on late payments.', 50, 720, { align: 'center' })
        .text('Generated electronically by Tracely TMS. Valid without physical signature.', 50, 735, { align: 'center' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = { generateInvoicePDF };
