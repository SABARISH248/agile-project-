import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Receipt, Plus, CheckCircle, XCircle, Trash2, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import {
  fetchExpenses,
  createExpense,
  updateExpenseStatus,
  deleteExpense,
} from '../../store/slices/expenseSlice';
import { fetchTrips } from '../../store/slices/tripSlice';

export default function ExpensesPage() {
  const dispatch = useDispatch();
  const { expenses, loading } = useSelector((state) => state.expenses);
  const { trips } = useSelector((state) => state.trips);
  const { user } = useSelector((state) => state.auth);

  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    tripId: '',
    category: 'fuel',
    amount: '',
    description: '',
  });

  useEffect(() => {
    dispatch(fetchExpenses());
    dispatch(fetchTrips());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(
        createExpense({
          ...formData,
          amount: Number(formData.amount),
        })
      ).unwrap();
      toast.success('Expense claim submitted!');
      setModalOpen(false);
      setFormData({ tripId: '', category: 'fuel', amount: '', description: '' });
      dispatch(fetchExpenses());
    } catch (err) {
      toast.error(err || 'Failed to submit expense');
    }
  };

  const handleApprove = async (id) => {
    try {
      await dispatch(updateExpenseStatus({ id, status: 'approved' })).unwrap();
      toast.success('Expense approved');
      dispatch(fetchExpenses());
    } catch (err) {
      toast.error(err || 'Failed to approve');
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Enter rejection remark:');
    if (reason !== null) {
      try {
        await dispatch(updateExpenseStatus({ id, status: 'rejected', remarks: reason })).unwrap();
        toast.error('Expense rejected');
        dispatch(fetchExpenses());
      } catch (err) {
        toast.error(err || 'Failed to reject');
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this expense record?')) {
      try {
        await dispatch(deleteExpense(id)).unwrap();
        toast.success('Expense deleted');
      } catch (err) {
        toast.error(err || 'Failed to delete');
      }
    }
  };

  const columns = [
    {
      header: 'Category & Notes',
      render: (e) => (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-dark-900 border border-slate-700 text-brand-400">
            <Receipt className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-white capitalize block">{e.category}</span>
            <span className="text-xs text-slate-400">{e.description || 'On-road expense'}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Amount',
      render: (e) => (
        <span className="font-mono font-bold text-emerald-400 text-sm">
          ${(e.amount || 0).toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Trip Ref',
      render: (e) => (
        <span className="font-mono text-xs text-slate-300">
          {e.trip?.tripNumber || 'Fleet General'}
        </span>
      ),
    },
    {
      header: 'Driver / Claimant',
      render: (e) => (
        <span className="text-xs text-slate-300">
          {e.driver?.fullName || user?.name || 'Driver'}
        </span>
      ),
    },
    {
      header: 'Status',
      render: (e) => <StatusBadge status={e.status} />,
    },
    {
      header: 'Actions',
      className: 'text-right',
      render: (e) => (
        <div className="flex items-center justify-end gap-1">
          {['admin', 'manager'].includes(user?.role) && e.status === 'pending' && (
            <>
              <button
                onClick={() => handleApprove(e._id)}
                className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition"
                title="Approve"
              >
                <CheckCircle className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleReject(e._id)}
                className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition"
                title="Reject"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </>
          )}
          {['admin', 'manager'].includes(user?.role) && (
            <button
              onClick={() => handleDelete(e._id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
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
            Trip Expenses & Fuel Reimbursements
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Audit driver submitted diesel bills, toll receipts, maintenance fees, and driver allowances
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white text-xs font-semibold shadow-lg shadow-brand-500/20 transition"
        >
          <Plus className="w-4 h-4" /> Claim Expense
        </button>
      </div>

      <DataTable
        columns={columns}
        data={expenses}
        loading={loading}
        searchPlaceholder="Search expenses by category, claimant..."
        searchKey="category"
      />

      {/* Add Expense Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Submit New Trip Expense">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Associated Trip
            </label>
            <select
              value={formData.tripId}
              onChange={(e) => setFormData({ ...formData, tripId: e.target.value })}
              className="w-full px-3 py-2 bg-dark-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
            >
              <option value="">-- Standby / General Fleet --</option>
              {trips.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.tripNumber} ({t.booking?.pickupLocation?.city} → {t.booking?.dropLocation?.city})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Expense Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 bg-dark-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
              >
                <option value="fuel">Fuel / Diesel</option>
                <option value="toll">Fastag / Toll</option>
                <option value="repair">Tyre / Repair</option>
                <option value="allowance">Driver Allowance</option>
                <option value="misc">Miscellaneous</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Amount ($)
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="250"
                className="w-full px-3 py-2 bg-dark-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Description / Notes
            </label>
            <input
              type="text"
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g. 100 liters diesel filled at Shell Highway"
              className="w-full px-3 py-2 bg-dark-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-medium text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-xs font-bold text-white shadow"
            >
              Submit Claim
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
