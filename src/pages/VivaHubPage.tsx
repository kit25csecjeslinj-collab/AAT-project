/**
 * @file VivaHubPage.tsx
 * @description Dedicated DBMS Viva & SQL Examiner Hub for college presentation at KIT CSE.
 * Features live interactive SQL Runner, preset viva queries, DDL schema viewer, normalization guide, and test matrix.
 */

import React, { useState, useEffect } from 'react';
import {
  Terminal,
  Play,
  Copy,
  Check,
  FileCode,
  BookOpen,
  CheckCircle2,
  Database,
  Layers,
  Sparkles,
  GraduationCap,
  AlertCircle,
} from 'lucide-react';
import { api } from '../services/api.ts';

interface VivaHubPageProps {
  onShowToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const VivaHubPage: React.FC<VivaHubPageProps> = ({ onShowToast }) => {
  const [activeTab, setActiveTab] = useState<'runner' | 'schema' | 'sample' | 'reports' | 'design' | 'tests'>('runner');
  
  // SQL Runner state
  const [queryInput, setQueryInput] = useState(
    `SELECT d.department_name, COUNT(e.employee_id) AS total_employees, ROUND(AVG(r.overall_rating), 2) AS avg_rating\nFROM departments d\nLEFT JOIN employees e ON d.department_id = e.department_id\nLEFT JOIN performance_reviews r ON e.employee_id = r.employee_id AND r.review_status = 'Completed'\nGROUP BY d.department_name\nORDER BY avg_rating DESC;`
  );
  const [queryResult, setQueryResult] = useState<any>(null);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  // Scripts content
  const [scripts, setScripts] = useState<{
    schemaSql: string;
    sampleDataSql: string;
    reportsSql: string;
    dbDesignMd: string;
    testPlanMd: string;
  } | null>(null);

  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  useEffect(() => {
    const fetchScripts = async () => {
      try {
        const res = await api.getSqlScripts();
        setScripts(res.data);
      } catch (err: any) {
        console.error('Failed to load scripts', err);
      }
    };
    fetchScripts();
  }, []);

  const handleRunQuery = async (queryToRun?: string) => {
    const sql = queryToRun || queryInput;
    setIsRunning(true);
    setQueryError(null);
    try {
      const res = await api.executeSQL(sql);
      setQueryResult(res.data);
      onShowToast('success', 'SQL Query Executed', `Returned ${res.data.rowCount} rows.`);
    } catch (err: any) {
      setQueryError(err.message || 'Execution error');
      setQueryResult(null);
      onShowToast('error', 'SQL Syntax/Execution Error', err.message);
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopy = (text: string, tabName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTab(tabName);
    onShowToast('info', 'Copied to Clipboard', `${tabName} code copied.`);
    setTimeout(() => setCopiedTab(null), 2500);
  };

  const presetQueries = [
    {
      title: 'Department Join & Rating Rollup',
      description: 'LEFT JOIN, GROUP BY, COUNT(DISTINCT) and AVG(rating)',
      sql: `SELECT d.department_name, COUNT(DISTINCT e.employee_id) AS staff_count, ROUND(AVG(r.overall_rating), 2) AS avg_rating\nFROM departments d\nLEFT JOIN employees e ON d.department_id = e.department_id\nLEFT JOIN performance_reviews r ON e.employee_id = r.employee_id AND r.review_status = 'Completed'\nGROUP BY d.department_name\nORDER BY avg_rating DESC;`,
    },
    {
      title: 'Top Performers Ranking',
      description: 'INNER JOIN & MySQL 8.0 Window Function DENSE_RANK()',
      sql: `SELECT e.full_name, e.designation, d.department_name, ROUND(AVG(r.overall_rating), 2) AS average_rating\nFROM employees e\nJOIN departments d ON e.department_id = d.department_id\nJOIN performance_reviews r ON e.employee_id = r.employee_id\nWHERE r.review_status = 'Completed'\nGROUP BY e.employee_id, e.full_name, e.designation, d.department_name\nORDER BY average_rating DESC\nLIMIT 5;`,
    },
    {
      title: 'Active Employees Directory',
      description: 'Basic SELECT with WHERE condition on employment_status',
      sql: `SELECT employee_id, full_name, email, designation, joining_date, employment_status\nFROM employees\nWHERE employment_status = 'Active'\nORDER BY joining_date DESC;`,
    },
    {
      title: 'Recent Completed Reviews',
      description: '360° reviews with 4 category dimensions',
      sql: `SELECT r.review_id, e.full_name, r.technical_skills_rating, r.communication_rating, r.teamwork_rating, r.productivity_rating, r.overall_rating, r.review_status\nFROM performance_reviews r\nJOIN employees e ON r.employee_id = e.employee_id\nWHERE r.review_status = 'Completed'\nORDER BY r.review_period_end DESC;`,
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* College Viva Presentation Banner */}
      <div className="bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 text-white border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 shrink-0">
            <GraduationCap className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">
                KIT CSE • DBMS AAT Examination Hub
              </span>
              <span className="text-[10px] bg-blue-500/30 text-blue-300 px-2 py-0.5 rounded-full font-mono">
                MySQL 8.0+
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white mt-0.5">
              Employee Performance Tracking System
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Presented by: <strong>Jeslin J</strong> (Register No: <strong>711525BCS052</strong>) • Department of Computer Science & Engineering
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300">
            Engine: InnoDB / UTF8MB4
          </span>
        </div>
      </div>

      {/* Hub Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-semibold pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('runner')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'runner'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>Live SQL Query Runner</span>
        </button>

        <button
          onClick={() => setActiveTab('schema')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'schema'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>DDL Schema (01_schema.sql)</span>
        </button>

        <button
          onClick={() => setActiveTab('sample')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'sample'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Seed Data (02_sample_data.sql)</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'reports'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Analytical Queries (03_reports.sql)</span>
        </button>

        <button
          onClick={() => setActiveTab('design')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'design'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>ER Design & Normalization</span>
        </button>

        <button
          onClick={() => setActiveTab('tests')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'tests'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Test Plan & Matrix</span>
        </button>
      </div>

      {/* Tab 1: Live Interactive SQL Runner */}
      {activeTab === 'runner' && (
        <div className="space-y-6">
          {/* Preset Buttons Strip */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Quick Preset Queries for Viva Demonstration:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {presetQueries.map((pq, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQueryInput(pq.sql);
                    handleRunQuery(pq.sql);
                  }}
                  className="p-3 text-left rounded-xl bg-slate-50 hover:bg-blue-50/70 border border-slate-200 hover:border-blue-300 transition-all group"
                >
                  <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600">
                    {pq.title}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                    {pq.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* SQL Editor Box */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="px-5 py-3 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>mysql&gt; Interactive Query Editor</span>
              </div>
              <button
                onClick={() => handleRunQuery()}
                disabled={isRunning}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>{isRunning ? 'Executing...' : 'Execute SQL'}</span>
              </button>
            </div>

            <textarea
              rows={5}
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              className="w-full p-4 font-mono text-xs sm:text-sm bg-slate-950 text-emerald-300 focus:outline-hidden leading-relaxed"
              spellCheck={false}
            />
          </div>

          {/* Execution Error Banner */}
          {queryError && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h5 className="font-bold">SQL Execution Failed</h5>
                <p className="mt-1 font-mono">{queryError}</p>
              </div>
            </div>
          )}

          {/* Query Result Grid */}
          {queryResult && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
              <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">
                  Result Source: <strong className="text-blue-600">{queryResult.source}</strong>
                </span>
                <span className="font-mono text-slate-500 font-bold">
                  {queryResult.rowCount} rows in set
                </span>
              </div>

              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-left border-collapse font-mono text-xs">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-700">
                      {queryResult.fields.map((col: string, idx: number) => (
                        <th key={idx} className="py-2.5 px-3 whitespace-nowrap font-bold">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {queryResult.results.map((row: any, rIdx: number) => (
                      <tr key={rIdx} className="hover:bg-slate-50">
                        {queryResult.fields.map((col: string, cIdx: number) => (
                          <td key={cIdx} className="py-2 px-3 whitespace-nowrap text-slate-800">
                            {row[col] !== null && row[col] !== undefined ? String(row[col]) : <span className="text-slate-400 italic">NULL</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Schema SQL Viewer */}
      {activeTab === 'schema' && scripts && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
            <span className="font-mono text-xs font-semibold text-emerald-400">
              sql/01_schema.sql (DDL)
            </span>
            <button
              onClick={() => handleCopy(scripts.schemaSql, '01_schema.sql')}
              className="px-3 py-1 rounded-lg text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 flex items-center gap-1.5 transition-colors"
            >
              {copiedTab === '01_schema.sql' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedTab === '01_schema.sql' ? 'Copied' : 'Copy Script'}</span>
            </button>
          </div>
          <pre className="p-5 font-mono text-xs bg-slate-950 text-slate-200 overflow-x-auto max-h-[600px] leading-relaxed">
            {scripts.schemaSql}
          </pre>
        </div>
      )}

      {/* Tab 3: Seed Data SQL Viewer */}
      {activeTab === 'sample' && scripts && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
            <span className="font-mono text-xs font-semibold text-emerald-400">
              sql/02_sample_data.sql (DML)
            </span>
            <button
              onClick={() => handleCopy(scripts.sampleDataSql, '02_sample_data.sql')}
              className="px-3 py-1 rounded-lg text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 flex items-center gap-1.5 transition-colors"
            >
              {copiedTab === '02_sample_data.sql' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedTab === '02_sample_data.sql' ? 'Copied' : 'Copy Seed Data'}</span>
            </button>
          </div>
          <pre className="p-5 font-mono text-xs bg-slate-950 text-slate-200 overflow-x-auto max-h-[600px] leading-relaxed">
            {scripts.sampleDataSql}
          </pre>
        </div>
      )}

      {/* Tab 4: Analytical Queries Viewer */}
      {activeTab === 'reports' && scripts && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
            <span className="font-mono text-xs font-semibold text-emerald-400">
              sql/03_reports.sql (Analytical & Window Functions)
            </span>
            <button
              onClick={() => handleCopy(scripts.reportsSql, '03_reports.sql')}
              className="px-3 py-1 rounded-lg text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 flex items-center gap-1.5 transition-colors"
            >
              {copiedTab === '03_reports.sql' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedTab === '03_reports.sql' ? 'Copied' : 'Copy Queries'}</span>
            </button>
          </div>
          <pre className="p-5 font-mono text-xs bg-slate-950 text-slate-200 overflow-x-auto max-h-[600px] leading-relaxed">
            {scripts.reportsSql}
          </pre>
        </div>
      )}

      {/* Tab 5: Normalization & ER Design */}
      {activeTab === 'design' && scripts && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 prose max-w-none text-slate-800 text-xs sm:text-sm">
          <pre className="whitespace-pre-wrap font-sans bg-transparent p-0 text-slate-800">
            {scripts.dbDesignMd}
          </pre>
        </div>
      )}

      {/* Tab 6: Test Matrix */}
      {activeTab === 'tests' && scripts && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 prose max-w-none text-slate-800 text-xs sm:text-sm">
          <pre className="whitespace-pre-wrap font-sans bg-transparent p-0 text-slate-800">
            {scripts.testPlanMd}
          </pre>
        </div>
      )}
    </div>
  );
};
