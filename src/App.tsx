/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sidebar, NavItemKey } from './components/Sidebar.tsx';
import { Header } from './components/Header.tsx';
import { DatabaseStatusModal } from './components/DatabaseStatusModal.tsx';
import { Toast, ToastMessage } from './components/Toast.tsx';

import { DashboardPage } from './pages/DashboardPage.tsx';
import { EmployeesPage } from './pages/EmployeesPage.tsx';
import { EmployeeProfilePage } from './pages/EmployeeProfilePage.tsx';
import { DepartmentsPage } from './pages/DepartmentsPage.tsx';
import { ReviewsPage } from './pages/ReviewsPage.tsx';
import { ReportsPage } from './pages/ReportsPage.tsx';
import { VivaHubPage } from './pages/VivaHubPage.tsx';
import { LoginPage } from './pages/LoginPage.tsx';

import { DashboardData, DatabaseStatus, Department, Employee, UserSession } from './types/index.ts';
import { api } from './services/api.ts';
import { GraduationCap } from 'lucide-react';

export default function App() {
  // Navigation & User State
  const [currentTab, setCurrentTab] = useState<NavItemKey>('dashboard');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDBModalOpen, setIsDBModalOpen] = useState(false);

  // Authenticated User Session (Defaults to Administrator for immediate seamless evaluation)
  const [currentUser, setCurrentUser] = useState<UserSession | null>({
    user_id: 1,
    username: 'admin',
    email: 'admin@kitcorp.com',
    role: 'Administrator',
    full_name: 'Jeslin J (Administrator)',
  });

  // Global Data State
  const [dbStatus, setDbStatus] = useState<DatabaseStatus | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  // Quick Action Modal flags
  const [initialAddEmployeeModal, setInitialAddEmployeeModal] = useState(false);
  const [initialAddReviewModal, setInitialAddReviewModal] = useState(false);
  const [preselectedReviewEmpId, setPreselectedReviewEmpId] = useState<number | null>(null);

  // Toast Notification System
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    setToasts((prev) => [...prev, { id, type, title, message }]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Data Fetching
  const refreshAppData = async () => {
    setIsDataLoading(true);
    try {
      const [statusRes, dashRes, deptRes, empRes] = await Promise.all([
        api.getDBStatus(),
        api.getDashboard(),
        api.getDepartments(),
        api.getEmployees({ limit: 100 }),
      ]);

      setDbStatus(statusRes.data);
      setDashboardData(dashRes.data);
      setDepartments(deptRes.data);
      setEmployees(empRes.data);
    } catch (err: any) {
      console.error('App data load error', err);
      showToast('error', 'Sync Warning', err.message || 'Error fetching database records');
    } finally {
      setIsDataLoading(false);
    }
  };

  useEffect(() => {
    refreshAppData();
  }, []);

  const handleSelectTab = (tab: NavItemKey) => {
    setSelectedEmployeeId(null);
    setCurrentTab(tab);
  };

  const handleOpenEmployeeProfile = (id: number) => {
    setSelectedEmployeeId(id);
  };

  const handleQuickAction = (action: 'add-employee' | 'add-review' | 'sql-runner') => {
    if (action === 'add-employee') {
      setSelectedEmployeeId(null);
      setCurrentTab('employees');
      setInitialAddEmployeeModal(true);
    } else if (action === 'add-review') {
      setSelectedEmployeeId(null);
      setCurrentTab('reviews');
      setPreselectedReviewEmpId(null);
      setInitialAddReviewModal(true);
    } else if (action === 'sql-runner') {
      setSelectedEmployeeId(null);
      setCurrentTab('viva-hub');
    }
  };

  const handleAddReviewForEmployee = (empId: number) => {
    setSelectedEmployeeId(null);
    setCurrentTab('reviews');
    setPreselectedReviewEmpId(empId);
    setInitialAddReviewModal(true);
  };

  // If user explicitly logged out, render LoginPage
  if (!currentUser) {
    return (
      <>
        <LoginPage
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            refreshAppData();
          }}
          onShowToast={showToast}
        />
        <Toast toasts={toasts} onDismiss={dismissToast} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800 antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        currentUser={currentUser}
        onLogout={() => {
          setCurrentUser(null);
          showToast('info', 'Logged Out', 'You have been signed out.');
        }}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        onOpenDBModal={() => setIsDBModalOpen(true)}
        isLiveMySQL={Boolean(dbStatus?.connected)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Sticky Top Header */}
        <Header
          currentTab={currentTab}
          onOpenMobile={() => setIsMobileMenuOpen(true)}
          onOpenDBModal={() => setIsDBModalOpen(true)}
          dbStatus={dbStatus}
          currentUser={currentUser}
          onQuickAction={handleQuickAction}
        />

        {/* Page Router Body */}
        <main className="flex-1 pb-12">
          {selectedEmployeeId ? (
            <EmployeeProfilePage
              employeeId={selectedEmployeeId}
              onBack={() => setSelectedEmployeeId(null)}
              onAddReviewForEmployee={handleAddReviewForEmployee}
              onShowToast={showToast}
            />
          ) : currentTab === 'dashboard' ? (
            <DashboardPage
              data={dashboardData}
              isLoading={isDataLoading}
              onNavigate={(tab) => handleSelectTab(tab)}
              onAddEmployee={() => handleQuickAction('add-employee')}
              onAddReview={() => handleQuickAction('add-review')}
              onSelectEmployee={handleOpenEmployeeProfile}
            />
          ) : currentTab === 'employees' ? (
            <EmployeesPage
              departments={departments}
              onSelectEmployee={handleOpenEmployeeProfile}
              onShowToast={showToast}
              initialAddModalOpen={initialAddEmployeeModal}
              onResetInitialAdd={() => setInitialAddEmployeeModal(false)}
            />
          ) : currentTab === 'departments' ? (
            <DepartmentsPage
              departments={departments}
              onRefresh={refreshAppData}
              onShowToast={showToast}
            />
          ) : currentTab === 'reviews' ? (
            <ReviewsPage
              employees={employees}
              departments={departments}
              onSelectEmployee={handleOpenEmployeeProfile}
              onShowToast={showToast}
              initialAddModalOpen={initialAddReviewModal}
              preselectedEmployeeId={preselectedReviewEmpId}
              onResetInitialAdd={() => {
                setInitialAddReviewModal(false);
                setPreselectedReviewEmpId(null);
              }}
            />
          ) : currentTab === 'reports' ? (
            <ReportsPage
              departments={departments}
              onSelectEmployee={handleOpenEmployeeProfile}
              onShowToast={showToast}
            />
          ) : currentTab === 'viva-hub' ? (
            <VivaHubPage onShowToast={showToast} />
          ) : null}
        </main>

        {/* Discreet Academic Footer */}
        <footer className="border-t border-slate-200/80 bg-white py-4 px-6 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-teal-600" />
            <span className="font-semibold text-slate-700">KIT | CSE | DBMS AAT Project</span>
            <span className="hidden md:inline">• Kalaignarkarunanidhi Institute of Technology</span>
          </div>
          <div className="text-right">
            <span>Student: <strong>Jeslin J</strong> (Reg No: <span className="font-mono">711525BCS052</span>)</span>
            <span className="ml-3 font-mono text-[11px] text-slate-400">MySQL 8.0+ / InnoDB</span>
          </div>
        </footer>
      </div>

      {/* Global Database Diagnostics Modal */}
      <DatabaseStatusModal
        isOpen={isDBModalOpen}
        status={dbStatus}
        onClose={() => setIsDBModalOpen(false)}
        onRefresh={refreshAppData}
      />

      {/* Toast Notification Container */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
