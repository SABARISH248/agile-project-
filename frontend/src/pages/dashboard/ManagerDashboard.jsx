import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  CalendarCheck,
  Truck,
  Users,
  Receipt,
  CheckCircle,
  XCircle,
  ArrowRight,
  Plus,
} from 'lucide-react';
import toast from 'react-hot-toast';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import { fetchBookings } from '../../store/slices/bookingSlice';
import { fetchAvailableVehicles } from '../../store/slices/vehicleSlice';
import { fetchAvailableDrivers } from '../../store/slices/driverSlice';
import { fetchExpenses, updateExpenseStatus } from '../../store/slices/expenseSlice';
import { createTrip } from '../../store/slices/tripSlice';

export default function ManagerDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { bookings, loading: bookingsLoading } = useSelector((state) => state.bookings);
  const { availableVehicles } = useSelector((state) => state.vehicles);
  const { availableDrivers } = useSelector((state) => state.drivers);
  const { expenses } = useSelector((state) => state.expenses);

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [assignData, setAssignData] = useState({ vehicleId: '', driverId: '' });

  useEffect(() => {
    dispatch(fetchBookings({ limit: 6 }));
    dispatch(fetchAvailableVehicles());
    dispatch(fetchAvailableDrivers());
    dispatch(fetchExpenses({ status: 'pending', limit: 5 }));
  }, [dispatch]);

  const pendingBookings = bookings.filter((b) => ['draft', 'confirmed'].includes(b.status));
  const pendingExpenses = expenses.filter((e) => e.status === 'pending');

  const handleOpenAssign = (booking) => {
    setSelectedBooking(booking);
    setAssignData({ vehicleId: '', driverId: '' });
    setAssignModalOpen(true);
  };

  const handleConfirmAssign = async (e) => {
    e.preventDefault();
    if (!assignData.vehicleId || !assignData.driverId) {
      toast.error('Please select both a vehicle and a driver');
      return;
    }

    try {
      await dispatch(
        createTrip({
          bookingId: selectedBooking._id,
          vehicleId: assignData.vehicleId,
          driverId: assignData.driverId,
        })
      ).unwrap();

      toast.success('Vehicle and Driver successfully assigned! Trip initiated.');
      setAssignModalOpen(false);
      dispatch(fetchBookings());
      dispatch(fetchAvailableVehicles());
      dispatch(fetchAvailableDrivers());
    } catch (err) {
      toast.error(err || 'Failed to assign trip');
    }
  };

  const handleApproveExpense = async (id) => {
    try {
      await dispatch(updateExpenseStatus({ id, status: 'approved' })).unwrap();
      toast.success('Expense approved');
    } catch (err) {
      toast.error(err || 'Failed to approve');
    }
  };

  const handleRejectExpense = async (id) => {
    try {
      await dispatch(updateExpenseStatus({ id, status: 'rejected', remarks: 'Denied by Manager' })).unwrap();
      toast.error('Expense rejected');
    } catch (err) {
      toast.error(err || 'Failed to reject');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-white tracking-tight">
            Dispatch Operations Hub
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Assign resources, approve driver reimbursements, and coordinate transit schedules
          </p>
        </div>
        <button
          onClick={() => navigate('/bookings')}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white text-xs font-semibold shadow-lg shadow-brand-500/20 transition"
        >
          <Plus className="w-4 h-4" /> New Booking
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Unassigned Bookings"
          value={pendingBookings.length}
          change="Needs Dispatch"
          changeType="negative"
          icon={CalendarCheck}
          color="amber"
        />
        <StatCard
          title="Available Lorries"
          value={availableVehicles.length}
          change="Ready to roll"
          changeType="positive"
          icon={Truck}
          color="emerald"
        />
        <StatCard
          title="Standby Drivers"
          value={availableDrivers.length}
          change="On shift"
          changeType="positive"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Pending Expense Claims"
          value={pendingExpenses.length}
          change="Awaiting audit"
          changeType="negative"
          icon={Receipt}
          color="rose"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bookings Queue */}
        <div className="lg:col-span-2 bg-dark-800/80 border border-slate-700/60 rounded-xl p-5 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Pending Shipment Bookings</h3>
              <p className="text-xs text-slate-400">Assign lorries & drivers to begin transit</p>
            </div>
            <button
              onClick={() => navigate('/bookings')}
              className="text-xs text-brand-400 hover:text-brand-300 font-semibold"
            >
              View All
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-dark-900/60 text-[10px] uppercase text-slate-400 font-semibold border-b border-slate-700/60">
                <tr>
                  <th className="px-4 py-3">Booking #</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Route</th>
                  <th className="px-4 py-3">Cargo Weight</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/40">
                {pendingBookings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                      All shipments are currently dispatched and moving! 🚛
                    </td>
                  </tr>
                ) : (
                  pendingBookings.slice(0, 5).map((b) => (
                    <tr key={b._id} className="hover:bg-slate-800/40 transition">
                      <td className="px-4 py-3 font-mono font-medium text-brand-400">{b.bookingNumber}</td>
                      <td className="px-4 py-3 font-semibold text-white">{b.customerName}</td>
                      <td className="px-4 py-3">
                        {b.pickupLocation?.city} → {b.dropLocation?.city}
                      </td>
                      <td className="px-4 py-3">{b.cargo?.weight} kg ({b.cargo?.type})</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={b.status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleOpenAssign(b)}
                          className="px-2.5 py-1 rounded-lg bg-brand-500 text-white hover:bg-brand-400 font-semibold text-[11px] transition shadow"
                        >
                          Assign & Dispatch
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Expense Approvals */}
        <div className="bg-dark-800/80 border border-slate-700/60 rounded-xl p-5 shadow-xl backdrop-blur-md flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Pending Reimbursements</h3>
              <p className="text-xs text-slate-400">Driver submitted receipts</p>
            </div>
            <button
              onClick={() => navigate('/expenses')}
              className="text-xs text-brand-400 hover:text-brand-300 font-semibold"
            >
              Audits
            </button>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto">
            {pendingExpenses.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No pending expense claims to review.
              </div>
            ) : (
              pendingExpenses.map((exp) => (
                <div
                  key={exp._id}
                  className="p-3 rounded-xl bg-dark-900/60 border border-slate-700/80 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white capitalize">{exp.category}</span>
                      <span className="text-xs font-mono font-bold text-brand-400">
                        ${exp.amount?.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {exp.driver?.fullName || 'Driver'} • {exp.description || 'On-trip expense'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleApproveExpense(exp._id)}
                      className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition"
                      title="Approve"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRejectExpense(exp._id)}
                      className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition"
                      title="Reject"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Assign Modal */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title={`Assign Truck & Driver: ${selectedBooking?.bookingNumber}`}
      >
        <form onSubmit={handleConfirmAssign} className="space-y-4">
          <div className="p-3 rounded-xl bg-dark-900/60 border border-slate-700 text-xs text-slate-300 space-y-1">
            <p><strong>Customer:</strong> {selectedBooking?.customerName}</p>
            <p><strong>Route:</strong> {selectedBooking?.pickupLocation?.city} → {selectedBooking?.dropLocation?.city} ({selectedBooking?.estimatedDistance} km)</p>
            <p><strong>Cargo:</strong> {selectedBooking?.cargo?.type} ({selectedBooking?.cargo?.weight} kg)</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Select Available Truck
            </label>
            <select
              required
              value={assignData.vehicleId}
              onChange={(e) => setAssignData({ ...assignData, vehicleId: e.target.value })}
              className="w-full px-3 py-2 bg-dark-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
            >
              <option value="">-- Choose Truck --</option>
              {availableVehicles.map((v) => (
                <option key={v._id} value={v._id}>
                  {v.plateNumber} ({v.type} - {v.capacity?.weight}kg capacity)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Select Available Driver
            </label>
            <select
              required
              value={assignData.driverId}
              onChange={(e) => setAssignData({ ...assignData, driverId: e.target.value })}
              className="w-full px-3 py-2 bg-dark-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
            >
              <option value="">-- Choose Driver --</option>
              {availableDrivers.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.fullName} (Lic: {d.licenseNumber} - Rating: {d.rating}⭐)
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setAssignModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-medium text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-xs font-bold text-white shadow-lg shadow-brand-500/20"
            >
              Dispatch Trip Now
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
