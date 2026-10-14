import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CalendarCheck, Plus, Calculator, XCircle, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import {
  fetchBookings,
  createBooking,
  cancelBooking,
  calculateRate,
  clearRateEstimate,
} from '../../store/slices/bookingSlice';

export default function BookingsPage() {
  const dispatch = useDispatch();
  const { bookings, rateEstimate, loading } = useSelector((state) => state.bookings);

  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    pickupLocation: { address: '', city: 'Mumbai', state: 'Maharashtra', zip: '400001' },
    dropLocation: { address: '', city: 'Delhi', state: 'Delhi', zip: '110001' },
    cargo: { type: 'General Merchandise', weight: 15000, volume: 50 },
    estimatedDistance: 1400,
    vehicleTypeRequired: 'trailer',
  });

  useEffect(() => {
    dispatch(fetchBookings());
  }, [dispatch]);

  const handleOpenAdd = () => {
    dispatch(clearRateEstimate());
    setModalOpen(true);
  };

  const handleCalculateRate = async () => {
    if (!formData.estimatedDistance || !formData.cargo.weight) {
      toast.error('Please enter distance and cargo weight first');
      return;
    }
    dispatch(
      calculateRate({
        distanceKm: Number(formData.estimatedDistance),
        weightKg: Number(formData.cargo.weight),
        vehicleType: formData.vehicleTypeRequired,
      })
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(createBooking(formData)).unwrap();
      toast.success('Shipment booking created successfully!');
      setModalOpen(false);
      dispatch(fetchBookings());
    } catch (err) {
      toast.error(err || 'Failed to create booking');
    }
  };

  const handleCancelBooking = async (id) => {
    const reason = window.prompt('Please enter cancellation reason:');
    if (reason) {
      try {
        await dispatch(cancelBooking({ id, reason })).unwrap();
        toast.success('Booking cancelled');
        dispatch(fetchBookings());
      } catch (err) {
        toast.error(err || 'Failed to cancel booking');
      }
    }
  };

  const columns = [
    {
      header: 'Booking #',
      render: (b) => (
        <span className="font-mono font-bold text-brand-400 block">{b.bookingNumber}</span>
      ),
    },
    {
      header: 'Customer Details',
      render: (b) => (
        <div>
          <span className="font-semibold text-white block">{b.customer?.name || b.customer?.companyName || b.customerName || 'Shipper'}</span>
          <span className="text-xs text-slate-400">{b.customer?.phone || b.customerPhone || b.customer?.email}</span>
        </div>
      ),
    },
    {
      header: 'Route (Origin → Destination)',
      render: (b) => {
        const pCity = b.pickupLocation?.city || 'Origin';
        const dCity = b.dropoffLocation?.city || b.dropLocation?.city || 'Destination';
        const dist = b.estimatedDistanceKm || b.estimatedDistance || 0;
        return (
          <div>
            <span className="text-slate-200 block">
              {pCity} → {dCity}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {dist} km estimated
            </span>
          </div>
        );
      },
    },
    {
      header: 'Cargo',
      render: (b) => {
        const weight = b.cargoDetails?.weightKg || b.cargo?.weight || 0;
        const type = b.cargoDetails?.cargoType || b.cargo?.type || 'Freight';
        return (
          <div>
            <span className="text-slate-200 block">{weight.toLocaleString()} kg</span>
            <span className="text-[10px] text-slate-400">{type}</span>
          </div>
        );
      },
    },
    {
      header: 'Quoted Price',
      render: (b) => {
        const cost = b.pricing?.totalAmount || b.estimatedCost || 0;
        return (
          <span className="font-mono font-bold text-emerald-400">
            ${cost.toLocaleString()}
          </span>
        );
      },
    },
    {
      header: 'Status',
      render: (b) => <StatusBadge status={b.status} />,
    },
    {
      header: 'Actions',
      className: 'text-right',
      render: (b) => (
        <div className="flex items-center justify-end gap-1">
          {b.status !== 'cancelled' && b.status !== 'completed' && (
            <button
              onClick={() => handleCancelBooking(b._id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
              title="Cancel Booking"
            >
              <XCircle className="w-4 h-4" />
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
            Shipment Bookings & Freight Orders
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Accept customer orders, auto-estimate freight charges, and trigger dispatch pipelines
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white text-xs font-semibold shadow-lg shadow-brand-500/20 transition"
        >
          <Plus className="w-4 h-4" /> Create Shipment Booking
        </button>
      </div>

      <DataTable
        columns={columns}
        data={bookings}
        loading={loading}
        searchPlaceholder="Search bookings by number, customer, route..."
        searchKey="bookingNumber"
      />

      {/* New Booking Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create Shipment Freight Booking"
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Customer info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Customer / Shipper Name
              </label>
              <input
                type="text"
                required
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                placeholder="Apex Logistics Ltd"
                className="w-full px-3 py-2 bg-dark-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={formData.customerEmail}
                onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                placeholder="billing@apex.com"
                className="w-full px-3 py-2 bg-dark-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Contact Phone
              </label>
              <input
                type="tel"
                required
                value={formData.customerPhone}
                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                placeholder="+91 9900112233"
                className="w-full px-3 py-2 bg-dark-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {/* Pickup and Dropoff */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 rounded-xl bg-dark-900/60 border border-slate-700/80">
            <div>
              <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
                Pickup Origin Location
              </p>
              <div className="space-y-2">
                <input
                  type="text"
                  required
                  placeholder="Street / Warehouse address"
                  value={formData.pickupLocation.address}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pickupLocation: { ...formData.pickupLocation, address: e.target.value },
                    })
                  }
                  className="w-full px-3 py-1.5 bg-dark-850 border border-slate-700 rounded-lg text-xs text-white"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="City (e.g. Mumbai)"
                    value={formData.pickupLocation.city}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pickupLocation: { ...formData.pickupLocation, city: e.target.value },
                      })
                    }
                    className="w-full px-3 py-1.5 bg-dark-850 border border-slate-700 rounded-lg text-xs text-white"
                  />
                  <input
                    type="text"
                    required
                    placeholder="State"
                    value={formData.pickupLocation.state}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pickupLocation: { ...formData.pickupLocation, state: e.target.value },
                      })
                    }
                    className="w-full px-3 py-1.5 bg-dark-850 border border-slate-700 rounded-lg text-xs text-white"
                  />
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-2">
                Dropoff Destination Location
              </p>
              <div className="space-y-2">
                <input
                  type="text"
                  required
                  placeholder="Street / Warehouse address"
                  value={formData.dropLocation.address}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      dropLocation: { ...formData.dropLocation, address: e.target.value },
                    })
                  }
                  className="w-full px-3 py-1.5 bg-dark-850 border border-slate-700 rounded-lg text-xs text-white"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="City (e.g. Delhi)"
                    value={formData.dropLocation.city}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dropLocation: { ...formData.dropLocation, city: e.target.value },
                      })
                    }
                    className="w-full px-3 py-1.5 bg-dark-850 border border-slate-700 rounded-lg text-xs text-white"
                  />
                  <input
                    type="text"
                    required
                    placeholder="State"
                    value={formData.dropLocation.state}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dropLocation: { ...formData.dropLocation, state: e.target.value },
                      })
                    }
                    className="w-full px-3 py-1.5 bg-dark-850 border border-slate-700 rounded-lg text-xs text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Cargo Details */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Cargo Commodity
              </label>
              <input
                type="text"
                required
                value={formData.cargo.type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    cargo: { ...formData.cargo, type: e.target.value },
                  })
                }
                placeholder="Electronics / Steel"
                className="w-full px-3 py-2 bg-dark-900 border border-slate-700 rounded-xl text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Weight (kg)
              </label>
              <input
                type="number"
                required
                min="100"
                value={formData.cargo.weight}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    cargo: { ...formData.cargo, weight: Number(e.target.value) },
                  })
                }
                className="w-full px-3 py-2 bg-dark-900 border border-slate-700 rounded-xl text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Distance (km)
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.estimatedDistance}
                onChange={(e) => setFormData({ ...formData, estimatedDistance: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-dark-900 border border-slate-700 rounded-xl text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Vehicle Type
              </label>
              <select
                value={formData.vehicleTypeRequired}
                onChange={(e) => setFormData({ ...formData, vehicleTypeRequired: e.target.value })}
                className="w-full px-3 py-2 bg-dark-900 border border-slate-700 rounded-xl text-sm text-white"
              >
                <option value="trailer">Heavy Trailer</option>
                <option value="container">Container</option>
                <option value="flatbed">Flatbed</option>
                <option value="tanker">Tanker</option>
              </select>
            </div>
          </div>

          {/* Pricing Estimation Engine */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-dark-900 to-dark-850 border border-brand-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-brand-400" /> Automated Freight Estimation Engine
              </p>
              {rateEstimate ? (
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-mono text-emerald-400">
                    ${rateEstimate.totalEstimatedCost?.toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-400">
                    (Base: ${rateEstimate.breakdown?.baseRate} + Distance: ${rateEstimate.breakdown?.distanceCost} + Tax)
                  </span>
                </div>
              ) : (
                <p className="text-xs text-slate-500 mt-1">
                  Click calculate to estimate freight pricing before confirming booking
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={handleCalculateRate}
              className="px-4 py-2 rounded-xl bg-dark-800 hover:bg-slate-700 text-xs font-semibold text-brand-400 border border-brand-500/30 transition shadow"
            >
              Calculate Quote
            </button>
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
              className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-xs font-bold text-white shadow-lg shadow-brand-500/20"
            >
              Confirm Booking
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
