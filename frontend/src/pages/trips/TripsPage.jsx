import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Navigation, Truck, User, ArrowRight, Eye } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import { fetchTrips } from '../../store/slices/tripSlice';

export default function TripsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { trips, loading } = useSelector((state) => state.trips);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    dispatch(fetchTrips());
  }, [dispatch]);

  const filteredTrips = statusFilter === 'all'
    ? trips
    : trips.filter((t) => t.status === statusFilter);

  const filterTabs = [
    { key: 'all', label: 'All Trips' },
    { key: 'in_transit', label: 'In Transit' },
    { key: 'dispatched', label: 'Dispatched' },
    { key: 'loading', label: 'Loading' },
    { key: 'delivered', label: 'Delivered' },
  ];

  const columns = [
    {
      header: 'Trip Number',
      render: (t) => (
        <span className="font-mono font-bold text-brand-400 block">{t.tripNumber}</span>
      ),
    },
    {
      header: 'Vehicle / Lorry',
      render: (t) => (
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-slate-400" />
          <div>
            <span className="font-semibold text-white block">
              {t.vehicle?.registrationNumber || t.vehicle?.plateNumber || 'Truck'}
            </span>
            <span className="text-xs text-slate-400">{t.vehicle?.model} ({t.vehicle?.vehicleType || t.vehicle?.type})</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Assigned Driver',
      render: (t) => (
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-slate-400" />
          <span className="text-slate-200 font-medium">{t.driver?.user?.name || t.driver?.fullName || 'Assigned Driver'}</span>
        </div>
      ),
    },
    {
      header: 'Transit Route',
      render: (t) => {
        const pCity = t.booking?.pickupLocation?.city || 'Origin';
        const dCity = t.booking?.dropoffLocation?.city || t.booking?.dropLocation?.city || 'Destination';
        const cargoType = t.booking?.cargoDetails?.cargoType || t.booking?.cargo?.type || 'Cargo';
        const cargoWeight = t.booking?.cargoDetails?.weightKg || t.booking?.cargo?.weight || 0;
        return (
          <div>
            <span className="text-slate-200 block">
              {pCity} → {dCity}
            </span>
            <span className="text-[10px] text-slate-400">
              {cargoType} ({cargoWeight.toLocaleString()} kg)
            </span>
          </div>
        );
      },
    },
    {
      header: 'Current Status',
      render: (t) => <StatusBadge status={t.status} />,
    },
    {
      header: 'Actions',
      className: 'text-right',
      render: (t) => (
        <button
          onClick={() => navigate(`/trips/${t._id}`)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-500/10 text-brand-400 hover:bg-brand-500 hover:text-white font-semibold text-xs transition"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Track Live</span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-white tracking-tight">
            Trip Tracking & Fleet Dispatch
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Monitor real-time GPS locations, transit lifecycles, and delivery timelines
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              statusFilter === tab.key
                ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                : 'bg-dark-800 text-slate-400 hover:text-white border border-slate-700/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={filteredTrips}
        loading={loading}
        searchPlaceholder="Search trips by number, plate, driver..."
        searchKey="tripNumber"
      />
    </div>
  );
}
