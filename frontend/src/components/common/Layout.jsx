import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { addNotification, fetchNotifications } from '../../store/slices/notificationSlice';
import { updateLiveLocation } from '../../store/slices/tripSlice';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    // Fetch notifications initially
    if (user) {
      dispatch(fetchNotifications());

      // Initialize Socket.io connection
      const socket = io(import.meta.env.VITE_SOCKET_URL || window.location.origin, {
        transports: ['websocket', 'polling'],
      });

      socket.on('connect', () => {
        // Join user and role specific rooms
        socket.emit('join', { userId: user._id, role: user.role });
      });

      // Listen for push notifications
      socket.on('notification', (data) => {
        toast.custom((t) => (
          <div
            className={`${
              t.visible ? 'animate-enter' : 'animate-leave'
            } max-w-md w-full bg-dark-800 border border-brand-500/40 shadow-2xl rounded-xl pointer-events-auto flex p-4 ring-1 ring-black ring-opacity-5`}
          >
            <div className="flex-1 w-0">
              <p className="text-sm font-semibold text-brand-400">🔔 {data.title}</p>
              <p className="mt-1 text-xs text-slate-300">{data.message}</p>
            </div>
          </div>
        ));
        dispatch(addNotification(data));
      });

      // Listen for trip live location updates
      socket.on('trip_location_update', (data) => {
        dispatch(updateLiveLocation(data));
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [dispatch, user]);

  return (
    <div className="min-h-screen bg-dark-900 text-slate-100 flex flex-col">
      {/* Sidebar navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content wrapper */}
      <div className="lg:pl-64 flex flex-col flex-1 min-h-screen">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
