import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  LayoutDashboard,
  Truck,
  Users,
  CalendarCheck,
  Navigation,
  Receipt,
  FileText,
  BarChart3,
  User,
  X,
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useSelector((state) => state.auth);
  const role = user?.role || 'driver';

  const navItems = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard',
      roles: ['admin', 'manager', 'driver'],
    },
    {
      title: 'Fleet Vehicles',
      icon: Truck,
      path: '/vehicles',
      roles: ['admin', 'manager'],
    },
    {
      title: 'Drivers',
      icon: Users,
      path: '/drivers',
      roles: ['admin', 'manager'],
    },
    {
      title: 'Shipment Bookings',
      icon: CalendarCheck,
      path: '/bookings',
      roles: ['admin', 'manager'],
    },
    {
      title: role === 'driver' ? 'My Trips' : 'Trip Tracking',
      icon: Navigation,
      path: '/trips',
      roles: ['admin', 'manager', 'driver'],
    },
    {
      title: 'Trip Expenses',
      icon: Receipt,
      path: '/expenses',
      roles: ['admin', 'manager', 'driver'],
    },
    {
      title: 'Invoices & Billing',
      icon: FileText,
      path: '/invoices',
      roles: ['admin', 'manager'],
    },
    {
      title: 'Analytics & Reports',
      icon: BarChart3,
      path: '/reports',
      roles: ['admin', 'manager'],
    },
    {
      title: 'Profile & Settings',
      icon: User,
      path: '/profile',
      roles: ['admin', 'manager', 'driver'],
    },
  ];

  const allowedNav = navItems.filter((item) => item.roles.includes(role));

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar sidebar element */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-dark-900 border-r border-slate-700/60 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-700/60 bg-dark-900/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-brand-500/20 text-white font-bold text-lg">
              🚚
            </div>
            <div>
              <span className="font-heading font-extrabold text-white text-base tracking-tight block">
                TRACELY
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block -mt-1">
                Lorry Logistics
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Navigation Menu
          </div>
          {allowedNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => onClose()}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group ${
                    isActive
                      ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-lg shadow-brand-500/25'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-dark-800/80'
                  }`
                }
              >
                <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                <span>{item.title}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Current user badge at bottom */}
        <div className="p-4 border-t border-slate-700/60 bg-dark-950/40">
          <div className="flex items-center gap-3 px-2 py-1.5">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-brand-400">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-slate-400 capitalize">{user?.role} Portal</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
