/**
 * @file ReviewsPage.tsx
 * @description Performance Review Management with 4-dimensional rating matrix, automated overall rating calculation, and period validation.
 */

import React, { useState, useEffect } from 'react';
import {
  Award,
  Search,
  Plus,
  Filter,
  Edit2,
  Trash2,
  Eye,
  Star,
  Calendar,
  User,
  Building,
  Target,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  X,
  AlertCircle,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { PerformanceReview, Employee, Department } from '../types/index.ts';
import { api } from '../services/api.ts';
import { StarRating } from '../components/StarRating.tsx';
import { ConfirmModal } from '../components/ConfirmModal.tsx';

interface ReviewsPageProps {
  employees: Employee[];
  departments: Department[];
  onSelectEmployee: (id: number) => void;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
  initialAddModalOpen?: boolean;
  preselectedEmployeeId?: number | null;
  onResetInitialAdd?: () => void;
}

export const ReviewsPage: React.FC<ReviewsPageProps> = ({
  employees,
  departments,
  onSelectEmployee,
  onShowToast,
  initialAddModalOpen = false,
  preselectedEmployeeId = null,
  onResetInitialAdd,
}) => {
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedEmp, setSelectedEmp] = useState<string>('all');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [minRating, setMinRating] = useState<string>('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(initialAddModalOpen);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedReviewForEdit, setSelectedReviewForEdit] = useState<PerformanceReview | null>(null);
  const [detailReview, setDetailReview] = useState<PerformanceReview | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<PerformanceReview | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Review Form State
  const [formData, setFormData] = useState({
    employee_id: preselectedEmployeeId ? String(preselectedEmployeeId) : '',
    review_period_start: '2026-04-01',
    review_period_end: '2026-06-30',
    technical_skills_rating: 4.5,
    communication_rating: 4.2,
    teamwork_rating: 4.4,
    productivity_rating: 4.6,
    reviewer_name: 'Dr. Rajesh Murugan (VP Eng)',
    reviewer_comments: '',
    next_period_goals: '',
    review_status: 'Completed' as 'Pending' | 'In Progress' | 'Completed',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Automated Overall Rating calculation
  const computedOverall = Number(
    (
      (Number(formData.technical_skills_rating || 0) +
        Number(formData.communication_rating || 0) +
        Number(formData.teamwork_rating || 0) +
        Number(formData.productivity_rating || 0)) /
      4
    ).toFixed(2)
  );

  useEffect(() => {
    if (initialAddModalOpen) {
      if (preselectedEmployeeId) {
        setFormData((prev) => ({ ...prev, employee_id: String(preselectedEmployeeId) }));
      }
      setIsAddModalOpen(true);
      if (onResetInitialAdd) onResetInitialAdd();
    }
  }, [initialAddModalOpen, preselectedEmployeeId]);

  const fetchReviews = async (page = pagination.page) => {
    setIsLoading(true);
    try {
      const res = await api.getReviews({
        search,
        employee_id: selectedEmp,
        department_id: selectedDept,
        review_status: selectedStatus,
        min_rating: minRating ? parseFloat(minRating) : undefined,
        page,
        limit: 10,
      });
      setReviews(res.data);
      setPagination(res.pagination);
    } catch (err: any) {
      onShowToast('error', 'Failed to fetch reviews', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchReviews(1);
    }, 200);
    return () => clearTimeout(timer);
  }, [search, selectedEmp, selectedDept, selectedStatus, minRating]);

  const handleOpenAdd = () => {
    setFormData({
      employee_id: preselectedEmployeeId ? String(preselectedEmployeeId) : employees[0]?.employee_id?.toString() || '1',
      review_period_start: '2026-04-01',
      review_period_end: '2026-06-30',
      technical_skills_rating: 4.5,
      communication_rating: 4.2,
      teamwork_rating: 4.4,
      productivity_rating: 4.6,
      reviewer_name: 'Dr. Rajesh Murugan (VP Eng)',
      reviewer_comments: '',
      next_period_goals: '',
      review_status: 'Completed',
    });
    setFormError(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (rev: PerformanceReview) => {
    setSelectedReviewForEdit(rev);
    setFormData({
      employee_id: String(rev.employee_id),
      review_period_start: rev.review_period_start,
      review_period_end: rev.review_period_end,
      technical_skills_rating: rev.technical_skills_rating,
      communication_rating: rev.communication_rating,
      teamwork_rating: rev.teamwork_rating,
      productivity_rating: rev.productivity_rating,
      reviewer_name: rev.reviewer_name,
      reviewer_comments: rev.reviewer_comments || '',
      next_period_goals: rev.next_period_goals || '',
      review_status: rev.review_status,
    });
    setFormError(null);
    setIsEditModalOpen(true);
  };

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validation: Start Date <= End Date
    if (new Date(formData.review_period_start) > new Date(formData.review_period_end)) {
      return setFormError('Date Validation Error: Start date cannot be after end date.');
    }

    if (!formData.reviewer_name.trim()) {
      return setFormError('Reviewer name is required.');
    }

    setIsSubmitting(true);
    try {
      await api.createReview({
        employee_id: parseInt(formData.employee_id, 10),
        review_period_start: formData.review_period_start,
        review_period_end: formData.review_period_end,
        technical_skills_rating: Number(formData.technical_skills_rating),
        communication_rating: Number(formData.communication_rating),
        teamwork_rating: Number(formData.teamwork_rating),
        productivity_rating: Number(formData.productivity_rating),
        reviewer_name: formData.reviewer_name.trim(),
        reviewer_comments: formData.reviewer_comments.trim() || undefined,
        next_period_goals: formData.next_period_goals.trim() || undefined,
        review_status: formData.review_status,
      });

      onShowToast('success', 'Review Recorded', `Overall Score: ${computedOverall.toFixed(2)} / 5.00`);
      setIsAddModalOpen(false);
      fetchReviews(1);
    } catch (err: any) {
      setFormError(err.message || 'Failed to submit performance review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReviewForEdit) return;
    setFormError(null);

    if (new Date(formData.review_period_start) > new Date(formData.review_period_end)) {
      return setFormError('Date Validation Error: Start date cannot be after end date.');
    }

    setIsSubmitting(true);
    try {
      await api.updateReview(selectedReviewForEdit.review_id, {
        technical_skills_rating: Number(formData.technical_skills_rating),
        communication_rating: Number(formData.communication_rating),
        teamwork_rating: Number(formData.teamwork_rating),
        productivity_rating: Number(formData.productivity_rating),
        reviewer_name: formData.reviewer_name.trim(),
        reviewer_comments: formData.reviewer_comments.trim() || undefined,
        next_period_goals: formData.next_period_goals.trim() || undefined,
        review_status: formData.review_status,
      });

      onShowToast('success', 'Review Updated', `Review #${selectedReviewForEdit.review_id} updated.`);
      setIsEditModalOpen(false);
      fetchReviews(pagination.page);
    } catch (err: any) {
      setFormError(err.message || 'Failed to update review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteCandidate) return;
    setIsDeleting(true);
    try {
      await api.deleteReview(deleteCandidate.review_id);
      onShowToast('success', 'Review Deleted', `Review #${deleteCandidate.review_id} removed.`);
      setDeleteCandidate(null);
      fetchReviews(pagination.page);
    } catch (err: any) {
      onShowToast('error', 'Failed to delete review', err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Filter and Actions Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search feedback, employee name, reviewer, or goals..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-blue-500"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/20 transition-all flex items-center justify-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create Performance Review</span>
          </button>
        </div>

        {/* Filter Row */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-xs">
          {/* Department Filter */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-500 shrink-0">Dept:</span>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 py-1.5 px-2.5 rounded-lg text-slate-700 focus:outline-hidden"
            >
              <option value="all">All Departments</option>
              {departments.map((d) => (
                <option key={d.department_id} value={d.department_id}>
                  {d.department_name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-500 shrink-0">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 py-1.5 px-2.5 rounded-lg text-slate-700 focus:outline-hidden"
            >
              <option value="all">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="In Progress">In Progress</option>
              <option value="Pending">Pending</option>
            </select>
          </div>

          {/* Min Rating Filter */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-500 shrink-0">Min Score:</span>
            <select
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 py-1.5 px-2.5 rounded-lg text-slate-700 focus:outline-hidden"
            >
              <option value="">Any Rating</option>
              <option value="4.5">≥ 4.50 (Exceptional)</option>
              <option value="4.0">≥ 4.00 (High Performer)</option>
              <option value="3.0">≥ 3.00 (Satisfactory)</option>
            </select>
          </div>

          {/* Employee Filter */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-500 shrink-0">Staff:</span>
            <select
              value={selectedEmp}
              onChange={(e) => setSelectedEmp(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 py-1.5 px-2.5 rounded-lg text-slate-700 focus:outline-hidden"
            >
              <option value="all">All Employees</option>
              {employees.map((e) => (
                <option key={e.employee_id} value={e.employee_id}>
                  {e.full_name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Review ID</th>
                <th className="py-3.5 px-4">Employee</th>
                <th className="py-3.5 px-4">Evaluation Cycle</th>
                <th className="py-3.5 px-4">4 Pillars (Tech/Comm/Team/Prod)</th>
                <th className="py-3.5 px-4">Overall Score</th>
                <th className="py-3.5 px-4">Reviewer</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={8} className="py-4 px-4 bg-slate-50/30" />
                  </tr>
                ))
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Award className="w-8 h-8 text-slate-300" />
                      <span className="font-medium text-slate-600">No performance reviews match this criteria.</span>
                      <span className="text-xs text-slate-400">Create a new review or clear your active filters.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                reviews.map((rev) => (
                  <tr key={rev.review_id} className="hover:bg-slate-50/70 transition-colors group">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-500 text-xs">
                      #{rev.review_id}
                    </td>

                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => onSelectEmployee(rev.employee_id)}
                        className="font-bold text-slate-900 group-hover:text-blue-600 text-left hover:underline transition-colors block"
                      >
                        {rev.employee_name}
                      </button>
                      <div className="text-[11px] text-slate-400">
                        {rev.designation} • {rev.department_name}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-xs text-slate-600">
                      <div>{rev.review_period_start}</div>
                      <div className="text-slate-400 text-[10px]">to {rev.review_period_end}</div>
                    </td>

                    {/* 4 Pillars Breakdown Badge */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-mono text-[11px]">
                        <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-semibold" title="Technical Skills">
                          T: {rev.technical_skills_rating.toFixed(1)}
                        </span>
                        <span className="bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded font-semibold" title="Communication">
                          C: {rev.communication_rating.toFixed(1)}
                        </span>
                        <span className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-semibold" title="Teamwork">
                          W: {rev.teamwork_rating.toFixed(1)}
                        </span>
                        <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-semibold" title="Productivity">
                          P: {rev.productivity_rating.toFixed(1)}
                        </span>
                      </div>
                    </td>

                    {/* Overall Rating */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-bold font-mono text-slate-900">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{rev.overall_rating.toFixed(2)}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-xs text-slate-700">
                      {rev.reviewer_name}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
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

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setDetailReview(rev)}
                          title="View Comments & Goals"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(rev)}
                          title="Edit Review"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteCandidate(rev)}
                          title="Delete Review"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 bg-slate-50/70 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing <strong className="text-slate-800">{reviews.length}</strong> of{' '}
            <strong className="text-slate-800">{pagination.total}</strong> reviews
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchReviews(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-slate-700 px-1">
              Page {pagination.page} of {Math.max(1, pagination.totalPages)}
            </span>
            <button
              onClick={() => fetchReviews(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Review Modal */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-xl border border-blue-400/30 text-blue-400">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {isAddModalOpen ? 'Create Performance Review' : `Edit Review #${selectedReviewForEdit?.review_id}`}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Automated Overall Calculation = (Tech + Comm + Team + Prod) / 4
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setIsEditModalOpen(false);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={isAddModalOpen ? handleSubmitAdd : handleSubmitEdit}
              className="p-6 space-y-4 overflow-y-auto"
            >
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Employee & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Employee * (FK)
                  </label>
                  <select
                    required
                    disabled={isEditModalOpen}
                    value={formData.employee_id}
                    onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-blue-500 font-medium disabled:opacity-60"
                  >
                    {employees.map((e) => (
                      <option key={e.employee_id} value={e.employee_id}>
                        {e.full_name} ({e.designation} • {e.department_name})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Review Status
                  </label>
                  <select
                    value={formData.review_status}
                    onChange={(e) => setFormData({ ...formData, review_status: e.target.value as any })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-blue-500 font-medium"
                  >
                    <option value="Completed">Completed</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>

              {/* Review Period Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Period Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    disabled={isEditModalOpen}
                    value={formData.review_period_start}
                    onChange={(e) => setFormData({ ...formData, review_period_start: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-blue-500 disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Period End Date *
                  </label>
                  <input
                    type="date"
                    required
                    disabled={isEditModalOpen}
                    value={formData.review_period_end}
                    onChange={(e) => setFormData({ ...formData, review_period_end: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-blue-500 disabled:opacity-60"
                  />
                </div>
              </div>

              {/* 4 Pillars Interactive Sliders */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Evaluation Matrix (1.00 – 5.00)
                  </span>
                  <div className="flex items-center gap-1.5 bg-blue-600 text-white px-2.5 py-0.5 rounded-lg text-xs font-bold font-mono">
                    <Star className="w-3.5 h-3.5 fill-white text-white" />
                    Overall: {computedOverall.toFixed(2)}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  {/* Technical */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-700">1. Technical Skills:</span>
                      <span className="font-mono font-bold text-blue-600">{Number(formData.technical_skills_rating).toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="1.0"
                      max="5.0"
                      step="0.1"
                      value={formData.technical_skills_rating}
                      onChange={(e) => setFormData({ ...formData, technical_skills_rating: parseFloat(e.target.value) })}
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                  </div>

                  {/* Communication */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-700">2. Communication:</span>
                      <span className="font-mono font-bold text-teal-600">{Number(formData.communication_rating).toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="1.0"
                      max="5.0"
                      step="0.1"
                      value={formData.communication_rating}
                      onChange={(e) => setFormData({ ...formData, communication_rating: parseFloat(e.target.value) })}
                      className="w-full accent-teal-600 cursor-pointer"
                    />
                  </div>

                  {/* Teamwork */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-700">3. Teamwork:</span>
                      <span className="font-mono font-bold text-indigo-600">{Number(formData.teamwork_rating).toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="1.0"
                      max="5.0"
                      step="0.1"
                      value={formData.teamwork_rating}
                      onChange={(e) => setFormData({ ...formData, teamwork_rating: parseFloat(e.target.value) })}
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                  </div>

                  {/* Productivity */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-700">4. Productivity:</span>
                      <span className="font-mono font-bold text-emerald-600">{Number(formData.productivity_rating).toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="1.0"
                      max="5.0"
                      step="0.1"
                      value={formData.productivity_rating}
                      onChange={(e) => setFormData({ ...formData, productivity_rating: parseFloat(e.target.value) })}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Reviewer Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Reviewer Name & Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.reviewer_name}
                  onChange={(e) => setFormData({ ...formData, reviewer_name: e.target.value })}
                  placeholder="e.g. Dr. Rajesh Murugan (VP Eng)"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-blue-500"
                />
              </div>

              {/* Feedback Comments */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Reviewer Detailed Comments
                </label>
                <textarea
                  rows={2}
                  value={formData.reviewer_comments}
                  onChange={(e) => setFormData({ ...formData, reviewer_comments: e.target.value })}
                  placeholder="Detailed observations on technical depth, key project milestones delivered..."
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-blue-500"
                />
              </div>

              {/* Goals for next cycle */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Goals for Upcoming Evaluation Cycle
                </label>
                <textarea
                  rows={2}
                  value={formData.next_period_goals}
                  onChange={(e) => setFormData({ ...formData, next_period_goals: e.target.value })}
                  placeholder="Specific quarterly targets (e.g. lead database partitioning, mentor juniors)..."
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setIsEditModalOpen(false);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors flex items-center gap-2"
                >
                  {isSubmitting && (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  {isAddModalOpen ? 'Record Review' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Details View Modal */}
      {detailReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">
                  Appraisal #{detailReview.review_id} Details
                </h3>
                <p className="text-xs text-slate-400">
                  {detailReview.employee_name} ({detailReview.designation})
                </p>
              </div>
              <button
                onClick={() => setDetailReview(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Cycle</span>
                  <span className="text-xs font-mono font-bold text-slate-800">
                    {detailReview.review_period_start} – {detailReview.review_period_end}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Overall Score</span>
                  <div className="flex items-center gap-1 font-bold font-mono text-slate-900 text-base">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    {detailReview.overall_rating.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* 4 Pillars */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 bg-blue-50/60 rounded-xl border border-blue-100">
                  <span className="text-blue-800 font-bold block text-[11px]">Technical Skills:</span>
                  <span className="text-sm font-black text-blue-950">{detailReview.technical_skills_rating.toFixed(2)}</span>
                </div>
                <div className="p-2.5 bg-teal-50/60 rounded-xl border border-teal-100">
                  <span className="text-teal-800 font-bold block text-[11px]">Communication:</span>
                  <span className="text-sm font-black text-teal-950">{detailReview.communication_rating.toFixed(2)}</span>
                </div>
                <div className="p-2.5 bg-indigo-50/60 rounded-xl border border-indigo-100">
                  <span className="text-indigo-800 font-bold block text-[11px]">Teamwork:</span>
                  <span className="text-sm font-black text-indigo-950">{detailReview.teamwork_rating.toFixed(2)}</span>
                </div>
                <div className="p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-100">
                  <span className="text-emerald-800 font-bold block text-[11px]">Productivity:</span>
                  <span className="text-sm font-black text-emerald-950">{detailReview.productivity_rating.toFixed(2)}</span>
                </div>
              </div>

              {detailReview.reviewer_comments && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
                  <span className="font-bold text-slate-800 block mb-1">Reviewer Feedback:</span>
                  <p className="text-slate-600 leading-relaxed">{detailReview.reviewer_comments}</p>
                </div>
              )}

              {detailReview.next_period_goals && (
                <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-100 text-xs">
                  <span className="font-bold text-teal-900 block mb-1">Milestones & Goals:</span>
                  <p className="text-teal-950 leading-relaxed">{detailReview.next_period_goals}</p>
                </div>
              )}

              <div className="pt-2 text-right">
                <button
                  onClick={() => setDetailReview(null)}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteCandidate)}
        title="Delete Performance Review"
        message={`Are you sure you want to permanently delete Review #${deleteCandidate?.review_id} for ${deleteCandidate?.employee_name}?`}
        confirmLabel="Delete Review"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteCandidate(null)}
      />
    </div>
  );
};
