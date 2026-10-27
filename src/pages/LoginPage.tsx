/**
 * @file LoginPage.tsx
 * @description Polished enterprise login screen with role credentials and quick-fill triggers.
 */

import React, { useState } from 'react';
import {
  Lock,
  User,
  ShieldCheck,
  Building,
  GraduationCap,
  ArrowRight,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { api } from '../services/api.ts';
import { UserSession } from '../types/index.ts';

interface LoginPageProps {
  onLoginSuccess: (user: UserSession) => void;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onShowToast }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await api.login(username, password);
      onShowToast('success', 'Authentication Successful', `Welcome back, ${res.user.full_name}!`);
      onLoginSuccess(res.user);
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid username or password credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Subtle Gradient Spheres */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Brand Logo Header */}
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-blue-500 to-teal-400 flex items-center justify-center text-white shadow-xl shadow-blue-500/30 font-black text-2xl">
            P
          </div>
        </div>

        <h2 className="mt-4 text-center text-2xl sm:text-3xl font-black text-white tracking-tight">
          PerformanceTrack
        </h2>
        <p className="mt-1 text-center text-xs text-slate-400 font-medium">
          Enterprise Employee Performance Management System
        </p>

        {/* College Project Badge */}
        <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-teal-400 font-medium">
          <GraduationCap className="w-4 h-4" />
          <span>KIT CSE • DBMS AAT Project • Jeslin J (711525BCS052)</span>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-slate-900 py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-slate-800">
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-linear-to-r from-blue-600 to-teal-600 hover:from-blue-500 hover:to-teal-500 shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Fill Demo Credentials */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2 text-center">
              Quick-Fill Role Credentials for Evaluation:
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin', 'admin123')}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-left transition-colors"
              >
                <div className="text-[11px] font-bold text-white">Admin</div>
                <div className="text-[9px] font-mono text-slate-400">admin / admin123</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('hrmanager', 'hr123')}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-left transition-colors"
              >
                <div className="text-[11px] font-bold text-white">HR Manager</div>
                <div className="text-[9px] font-mono text-slate-400">hrmanager / hr123</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('reviewer', 'rev123')}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-left transition-colors"
              >
                <div className="text-[11px] font-bold text-white">Reviewer</div>
                <div className="text-[9px] font-mono text-slate-400">reviewer / rev123</div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="mt-4 text-center text-[11px] text-slate-400">
          Database: MySQL 8.0+ • Backed by Express & MySQL2 Driver
        </p>
      </div>
    </div>
  );
};
