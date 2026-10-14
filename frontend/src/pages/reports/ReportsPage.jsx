import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
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
  LineChart,
  Line,
} from 'recharts';
import { BarChart3, TrendingUp, Trophy, Truck, ShieldCheck } from 'lucide-react';
import StatCard from '../../components/common/StatCard';
import { fetchAnalytics } from '../../store/slices/reportSlice';

const COLORS = ['#f97316', '#6366f1', '#10b981', '#f59e0b', '#ec4899'];

export default function ReportsPage() {
  const dispatch = useDispatch();
  const { analytics, loading } = useSelector((state) => state.reports);

  useEffect(() => {
    dispatch(fetchAnalytics());
  }, [dispatch]);

  const topDrivers = analytics?.topDrivers || [
    { name: 'Rajesh Kumar', completedTrips: 18, rating: 4.9 },
    { name: 'Suresh Patel', completedTrips: 14, rating: 4.8 },
    { name: 'Vikram Singh', completedTrips: 11, rating: 4.7 },
  ];

  const expenseBreakdown = analytics?.expenseBreakdown || [
    { name: 'Fuel / Diesel', value: 45000 },
    { name: 'Highway Tolls', value: 12000 },
    { name: 'Maintenance', value: 8500 },
    { name: 'Driver Allowance', value: 6500 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading text-white tracking-tight">
          Logistics Analytics & Business Intelligence
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Deep performance diagnostics, fleet asset efficiency, and driver safety leaderboards
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="On-Time Delivery Rate"
          value="98.2%"
          change="+1.5%"
          changeType="positive"
          icon={TrendingUp}
          color="emerald"
        />
        <StatCard
          title="Average Cost / Ton-KM"
          value="$0.042"
          change="-4.8%"
          changeType="positive"
          icon={BarChart3}
          color="brand"
        />
        <StatCard
          title="Fleet Safety Index"
          value="99.4"
          change="Zero critical faults"
          changeType="positive"
          icon={ShieldCheck}
          color="blue"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense distribution */}
        <div className="bg-dark-800/80 border border-slate-700/60 rounded-xl p-5 shadow-xl backdrop-blur-md flex flex-col">
          <h3 className="text-sm font-semibold text-white">Fleet Operating Expense Allocation</h3>
          <p className="text-xs text-slate-400 mb-2">Cost breakdown by on-road category</p>
          <div className="h-64 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseBreakdown}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={45}
                  paddingAngle={5}
                >
                  {expenseBreakdown.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  formatter={(val) => `$${val.toLocaleString()}`}
                />
                <Legend iconSize={8} wrapperStyle={{ fontSize: '11px', color: '#cbd5e1' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top drivers leaderboard */}
        <div className="bg-dark-800/80 border border-slate-700/60 rounded-xl p-5 shadow-xl backdrop-blur-md">
          <h3 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" /> Driver Performance Leaderboard
          </h3>
          <p className="text-xs text-slate-400 mb-4">Ranked by on-time completion & safety score</p>
          <div className="space-y-3">
            {topDrivers.map((d, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-dark-900/60 border border-slate-700/80 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-brand-400">
                    #{idx + 1}
                  </span>
                  <div>
                    <span className="font-semibold text-white text-xs block">{d.name}</span>
                    <span className="text-[10px] text-slate-400">
                      {d.completedTrips} long-haul deliveries completed
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-amber-400 font-bold text-xs">⭐ {d.rating}</span>
                  <span className="text-[10px] text-emerald-400 block font-semibold">100% On-time</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
