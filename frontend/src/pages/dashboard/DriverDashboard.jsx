import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Truck,
  MapPin,
  Calendar,
  Receipt,
  UploadCloud,
  CheckCircle,
  Navigation,
  ArrowRight,
  ShieldCheck,
  Plus,
} from 'lucide-react';
import toast from 'react-hot-toast';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import TripStepper from '../../components/trips/TripStepper';
import Modal from '../../components/common/Modal';
import { fetchTrips, updateTripStatus, updateTripLocation, uploadPOD } from '../../store/slices/tripSlice';
import { createExpense } from '../../store/slices/expenseSlice';

export default function DriverDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { trips, loading } = useSelector((state) => state.trips);

  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [podModalOpen, setPodModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);

  const [expenseData, setExpenseData] = useState({ category: 'fuel', amount: '', description: '' });
  const [podFile, setPodFile] = useState(null);
  const [podReceiver, setPodReceiver] = useState('');
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    dispatch(fetchTrips());
  }, [dispatch]);

  // Find currently active trip for this driver
  const activeTrip = trips.find((t) =>
    ['booked', 'loading', 'dispatched', 'in_transit', 'unloading'].includes(t.status)
  ) || trips[0];

  const handleUpdateStatus = async (statusValue) => {
    if (!activeTrip) return;
    try {
      await dispatch(
        updateTripStatus({
          id: activeTrip._id,
          status: statusValue,
          remarks: `Status updated by driver to ${statusValue}`,
        })
      ).unwrap();
      toast.success(`Trip status updated to ${statusValue}!`);
      setStatusModalOpen(false);
      dispatch(fetchTrips());
    } catch (err) {
      toast.error(err || 'Failed to update trip status');
    }
  };

  const handleSimulateGPS = async () => {
    if (!activeTrip) return;
    // Simulate slight movement
    const currentCoords = activeTrip.currentLocation?.coordinates || [75.0, 23.0];
    const newCoords = [currentCoords[0] + 0.05, currentCoords[1] + 0.05];
    try {
      await dispatch(
        updateTripLocation({
          id: activeTrip._id,
          coordinates: newCoords,
          speed: 68,
        })
      ).unwrap();
      toast.success('Live GPS coordinates transmitted to dispatch!');
    } catch (err) {
      toast.error('Failed to update GPS');
    }
  };

  const handleLogExpense = async (e) => {
    e.preventDefault();
    if (!activeTrip) {
      toast.error('No active trip linked');
      return;
    }
    try {
      await dispatch(
        createExpense({
          tripId: activeTrip._id,
          category: expenseData.category,
          amount: Number(expenseData.amount),
          description: expenseData.description,
        })
      ).unwrap();
      toast.success('Expense claim submitted for manager audit!');
      setExpenseModalOpen(false);
      setExpenseData({ category: 'fuel', amount: '', description: '' });
    } catch (err) {
      toast.error(err || 'Failed to log expense');
    }
  };

  const handleUploadPOD = async (e) => {
    e.preventDefault();
    if (!activeTrip) return;
    const formData = new FormData();
    if (podFile) formData.append('pod', podFile);
    formData.append('receiverName', podReceiver);

    try {
      await dispatch(uploadPOD({ id: activeTrip._id, formData })).unwrap();
      toast.success('Proof of delivery recorded! Trip marked delivered.');
      setPodModalOpen(false);
      dispatch(fetchTrips());
    } catch (err) {
      toast.error(err || 'Failed to submit POD');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-white tracking-tight">
            Driver Command Cockpit
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Welcome back, {user?.name || 'Captain'} • Vehicle:{' '}
            <span className="text-brand-400 font-bold">{activeTrip?.vehicle?.plateNumber || 'Truck Standby'}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setExpenseModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-dark-800 border border-slate-700 hover:bg-slate-750 text-slate-200 text-xs font-semibold transition"
          >
            <Receipt className="w-4 h-4 text-brand-400" /> Log Trip Expense
          </button>
          <button
            onClick={handleSimulateGPS}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-semibold shadow-lg shadow-emerald-500/20 transition"
          >
            <Navigation className="w-4 h-4" /> Transmit GPS
          </button>
        </div>
      </div>

      {/* Driver Scorecards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Current Mission Status"
          value={activeTrip ? activeTrip.status.toUpperCase() : 'STANDBY'}
          change="Vehicle Assigned"
          changeType="positive"
          icon={Truck}
          color="brand"
        />
        <StatCard
          title="Safety & Driver Rating"
          value="4.9 / 5.0"
          change="Top 5% Performer"
          changeType="positive"
          icon={ShieldCheck}
          color="emerald"
        />
        <StatCard
          title="Deliveries Completed"
          value="42"
          change="Zero incidents"
          changeType="positive"
          icon={CheckCircle}
          color="blue"
        />
      </div>

      {/* Active Trip Hero Banner */}
      {activeTrip ? (
        <div className="bg-dark-800/80 border border-slate-700/60 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-700/60 gap-4">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-brand-400 bg-brand-500/10 border border-brand-500/20 px-2.5 py-1 rounded-lg">
                  {activeTrip.tripNumber}
                </span>
                <StatusBadge status={activeTrip.status} />
              </div>
              <h2 className="text-xl font-bold text-white mt-2 font-heading">
                {activeTrip.booking?.pickupLocation?.city || 'Origin'} → {activeTrip.booking?.dropLocation?.city || 'Destination'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Cargo: {activeTrip.booking?.cargo?.type} • {activeTrip.booking?.cargo?.weight} kg
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setStatusModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-white font-bold text-xs shadow-lg shadow-brand-500/20 transition"
              >
                Update Transit Stage
              </button>
              {activeTrip.status !== 'delivered' && (
                <button
                  onClick={() => setPodModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 transition flex items-center gap-1.5"
                >
                  <UploadCloud className="w-4 h-4" /> Upload POD
                </button>
              )}
              <button
                onClick={() => navigate(`/trips/${activeTrip._id}`)}
                className="px-4 py-2.5 rounded-xl bg-dark-900 border border-slate-700 hover:bg-slate-750 text-slate-300 font-bold text-xs transition"
              >
                Full Route Map
              </button>
            </div>
          </div>

          {/* Stepper visualizer */}
          <TripStepper currentStatus={activeTrip.status} timeline={activeTrip.timeline} />

          {/* Origin & Destination details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-700/40">
            <div className="p-3.5 rounded-xl bg-dark-900/60 border border-slate-700/80">
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> Pickup Point
              </p>
              <p className="text-xs font-semibold text-white mt-1">
                {activeTrip.booking?.pickupLocation?.address || 'Loading Bay 1'}
              </p>
              <p className="text-[11px] text-slate-400">
                {activeTrip.booking?.pickupLocation?.city}, {activeTrip.booking?.pickupLocation?.state}
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-dark-900/60 border border-slate-700/80">
              <p className="text-[10px] font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> Drop-off Destination
              </p>
              <p className="text-xs font-semibold text-white mt-1">
                {activeTrip.booking?.dropLocation?.address || 'Warehouse 4'}
              </p>
              <p className="text-[11px] text-slate-400">
                {activeTrip.booking?.dropLocation?.city}, {activeTrip.booking?.dropLocation?.state}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-dark-800 border border-slate-700 text-slate-400">
          <Truck className="w-12 h-12 stroke-[1.2] mx-auto mb-3 text-slate-600" />
          <h3 className="text-base font-semibold text-white">No Active Trip Assigned</h3>
          <p className="text-xs text-slate-400 mt-1">Stand by for dispatch assignment from manager</p>
        </div>
      )}

      {/* Update Status Modal */}
      <Modal isOpen={statusModalOpen} onClose={() => setStatusModalOpen(false)} title="Update Trip Stage">
        <div className="space-y-3">
          <p className="text-xs text-slate-400">Select the current operational state of this delivery:</p>
          <div className="grid grid-cols-2 gap-2">
            {['loading', 'dispatched', 'in_transit', 'unloading', 'delivered'].map((s) => (
              <button
                key={s}
                onClick={() => handleUpdateStatus(s)}
                className="p-3 rounded-xl bg-dark-900 border border-slate-700 hover:border-brand-500 hover:bg-brand-500/10 text-left capitalize text-xs font-semibold text-white transition flex items-center justify-between"
              >
                <span>{s.replace('_', ' ')}</span>
                <ArrowRight className="w-3.5 h-3.5 text-brand-400" />
              </button>
            ))}
          </div>
        </div>
      </Modal>

      {/* Log Expense Modal */}
      <Modal isOpen={expenseModalOpen} onClose={() => setExpenseModalOpen(false)} title="Submit On-Road Expense Claim">
        <form onSubmit={handleLogExpense} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Category
            </label>
            <select
              value={expenseData.category}
              onChange={(e) => setExpenseData({ ...expenseData, category: e.target.value })}
              className="w-full px-3 py-2 bg-dark-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
            >
              <option value="fuel">Fuel / Diesel</option>
              <option value="toll">Highway Toll</option>
              <option value="repair">Emergency Repairs / Tyre</option>
              <option value="allowance">Driver Allowance / Food</option>
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
              value={expenseData.amount}
              onChange={(e) => setExpenseData({ ...expenseData, amount: e.target.value })}
              placeholder="e.g. 150"
              className="w-full px-3 py-2 bg-dark-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Notes / Description
            </label>
            <input
              type="text"
              value={expenseData.description}
              onChange={(e) => setExpenseData({ ...expenseData, description: e.target.value })}
              placeholder="e.g. 80 Litres diesel at Highway Station"
              className="w-full px-3 py-2 bg-dark-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setExpenseModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-medium text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-xs font-bold text-white shadow-lg shadow-brand-500/20"
            >
              Submit Expense
            </button>
          </div>
        </form>
      </Modal>

      {/* Upload POD Modal */}
      <Modal isOpen={podModalOpen} onClose={() => setPodModalOpen(false)} title="Proof of Delivery (POD)">
        <form onSubmit={handleUploadPOD} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Receiver Full Name
            </label>
            <input
              type="text"
              required
              value={podReceiver}
              onChange={(e) => setPodReceiver(e.target.value)}
              placeholder="e.g. Robert Smith"
              className="w-full px-3 py-2 bg-dark-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Signed Invoice or Cargo Photo
            </label>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => setPodFile(e.target.files[0])}
              className="w-full px-3 py-2 bg-dark-900 border border-slate-700 rounded-xl text-xs text-slate-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-500 file:text-white hover:file:bg-brand-400"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setPodModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-medium text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg shadow-emerald-500/20"
            >
              Confirm Delivery & Close Trip
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
