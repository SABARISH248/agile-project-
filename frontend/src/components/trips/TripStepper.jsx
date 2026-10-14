import React from 'react';
import { CheckCircle2, Clock, Truck, Package, Flag } from 'lucide-react';

const steps = [
  { key: 'booked', label: 'Booked', icon: Clock },
  { key: 'loading', label: 'Loading', icon: Package },
  { key: 'dispatched', label: 'Dispatched', icon: Truck },
  { key: 'in_transit', label: 'In Transit', icon: Truck },
  { key: 'unloading', label: 'Unloading', icon: Package },
  { key: 'delivered', label: 'Delivered', icon: Flag },
];

export default function TripStepper({ currentStatus = 'booked', timeline = [] }) {
  const currentIndex = steps.findIndex((s) => s.key === currentStatus.toLowerCase());

  const getTimelineDate = (statusKey) => {
    const entry = timeline.find((t) => t.status === statusKey);
    if (!entry) return null;
    return new Date(entry.timestamp).toLocaleTimeString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="w-full py-6">
      <div className="relative flex items-center justify-between">
        {/* Background connector line */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-800 -translate-y-1/2 z-0" />
        {/* Active colored line */}
        <div
          className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-brand-600 to-indigo-500 -translate-y-1/2 z-0 transition-all duration-500"
          style={{
            width: `${Math.max(0, (currentIndex / (steps.length - 1)) * 100)}%`,
          }}
        />

        {steps.map((step, idx) => {
          const isPassed = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const time = getTimelineDate(step.key);

          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center group">
              {/* Step Circle */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 border-2 ${
                  isCurrent
                    ? 'bg-brand-600 border-brand-400 text-white shadow-lg shadow-brand-500/50 scale-110 ring-4 ring-brand-500/20'
                    : isPassed
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                    : 'bg-dark-900 border-slate-700 text-slate-500'
                }`}
              >
                {isPassed ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>

              {/* Step Label */}
              <div className="mt-2 text-center">
                <p
                  className={`text-xs font-semibold whitespace-nowrap ${
                    isCurrent
                      ? 'text-brand-400 font-bold'
                      : isPassed
                      ? 'text-slate-200'
                      : 'text-slate-500'
                  }`}
                >
                  {step.label}
                </p>
                {time && (
                  <p className="text-[10px] text-slate-400 whitespace-nowrap mt-0.5">
                    {time}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
