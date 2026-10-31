import React, { useState } from 'react';
import { 
  DollarSign, 
  AlertTriangle, 
  Users, 
  PieChart as PieIcon, 
  BarChart2, 
  TrendingUp, 
  CheckCircle2 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell, 
  PieChart, 
  Pie 
} from 'recharts';
import { CostSummary, ItemType } from '../../types';

interface CostTrackerSidebarProps {
  costSummary: CostSummary | null;
  isLoading?: boolean;
}

const CATEGORY_COLORS: Record<ItemType, string> = {
  attraction: '#4f46e5',   // Indigo
  dining: '#ea580c',       // Orange
  accommodation: '#059669',// Emerald
  transport: '#0284c7',    // Sky
  activity: '#7c3aed',     // Purple
};

export const CostTrackerSidebar: React.FC<CostTrackerSidebarProps> = ({
  costSummary,
  isLoading,
}) => {
  const [chartView, setChartView] = useState<'category' | 'days'>('category');

  if (isLoading || !costSummary) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm animate-pulse">
        <div className="h-5 w-32 bg-slate-200 dark:bg-slate-800 rounded mb-4" />
        <div className="h-20 bg-slate-100 dark:bg-slate-800/60 rounded-2xl mb-4" />
        <div className="h-40 bg-slate-100 dark:bg-slate-800/60 rounded-2xl" />
      </div>
    );
  }

  const {
    budget,
    total_cost,
    remaining_budget,
    is_over_budget,
    over_budget_amount,
    per_person_cost,
    travelers_count,
    categories,
    days,
    warning_message,
  } = costSummary;

  const pctUsed = budget > 0 ? Math.min(100, Math.round((total_cost / budget) * 100)) : 0;

  // Prepare chart data
  const categoryChartData = categories.map(c => ({
    name: c.category.charAt(0).toUpperCase() + c.category.slice(1),
    amount: c.amount,
    color: CATEGORY_COLORS[c.category] || '#6366f1',
  }));

  const daysChartData = days.map(d => ({
    name: `Day ${d.day_number}`,
    amount: d.amount,
  }));

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <DollarSign className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
              Cost & Budget Tracker
            </h3>
            <p className="text-[11px] text-slate-500">Live expense breakdown</p>
          </div>
        </div>

        {/* View toggle */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs">
          <button
            onClick={() => setChartView('category')}
            className={`p-1.5 rounded-md transition-colors ${
              chartView === 'category'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Breakdown by Category"
          >
            <PieIcon className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setChartView('days')}
            className={`p-1.5 rounded-md transition-colors ${
              chartView === 'days'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Breakdown by Day"
          >
            <BarChart2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Budget Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/60 dark:from-slate-800/60 dark:to-slate-800/20 border border-slate-200/80 dark:border-slate-800">
        <div className="flex justify-between items-baseline mb-2">
          <div>
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Total Spent</div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
              ${total_cost.toFixed(2)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Total Budget</div>
            <div className="text-sm font-bold text-slate-700 dark:text-slate-300">
              ${budget.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden mt-2">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              is_over_budget ? 'bg-rose-500' : pctUsed > 80 ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${pctUsed}%` }}
          />
        </div>

        <div className="flex justify-between items-center mt-2 text-[11px]">
          <span className="font-semibold text-slate-500">{pctUsed}% of budget</span>
          <span className={`font-bold ${is_over_budget ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {is_over_budget ? `+$${over_budget_amount.toFixed(2)} over` : `$${remaining_budget.toFixed(2)} left`}
          </span>
        </div>
      </div>

      {/* Over budget alert banner */}
      {is_over_budget && (
        <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2.5 text-xs text-rose-800 dark:text-rose-300">
          <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">Budget Alert</div>
            <div className="text-[11px] mt-0.5 leading-relaxed">
              {warning_message || `Itinerary exceeds target by $${over_budget_amount.toFixed(2)}. Suggest locking budget stops or swapping dining.`}
            </div>
          </div>
        </div>
      )}

      {/* Per Person Breakdown (especially relevant for groups / couples) */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-xs">
        <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-300">
          <Users className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>Per person share ({travelers_count} traveler{travelers_count > 1 ? 's' : ''}):</span>
        </div>
        <div className="font-extrabold text-indigo-700 dark:text-indigo-300 text-sm">
          ${per_person_cost.toFixed(2)}
        </div>
      </div>

      {/* Recharts Visualization */}
      <div className="pt-2">
        <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center justify-between">
          <span>{chartView === 'category' ? 'Category Spending' : 'Daily Spending'}</span>
          <span className="text-[10px] text-slate-400">USD ($)</span>
        </div>

        <div className="h-44 w-full">
          {chartView === 'category' ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData} layout="vertical" margin={{ top: 5, right: 10, left: 15, bottom: 5 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={75} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(val: number) => [`$${val.toFixed(2)}`, 'Cost']}
                  contentStyle={{ borderRadius: '8px', fontSize: '11px' }}
                />
                <Bar dataKey="amount" radius={[0, 6, 6, 0]}>
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={daysChartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(val: number) => [`$${val.toFixed(2)}`, 'Day Cost']}
                  contentStyle={{ borderRadius: '8px', fontSize: '11px' }}
                />
                <Bar dataKey="amount" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Category Pills list */}
      <div className="space-y-1.5 pt-1">
        {categories.map((c) => (
          <div key={c.category} className="flex items-center justify-between text-xs py-1 px-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: CATEGORY_COLORS[c.category] || '#6366f1' }}
              />
              <span className="capitalize text-slate-700 dark:text-slate-300 font-medium">
                {c.category} ({c.item_count})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-[11px]">{c.percentage}%</span>
              <span className="font-bold text-slate-900 dark:text-white">${c.amount.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
