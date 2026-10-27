/**
 * @file EmployeesPage.tsx
 * @description Employee Directory with search, filters, sorting, pagination, CRUD modals, and status toggle.
 */

import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Mail,
  Phone,
  Calendar,
  Building,
  UserCheck,
  X,
  AlertCircle,
} from 'lucide-react';
import { Employee, Department } from '../types/index.ts';
import { api } from '../services/api.ts';
import { StarRating } from '../components/StarRating.tsx';
import { ConfirmModal } from '../components/ConfirmModal.tsx';

interface EmployeesPageProps {
  departments: Department[];
  onSelectEmployee: (id: number) => void;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
  initialAddModalOpen?: boolean;
  onResetInitialAdd?: () => void;
}

export const EmployeesPage: React.FC<EmployeesPageProps> = ({
  departments,
  onSelectEmployee,
  onShowToast,
  initialAddModalOpen = false,
  onResetInitialAdd,
}) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Sorting state
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(initialAddModalOpen);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEmployeeForEdit, setSelectedEmployeeForEdit] = useState<Employee | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<Employee | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    department_id: '',
    designation: '',
    joining_date: new Date().toISOString().slice(0, 10),
    employment_status: 'Active' as 'Active' | 'Inactive',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialAddModalOpen) {
      setIsAddModalOpen(true);
      if (onResetInitialAdd) onResetInitialAdd();
    }
  }, [initialAddModalOpen]);

  const fetchEmployees = async (page = pagination.page) => {
    setIsLoading(true);
    try {
      const res = await api.getEmployees({
        search,
        department_id: selectedDept,
        employment_status: selectedStatus,
        sort_by: sortBy,
        sort_order: sortOrder,
        page,
        limit: 10,
      });
      setEmployees(res.data);
      setPagination(res.pagination);
    } catch (err: any) {
      onShowToast('error', 'Failed to load employees', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEmployees(1);
    }, 200);
    return () => clearTimeout(timer);
  }, [search, selectedDept, selectedStatus, sortBy, sortOrder]);

  const handleOpenAdd = () => {
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      department_id: departments[0]?.department_id?.toString() || '1',
      designation: '',
      joining_date: new Date().toISOString().slice(0, 10),
      employment_status: 'Active',
    });
    setFormError(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (emp: Employee) => {
    setSelectedEmployeeForEdit(emp);
    setFormData({
      full_name: emp.full_name,
      email: emp.email,
      phone: emp.phone || '',
      department_id: emp.department_id.toString(),
      designation: emp.designation,
      joining_date: emp.joining_date,
      employment_status: emp.employment_status,
    });
    setFormError(null);
    setIsEditModalOpen(true);
  };

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.full_name.trim()) return setFormError('Employee full name is required.');
    if (!formData.email.trim()) return setFormError('Email address is required.');
    if (!formData.department_id) return setFormError('Please select a valid department.');
    if (!formData.designation.trim()) return setFormError('Designation is required.');
    if (!formData.joining_date) return setFormError('Joining date is required.');

    setIsSubmitting(true);
    try {
      await api.createEmployee({
        full_name: formData.full_name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        department_id: parseInt(formData.department_id, 10),
        designation: formData.designation.trim(),
        joining_date: formData.joining_date,
        employment_status: formData.employment_status,
      });

      onShowToast('success', 'Employee Created', `Successfully enrolled ${formData.full_name}.`);
      setIsAddModalOpen(false);
      fetchEmployees(1);
    } catch (err: any) {
      setFormError(err.message || 'Failed to create employee record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployeeForEdit) return;
    setFormError(null);

    setIsSubmitting(true);
    try {
      await api.updateEmployee(selectedEmployeeForEdit.employee_id, {
        full_name: formData.full_name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        department_id: parseInt(formData.department_id, 10),
        designation: formData.designation.trim(),
        joining_date: formData.joining_date,
        employment_status: formData.employment_status,
      });

      onShowToast('success', 'Employee Updated', `Changes to #${selectedEmployeeForEdit.employee_id} saved.`);
      setIsEditModalOpen(false);
      fetchEmployees(pagination.page);
    } catch (err: any) {
      setFormError(err.message || 'Failed to update employee record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (emp: Employee) => {
    try {
      await api.toggleEmployeeStatus(emp.employee_id);
      const next = emp.employment_status === 'Active' ? 'Inactive' : 'Active';
      onShowToast('info', 'Status Updated', `${emp.full_name} is now ${next}.`);
      fetchEmployees(pagination.page);
    } catch (err: any) {
      onShowToast('error', 'Status Change Failed', err.message);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteCandidate) return;
    setIsDeleting(true);
    try {
      await api.deleteEmployee(deleteCandidate.employee_id);
      onShowToast(
        'success',
        'Employee Deleted',
        `Employee #${deleteCandidate.employee_id} and associated reviews removed.`
      );
      setDeleteCandidate(null);
      fetchEmployees(pagination.page);
    } catch (err: any) {
      onShowToast('error', 'Deletion Error', err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Controls: Search, Filters & Action Button */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, ID, email, or designation..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
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

          {/* Add Employee CTA */}
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/20 transition-all flex items-center justify-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Employee</span>
          </button>
        </div>

        {/* Filters and Sorting Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-xs">
          {/* Department Filter */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-500 shrink-0">Dept:</span>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 py-1.5 px-2.5 rounded-lg font-medium text-slate-700 focus:outline-hidden focus:border-blue-500"
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
              className="w-full bg-slate-50 border border-slate-200 py-1.5 px-2.5 rounded-lg font-medium text-slate-700 focus:outline-hidden focus:border-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="Active">Active Only</option>
              <option value="Inactive">Inactive Only</option>
            </select>
          </div>

          {/* Sort By Field */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-500 shrink-0">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 py-1.5 px-2.5 rounded-lg font-medium text-slate-700 focus:outline-hidden focus:border-blue-500"
            >
              <option value="name">Name</option>
              <option value="joining_date">Joining Date</option>
              <option value="rating">Performance Rating</option>
              <option value="employee_id">Employee ID</option>
            </select>
          </div>

          {/* Sort Order Direction */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-500 shrink-0">Order:</span>
            <button
              onClick={() => setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC')}
              className="w-full bg-slate-50 border border-slate-200 py-1.5 px-2.5 rounded-lg font-medium text-slate-700 hover:bg-slate-100 flex items-center justify-between transition-colors"
            >
              <span>{sortOrder === 'ASC' ? 'Ascending (A-Z)' : 'Descending (Z-A)'}</span>
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Employee Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">ID</th>
                <th className="py-3.5 px-4">Employee</th>
                <th className="py-3.5 px-4">Department & Designation</th>
                <th className="py-3.5 px-4">Date Joined</th>
                <th className="py-3.5 px-4">Avg Rating</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={7} className="py-4 px-4 bg-slate-50/30" />
                  </tr>
                ))
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users className="w-8 h-8 text-slate-300" />
                      <span className="font-medium text-slate-600">No employees match your search criteria.</span>
                      <span className="text-xs text-slate-400">Try adjusting your filters or search keywords.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp.employee_id} className="hover:bg-slate-50/70 transition-colors group">
                    {/* ID */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-500 text-xs">
                      #{emp.employee_id}
                    </td>

                    {/* Employee Profile */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {emp.full_name}
                      </div>
                      <div className="flex items-center gap-2 text-slate-500 text-xs mt-0.5">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          {emp.email}
                        </span>
                        {emp.phone && (
                          <span className="hidden md:flex items-center gap-1 text-slate-400">
                            • <Phone className="w-3 h-3" /> {emp.phone}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Department & Role */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">
                        {emp.designation}
                      </div>
                      <div className="text-slate-500 text-xs">
                        {emp.department_name}
                      </div>
                    </td>

                    {/* Joining Date */}
                    <td className="py-3.5 px-4 text-slate-600 font-mono text-xs">
                      {emp.joining_date}
                    </td>

                    {/* Rating */}
                    <td className="py-3.5 px-4">
                      <StarRating rating={emp.avg_rating} size="sm" />
                      {emp.total_reviews ? (
                        <span className="text-[10px] text-slate-400 block font-normal">
                          ({emp.total_reviews} review{emp.total_reviews > 1 ? 's' : ''})
                        </span>
                      ) : null}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleStatus(emp)}
                        title="Click to toggle status"
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          emp.employment_status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            emp.employment_status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'
                          }`}
                        />
                        <span>{emp.employment_status}</span>
                      </button>
                    </td>

                    {/* Action Buttons */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onSelectEmployee(emp.employee_id)}
                          title="View Profile & Insights"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(emp)}
                          title="Edit Details"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteCandidate(emp)}
                          title="Delete Record"
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

        {/* Table Pagination Controls */}
        <div className="px-4 py-3 bg-slate-50/70 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing <strong className="text-slate-800">{employees.length}</strong> of{' '}
            <strong className="text-slate-800">{pagination.total}</strong> employees
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchEmployees(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-slate-700 px-1">
              Page {pagination.page} of {Math.max(1, pagination.totalPages)}
            </span>
            <button
              onClick={() => fetchEmployees(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Employee Modal */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-xl border border-blue-400/30 text-blue-400">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {isAddModalOpen ? 'Add New Employee' : `Edit Employee #${selectedEmployeeForEdit?.employee_id}`}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Master entity record for employee_performance_db
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="e.g. Jeslin J"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Email Address * (Unique)
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="jeslin.j@kitcorp.com"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Department * (FK)
                  </label>
                  <select
                    required
                    value={formData.department_id}
                    onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-blue-500 font-medium"
                  >
                    {departments.map((d) => (
                      <option key={d.department_id} value={d.department_id}>
                        {d.department_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Job Designation *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    placeholder="e.g. Lead Systems Engineer"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Date of Joining *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.joining_date}
                    onChange={(e) => setFormData({ ...formData, joining_date: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Employment Status
                  </label>
                  <select
                    value={formData.employment_status}
                    onChange={(e) => setFormData({ ...formData, employment_status: e.target.value as any })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-blue-500 font-medium"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
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
                  {isAddModalOpen ? 'Save Employee' : 'Update Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteCandidate)}
        title="Delete Employee Record"
        message={`Are you sure you want to delete ${deleteCandidate?.full_name} (#${deleteCandidate?.employee_id})? Due to foreign key ON DELETE CASCADE, all historical performance reviews associated with this employee will also be permanently deleted.`}
        confirmLabel="Yes, Delete Permanently"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteCandidate(null)}
      />
    </div>
  );
};
