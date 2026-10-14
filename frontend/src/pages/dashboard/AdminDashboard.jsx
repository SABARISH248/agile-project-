import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Truck,
  Users,
  CalendarCheck,
  DollarSign,
  TrendingUp,
  AlertCircle,
  PlusCircle,
  Navigation,
  ArrowUpRight,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import { fetchDashboardStats } from '../../store/slices/reportSlice';
import { fetchTrips } from '../../store/slices/tripSlice';

const PIE_COLORS = ['#f97316', '#6366f1', '#10b981', '#f59e0b', '#ec4899'];

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { dashboard, loading } = useSelector((state) => state.reports);
  const { trips } = useSelector((state) => state.trips);

  useEffect(() => {
    dispatch(fetchDashboardStats());
    dispatch(fetchTrips({ limit: 5 }));
  }, [dispatch]);

  const stats = dashboard?.stats || {};
  const monthlyData = dashboard?.monthlyRevenue || [];
  const vehicleBreakdown = dashboard?.vehicleBreakdown || [];

  return (
    <div className="space-y-6">
      {/* Page Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-white tracking-tight">
            Executive Fleet Overview
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time logistics monitoring, financial performance, and fleet utilization
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/bookings')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white text-xs font-semibold shadow-lg shadow-brand-500/20 transition"
          >
            <PlusCircle className="w-4 h-4" /> New Booking
          </button>
          <button
            onClick={() => navigate('/trips')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-dark-800 border border-slate-700 hover:bg-slate-750 text-slate-200 text-xs font-semibold transition"
          >
            <Navigation className="w-4 h-4 text-brand-400" /> Live Tracking
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Fleet"
          value={stats.activeVehicles ?? stats.totalVehicles ?? 5}
          change="+2 vehicles"
          changeType="positive"
          icon={Truck}
          color="brand"
        />
        <StatCard
          title="Live In-Transit Trips"
          value={stats.activeTrips ?? 3}
          change="+15%"
          changeType="positive"
          icon={Navigation}
          color="blue"
        />
        <StatCard
          title="Total Gross Revenue"
          value={`$${(stats.totalRevenue || 124500).toLocaleString()}`}
          change="+18.4%"
          changeType="positive"
          icon={DollarSign}
          color="emerald"
        />
        <StatCard
          title="Active Bookings"
          value={stats.activeBookings ?? 4}
          change="+3 new"
          changeType="positive"
          icon={CalendarCheck}
          color="amber"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue & Expenses Trend */}
        <div className="lg:col-span-2 bg-dark-800/80 border border-slate-700/60 rounded-xl p-5 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Revenue & Operating Expenses Trend</h3>
              <p className="text-xs text-slate-400">Monthly trajectory across fleet operations</p>
            </div>
            <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
              Net Margin +32%
            </span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={
                  monthlyData.length > 0
                    ? monthlyData
                    : [
                        { month: 'Jan', revenue: 42000, expenses: 26000 },
                        { month: 'Feb', revenue: 56000, expenses: 31000 },
                        { month: 'Mar', revenue: 68000, expenses: 38000 },
                        { month: 'Apr', revenue: 85000, expenses: 44000 },
                        { month: 'May', revenue: 99000, expenses: 51000 },
                        { month: 'Jun', revenue: 124500, expenses: 62000 },
                      ]
                }
              >
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `$${val / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  itemStyle={{ fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" name="Revenue ($)" />
                <Area type="monotone" dataKey="expenses" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorExp)" name="Expenses ($)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fleet Distribution */}
        <div className="bg-dark-800/80 border border-slate-700/60 rounded-xl p-5 shadow-xl backdrop-blur-md flex flex-col">
          <h3 className="text-sm font-semibold text-white">Fleet by Vehicle Type</h3>
          <p className="text-xs text-slate-400 mb-2">Truck allocation across categories</p>
          <div className="h-64 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={
                    vehicleBreakdown.length > 0
                      ? vehicleBreakdown
                      : [
                          { name: 'Trailer', count: 2 },
                          { name: 'Container', count: 1 },
                          { name: 'Flatbed', count: 1 },
                          { name: 'Tanker', count: 1 },
                        ]
                  }
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                >
                  {(vehicleBreakdown.length > 0 ? vehicleBreakdown : [1, 2, 3, 4]).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                />
                <Legend iconSize={8} wrapperStyle={{ fontSize: '11px', color: '#cbd5e1' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Active Live Trips Quick Table */}
      <div className="bg-dark-800/80 border border-slate-700/60 rounded-xl p-5 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Live Dispatched Fleet</h3>
            <p className="text-xs text-slate-400">Current active trips and their immediate status</p>
          </div>
          <button
            onClick={() => navigate('/trips')}
            className="text-xs text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1"
          >
            View all trips <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-dark-900/60 text-[10px] uppercase text-slate-400 font-semibold border-b border-slate-700/60">
              <tr>
                <th className="px-4 py-3">Trip ID</th>
                <th className="px-4 py-3">Vehicle / Truck</th>
                <th className="px-4 py-3">Driver</th>
                <th className="px-4 py-3">Route (Origin → Destination)</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/40">
              {trips.slice(0, 4).map((t) => (
                <tr key={t._id} className="hover:bg-slate-800/40 transition">
                  <td className="px-4 py-3 font-mono font-medium text-brand-400">{t.tripNumber}</td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-white">{t.vehicle?.plateNumber || 'Truck'}</div>
                    <div className="text-[10px] text-slate-400">{t.vehicle?.model}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-200">{t.driver?.fullName || 'Assigned Driver'}</td>
                  <td className="px-4 py-3">
                    <span className="text-slate-300">{t.booking?.pickupLocation?.city || 'Origin'}</span>
                    <span className="text-slate-500 mx-1.5">→</span>
                    <span className="text-slate-300">{t.booking?.dropLocation?.city || 'Dest'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={t.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => navigate(`/trips/${t._id}`)}
                      className="px-2.5 py-1 rounded-lg bg-brand-500/10 text-brand-400 hover:bg-brand-500/20 font-semibold text-[11px] transition"
                    >
                      Track Live
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
