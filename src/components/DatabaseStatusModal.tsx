/**
 * @file DatabaseStatusModal.tsx
 * @description Modal explaining MySQL 8.0 connection status, parameters, and troubleshooting.
 */

import React, { useState } from 'react';
import { Database, CheckCircle2, AlertCircle, RefreshCw, Server, X, ShieldAlert, Terminal, Layers } from 'lucide-react';
import { DatabaseStatus } from '../types/index.ts';
import { api } from '../services/api.ts';

interface DatabaseStatusModalProps {
  isOpen: boolean;
  status: DatabaseStatus | null;
  onClose: () => void;
  onRefresh: () => void;
}

export const DatabaseStatusModal: React.FC<DatabaseStatusModalProps> = ({
  isOpen,
  status,
  onClose,
  onRefresh,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (!isOpen) return null;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-xl border border-blue-400/30 text-blue-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Database Engine Status
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                    status?.connected
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {status?.connected ? 'MySQL 8.0 Live' : 'Demo Mode (Simulated MySQL)'}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                KIT CSE DBMS AAT Project • Jeslin J (711525BCS052)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Status Alert Banner */}
          <div
            className={`p-4 rounded-xl border flex items-start gap-3.5 ${
              status?.connected
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}
          >
            {status?.connected ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="text-sm">
              <h4 className="font-semibold">
                {status?.connected
                  ? 'Connected to Live MySQL 8.0 Database'
                  : 'Operating in High-Fidelity Demo Mode'}
              </h4>
              <p className="mt-1 text-xs leading-relaxed opacity-90">
                {status?.connected
                  ? `Active connection pool initialized with database '${status.database}' on ${status.host}:${status.port}. All SQL operations execute directly on the live MySQL server.`
                  : `MySQL server is not running on localhost:3306 in this container environment. The application has automatically engaged its Demo Mode, maintaining full relational integrity, SQL constraints, and seed data from 02_sample_data.sql.`}
              </p>
            </div>
          </div>

          {/* Connection Parameters Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Host</span>
              <span className="text-sm font-mono font-medium text-slate-800">{status?.host || 'localhost'}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Port</span>
              <span className="text-sm font-mono font-medium text-slate-800">{status?.port || 3306}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Database</span>
              <span className="text-sm font-mono font-medium text-slate-800">{status?.database || 'employee_performance_db'}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Driver</span>
              <span className="text-sm font-mono font-medium text-slate-800">mysql2 (Node.js)</span>
            </div>
          </div>

          {/* Table Counts */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-600" />
              Active Database Table Records
            </h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 flex items-center justify-between">
                <div>
                  <span className="text-xs text-blue-700 font-medium">departments</span>
                  <span className="text-lg font-bold text-blue-900 block font-mono">
                    {status?.tableCounts.departments ?? 6}
                  </span>
                </div>
                <span className="text-[10px] bg-blue-200/60 text-blue-800 font-bold px-2 py-0.5 rounded-full">InnoDB</span>
              </div>
              <div className="p-3 rounded-xl bg-teal-50/60 border border-teal-100 flex items-center justify-between">
                <div>
                  <span className="text-xs text-teal-700 font-medium">employees</span>
                  <span className="text-lg font-bold text-teal-900 block font-mono">
                    {status?.tableCounts.employees ?? 15}
                  </span>
                </div>
                <span className="text-[10px] bg-teal-200/60 text-teal-800 font-bold px-2 py-0.5 rounded-full">FK: dept_id</span>
              </div>
              <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between">
                <div>
                  <span className="text-xs text-indigo-700 font-medium">performance_reviews</span>
                  <span className="text-lg font-bold text-indigo-900 block font-mono">
                    {status?.tableCounts.reviews ?? 25}
                  </span>
                </div>
                <span className="text-[10px] bg-indigo-200/60 text-indigo-800 font-bold px-2 py-0.5 rounded-full">CASCADE</span>
              </div>
            </div>
          </div>

          {/* Setup / Instructions for Local Testing */}
          <div className="p-4 bg-slate-900 text-slate-200 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <Terminal className="w-4 h-4 text-blue-400" />
              Run on Local MySQL 8.0 (Viva Demo Command):
            </div>
            <pre className="text-xs font-mono bg-slate-950 p-3 rounded-lg overflow-x-auto text-emerald-400 leading-relaxed border border-slate-800">
{`# 1. Start MySQL and run schema DDL
mysql -u root -p < sql/01_schema.sql

# 2. Insert realistic seed data
mysql -u root -p < sql/02_sample_data.sql

# 3. Configure .env with DB_HOST, DB_USER, DB_PASSWORD
# 4. Start the server
npm run dev`}
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200/70 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Engine: MySQL 8.0+ / InnoDB / UTF-8
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              Test Connection
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
