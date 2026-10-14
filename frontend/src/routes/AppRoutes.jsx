import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ProtectedRoute from './ProtectedRoute';
import Layout from '../components/common/Layout';

// Pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import AdminDashboard from '../pages/dashboard/AdminDashboard';
import ManagerDashboard from '../pages/dashboard/ManagerDashboard';
import DriverDashboard from '../pages/dashboard/DriverDashboard';
import VehiclesPage from '../pages/vehicles/VehiclesPage';
import DriversPage from '../pages/drivers/DriversPage';
import BookingsPage from '../pages/bookings/BookingsPage';
import TripsPage from '../pages/trips/TripsPage';
import TripDetailPage from '../pages/trips/TripDetailPage';
import ExpensesPage from '../pages/expenses/ExpensesPage';
import InvoicesPage from '../pages/invoices/InvoicesPage';
import ReportsPage from '../pages/reports/ReportsPage';
import ProfilePage from '../pages/profile/ProfilePage';

// Dynamic Dashboard component based on role
function RoleBasedDashboard() {
  const { user } = useSelector((state) => state.auth);
  if (user?.role === 'admin') return <AdminDashboard />;
  if (user?.role === 'manager') return <ManagerDashboard />;
  return <DriverDashboard />;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Routes inside Layout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<RoleBasedDashboard />} />
          <Route path="/trips" element={<TripsPage />} />
          <Route path="/trips/:id" element={<TripDetailPage />} />
          <Route path="/expenses" element={<ExpensesPage />} />
          <Route path="/profile" element={<ProfilePage />} />

          {/* Manager & Admin Only Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'manager']} />}>
            <Route path="/vehicles" element={<VehiclesPage />} />
            <Route path="/drivers" element={<DriversPage />} />
            <Route path="/bookings" element={<BookingsPage />} />
            <Route path="/invoices" element={<InvoicesPage />} />
            <Route path="/reports" element={<ReportsPage />} />
          </Route>
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
