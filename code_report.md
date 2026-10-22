# 📚 Code‑Only Report for Agile Project

---
## Backend

### `backend/src/app.js`
```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');

const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Route imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const driverRoutes = require('./routes/driverRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const tripRoutes = require('./routes/tripRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const reportRoutes = require('./routes/reportRoutes');
const maintenanceRoutes = require('./routes/maintenanceRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();

// Security headers
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// CORS – allow frontend client
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })
);

// Rate limiting – protect against brute‑force
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  message: { success: false, message: 'Too many requests from this IP. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/api/health', (req, res) =>
  res.json({
    success: true,
    message: 'Tracely TMS API is operational',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  })
);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/notifications', notificationRoutes);

// Error middleware (must be last)
app.use(notFound);
app.use(errorHandler);

module.exports = app;
```

### `backend/src/server.js`
```javascript
const http = require('http');
const app = require('./app');
const mongoose = require('mongoose');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

// Connect to DB then start server
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('✅ MongoDB connected');
    const server = http.createServer(app);
    server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('❌ DB connection error:', err);
    process.exit(1);
  });
```

### `backend/src/routes/tripRoutes.js`
```javascript
const express = require('express');
const router = express.Router();
const {
  createTrip,
  getTrips,
  getTripById,
  updateTripStatus,
  updateTripLocation,
  uploadProofOfDelivery,
} = require('../controllers/tripController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(protect);

router.route('/')
  .get(getTrips)
  .post(authorize('admin', 'manager'), createTrip);

router.route('/:id')
  .get(getTripById);

router.patch('/:id/status', updateTripStatus);
router.patch('/:id/location', updateTripLocation);
router.post('/:id/proof', upload.single('podFile'), uploadProofOfDelivery);

module.exports = router;
```

### `backend/src/controllers/tripController.js`
*(Full file is very long – truncated for brevity; the complete source lives in the repository)*
```javascript
// ... (see repository for the full 400‑line implementation) ...
```

---
## Frontend (Vite + React)

### `frontend/package.json`
```json
{
  "name": "tracely-frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
  },
  "dependencies": {
    "@reduxjs/toolkit": "^2.5.0",
    "axios": "^1.7.9",
    "leaflet": "^1.9.4",
    "lucide-react": "^0.474.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-hot-toast": "^2.5.1",
    "react-leaflet": "^4.2.1",
    "react-redux": "^9.2.0",
    "react-router-dom": "^7.1.5",
    "recharts": "^2.15.0",
    "socket.io-client": "^4.8.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.18",
    "@types/react-dom": "^18.3.5",
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.5.1",
    "tailwindcss": "^3.4.17",
    "vite": "^6.1.0"
  }
}
```

### `frontend/vite.config.js`
```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
```

---
## Vercel Configuration

### `vercel.json`
```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "frontend/dist" }
    },
    {
      "src": "api/**/*.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/api/index.js" },
    { "src": "/(.*)", "dest": "/frontend/dist/$1" }
  ]
}
```

---
## Entry point for Vercel Serverless Function

### `api/index.js`
```javascript
// Vercel Serverless Function entry point
// This file simply exports the Express app defined in the backend.
const app = require('./../backend/src/app');
module.exports = app;
```

---
*All other source files (models, more controllers, Redux slices, CSS, etc.) are present in the repository under `backend/src/` and `frontend/`. You can explore them directly in the project directory.*
