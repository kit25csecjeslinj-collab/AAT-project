/**
 * @file types/index.ts
 * @description Centralized TypeScript definitions for Employee Performance Tracking System.
 */

export interface Department {
  department_id: number;
  department_name: string;
  description: string | null;
  created_at: string;
  employee_count?: number;
  active_employee_count?: number;
  avg_rating?: number;
}

export interface Employee {
  employee_id: number;
  full_name: string;
  email: string;
  phone: string | null;
  department_id: number;
  designation: string;
  joining_date: string;
  employment_status: 'Active' | 'Inactive';
  created_at: string;
  department_name?: string;
  avg_rating?: number | null;
  total_reviews?: number;
  reviews?: PerformanceReview[];
}

export interface PerformanceReview {
  review_id: number;
  employee_id: number;
  review_period_start: string;
  review_period_end: string;
  technical_skills_rating: number;
  communication_rating: number;
  teamwork_rating: number;
  productivity_rating: number;
  overall_rating: number;
  reviewer_name: string;
  reviewer_comments: string | null;
  next_period_goals: string | null;
  review_status: 'Pending' | 'In Progress' | 'Completed';
  created_at: string;
  employee_name?: string;
  department_name?: string;
  designation?: string;
}

export interface UserSession {
  user_id: number;
  username: string;
  email: string;
  role: 'Administrator' | 'HR Manager' | 'Reviewer';
  full_name: string;
}

export interface DashboardKPI {
  total_employees: number;
  active_employees: number;
  inactive_employees: number;
  avg_rating: number;
  reviews_completed: number;
  reviews_pending: number;
  top_performers_count: number;
}

export interface MonthlyTrend {
  month_label: string;
  reviews_evaluated: number;
  avg_overall_rating: number;
  avg_technical: number;
  avg_productivity: number;
}

export interface DepartmentSummary {
  department_id: number;
  department_name: string;
  total_employees: number;
  avg_rating: number;
}

export interface TopPerformer {
  employee_id: number;
  full_name: string;
  designation: string;
  department_name: string;
  total_completed_reviews: number;
  average_rating: number;
}

export interface DashboardData {
  kpi: DashboardKPI;
  trends: MonthlyTrend[];
  deptSummary: DepartmentSummary[];
  topPerformers: TopPerformer[];
  recentReviews: PerformanceReview[];
}

export interface DatabaseStatus {
  connected: boolean;
  mode: string;
  host: string;
  port: number;
  database: string;
  user: string;
  tableCounts: {
    departments: number;
    employees: number;
    reviews: number;
  };
  errorMessage: string | null;
}
