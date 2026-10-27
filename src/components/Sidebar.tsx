/**
 * @file Sidebar.tsx
 * @description Enterprise dark navy sidebar navigation with college project details.
 */

import React from 'react';
import {
  LayoutDashboard,
  Users,
  Building2,
  Award,
  BarChart3,
  Terminal,
  LogOut,
  X,
  Sparkles,
  GraduationCap,
} from 'lucide-react';
import { UserSession } from '../types/index.ts';

export type NavItemKey =
  | 'dashboard'
  | 'employees'
  | 'departments'
  | 'reviews'
  | 'reports'
  | 'viva-hub';

interface SidebarProps {
  currentTab: NavItemKey;
  onSelectTab: (tab: NavItemKey) => void;
  currentUser: UserSession | null;
  onLogout: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenDBModal: () => void;
  isLiveMySQL: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  onLogout,
  isMobileOpen,
  onCloseMobile,
  onOpenDBModal,
  isLiveMySQL,
}) => {
  const navItems = [
    { key: 'dashboard' as NavItemKey, label: 'Dashboard', icon: LayoutDashboard },
    { key: 'employees' as NavItemKey, label: 'Employees', icon: Users },
    { key: 'departments' as NavItemKey, label: 'Departments', icon: Building2 },
    { key: 'reviews' as NavItemKey, label: 'Performance Reviews', icon: Award },
    { key: 'reports' as NavItemKey, label: 'Reports & Analytics', icon: BarChart3 },
    { key: 'viva-hub' as NavItemKey, label: 'SQL & Viva Hub', icon: Terminal, badge: 'DBMS AAT' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div>
          <div className="h-16 px-5 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-linear-to-br from-blue-500 to-teal-400 flex items-center justify-center text-white shadow-md shadow-blue-500/20 font-black text-lg">
                P
              </div>
              <div>
                <h1 className="text-base font-extrabold text-white tracking-tight leading-tight">
                  PerformanceTrack
                </h1>
                <p className="text-[11px] font-medium text-slate-400">
                  Employee Performance Management
                </p>
              </div>
            </div>
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Database Mode Chip */}
          <div className="px-4 pt-4">
            <button
              onClick={onOpenDBModal}
              className={`w-full px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between border transition-all ${
                isLiveMySQL
                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60 hover:bg-emerald-950/70'
                  : 'bg-amber-950/40 text-amber-300 border-amber-800/60 hover:bg-amber-950/70'
              }`}
            >
              <span className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isLiveMySQL ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                  }`}
                />
                {isLiveMySQL ? 'MySQL 8.0 Live' : 'Demo Mode (Simulated)'}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-300">
                Inspect
              </span>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Main Menu
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => {
                    onSelectTab(item.key);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Card & Project Info Footer */}
        <div className="p-3 border-t border-slate-800/80 space-y-3">
          {/* User Session Info */}
          {currentUser && (
            <div className="p-2.5 rounded-xl bg-slate-800/70 border border-slate-700/50 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 font-bold text-xs shrink-0">
                  {currentUser.full_name.charAt(0)}
                </div>
                <div className="truncate text-left">
                  <div className="text-xs font-bold text-white truncate">
                    {currentUser.full_name}
                  </div>
                  <div className="text-[10px] font-medium text-slate-400 truncate">
                    {currentUser.role}
                  </div>
                </div>
              </div>
              <button
                onClick={onLogout}
                title="Logout"
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* College Project Discreet Attribution */}
          <div className="px-2 py-1 text-center">
            <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-slate-400">
              <GraduationCap className="w-3.5 h-3.5 text-teal-400" />
              <span>KIT • CSE Department</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">
              DBMS AAT Project • Jeslin J
            </p>
            <p className="text-[9px] font-mono text-slate-400">
              Reg: 711525BCS052
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
