import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Users, Plus, Star, Phone, Shield, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import {
  fetchDrivers,
  createDriver,
  updateDriver,
  deleteDriver,
} from '../../store/slices/driverSlice';

export default function DriversPage() {
  const dispatch = useDispatch();
  const { drivers, loading } = useSelector((state) => state.drivers);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    licenseNumber: '',
    licenseType: 'Commercial Heavy',
    experienceYears: 5,
    status: 'available',
  });

  useEffect(() => {
    dispatch(fetchDrivers());
  }, [dispatch]);

  const handleOpenAdd = () => {
    setEditingDriver(null);
    setFormData({
      fullName: '',
      email: '',
      password: '',
      phone: '',
      licenseNumber: '',
      licenseType: 'Commercial Heavy',
      experienceYears: 5,
      status: 'available',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (d) => {
    setEditingDriver(d);
    setFormData({
      fullName: d.fullName,
      email: d.email || '',
      password: '',
      phone: d.phone,
      licenseNumber: d.licenseNumber,
      licenseType: d.licenseType || 'Commercial Heavy',
      experienceYears: d.experienceYears || 1,
      status: d.status,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDriver) {
        await dispatch(updateDriver({ id: editingDriver._id, data: formData })).unwrap();
        toast.success('Driver record updated');
      } else {
        await dispatch(createDriver(formData)).unwrap();
        toast.success('Driver registered and account activated!');
      }
      setModalOpen(false);
      dispatch(fetchDrivers());
    } catch (err) {
      toast.error(err || 'Failed to process driver');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this driver?')) {
      try {
        await dispatch(deleteDriver(id)).unwrap();
        toast.success('Driver removed');
      } catch (err) {
        toast.error(err || 'Failed to delete');
      }
    }
  };

  const columns = [
    {
      header: 'Driver Name',
      render: (d) => {
        const name = d.user?.name || d.fullName || 'Commercial Driver';
        const email = d.user?.email || d.email || '';
        return (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
              {name.charAt(0)}
            </div>
            <div>
              <span className="font-bold text-white block">{name}</span>
              <span className="text-xs text-slate-400">{email}</span>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Commercial License',
      render: (d) => (
        <div>
          <span className="font-mono text-slate-200 block">{d.licenseNumber}</span>
          <span className="text-[10px] text-slate-400">{d.licenseType || 'Heavy Transport'}</span>
        </div>
      ),
    },
    {
      header: 'Phone / Contact',
      render: (d) => (
        <div className="flex items-center gap-1.5 text-slate-300">
          <Phone className="w-3.5 h-3.5 text-slate-500" />
          <span>{d.user?.phone || d.phone || '+1 (555) 723-9912'}</span>
        </div>
      ),
    },
    {
      header: 'Experience & Rating',
      render: (d) => (
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-300">{d.experienceYears || 3} yrs exp</span>
          <span className="flex items-center text-amber-400 text-xs font-bold bg-amber-500/10 px-1.5 py-0.5 rounded">
            <Star className="w-3 h-3 fill-current mr-0.5" />
            {d.rating || 4.8}
          </span>
        </div>
      ),
    },
    {
      header: 'Status',
      render: (d) => <StatusBadge status={d.status} />,
    },
    {
      header: 'Actions',
      className: 'text-right',
      render: (d) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => handleOpenEdit(d)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-750 transition"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(d._id)}
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
            Commercial Driver Directory
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage heavy vehicle operators, certifications, safety ratings, and roster status
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white text-xs font-semibold shadow-lg shadow-brand-500/20 transition"
        >
          <Plus className="w-4 h-4" /> Register Driver
        </button>
      </div>

      <DataTable
        columns={columns}
        data={drivers}
        loading={loading}
        searchPlaceholder="Search drivers by name, license, phone..."
        searchKey="fullName"
      />

      {/* Add / Edit Driver Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingDriver ? 'Edit Driver Information' : 'Onboard New Driver'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Michael Scott"
                className="w-full px-3 py-2 bg-dark-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Email (for Driver Login)
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="driver@tracely.com"
                className="w-full px-3 py-2 bg-dark-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {!editingDriver && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Initial Account Password
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full px-3 py-2 bg-dark-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Commercial License #
              </label>
              <input
                type="text"
                required
                value={formData.licenseNumber}
                onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                placeholder="DL-IND-884920"
                className="w-full px-3 py-2 bg-dark-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Phone Number
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 9876543210"
                className="w-full px-3 py-2 bg-dark-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Experience (Years)
              </label>
              <input
                type="number"
                min="0"
                value={formData.experienceYears}
                onChange={(e) => setFormData({ ...formData, experienceYears: Number(e.target.value) })}
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
                <option value="on_leave">On Leave</option>
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
              {editingDriver ? 'Save Changes' : 'Onboard Driver'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
