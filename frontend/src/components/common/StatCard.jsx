import React from 'react';

export default function StatCard({ title, value, change, changeType = 'positive', icon: Icon, color = 'brand' }) {
  const colorGradients = {
    brand: 'from-brand-500/20 to-brand-600/5 text-brand-400 border-brand-500/20',
    blue: 'from-blue-500/20 to-blue-600/5 text-blue-400 border-blue-500/20',
    emerald: 'from-emerald-500/20 to-emerald-600/5 text-emerald-400 border-emerald-500/20',
    amber: 'from-amber-500/20 to-amber-600/5 text-amber-400 border-amber-500/20',
    purple: 'from-purple-500/20 to-purple-600/5 text-purple-400 border-purple-500/20',
    rose: 'from-rose-500/20 to-rose-600/5 text-rose-400 border-rose-500/20',
  };

  const selectedGradient = colorGradients[color] || colorGradients.brand;

  return (
    <div className="relative overflow-hidden rounded-xl bg-dark-800/80 border border-slate-700/60 p-6 shadow-lg backdrop-blur-md transition-all duration-300 hover:border-slate-600 hover:-translate-y-0.5 group">
      {/* Background soft glow */}
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br ${selectedGradient} blur-2xl opacity-60 group-hover:opacity-100 transition-opacity`} />
      
      <div className="relative flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white">{value}</p>
          {change !== undefined && (
            <div className="mt-2 flex items-center text-xs">
              <span className={`font-semibold ${changeType === 'positive' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {changeType === 'positive' ? '↑' : '↓'} {change}
              </span>
              <span className="ml-1.5 text-slate-400">vs last period</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={`p-3.5 rounded-xl bg-gradient-to-br ${selectedGradient} border border-white/5 shadow-inner`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
}
