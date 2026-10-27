/**
 * @file ReportsPage.tsx
 * @description Advanced HR Analytics & Reports with SQL aggregations, employee rankings, and CSV export.
 */

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  TrendingUp,
  Award,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Star,
  Users,
  Layers,
  FileText,
} from 'lucide-react';
import { Department } from '../types/index.ts';
import { api } from '../services/api.ts';
import { StarRating } from '../components/StarRating.tsx';

interface ReportsPageProps {
  departments: Department[];
  onSelectEmployee: (id: number) => void;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({
  departments,
  onSelectEmployee,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'rankings' | 'departments' | 'trends' | 'status'>('rankings');
  const [rankings, setRankings] = useState<any[]>([]);
  const [trends, setTrends] = useState<any[]>([]);
  const [deptStats, setDeptStats] = useState<any[]>([]);
  const [statusStats, setStatusStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllReportData = async () => {
      setIsLoading(true);
      try {
        const [rankRes, trendRes, deptRes, statusRes] = await Promise.all([
          api.getEmployeeRankingsReport(),
          api.getPerformanceTrendsReport(),
          api.getDepartmentPerformanceReport(),
          api.getReviewStatusReport(),
        ]);

        setRankings(rankRes.data);
        setTrends(trendRes.data);
        setDeptStats(deptRes.data);
        setStatusStats(statusRes.data);
      } catch (err: any) {
        onShowToast('error', 'Report Load Failure', err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllReportData();
  }, []);

  const handleExport = (endpoint: string, filename: string) => {
    onShowToast('info', 'Export Started', `Downloading ${filename}...`);
    window.location.href = `/api/reports/export/${endpoint}`;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* CSV Export & Actions Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Executive HR Analytics & Data Exports
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Database aggregations via AVG(), COUNT(), GROUP BY, and SQL Window Functions
          </p>
        </div>

        {/* CSV Export Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleExport('employees', 'employees_performance_report.csv')}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>Export Employees CSV</span>
          </button>
          <button
            onClick={() => handleExport('reviews', 'performance_reviews_export.csv')}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-teal-600" />
            <span>Export Reviews CSV</span>
          </button>
          <button
            onClick={() => handleExport('departments', 'department_summary.csv')}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Department Rollup CSV</span>
          </button>
        </div>
      </div>

      {/* Reports Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-semibold pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('rankings')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'rankings'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Employee Performance Rankings</span>
        </button>

        <button
          onClick={() => setActiveTab('departments')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'departments'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Department Performance Matrix</span>
        </button>

        <button
          onClick={() => setActiveTab('trends')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'trends'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Quarterly Trends & Pillar Comparison</span>
        </button>

        <button
          onClick={() => setActiveTab('status')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'status'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Appraisal Completion Status</span>
        </button>
      </div>

      {/* Tab 1: Employee Rankings */}
      {activeTab === 'rankings' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Official Company-Wide Performance Rankings
              </h4>
              <p className="text-xs text-slate-500">
                Aggregated with SQL DENSE_RANK() OVER (ORDER BY AVG(overall_rating) DESC)
              </p>
            </div>
            <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
              {rankings.length} Ranked Employees
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 text-center">Rank</th>
                  <th className="py-3.5 px-4">Employee</th>
                  <th className="py-3.5 px-4">Department & Role</th>
                  <th className="py-3.5 px-4 text-center">Reviews</th>
                  <th className="py-3.5 px-4">Tech</th>
                  <th className="py-3.5 px-4">Comm</th>
                  <th className="py-3.5 px-4">Team</th>
                  <th className="py-3.5 px-4">Prod</th>
                  <th className="py-3.5 px-4">Overall Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {rankings.map((emp, index) => {
                  const medal =
                    index === 0
                      ? '🥇'
                      : index === 1
                      ? '🥈'
                      : index === 2
                      ? '🥉'
                      : `#${index + 1}`;

                  return (
                    <tr
                      key={emp.employee_id}
                      onClick={() => onSelectEmployee(emp.employee_id)}
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4 text-center font-bold font-mono text-sm">
                        {medal}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {emp.full_name}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">{emp.designation}</div>
                        <div className="text-[11px] text-slate-500">{emp.department_name}</div>
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono font-medium text-slate-600">
                        {emp.total_reviews}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-blue-700 font-semibold">
                        {emp.avg_tech.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-teal-700 font-semibold">
                        {emp.avg_comm.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-indigo-700 font-semibold">
                        {emp.avg_team.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-emerald-700 font-semibold">
                        {emp.avg_prod.toFixed(2)}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-bold font-mono text-slate-900 text-sm">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{emp.average_rating.toFixed(2)}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Department Performance */}
      {activeTab === 'departments' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h4 className="text-sm font-bold text-slate-900">
              Department Aggregations (SQL LEFT JOIN & AVG)
            </h4>
            <p className="text-xs text-slate-500">
              Comparative analysis across organizational business units
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Department Name</th>
                  <th className="py-3.5 px-4 text-center">Total Staff</th>
                  <th className="py-3.5 px-4 text-center">Active Staff</th>
                  <th className="py-3.5 px-4">Average Rating</th>
                  <th className="py-3.5 px-4">Performance Index Bar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {deptStats.map((dept) => {
                  const avg = dept.avg_rating ?? 0;
                  const pct = (avg / 5.0) * 100;
                  return (
                    <tr key={dept.department_id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {dept.department_name}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-medium">
                        {dept.employee_count ?? 0}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-medium text-emerald-600">
                        {dept.active_employee_count ?? dept.employee_count ?? 0}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-bold font-mono text-slate-900">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{avg > 0 ? avg.toFixed(2) : 'No reviews'}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="w-full max-w-xs bg-slate-100 h-2.5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-linear-to-r from-blue-600 to-teal-500 rounded-full"
                            style={{ width: `${avg > 0 ? pct : 0}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Quarterly Trends */}
      {activeTab === 'trends' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-6">
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Quarterly Evaluation Cycle Metrics
            </h4>
            <p className="text-xs text-slate-500">
              Aggregated monthly trends and multi-dimensional pillar evolution
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {trends.map((t, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">{t.month_label}</span>
                  <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                    {t.reviews_evaluated} reviews
                  </span>
                </div>
                <div className="text-2xl font-black font-mono text-slate-900">
                  {t.avg_overall_rating.toFixed(2)}
                  <span className="text-xs font-normal text-slate-500 ml-1">/ 5.0</span>
                </div>
                <div className="pt-2 border-t border-slate-200/60 grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-600">
                  <div>Tech: <strong>{t.avg_technical.toFixed(2)}</strong></div>
                  <div>Prod: <strong>{t.avg_productivity.toFixed(2)}</strong></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Review Completion Status */}
      {activeTab === 'status' && statusStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Completed Reviews</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-3xl font-black font-mono text-emerald-700">
              {statusStats.Completed}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Finalized with comments and ratings
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">In Progress</span>
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-3xl font-black font-mono text-blue-700">
              {statusStats['In Progress']}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Currently drafted by assigned reviewers
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Pending Appraisals</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-3xl font-black font-mono text-amber-700">
              {statusStats.Pending}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Scheduled for current quarterly cycle
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
