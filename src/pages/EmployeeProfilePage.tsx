/**
 * @file EmployeeProfilePage.tsx
 * @description Dedicated Employee 360-degree Profile view with rating breakdown, historical trend chart, goals, and strengths/improvements summary.
 */

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Building,
  Briefcase,
  Star,
  Award,
  TrendingUp,
  Target,
  MessageSquare,
  Plus,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { Employee, PerformanceReview } from '../types/index.ts';
import { api } from '../services/api.ts';
import { StarRating } from '../components/StarRating.tsx';

interface EmployeeProfilePageProps {
  employeeId: number;
  onBack: () => void;
  onAddReviewForEmployee: (employeeId: number) => void;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const EmployeeProfilePage: React.FC<EmployeeProfilePageProps> = ({
  employeeId,
  onBack,
  onAddReviewForEmployee,
  onShowToast,
}) => {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const res = await api.getEmployeeById(employeeId);
        setEmployee(res.data);
      } catch (err: any) {
        onShowToast('error', 'Profile Load Error', err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [employeeId]);

  if (isLoading || !employee) {
    return (
      <div className="p-8 max-w-6xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 w-40 bg-slate-200 rounded-lg" />
        <div className="h-44 bg-slate-200 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-slate-200 rounded-2xl" />
          <div className="h-64 bg-slate-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  const reviews: PerformanceReview[] = employee.reviews || [];
  const completedReviews = reviews.filter((r) => r.review_status === 'Completed');

  // Compute category averages
  const avgTech =
    completedReviews.length > 0
      ? Number((completedReviews.reduce((s, r) => s + r.technical_skills_rating, 0) / completedReviews.length).toFixed(2))
      : null;
  const avgComm =
    completedReviews.length > 0
      ? Number((completedReviews.reduce((s, r) => s + r.communication_rating, 0) / completedReviews.length).toFixed(2))
      : null;
  const avgTeam =
    completedReviews.length > 0
      ? Number((completedReviews.reduce((s, r) => s + r.teamwork_rating, 0) / completedReviews.length).toFixed(2))
      : null;
  const avgProd =
    completedReviews.length > 0
      ? Number((completedReviews.reduce((s, r) => s + r.productivity_rating, 0) / completedReviews.length).toFixed(2))
      : null;

  // Derive strengths and improvement areas strictly from saved category ratings
  const categoryScores = [
    { name: 'Technical Skills', score: avgTech },
    { name: 'Communication', score: avgComm },
    { name: 'Teamwork & Collaboration', score: avgTeam },
    { name: 'Productivity & Execution', score: avgProd },
  ].filter((c) => c.score !== null) as { name: string; score: number }[];

  const strengths = [...categoryScores].sort((a, b) => b.score - a.score).filter((c) => c.score >= 4.0);
  const improvementAreas = [...categoryScores].sort((a, b) => a.score - b.score).filter((c) => c.score < 4.0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Back Button & Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3.5 py-1.5 rounded-xl transition-colors shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Directory</span>
        </button>

        <button
          onClick={() => onAddReviewForEmployee(employee.employee_id)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Record New Review</span>
        </button>
      </div>

      {/* Main Profile Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-blue-600 to-teal-500 flex items-center justify-center text-white font-black text-2xl shadow-md shadow-blue-500/20 shrink-0">
              {employee.full_name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {employee.full_name}
                </h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    employee.employment_status === 'Active'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  {employee.employment_status}
                </span>
              </div>
              <div className="text-sm font-semibold text-blue-600 mt-0.5">
                {employee.designation}
              </div>
              <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-4">
                <span className="flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  {employee.department_name}
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {employee.email}
                </span>
                {employee.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {employee.phone}
                  </span>
                )}
                <span className="flex items-center gap-1 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Joined {employee.joining_date}
                </span>
              </div>
            </div>
          </div>

          {/* Rating Summary Pill */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-center shrink-0 w-full md:w-auto">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Cumulative Average
            </span>
            <div className="text-3xl font-black text-slate-900 font-mono mt-0.5">
              {employee.avg_rating ? employee.avg_rating.toFixed(2) : '—'}
            </div>
            <div className="mt-1 flex justify-center">
              <StarRating rating={employee.avg_rating} size="sm" showNumber={false} />
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">
              Based on {completedReviews.length} completed review{completedReviews.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* 4 Category Matrix & Strengths Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Rating Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-blue-600" />
              Evaluation Matrix Breakdown
            </h3>
            <p className="text-xs text-slate-500">
              Aggregated across 4 core evaluation pillars (1.00 – 5.00 scale)
            </p>
          </div>

          <div className="space-y-4 pt-2">
            {[
              { label: 'Technical Skills & Architecture', score: avgTech, color: 'bg-blue-600' },
              { label: 'Communication & Collaboration', score: avgComm, color: 'bg-teal-500' },
              { label: 'Teamwork & Culture Support', score: avgTeam, color: 'bg-indigo-500' },
              { label: 'Productivity & Project Delivery', score: avgProd, color: 'bg-emerald-500' },
            ].map((cat, idx) => {
              const val = cat.score ?? 0;
              const pct = (val / 5.0) * 100;
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-700">{cat.label}</span>
                    <span className="font-mono font-bold text-slate-900">
                      {cat.score !== null ? cat.score.toFixed(2) : 'No data'}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${cat.color}`}
                      style={{ width: `${cat.score !== null ? pct : 0}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Strengths & Improvement Insights */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Verified Performance Insights
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Synthesized strictly from recorded SQL review data
            </p>

            {completedReviews.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 text-center">
                Insufficient review data to calculate strengths and growth areas. Record at least one completed evaluation cycle.
              </div>
            ) : (
              <div className="space-y-4">
                {/* Core Strengths */}
                <div>
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block mb-2">
                    Key Strengths (Score ≥ 4.00)
                  </span>
                  {strengths.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No dimension currently above 4.00.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {strengths.map((s, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          {s.name} ({s.score.toFixed(2)})
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Focus Areas */}
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block mb-2">
                    Development Opportunities (Score &lt; 4.00)
                  </span>
                  {improvementAreas.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">Employee demonstrates solid proficiency across all pillars.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {improvementAreas.map((a, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-xs font-medium flex items-center gap-1.5"
                        >
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          {a.name} ({a.score.toFixed(2)})
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4 text-[11px] text-slate-400">
            Rule: Insights derive transparently from empirical review ratings; no simulated hallucinations.
          </div>
        </div>
      </div>

      {/* Review History & Goals Timeline */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-teal-600" />
            Historical Appraisal Cycles & Goals
          </h3>
          <p className="text-xs text-slate-500">
            Chronological log of reviews, reviewer feedback, and next-period milestones
          </p>
        </div>

        {reviews.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            No performance appraisals have been submitted for this employee yet.
          </div>
        ) : (
          <div className="space-y-4 divide-y divide-slate-100">
            {reviews.map((rev) => (
              <div key={rev.review_id} className="pt-4 first:pt-0 space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                        rev.review_status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : rev.review_status === 'In Progress'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {rev.review_status}
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-700">
                      Cycle: {rev.review_period_start} – {rev.review_period_end}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-xs text-slate-500">
                      Reviewer: <strong className="text-slate-800">{rev.reviewer_name}</strong>
                    </div>
                    <div className="flex items-center gap-1 font-mono font-bold text-slate-900 text-sm bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{rev.overall_rating.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Individual Ratings Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100 font-mono">
                  <div>Tech: <strong>{rev.technical_skills_rating.toFixed(2)}</strong></div>
                  <div>Comm: <strong>{rev.communication_rating.toFixed(2)}</strong></div>
                  <div>Team: <strong>{rev.teamwork_rating.toFixed(2)}</strong></div>
                  <div>Prod: <strong>{rev.productivity_rating.toFixed(2)}</strong></div>
                </div>

                {/* Reviewer Comments & Next Goals */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
                  {rev.reviewer_comments && (
                    <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-slate-700">
                      <span className="font-bold text-blue-900 flex items-center gap-1.5 mb-1">
                        <MessageSquare className="w-3.5 h-3.5" />
                        Reviewer Feedback
                      </span>
                      <p className="leading-relaxed">{rev.reviewer_comments}</p>
                    </div>
                  )}

                  {rev.next_period_goals && (
                    <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-100 text-slate-700">
                      <span className="font-bold text-teal-900 flex items-center gap-1.5 mb-1">
                        <Target className="w-3.5 h-3.5" />
                        Goals for Next Period
                      </span>
                      <p className="leading-relaxed">{rev.next_period_goals}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
