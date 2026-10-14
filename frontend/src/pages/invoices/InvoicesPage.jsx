import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FileText, Download, CheckCircle, CreditCard, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import { fetchInvoices, updatePaymentStatus } from '../../store/slices/invoiceSlice';
import api from '../../api/axios';

export default function InvoicesPage() {
  const dispatch = useDispatch();
  const { invoices, loading } = useSelector((state) => state.invoices);

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentData, setPaymentData] = useState({
    paymentStatus: 'paid',
    paymentMethod: 'bank_transfer',
    paymentReference: '',
  });

  useEffect(() => {
    dispatch(fetchInvoices());
  }, [dispatch]);

  const handleDownloadPDF = async (invoiceId, invoiceNumber) => {
    try {
      toast.loading('Generating PDF Invoice...', { id: 'pdf-toast' });
      const res = await api.get(`/invoices/${invoiceId}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${invoiceNumber || 'Invoice'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Invoice PDF downloaded!', { id: 'pdf-toast' });
    } catch (err) {
      toast.error('Failed to download invoice PDF', { id: 'pdf-toast' });
    }
  };

  const handleOpenPayment = (inv) => {
    setSelectedInvoice(inv);
    setPaymentData({
      paymentStatus: 'paid',
      paymentMethod: 'bank_transfer',
      paymentReference: '',
    });
    setPaymentModalOpen(true);
  };

  const handleUpdatePayment = async (e) => {
    e.preventDefault();
    try {
      await dispatch(
        updatePaymentStatus({
          id: selectedInvoice._id,
          ...paymentData,
        })
      ).unwrap();
      toast.success('Invoice payment recorded!');
      setPaymentModalOpen(false);
      dispatch(fetchInvoices());
    } catch (err) {
      toast.error(err || 'Failed to update payment');
    }
  };

  const columns = [
    {
      header: 'Invoice #',
      render: (i) => (
        <span className="font-mono font-bold text-brand-400 block">{i.invoiceNumber}</span>
      ),
    },
    {
      header: 'Customer Details',
      render: (i) => (
        <div>
          <span className="font-semibold text-white block">{i.customerName}</span>
          <span className="text-xs text-slate-400">{i.customerEmail}</span>
        </div>
      ),
    },
    {
      header: 'Booking Ref',
      render: (i) => (
        <span className="font-mono text-xs text-slate-300">
          {i.booking?.bookingNumber || 'Direct Invoice'}
        </span>
      ),
    },
    {
      header: 'Financial Breakdown',
      render: (i) => (
        <div>
          <span className="font-mono font-bold text-white block text-sm">
            ${(i.totalAmount || 0).toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-400">
            Sub: ${(i.subtotal || 0).toLocaleString()} + Tax: ${(i.taxAmount || 0).toLocaleString()}
          </span>
        </div>
      ),
    },
    {
      header: 'Payment Status',
      render: (i) => <StatusBadge status={i.paymentStatus} />,
    },
    {
      header: 'Actions',
      className: 'text-right',
      render: (i) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => handleDownloadPDF(i._id, i.invoiceNumber)}
            className="p-1.5 rounded-lg text-brand-400 hover:text-brand-300 hover:bg-brand-500/10 transition"
            title="Download PDF"
          >
            <Download className="w-4 h-4" />
          </button>
          {i.paymentStatus !== 'paid' && (
            <button
              onClick={() => handleOpenPayment(i)}
              className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white font-semibold text-[11px] transition"
            >
              Record Pay
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-white tracking-tight">
            Invoicing & Freight Billing
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Automated PDF generation, tax calculation, and customer payment reconciliation
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={invoices}
        loading={loading}
        searchPlaceholder="Search invoices by number, customer..."
        searchKey="invoiceNumber"
      />

      {/* Payment Update Modal */}
      <Modal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        title={`Record Payment: ${selectedInvoice?.invoiceNumber}`}
      >
        <form onSubmit={handleUpdatePayment} className="space-y-4">
          <div className="p-3.5 rounded-xl bg-dark-900 border border-slate-700 text-xs text-slate-300">
            <p><strong>Customer:</strong> {selectedInvoice?.customerName}</p>
            <p><strong>Due Amount:</strong> <span className="text-emerald-400 font-mono font-bold">${selectedInvoice?.totalAmount?.toLocaleString()}</span></p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Payment Status
            </label>
            <select
              value={paymentData.paymentStatus}
              onChange={(e) => setPaymentData({ ...paymentData, paymentStatus: e.target.value })}
              className="w-full px-3 py-2 bg-dark-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
            >
              <option value="paid">Fully Paid</option>
              <option value="partially_paid">Partially Paid</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Payment Method
            </label>
            <select
              value={paymentData.paymentMethod}
              onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value })}
              className="w-full px-3 py-2 bg-dark-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
            >
              <option value="bank_transfer">Direct Bank Wire / NEFT</option>
              <option value="credit_card">Corporate Credit Card</option>
              <option value="cheque">Cheque</option>
              <option value="cash">Cash</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Transaction / Reference ID
            </label>
            <input
              type="text"
              required
              value={paymentData.paymentReference}
              onChange={(e) => setPaymentData({ ...paymentData, paymentReference: e.target.value })}
              placeholder="e.g. UTR-9908123984"
              className="w-full px-3 py-2 bg-dark-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setPaymentModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-medium text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow"
            >
              Confirm Payment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
