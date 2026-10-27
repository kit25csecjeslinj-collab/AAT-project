/**
 * @file DashboardPage.tsx
 * @description Main HR Analytics Dashboard with SQL-aggregated KPIs, trend charts, and top performers.
 */

import React from 'react';
import {
  Users,
  UserCheck,
  Award,
  CheckCircle2,
  Clock,
  TrendingUp,
  Building2,
  ArrowUpRight,
  ExternalLink,
  ChevronRight,
  Star,
  Plus,
  FileSpreadsheet,
} from 'lucide-react';
import { DashboardData, PerformanceReview } from '../types/index.ts';
import { StarRating } from '../components/StarRating.tsx';

interface DashboardPageProps {
  data: DashboardData | null;
  isLoading: boolean;
  onNavigate: (tab: any, params?: any) => void;
  onAddEmployee: () => void;
  onAddReview: () => void;
  onSelectEmployee: (empId: number) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  data,
  isLoading,
  onNavigate,
  onAddEmployee,
  onAddReview,
  onSelectEmployee,
}) => {
  if (isLoading || !data) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-200/70 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-80 bg-slate-200/70 rounded-2xl lg:col-span-2" />
          <div className="h-80 bg-slate-200/70 rounded-2xl" />
        </div>
      </div>
    );
  }

  const { kpi, trends, deptSummary, topPerformers, recentReviews } = data;

  // Max value for monthly trends chart scaling
  const maxMonthlyScore = 5.0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* 1. Six Executive KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Card 1: Total Employees */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Staff</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {kpi.total_employees}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>Active: <strong className="text-emerald-600">{kpi.active_employees}</strong></span>
            <span>Inactive: <strong className="text-slate-400">{kpi.inactive_employees}</strong></span>
          </div>
        </div>

        {/* Card 2: Active Employees */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Staff</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {kpi.active_employees}
          </div>
          <div className="text-[11px] text-emerald-600 mt-1 font-medium">
            {kpi.total_employees > 0
              ? `${Math.round((kpi.active_employees / kpi.total_employees) * 100)}% retention`
              : '100% active'}
          </div>
        </div>

        {/* Card 3: Average Rating */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Rating</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <Star className="w-4 h-4 fill-amber-500" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {kpi.avg_rating.toFixed(2)}
          </div>
          <div className="mt-1">
            <StarRating rating={kpi.avg_rating} size="sm" showNumber={false} />
          </div>
        </div>

        {/* Card 4: Reviews Completed */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Completed</span>
            <div className="p-1.5 rounded-lg bg-teal-50 text-teal-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {kpi.reviews_completed}
          </div>
          <div className="text-[11px] text-teal-700 mt-1 font-medium">
            Finalized reviews
          </div>
        </div>

        {/* Card 5: Reviews Pending */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {kpi.reviews_pending}
          </div>
          <div className="text-[11px] text-amber-600 mt-1 font-medium">
            Awaiting evaluation
          </div>
        </div>

        {/* Card 6: Top Performers */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Top Talent</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {kpi.top_performers_count}
          </div>
          <div className="text-[11px] text-indigo-600 mt-1 font-medium">
            Score ≥ 4.50 / 5.0
          </div>
        </div>
      </div>

      {/* 2. Visual Charts Row: Monthly Trend & Department Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Performance Trend Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs lg:col-span-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                Monthly Performance Trends
              </h3>
              <p className="text-xs text-slate-500">
                SQL aggregation: AVG(overall_rating) grouped by evaluation cycle
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> Overall Rating
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500" /> Technical Score
              </span>
            </div>
          </div>

          {/* Bar / Column Chart */}
          <div className="h-64 flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b border-slate-100">
            {trends.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                No completed reviews to render monthly trend
              </div>
            ) : (
              trends.map((item, index) => {
                const heightPercent = Math.min(100, (item.avg_overall_rating / maxMonthlyScore) * 100);
                const techHeight = Math.min(100, (item.avg_technical / maxMonthlyScore) * 100);
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2 group relative">
                    {/* Tooltip on Hover */}
                    <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[11px] py-1 px-2.5 rounded-lg pointer-events-none whitespace-nowrap shadow-lg z-10">
                      <div>Overall: <strong>{item.avg_overall_rating}</strong> / 5.0</div>
                      <div>Tech: {item.avg_technical} | Reviews: {item.reviews_evaluated}</div>
                    </div>

                    <div className="w-full max-w-[48px] flex items-end justify-center gap-1.5 h-48">
                      {/* Overall bar */}
                      <div
                        className="w-1/2 bg-blue-600 rounded-t-lg transition-all duration-300 group-hover:bg-blue-700"
                        style={{ height: `${heightPercent}%` }}
                      />
                      {/* Tech bar */}
                      <div
                        className="w-1/2 bg-teal-400 rounded-t-lg transition-all duration-300 group-hover:bg-teal-500"
                        style={{ height: `${techHeight}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-medium text-slate-600 text-center truncate w-full">
                      {item.month_label}
                    </span>
                  </div>
                );
              })
            )}
          </div>
          <div className="flex justify-between items-center pt-3 text-[11px] text-slate-400">
            <span>Rating Scale: 1.00 (Min) – 5.00 (Max)</span>
            <span>Query: SELECT DATE_FORMAT(...), AVG(...) GROUP BY month</span>
          </div>
        </div>

        {/* Department-Wise Comparison */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-teal-600" />
                  Department Averages
                </h3>
                <p className="text-xs text-slate-500">
                  Calculated from recorded reviews
                </p>
              </div>
              <button
                onClick={() => onNavigate('departments')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center"
              >
                View all <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3.5 pt-2">
              {deptSummary.slice(0, 5).map((dept) => {
                const percentage = Math.min(100, (dept.avg_rating / 5.0) * 100);
                return (
                  <div key={dept.department_id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800 truncate">
                        {dept.department_name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 text-[11px]">
                          {dept.total_employees} staff
                        </span>
                        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">
                          {dept.avg_rating > 0 ? dept.avg_rating.toFixed(2) : 'N/A'}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          dept.avg_rating >= 4.5
                            ? 'bg-emerald-500'
                            : dept.avg_rating >= 4.0
                            ? 'bg-blue-500'
                            : dept.avg_rating >= 3.0
                            ? 'bg-teal-500'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${dept.avg_rating > 0 ? percentage : 5}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4">
            <button
              onClick={() => onNavigate('reports')}
              className="w-full py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors text-center block"
            >
              Analyze Full Department Breakdown & Trends →
            </button>
          </div>
        </div>
      </div>

      {/* 3. Top Performers & Recent Reviews Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top 5 Performers Leaderboard */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                Top Performers Leaderboard
              </h3>
              <p className="text-xs text-slate-500">
                SQL DENSE_RANK() by average review score
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {topPerformers.map((emp, index) => {
              const rankColor =
                index === 0
                  ? 'bg-amber-100 text-amber-700 border-amber-300'
                  : index === 1
                  ? 'bg-slate-200 text-slate-700 border-slate-300'
                  : index === 2
                  ? 'bg-amber-800/10 text-amber-900 border-amber-800/20'
                  : 'bg-slate-50 text-slate-600 border-slate-200';

              return (
                <div
                  key={emp.employee_id}
                  onClick={() => onSelectEmployee(emp.employee_id)}
                  className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/80 px-2 -mx-2 rounded-xl transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs border shrink-0 ${rankColor}`}
                    >
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                        {emp.full_name}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {emp.designation} • {emp.department_name}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold font-mono text-slate-900">
                      {emp.average_rating.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {emp.total_completed_reviews} reviews
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => onNavigate('employees')}
            className="w-full mt-4 py-2 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50/60 rounded-xl transition-colors text-center block border border-transparent hover:border-blue-100"
          >
            View All Employees & Full Rankings →
          </button>
        </div>

        {/* Recent Performance Reviews Table */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-600" />
                Recent Performance Appraisals
              </h3>
              <p className="text-xs text-slate-500">
                Latest 6 evaluations submitted to the database
              </p>
            </div>
            <button
              onClick={() => onNavigate('reviews')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center"
            >
              All reviews <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-2.5">Employee</th>
                  <th className="pb-2.5">Department</th>
                  <th className="pb-2.5">Cycle</th>
                  <th className="pb-2.5">Rating</th>
                  <th className="pb-2.5">Status</th>
                  <th className="pb-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {recentReviews.map((rev) => (
                  <tr key={rev.review_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 font-semibold text-slate-900">
                      <div>{rev.employee_name}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{rev.designation}</div>
                    </td>
                    <td className="py-3 text-slate-600">
                      {rev.department_name}
                    </td>
                    <td className="py-3 font-mono text-[11px] text-slate-500">
                      {rev.review_period_end}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-1.5 font-bold font-mono text-slate-900">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{rev.overall_rating.toFixed(2)}</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                          rev.review_status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : rev.review_status === 'In Progress'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {rev.review_status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => onNavigate('reviews')}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 p-1"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 4. Quick Action Shortcuts Banner */}
      <div className="bg-linear-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1 text-center md:text-left">
          <h4 className="text-base font-bold text-white flex items-center justify-center md:justify-start gap-2">
            <span>Database Operations & Administration</span>
            <span className="text-[10px] bg-blue-500/30 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded-full font-semibold">
              MySQL 8.0 DDL & DML
            </span>
          </h4>
          <p className="text-xs text-slate-300 max-w-xl">
            Insert new employee entities, record multi-dimensional reviews, or inspect the underlying SQL schema and triggers.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap justify-center">
          <button
            onClick={onAddEmployee}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 shadow-md transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-blue-600" />
            Add Employee
          </button>
          <button
            onClick={onAddReview}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-colors flex items-center gap-1.5"
          >
            <Award className="w-4 h-4" />
            Create Review
          </button>
          <button
            onClick={() => onNavigate('viva-hub')}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-teal-300 bg-teal-950/60 border border-teal-700/60 hover:bg-teal-900/60 transition-colors flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4" />
            SQL Viva Runner
          </button>
        </div>
      </div>
    </div>
  );
};
