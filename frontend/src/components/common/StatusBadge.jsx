import React from 'react';

const statusConfig = {
  // Vehicle / Driver status
  available: { label: 'Available', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  on_trip: { label: 'On Trip', color: 'bg-brand-500/10 text-brand-400 border-brand-500/30' },
  maintenance: { label: 'Maintenance', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
  inactive: { label: 'Inactive', color: 'bg-slate-500/10 text-slate-400 border-slate-500/30' },
  on_leave: { label: 'On Leave', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },

  // Booking status
  draft: { label: 'Draft', color: 'bg-slate-500/10 text-slate-400 border-slate-500/30' },
  confirmed: { label: 'Confirmed', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
  assigned: { label: 'Assigned', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' },
  in_progress: { label: 'In Progress', color: 'bg-brand-500/10 text-brand-400 border-brand-500/30' },
  completed: { label: 'Completed', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  cancelled: { label: 'Cancelled', color: 'bg-rose-500/10 text-rose-400 border-rose-500/30' },

  // Trip lifecycle
  booked: { label: 'Booked', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
  loading: { label: 'Loading', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
  dispatched: { label: 'Dispatched', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' },
  in_transit: { label: 'In Transit', color: 'bg-brand-500/10 text-brand-400 border-brand-500/30 animate-pulse' },
  unloading: { label: 'Unloading', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' },
  delivered: { label: 'Delivered', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },

  // Financial / approval
  pending: { label: 'Pending', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
  approved: { label: 'Approved', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  rejected: { label: 'Rejected', color: 'bg-rose-500/10 text-rose-400 border-rose-500/30' },
  paid: { label: 'Paid', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  unpaid: { label: 'Unpaid', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
  partially_paid: { label: 'Partial', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' },
  overdue: { label: 'Overdue', color: 'bg-rose-500/10 text-rose-400 border-rose-500/30' },
};

export default function StatusBadge({ status, className = '' }) {
  const norm = (status || '').toLowerCase().replace(/\s+/g, '_');
  const cfg = statusConfig[norm] || {
    label: (status || 'Unknown').replace('_', ' '),
    color: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${cfg.color} ${className}`}
    >
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-current opacity-80" />
      {cfg.label}
    </span>
  );
}
