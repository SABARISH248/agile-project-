import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import vehicleReducer from './slices/vehicleSlice';
import driverReducer from './slices/driverSlice';
import bookingReducer from './slices/bookingSlice';
import tripReducer from './slices/tripSlice';
import expenseReducer from './slices/expenseSlice';
import invoiceReducer from './slices/invoiceSlice';
import reportReducer from './slices/reportSlice';
import notificationReducer from './slices/notificationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    vehicles: vehicleReducer,
    drivers: driverReducer,
    bookings: bookingReducer,
    trips: tripReducer,
    expenses: expenseReducer,
    invoices: invoiceReducer,
    reports: reportReducer,
    notifications: notificationReducer,
  },
});

export default store;
