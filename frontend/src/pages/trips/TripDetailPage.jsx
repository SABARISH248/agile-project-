import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  ArrowLeft,
  Truck,
  User,
  Phone,
  MapPin,
  Calendar,
  CheckCircle,
  UploadCloud,
  FileCheck,
  ShieldCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import StatusBadge from '../../components/common/StatusBadge';
import TripStepper from '../../components/trips/TripStepper';
import LiveTrackingMap from '../../components/maps/LiveTrackingMap';
import Modal from '../../components/common/Modal';
import {
  fetchTrip,
  updateTripStatus,
  updateTripLocation,
  uploadPOD,
} from '../../store/slices/tripSlice';

export default function TripDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { selectedTrip: trip, loading } = useSelector((state) => state.trips);
  const { user } = useSelector((state) => state.auth);

  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [podModalOpen, setPodModalOpen] = useState(false);
  const [podFile, setPodFile] = useState(null);
  const [podReceiver, setPodReceiver] = useState('');

  useEffect(() => {
    if (id) {
      dispatch(fetchTrip(id));
    }
  }, [dispatch, id]);

  const handleUpdateStatus = async (statusValue) => {
    try {
      await dispatch(
        updateTripStatus({
          id: trip._id,
          status: statusValue,
          remarks: `Status updated by ${user?.name || 'Dispatcher'} to ${statusValue}`,
        })
      ).unwrap();
      toast.success(`Trip status moved to ${statusValue}!`);
      setStatusModalOpen(false);
      dispatch(fetchTrip(id));
    } catch (err) {
      toast.error(err || 'Failed to update status');
    }
  };

  const handleUploadPOD = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    if (podFile) formData.append('pod', podFile);
    formData.append('receiverName', podReceiver);

    try {
      await dispatch(uploadPOD({ id: trip._id, formData })).unwrap();
      toast.success('POD uploaded and trip marked delivered!');
      setPodModalOpen(false);
      dispatch(fetchTrip(id));
    } catch (err) {
      toast.error(err || 'Failed to upload POD');
    }
  };

  if (loading && !trip) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="p-8 text-center text-slate-400">
        <p>Trip not found.</p>
        <button
          onClick={() => navigate('/trips')}
          className="mt-4 px-4 py-2 bg-dark-800 text-slate-200 rounded-lg text-xs"
        >
          Back to Trips
        </button>
      </div>
    );
  }

  const pickup = trip.booking?.pickupLocation || {};
  const drop = trip.booking?.dropoffLocation || trip.booking?.dropLocation || {};
  const truckPlate = trip.vehicle?.registrationNumber || trip.vehicle?.plateNumber || 'Fleet Vehicle';
  const driverName = trip.driver?.user?.name || trip.driver?.fullName || 'Assigned Driver';
  const driverPhone = trip.driver?.user?.phone || trip.driver?.phone || '+1 (555) 723-9912';

  return (
    <div className="space-y-6">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/trips')}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Trips
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setStatusModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-white font-bold text-xs shadow-md transition"
          >
            Update Stage
          </button>
          {trip.status !== 'delivered' && (
            <button
              onClick={() => setPodModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
            >
              <UploadCloud className="w-3.5 h-3.5" /> Upload POD
            </button>
          )}
        </div>
      </div>

      {/* Header Info Banner */}
      <div className="bg-dark-800/80 border border-slate-700/60 rounded-2xl p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-700/60 gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-base font-mono font-bold text-brand-400">
                {trip.tripNumber}
              </span>
              <StatusBadge status={trip.status} />
            </div>
            <h1 className="text-2xl font-bold font-heading text-white mt-2">
              {pickup.city || 'Origin'} → {drop.city || 'Destination'}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Booking Ref: {trip.booking?.bookingNumber} • Cargo: {trip.booking?.cargoDetails?.cargoType || trip.booking?.cargo?.type || 'Cargo'} ({trip.booking?.cargoDetails?.weightKg || trip.booking?.cargo?.weight || 0} kg)
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 block">Freight Value</span>
            <span className="text-2xl font-mono font-bold text-emerald-400">
              ${(trip.booking?.pricing?.totalAmount || trip.booking?.estimatedCost || 0).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Stepper */}
        <TripStepper currentStatus={trip.status} timeline={trip.timeline} />
      </div>

      {/* Live Map & Operational Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Map Stream */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-dark-800/80 border border-slate-700/60 rounded-xl p-4 shadow-xl backdrop-blur-md">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Live Fleet GPS Positioning
            </h3>
            <LiveTrackingMap
              origin={pickup}
              destination={drop}
              currentLocation={trip.currentLocation}
              truckPlate={truckPlate}
              height="380px"
            />
          </div>

          {/* Timeline Milestones */}
          <div className="bg-dark-800/80 border border-slate-700/60 rounded-xl p-5 shadow-xl backdrop-blur-md">
            <h3 className="text-sm font-semibold text-white mb-3">Transit Timeline & Audit Log</h3>
            <div className="space-y-3">
              {(trip.timeline || []).map((t, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs">
                  <div className="w-2 h-2 rounded-full bg-brand-500 mt-1.5" />
                  <div className="flex-1">
                    <span className="font-bold text-white capitalize">{t.status.replace('_', ' ')}</span>
                    <p className="text-slate-400 text-[11px]">{t.remarks || 'Status logged'}</p>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Info: Vehicle, Driver, POD */}
        <div className="space-y-4">
          {/* Driver Card */}
          <div className="bg-dark-800/80 border border-slate-700/60 rounded-xl p-5 shadow-xl backdrop-blur-md">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-brand-400" /> Assigned Driver
            </h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow">
                {trip.driver?.fullName?.charAt(0) || 'D'}
              </div>
              <div>
                <p className="text-sm font-bold text-white">{trip.driver?.fullName || 'Assigned Driver'}</p>
                <p className="text-xs text-slate-400">Lic: {trip.driver?.licenseNumber}</p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" /> {trip.driver?.phone || 'Contact N/A'}
              </span>
              <span className="text-amber-400 font-bold">⭐ {trip.driver?.rating || 4.9}</span>
            </div>
          </div>

          {/* Vehicle Card */}
          <div className="bg-dark-800/80 border border-slate-700/60 rounded-xl p-5 shadow-xl backdrop-blur-md">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-brand-400" /> Transport Vehicle
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base font-bold text-white font-mono">{trip.vehicle?.plateNumber || 'Truck'}</p>
                <p className="text-xs text-slate-400 capitalize">{trip.vehicle?.make} {trip.vehicle?.model} ({trip.vehicle?.type})</p>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                Inspected
              </span>
            </div>
            <div className="mt-3 text-xs text-slate-400">
              Payload: <strong className="text-slate-200">{trip.vehicle?.capacity?.weight?.toLocaleString()} kg</strong>
            </div>
          </div>

          {/* Proof of Delivery Card */}
          <div className="bg-dark-800/80 border border-slate-700/60 rounded-xl p-5 shadow-xl backdrop-blur-md">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5 text-brand-400" /> Proof of Delivery (POD)
            </h3>
            {trip.proofOfDelivery?.documentUrl ? (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs">
                <p className="font-bold text-emerald-400">✓ POD Verified</p>
                <p className="text-slate-300 mt-1">Receiver: {trip.proofOfDelivery.receiverName || 'Authorized Signatory'}</p>
                <a
                  href={trip.proofOfDelivery.documentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-brand-400 hover:underline font-semibold"
                >
                  View Signed Document
                </a>
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-dark-900/60 border border-dashed border-slate-700 text-center text-xs text-slate-500">
                POD pending delivery confirmation.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Update Status Modal */}
      <Modal isOpen={statusModalOpen} onClose={() => setStatusModalOpen(false)} title="Update Transit Stage">
        <div className="space-y-3">
          <p className="text-xs text-slate-400">Advance the trip lifecycle stage:</p>
          <div className="grid grid-cols-2 gap-2">
            {['loading', 'dispatched', 'in_transit', 'unloading', 'delivered'].map((s) => (
              <button
                key={s}
                onClick={() => handleUpdateStatus(s)}
                className="p-3 rounded-xl bg-dark-900 border border-slate-700 hover:border-brand-500 hover:bg-brand-500/10 text-left capitalize text-xs font-semibold text-white transition"
              >
                {s.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </Modal>

      {/* POD Modal */}
      <Modal isOpen={podModalOpen} onClose={() => setPodModalOpen(false)} title="Upload Proof of Delivery">
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
              Upload Signed Bill / Photo
            </label>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => setPodFile(e.target.files[0])}
              className="w-full px-3 py-2 bg-dark-900 border border-slate-700 rounded-xl text-xs text-slate-400"
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
              className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-xs font-bold text-white shadow"
            >
              Confirm POD & Finish Trip
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
