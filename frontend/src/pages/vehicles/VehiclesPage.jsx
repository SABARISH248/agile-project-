import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Truck, Plus, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import {
  fetchVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} from '../../store/slices/vehicleSlice';

export default function VehiclesPage() {
  const dispatch = useDispatch();
  const { vehicles, loading } = useSelector((state) => state.vehicles);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [formData, setFormData] = useState({
    plateNumber: '',
    model: '',
    make: '',
    year: new Date().getFullYear(),
    type: 'trailer',
    capacity: { weight: 25000, volume: 80 },
    mileage: 0,
    status: 'available',
  });

  useEffect(() => {
    dispatch(fetchVehicles());
  }, [dispatch]);

  const handleOpenAdd = () => {
    setEditingVehicle(null);
    setFormData({
      plateNumber: '',
      model: '',
      make: '',
      year: new Date().getFullYear(),
      type: 'trailer',
      capacity: { weight: 25000, volume: 80 },
      mileage: 0,
      status: 'available',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (v) => {
    setEditingVehicle(v);
    setFormData({
      plateNumber: v.plateNumber,
      model: v.model,
      make: v.make,
      year: v.year,
      type: v.type,
      capacity: { weight: v.capacity?.weight || 20000, volume: v.capacity?.volume || 60 },
      mileage: v.mileage || 0,
      status: v.status,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingVehicle) {
        await dispatch(updateVehicle({ id: editingVehicle._id, data: formData })).unwrap();
        toast.success('Vehicle updated successfully');
      } else {
        await dispatch(createVehicle(formData)).unwrap();
        toast.success('Vehicle registered successfully');
      }
      setModalOpen(false);
      dispatch(fetchVehicles());
    } catch (err) {
      toast.error(err || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this vehicle from fleet?')) {
      try {
        await dispatch(deleteVehicle(id)).unwrap();
        toast.success('Vehicle removed');
      } catch (err) {
        toast.error(err || 'Failed to delete vehicle');
      }
    }
  };

  const columns = [
    {
      header: 'Plate & Model',
      render: (v) => (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-dark-900 border border-slate-700 text-brand-400">
            <Truck className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-white block">{v.registrationNumber || v.plateNumber}</span>
            <span className="text-xs text-slate-400">{v.make} {v.model} ({v.year})</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Type',
      render: (v) => <span className="capitalize font-medium text-slate-300">{v.vehicleType || v.type}</span>,
    },
    {
      header: 'Payload Capacity',
      render: (v) => (
        <div>
          <span className="text-slate-200 font-semibold block">
            {v.capacityTons ? `${v.capacityTons} Tons (${v.capacityTons * 1000} kg)` : `${v.capacity?.weight?.toLocaleString() || 20000} kg`}
          </span>
          <span className="text-[10px] text-slate-400">{v.fuelType || 'Diesel'} • {v.capacity?.volume || 50} m³</span>
        </div>
      ),
    },
    {
      header: 'Odometer (km)',
      render: (v) => <span className="font-mono text-slate-300">{(v.mileageKm || v.mileage || 0).toLocaleString()} km</span>,
    },
    {
      header: 'Status',
      render: (v) => <StatusBadge status={v.status} />,
    },
    {
      header: 'Actions',
      className: 'text-right',
      render: (v) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => handleOpenEdit(v)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-750 transition"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(v._id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-white tracking-tight">
            Fleet Vehicle Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Maintain truck profiles, capacities, inspection schedules, and availability
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white text-xs font-semibold shadow-lg shadow-brand-500/20 transition"
        >
          <Plus className="w-4 h-4" /> Register New Lorry
        </button>
      </div>

      <DataTable
        columns={columns}
        data={vehicles}
        loading={loading}
        searchPlaceholder="Search by plate, make, model..."
        searchKey="plateNumber"
      />

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingVehicle ? 'Edit Fleet Vehicle' : 'Register New Fleet Truck'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                License Plate Number
              </label>
              <input
                type="text"
                required
                value={formData.plateNumber}
                onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value })}
                placeholder="MH-04-AZ-9988"
                className="w-full px-3 py-2 bg-dark-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Vehicle Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 bg-dark-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
              >
                <option value="trailer">Heavy Trailer</option>
                <option value="container">Container Truck</option>
                <option value="flatbed">Flatbed Lorry</option>
                <option value="tanker">Liquid Tanker</option>
                <option value="tipper">Tipper Truck</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Manufacturer / Make
              </label>
              <input
                type="text"
                required
                value={formData.make}
                onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                placeholder="Volvo / Tata"
                className="w-full px-3 py-2 bg-dark-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Model
              </label>
              <input
                type="text"
                required
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                placeholder="FH16 / Signa"
                className="w-full px-3 py-2 bg-dark-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Year
              </label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-dark-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Max Payload (kg)
              </label>
              <input
                type="number"
                required
                value={formData.capacity.weight}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    capacity: { ...formData.capacity, weight: Number(e.target.value) },
                  })
                }
                className="w-full px-3 py-2 bg-dark-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Volume (m³)
              </label>
              <input
                type="number"
                value={formData.capacity.volume}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    capacity: { ...formData.capacity, volume: Number(e.target.value) },
                  })
                }
                className="w-full px-3 py-2 bg-dark-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 bg-dark-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
              >
                <option value="available">Available</option>
                <option value="on_trip">On Trip</option>
                <option value="maintenance">Maintenance</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
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
              {editingVehicle ? 'Save Changes' : 'Register Vehicle'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
