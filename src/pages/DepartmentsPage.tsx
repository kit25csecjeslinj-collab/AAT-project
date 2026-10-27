/**
 * @file DepartmentsPage.tsx
 * @description Department Management with employee counts, avg ratings, CRUD modals, and referential integrity protection.
 */

import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  Users,
  Star,
  ShieldAlert,
  X,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { Department } from '../types/index.ts';
import { api } from '../services/api.ts';
import { StarRating } from '../components/StarRating.tsx';
import { ConfirmModal } from '../components/ConfirmModal.tsx';

interface DepartmentsPageProps {
  departments: Department[];
  onRefresh: () => void;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const DepartmentsPage: React.FC<DepartmentsPageProps> = ({
  departments,
  onRefresh,
  onShowToast,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDeptForEdit, setSelectedDeptForEdit] = useState<Department | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<Department | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    department_name: '',
    description: '',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenAdd = () => {
    setFormData({ department_name: '', description: '' });
    setFormError(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (dept: Department) => {
    setSelectedDeptForEdit(dept);
    setFormData({
      department_name: dept.department_name,
      description: dept.description || '',
    });
    setFormError(null);
    setIsEditModalOpen(true);
  };

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.department_name.trim()) {
      return setFormError('Department name is required.');
    }

    setIsSubmitting(true);
    try {
      await api.createDepartment({
        department_name: formData.department_name.trim(),
        description: formData.description.trim() || undefined,
      });

      onShowToast('success', 'Department Created', `Added department '${formData.department_name}'.`);
      setIsAddModalOpen(false);
      onRefresh();
    } catch (err: any) {
      setFormError(err.message || 'Failed to create department');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeptForEdit) return;
    setFormError(null);

    setIsSubmitting(true);
    try {
      await api.updateDepartment(selectedDeptForEdit.department_id, {
        department_name: formData.department_name.trim(),
        description: formData.description.trim() || undefined,
      });

      onShowToast('success', 'Department Updated', `Department #${selectedDeptForEdit.department_id} updated.`);
      setIsEditModalOpen(false);
      onRefresh();
    } catch (err: any) {
      setFormError(err.message || 'Failed to update department');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteCandidate) return;

    // Frontend safety check for viva demonstration
    if ((deleteCandidate.employee_count ?? 0) > 0) {
      onShowToast(
        'error',
        'Referential Integrity Blocked',
        `Cannot delete '${deleteCandidate.department_name}' because it contains ${deleteCandidate.employee_count} active employees. Reassign employees before deleting.`
      );
      setDeleteCandidate(null);
      return;
    }

    setIsDeleting(true);
    try {
      await api.deleteDepartment(deleteCandidate.department_id);
      onShowToast('success', 'Department Deleted', `Department #${deleteCandidate.department_id} deleted.`);
      setDeleteCandidate(null);
      onRefresh();
    } catch (err: any) {
      onShowToast('error', 'Constraint Violation', err.message);
      setDeleteCandidate(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header & Add CTA */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-teal-600" />
            Organizational Departments
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Master departmental records with employee rollups and average rating calculations
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/20 transition-all flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Department</span>
        </button>
      </div>

      {/* Department Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((dept) => {
          const empCount = dept.employee_count ?? 0;
          const avgRating = dept.avg_rating ?? 0;

          return (
            <div
              key={dept.department_id}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs flex flex-col justify-between hover:shadow-md transition-all group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-sm border border-teal-100">
                      {dept.department_name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {dept.department_name}
                      </h4>
                      <span className="font-mono text-[10px] text-slate-400">
                        ID: #{dept.department_id}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(dept)}
                      title="Edit Department"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteCandidate(dept)}
                      title={empCount > 0 ? "Cannot delete: employees assigned" : "Delete Department"}
                      className={`p-1.5 rounded-lg transition-colors ${
                        empCount > 0
                          ? 'text-slate-300 hover:text-slate-500 hover:bg-slate-100'
                          : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                      }`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-4 line-clamp-2">
                  {dept.description || 'No description provided for this organizational unit.'}
                </p>
              </div>

              {/* Department Metrics */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Headcount</span>
                    <span className="text-sm font-bold font-mono text-slate-900 flex items-center gap-1 mt-0.5">
                      <Users className="w-3.5 h-3.5 text-blue-600" />
                      {empCount} staff
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Avg Rating</span>
                    <span className="text-sm font-bold font-mono text-slate-900 flex items-center gap-1 mt-0.5">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      {avgRating > 0 ? avgRating.toFixed(2) : 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Referential Integrity Note */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>Referential Rule:</span>
                  <span className={`font-mono font-medium ${empCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {empCount > 0 ? 'RESTRICT (Locked)' : 'SAFE TO DELETE'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-500/20 rounded-xl border border-teal-400/30 text-teal-400">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {isAddModalOpen ? 'Add Department' : `Edit Department #${selectedDeptForEdit?.department_id}`}
                  </h3>
                  <p className="text-xs text-slate-400">
                    departments table in employee_performance_db
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

            <form onSubmit={isAddModalOpen ? handleSubmitAdd : handleSubmitEdit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Department Name * (Unique)
                </label>
                <input
                  type="text"
                  required
                  value={formData.department_name}
                  onChange={(e) => setFormData({ ...formData, department_name: e.target.value })}
                  placeholder="e.g. Artificial Intelligence & Data Science"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the department's mandate and scope..."
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
                  {isAddModalOpen ? 'Create Department' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteCandidate)}
        title="Delete Department"
        message={
          (deleteCandidate?.employee_count ?? 0) > 0
            ? `WARNING: Department '${deleteCandidate?.department_name}' still has ${deleteCandidate?.employee_count} assigned employee(s). Under MySQL foreign key constraint (ON DELETE RESTRICT), this deletion will be BLOCKED by the database to prevent orphaned records.`
            : `Are you sure you want to delete '${deleteCandidate?.department_name}'? This action cannot be undone.`
        }
        confirmLabel="Confirm Delete"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteCandidate(null)}
      />
    </div>
  );
};
