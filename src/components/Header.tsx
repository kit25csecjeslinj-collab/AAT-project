/**
 * @file Header.tsx
 * @description Top navigation bar with breadcrumbs, quick actions, and database status.
 */

import React from 'react';
import {
  Menu,
  Database,
  Plus,
  Award,
  Download,
  Terminal,
  ShieldCheck,
} from 'lucide-react';
import { NavItemKey } from './Sidebar.tsx';
import { DatabaseStatus, UserSession } from '../types/index.ts';

interface HeaderProps {
  currentTab: NavItemKey;
  onOpenMobile: () => void;
  onOpenDBModal: () => void;
  dbStatus: DatabaseStatus | null;
  currentUser: UserSession | null;
  onQuickAction: (action: 'add-employee' | 'add-review' | 'sql-runner') => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onOpenMobile,
  onOpenDBModal,
  dbStatus,
  currentUser,
  onQuickAction,
}) => {
  const titles: Record<NavItemKey, { title: string; subtitle: string }> = {
    dashboard: { title: 'Executive HR Dashboard', subtitle: 'Real-time performance analytics, KPI aggregates & trends' },
    employees: { title: 'Employee Management', subtitle: 'Manage staff records, departments, designations & statuses' },
    departments: { title: 'Department Overview', subtitle: 'Organizational units, headcounts & department ratings' },
    reviews: { title: 'Performance Reviews', subtitle: '360° quarterly appraisals, 4-tier rating matrix & goals' },
    reports: { title: 'Reports & Analytics', subtitle: 'Department breakdowns, employee rankings & CSV data exports' },
    'viva-hub': { title: 'DBMS Viva & SQL Hub', subtitle: 'Interactive SQL query executor, DDL scripts & schema docs' },
  };

  const { title, subtitle } = titles[currentTab] || { title: 'PerformanceTrack', subtitle: '' };

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
      {/* Left: Mobile hamburger & Page Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              {title}
            </h2>
          </div>
          <p className="text-xs text-slate-500 hidden sm:block">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Right: Quick Actions & Status */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Database Status Button */}
        <button
          onClick={onOpenDBModal}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            dbStatus?.connected
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/70'
              : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100/70'
          }`}
          title="Click to view database connection details and test queries"
        >
          <Database className="w-3.5 h-3.5" />
          <span className="hidden md:inline font-mono">
            {dbStatus?.connected ? 'MySQL 8.0 Live' : 'Demo Mode (Simulated)'}
          </span>
          <span
            className={`w-2 h-2 rounded-full ${
              dbStatus?.connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
            }`}
          />
        </button>

        {/* Quick Action: New Review */}
        <button
          onClick={() => onQuickAction('add-review')}
          className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 transition-colors shadow-2xs"
        >
          <Award className="w-3.5 h-3.5 text-blue-600" />
          <span>New Review</span>
        </button>

        {/* Quick Action: Add Employee */}
        <button
          onClick={() => onQuickAction('add-employee')}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Employee</span>
          <span className="sm:hidden">Add</span>
        </button>

        {/* User Role Badge */}
        {currentUser && (
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-[11px] font-semibold text-slate-600">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>{currentUser.role}</span>
          </div>
        )}
      </div>
    </header>
  );
};
