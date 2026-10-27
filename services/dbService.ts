/**
 * @file dbService.ts
 * @description Centralized Database Service supporting both Live MySQL 8.0 execution
 * and simulated high-fidelity in-memory engine with realistic seed data.
 * Built for KIT CSE DBMS AAT Project by Jeslin J (711525BCS052).
 */

import { getMySQLPool, isConnectedToLiveMySQL, dbConfig, getConnectionError } from '../config/database.ts';

export interface Department {
  department_id: number;
  department_name: string;
  description: string | null;
  created_at: string;
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
  // Joined field
  department_name?: string;
  avg_rating?: number;
  total_reviews?: number;
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
  // Joined fields
  employee_name?: string;
  department_name?: string;
  designation?: string;
}

export interface SystemUser {
  user_id: number;
  username: string;
  email: string;
  password_hash: string;
  role: 'Administrator' | 'HR Manager' | 'Reviewer';
  full_name: string;
  created_at: string;
}

// ==========================================
// In-Memory Seed Storage for Demo Mode
// ==========================================
let departmentsStore: Department[] = [
  { department_id: 1, department_name: 'Computer Science', description: 'Core software engineering, cloud systems, and platform development', created_at: '2023-01-01 00:00:00' },
  { department_id: 2, department_name: 'Human Resources', description: 'Talent acquisition, employee engagement, workplace culture, and compliance', created_at: '2023-01-01 00:00:00' },
  { department_id: 3, department_name: 'Finance', description: 'Financial planning, accounting, budgeting, auditing, and corporate governance', created_at: '2023-01-01 00:00:00' },
  { department_id: 4, department_name: 'Sales & Marketing', description: 'Enterprise client acquisitions, brand growth, customer outreach, and sales operations', created_at: '2023-01-01 00:00:00' },
  { department_id: 5, department_name: 'Quality Assurance', description: 'Test automation, release verification, performance benchmarking, and QA', created_at: '2023-01-01 00:00:00' },
  { department_id: 6, department_name: 'Product Design', description: 'UI/UX design, user research, wireframing, and product innovation', created_at: '2023-01-01 00:00:00' },
];

let employeesStore: Employee[] = [
  { employee_id: 1, full_name: 'Aarav Patel', email: 'aarav.patel@kitcorp.com', phone: '+91 98765 43210', department_id: 1, designation: 'Senior Full-Stack Engineer', joining_date: '2023-01-15', employment_status: 'Active', created_at: '2023-01-15 09:00:00' },
  { employee_id: 2, full_name: 'Diya Sundaram', email: 'diya.sundaram@kitcorp.com', phone: '+91 98451 23456', department_id: 1, designation: 'Cloud DevOps Architect', joining_date: '2022-06-10', employment_status: 'Active', created_at: '2022-06-10 09:00:00' },
  { employee_id: 3, full_name: 'Karthik Raja', email: 'karthik.raja@kitcorp.com', phone: '+91 97890 12345', department_id: 1, designation: 'Software Engineer I', joining_date: '2024-03-01', employment_status: 'Active', created_at: '2024-03-01 09:00:00' },
  { employee_id: 4, full_name: 'Ananya Sharma', email: 'ananya.sharma@kitcorp.com', phone: '+91 99401 56789', department_id: 2, designation: 'HR Business Partner', joining_date: '2021-11-20', employment_status: 'Active', created_at: '2021-11-20 09:00:00' },
  { employee_id: 5, full_name: 'Vikram Chandran', email: 'vikram.chandran@kitcorp.com', phone: '+91 98840 87654', department_id: 2, designation: 'Talent Acquisition Lead', joining_date: '2023-05-18', employment_status: 'Active', created_at: '2023-05-18 09:00:00' },
  { employee_id: 6, full_name: 'Meera Nambiar', email: 'meera.nambiar@kitcorp.com', phone: '+91 94440 23456', department_id: 3, designation: 'Senior Financial Analyst', joining_date: '2022-02-14', employment_status: 'Active', created_at: '2022-02-14 09:00:00' },
  { employee_id: 7, full_name: 'Sanjay Kulkarni', email: 'sanjay.kulkarni@kitcorp.com', phone: '+91 96001 98765', department_id: 3, designation: 'Accounting Associate', joining_date: '2024-01-08', employment_status: 'Active', created_at: '2024-01-08 09:00:00' },
  { employee_id: 8, full_name: 'Pooja Iyer', email: 'pooja.iyer@kitcorp.com', phone: '+91 97100 45678', department_id: 4, designation: 'Sales Account Director', joining_date: '2021-08-12', employment_status: 'Active', created_at: '2021-08-12 09:00:00' },
  { employee_id: 9, full_name: 'Rahul Verma', email: 'rahul.verma@kitcorp.com', phone: '+91 98402 11223', department_id: 4, designation: 'Enterprise Marketing Strategist', joining_date: '2023-09-01', employment_status: 'Active', created_at: '2023-09-01 09:00:00' },
  { employee_id: 10, full_name: 'Sneha Krishnan', email: 'sneha.krishnan@kitcorp.com', phone: '+91 99620 33445', department_id: 5, designation: 'Lead QA Automation Engineer', joining_date: '2022-09-15', employment_status: 'Active', created_at: '2022-09-15 09:00:00' },
  { employee_id: 11, full_name: 'Harish Balaji', email: 'harish.balaji@kitcorp.com', phone: '+91 98415 66778', department_id: 5, designation: 'QA Test Associate', joining_date: '2024-02-10', employment_status: 'Active', created_at: '2024-02-10 09:00:00' },
  { employee_id: 12, full_name: 'Tanvi Menon', email: 'tanvi.menon@kitcorp.com', phone: '+91 97910 88990', department_id: 6, designation: 'Senior UI/UX Designer', joining_date: '2022-04-05', employment_status: 'Active', created_at: '2022-04-05 09:00:00' },
  { employee_id: 13, full_name: 'Rohan Gupta', email: 'rohan.gupta@kitcorp.com', phone: '+91 99402 99001', department_id: 1, designation: 'Backend Database Developer', joining_date: '2023-10-12', employment_status: 'Active', created_at: '2023-10-12 09:00:00' },
  { employee_id: 14, full_name: 'Naveen Kumar', email: 'naveen.kumar@kitcorp.com', phone: '+91 98403 44556', department_id: 4, designation: 'Junior Sales Executive', joining_date: '2024-04-15', employment_status: 'Inactive', created_at: '2024-04-15 09:00:00' },
  { employee_id: 15, full_name: 'Divya Nair', email: 'divya.nair@kitcorp.com', phone: '+91 97891 22334', department_id: 6, designation: 'Product Researcher', joining_date: '2023-08-20', employment_status: 'Active', created_at: '2023-08-20 09:00:00' },
];

let reviewsStore: PerformanceReview[] = [
  { review_id: 1, employee_id: 1, review_period_start: '2026-01-01', review_period_end: '2026-03-31', technical_skills_rating: 4.80, communication_rating: 4.60, teamwork_rating: 4.70, productivity_rating: 4.90, overall_rating: 4.75, reviewer_name: 'Dr. Rajesh Murugan (VP Eng)', reviewer_comments: 'Exceptional technical depth. Led the database migration to MySQL 8.0 cluster with zero downtime and mentored junior backend engineers.', next_period_goals: 'Spearhead GraphQL API modernization and containerize distributed services.', review_status: 'Completed', created_at: '2026-04-02 10:15:00' },
  { review_id: 2, employee_id: 1, review_period_start: '2025-10-01', review_period_end: '2025-12-31', technical_skills_rating: 4.70, communication_rating: 4.50, teamwork_rating: 4.60, productivity_rating: 4.80, overall_rating: 4.65, reviewer_name: 'Dr. Rajesh Murugan (VP Eng)', reviewer_comments: 'Delivered high-throughput payment reconciliation service ahead of deadline with 99.99% unit test coverage.', next_period_goals: 'Complete MySQL enterprise optimization certification and organize team tech talks.', review_status: 'Completed', created_at: '2026-01-05 11:30:00' },
  { review_id: 3, employee_id: 2, review_period_start: '2026-01-01', review_period_end: '2026-03-31', technical_skills_rating: 4.90, communication_rating: 4.70, teamwork_rating: 4.80, productivity_rating: 4.80, overall_rating: 4.80, reviewer_name: 'Dr. Rajesh Murugan (VP Eng)', reviewer_comments: 'Superb execution on automated CI/CD pipelines and infrastructure as code. Reduced cloud infrastructure spend by 28%.', next_period_goals: 'Automate disaster recovery failover drills and deploy multi-region monitoring dashboards.', review_status: 'Completed', created_at: '2026-04-03 14:20:00' },
  { review_id: 4, employee_id: 2, review_period_start: '2025-10-01', review_period_end: '2025-12-31', technical_skills_rating: 4.80, communication_rating: 4.60, teamwork_rating: 4.70, productivity_rating: 4.70, overall_rating: 4.70, reviewer_name: 'Dr. Rajesh Murugan (VP Eng)', reviewer_comments: 'Stabilized Kubernetes clusters during Black Friday enterprise traffic spikes.', next_period_goals: 'Streamline secret management workflows and enhance security scanning.', review_status: 'Completed', created_at: '2026-01-08 09:45:00' },
  { review_id: 5, employee_id: 3, review_period_start: '2026-01-01', review_period_end: '2026-03-31', technical_skills_rating: 3.80, communication_rating: 3.60, teamwork_rating: 4.00, productivity_rating: 3.60, overall_rating: 3.75, reviewer_name: 'Aarav Patel (Tech Lead)', reviewer_comments: 'Shows eager learning curve and solid grasp of React and TypeScript. Needs to improve SQL indexing understanding and code reviews thoroughness.', next_period_goals: 'Master complex SQL JOINs, transactions, and contribute to 3 core sprint epics.', review_status: 'Completed', created_at: '2026-04-04 16:10:00' },
  { review_id: 6, employee_id: 3, review_period_start: '2026-04-01', review_period_end: '2026-06-30', technical_skills_rating: 4.00, communication_rating: 3.80, teamwork_rating: 4.20, productivity_rating: 3.90, overall_rating: 3.98, reviewer_name: 'Aarav Patel (Tech Lead)', reviewer_comments: 'In-progress review for mid-year evaluation. Significant progress in database query debugging.', next_period_goals: 'Deliver the employee export report module independently.', review_status: 'In Progress', created_at: '2026-05-10 11:00:00' },
  { review_id: 7, employee_id: 4, review_period_start: '2026-01-01', review_period_end: '2026-03-31', technical_skills_rating: 4.50, communication_rating: 4.90, teamwork_rating: 4.80, productivity_rating: 4.60, overall_rating: 4.70, reviewer_name: 'Ganesh Raman (Chief People Officer)', reviewer_comments: 'Outstanding communication and interpersonal empathy. Successfully resolved inter-departmental workflows and enhanced onboarding NPS to 94%.', next_period_goals: 'Implement automated performance appraisal cadence and annual talent retention drive.', review_status: 'Completed', created_at: '2026-04-05 10:00:00' },
  { review_id: 8, employee_id: 4, review_period_start: '2025-10-01', review_period_end: '2025-12-31', technical_skills_rating: 4.40, communication_rating: 4.80, teamwork_rating: 4.70, productivity_rating: 4.50, overall_rating: 4.60, reviewer_name: 'Ganesh Raman (Chief People Officer)', reviewer_comments: 'Led company-wide annual townhall and implemented employee health benefits revamp.', next_period_goals: 'Conduct quarterly 360-degree feedback workshops.', review_status: 'Completed', created_at: '2026-01-04 15:30:00' },
  { review_id: 9, employee_id: 5, review_period_start: '2026-01-01', review_period_end: '2026-03-31', technical_skills_rating: 4.10, communication_rating: 4.50, teamwork_rating: 4.20, productivity_rating: 4.20, overall_rating: 4.25, reviewer_name: 'Ananya Sharma (HRBP)', reviewer_comments: 'Achieved hiring targets for campus recruitment drive across top engineering colleges in Tamil Nadu.', next_period_goals: 'Reduce time-to-hire by 15% and build pipeline for specialized AI/ML roles.', review_status: 'Completed', created_at: '2026-04-06 13:45:00' },
  { review_id: 10, employee_id: 6, review_period_start: '2026-01-01', review_period_end: '2026-03-31', technical_skills_rating: 4.70, communication_rating: 4.40, teamwork_rating: 4.50, productivity_rating: 4.60, overall_rating: 4.55, reviewer_name: 'Subramanian S (Finance Director)', reviewer_comments: 'Meticulous financial forecasting. Discovered an invoicing anomaly that saved the company $42,000.', next_period_goals: 'Implement automated ERP financial reconciliations and lead Q2 audit prep.', review_status: 'Completed', created_at: '2026-04-07 14:15:00' },
  { review_id: 11, employee_id: 6, review_period_start: '2025-10-01', review_period_end: '2025-12-31', technical_skills_rating: 4.60, communication_rating: 4.30, teamwork_rating: 4.40, productivity_rating: 4.50, overall_rating: 4.45, reviewer_name: 'Subramanian S (Finance Director)', reviewer_comments: 'Delivered year-end tax compliance reports with zero audit discrepancies.', next_period_goals: 'Refine cost-center budgeting models.', review_status: 'Completed', created_at: '2026-01-07 16:00:00' },
  { review_id: 12, employee_id: 7, review_period_start: '2026-01-01', review_period_end: '2026-03-31', technical_skills_rating: 3.40, communication_rating: 3.20, teamwork_rating: 3.60, productivity_rating: 3.40, overall_rating: 3.40, reviewer_name: 'Meera Nambiar (Lead Analyst)', reviewer_comments: 'Punctual with accounts payable processing but requires supervision on vendor tax withholding reconciliation.', next_period_goals: 'Attend corporate taxation training and increase journal entry accuracy to 99%.', review_status: 'Completed', created_at: '2026-04-08 11:20:00' },
  { review_id: 13, employee_id: 8, review_period_start: '2026-01-01', review_period_end: '2026-03-31', technical_skills_rating: 4.50, communication_rating: 4.90, teamwork_rating: 4.70, productivity_rating: 4.90, overall_rating: 4.75, reviewer_name: 'Vivek Singhania (Chief Revenue Officer)', reviewer_comments: 'Exceeded quarterly revenue quota by 142%. Closed two multi-million dollar annual enterprise agreements.', next_period_goals: 'Expand enterprise accounts in APAC region and train account executives.', review_status: 'Completed', created_at: '2026-04-09 10:45:00' },
  { review_id: 14, employee_id: 8, review_period_start: '2025-10-01', review_period_end: '2025-12-31', technical_skills_rating: 4.40, communication_rating: 4.80, teamwork_rating: 4.60, productivity_rating: 4.80, overall_rating: 4.65, reviewer_name: 'Vivek Singhania (Chief Revenue Officer)', reviewer_comments: 'Drove Q4 enterprise renewal rate to 98.4%.', next_period_goals: 'Build key client advisory council.', review_status: 'Completed', created_at: '2026-01-09 12:00:00' },
  { review_id: 15, employee_id: 9, review_period_start: '2026-01-01', review_period_end: '2026-03-31', technical_skills_rating: 4.20, communication_rating: 4.40, teamwork_rating: 4.30, productivity_rating: 4.10, overall_rating: 4.25, reviewer_name: 'Pooja Iyer (Sales Director)', reviewer_comments: 'Generated 650+ qualified enterprise inbound leads through coordinated technical webinars and whitepapers.', next_period_goals: 'Boost organic search traffic by 30% and launch brand customer showcase video.', review_status: 'Completed', created_at: '2026-04-10 15:30:00' },
  { review_id: 16, employee_id: 10, review_period_start: '2026-01-01', review_period_end: '2026-03-31', technical_skills_rating: 4.70, communication_rating: 4.40, teamwork_rating: 4.60, productivity_rating: 4.70, overall_rating: 4.60, reviewer_name: 'Dr. Rajesh Murugan (VP Eng)', reviewer_comments: 'Engineered end-to-end automated test suite, cutting regression test duration from 4 days to 45 minutes.', next_period_goals: 'Integrate automated performance stress testing in pre-release pipelines.', review_status: 'Completed', created_at: '2026-04-11 11:15:00' },
  { review_id: 17, employee_id: 10, review_period_start: '2025-10-01', review_period_end: '2025-12-31', technical_skills_rating: 4.60, communication_rating: 4.30, teamwork_rating: 4.50, productivity_rating: 4.60, overall_rating: 4.50, reviewer_name: 'Dr. Rajesh Murugan (VP Eng)', reviewer_comments: 'Maintained 0 critical release bugs across 4 production deployments.', next_period_goals: 'Expand cross-browser automated matrix.', review_status: 'Completed', created_at: '2026-01-10 14:00:00' },
  { review_id: 18, employee_id: 11, review_period_start: '2026-01-01', review_period_end: '2026-03-31', technical_skills_rating: 3.50, communication_rating: 3.40, teamwork_rating: 3.80, productivity_rating: 3.50, overall_rating: 3.55, reviewer_name: 'Sneha Krishnan (QA Lead)', reviewer_comments: 'Good manual exploratory testing. Needs more hands-on practice writing API automation tests.', next_period_goals: 'Complete Postman API test automation certification and write 50 new test scripts.', review_status: 'Completed', created_at: '2026-04-12 16:40:00' },
  { review_id: 19, employee_id: 12, review_period_start: '2026-01-01', review_period_end: '2026-03-31', technical_skills_rating: 4.80, communication_rating: 4.60, teamwork_rating: 4.70, productivity_rating: 4.70, overall_rating: 4.70, reviewer_name: 'Aditi Rao (Head of Product)', reviewer_comments: 'Created the unified design system for enterprise products with high accessibility WCAG 2.1 compliance.', next_period_goals: 'Conduct user usability studies for the upcoming mobile responsive dashboard.', review_status: 'Completed', created_at: '2026-04-13 14:00:00' },
  { review_id: 20, employee_id: 12, review_period_start: '2025-10-01', review_period_end: '2025-12-31', technical_skills_rating: 4.70, communication_rating: 4.50, teamwork_rating: 4.60, productivity_rating: 4.60, overall_rating: 4.60, reviewer_name: 'Aditi Rao (Head of Product)', reviewer_comments: 'Redesigned core navigation structure resulting in 22% drop in user task completion time.', next_period_goals: 'Publish Figma component token library.', review_status: 'Completed', created_at: '2026-01-12 11:30:00' },
  { review_id: 21, employee_id: 13, review_period_start: '2026-01-01', review_period_end: '2026-03-31', technical_skills_rating: 4.60, communication_rating: 4.10, teamwork_rating: 4.30, productivity_rating: 4.40, overall_rating: 4.35, reviewer_name: 'Aarav Patel (Tech Lead)', reviewer_comments: 'Optimized complex SQL queries and index strategies. Reduced database CPU load by 35% during peak hours.', next_period_goals: 'Implement database partitioning and write stored procedures for analytical reports.', review_status: 'Completed', created_at: '2026-04-14 17:15:00' },
  { review_id: 22, employee_id: 15, review_period_start: '2026-01-01', review_period_end: '2026-03-31', technical_skills_rating: 4.30, communication_rating: 4.70, teamwork_rating: 4.50, productivity_rating: 4.20, overall_rating: 4.43, reviewer_name: 'Aditi Rao (Head of Product)', reviewer_comments: 'Synthesized 40+ user interview transcripts into comprehensive product journey maps.', next_period_goals: 'Establish recurring customer feedback panels and prototype test cohorts.', review_status: 'Completed', created_at: '2026-04-15 10:20:00' },
  { review_id: 23, employee_id: 1, review_period_start: '2026-04-01', review_period_end: '2026-06-30', technical_skills_rating: 4.80, communication_rating: 4.70, teamwork_rating: 4.70, productivity_rating: 4.80, overall_rating: 4.75, reviewer_name: 'Dr. Rajesh Murugan (VP Eng)', reviewer_comments: 'Draft evaluation for Q2. Strong leadership in architecture review boards.', next_period_goals: 'Finalize microservice boundaries and publish team design documents.', review_status: 'Pending', created_at: '2026-05-12 09:30:00' },
  { review_id: 24, employee_id: 6, review_period_start: '2026-04-01', review_period_end: '2026-06-30', technical_skills_rating: 4.70, communication_rating: 4.50, teamwork_rating: 4.60, productivity_rating: 4.60, overall_rating: 4.60, reviewer_name: 'Subramanian S (Finance Director)', reviewer_comments: 'Mid-cycle review in progress for financial automation project.', next_period_goals: 'Complete vendor invoice reconciliations.', review_status: 'Pending', created_at: '2026-05-14 15:00:00' },
  { review_id: 25, employee_id: 12, review_period_start: '2026-04-01', review_period_end: '2026-06-30', technical_skills_rating: 4.80, communication_rating: 4.60, teamwork_rating: 4.80, productivity_rating: 4.60, overall_rating: 4.70, reviewer_name: 'Aditi Rao (Head of Product)', reviewer_comments: 'In-progress review for design system version 3.0 release.', next_period_goals: 'Deliver mobile-first navigation prototypes.', review_status: 'In Progress', created_at: '2026-05-15 16:30:00' }
];

let usersStore: SystemUser[] = [
  { user_id: 1, username: 'admin', email: 'admin@kitcorp.com', password_hash: '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQmG6W6dpE.v6vV3fL1.C', role: 'Administrator', full_name: 'Jeslin J (Administrator)', created_at: '2023-01-01 00:00:00' },
  { user_id: 2, username: 'hrmanager', email: 'ananya.hr@kitcorp.com', password_hash: '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQmG6W6dpE.v6vV3fL1.C', role: 'HR Manager', full_name: 'Ananya Sharma (HR)', created_at: '2023-01-01 00:00:00' },
  { user_id: 3, username: 'reviewer', email: 'rajesh.lead@kitcorp.com', password_hash: '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQmG6W6dpE.v6vV3fL1.C', role: 'Reviewer', full_name: 'Dr. Rajesh Murugan (Reviewer)', created_at: '2023-01-01 00:00:00' },
];

let nextDeptId = 7;
let nextEmpId = 16;
let nextReviewId = 26;

// Helper: Calculate Department details for an employee
function enrichEmployee(emp: Employee): Employee {
  const dept = departmentsStore.find(d => d.department_id === emp.department_id);
  const empReviews = reviewsStore.filter(r => r.employee_id === emp.employee_id && r.review_status === 'Completed');
  const avg = empReviews.length > 0 
    ? Number((empReviews.reduce((sum, r) => sum + r.overall_rating, 0) / empReviews.length).toFixed(2))
    : undefined;

  return {
    ...emp,
    department_name: dept ? dept.department_name : 'Unknown Department',
    avg_rating: avg,
    total_reviews: empReviews.length,
  };
}

// Helper: Enrich Review
function enrichReview(review: PerformanceReview): PerformanceReview {
  const emp = employeesStore.find(e => e.employee_id === review.employee_id);
  const dept = emp ? departmentsStore.find(d => d.department_id === emp.department_id) : null;
  return {
    ...review,
    employee_name: emp ? emp.full_name : `Employee #${review.employee_id}`,
    designation: emp ? emp.designation : 'N/A',
    department_name: dept ? dept.department_name : 'N/A',
  };
}

// ==========================================
// DB SERVICE METHODS
// ==========================================
export const dbService = {
  // Status & Connection Info
  getStatus: async () => {
    const isLive = isConnectedToLiveMySQL();
    if (isLive) {
      try {
        const pool = getMySQLPool()!;
        const [empRows]: any = await pool.query('SELECT COUNT(*) as count FROM employees');
        const [deptRows]: any = await pool.query('SELECT COUNT(*) as count FROM departments');
        const [revRows]: any = await pool.query('SELECT COUNT(*) as count FROM performance_reviews');

        return {
          connected: true,
          mode: 'MySQL 8.0 Live Database',
          host: dbConfig.host,
          port: dbConfig.port,
          database: dbConfig.database,
          user: dbConfig.user,
          tableCounts: {
            departments: deptRows[0].count,
            employees: empRows[0].count,
            reviews: revRows[0].count,
          },
          errorMessage: null,
        };
      } catch (err: any) {
        // Fall back to reported state
      }
    }

    return {
      connected: false,
      mode: 'Demo Mode (In-Memory MySQL 8.0 Simulation)',
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.database,
      user: dbConfig.user,
      tableCounts: {
        departments: departmentsStore.length,
        employees: employeesStore.length,
        reviews: reviewsStore.length,
      },
      errorMessage: getConnectionError() || 'MySQL server not connected on host:port. Running in high-fidelity simulated mode.',
    };
  },

  // ------------------------------------------
  // DASHBOARD METRICS
  // ------------------------------------------
  getDashboardMetrics: async () => {
    if (isConnectedToLiveMySQL()) {
      try {
        const pool = getMySQLPool()!;
        const sql = `
          SELECT 
              (SELECT COUNT(*) FROM employees) AS total_employees,
              (SELECT COUNT(*) FROM employees WHERE employment_status = 'Active') AS active_employees,
              (SELECT COUNT(*) FROM employees WHERE employment_status = 'Inactive') AS inactive_employees,
              (SELECT ROUND(AVG(overall_rating), 2) FROM performance_reviews WHERE review_status = 'Completed') AS avg_rating,
              (SELECT COUNT(*) FROM performance_reviews WHERE review_status = 'Completed') AS reviews_completed,
              (SELECT COUNT(*) FROM performance_reviews WHERE review_status IN ('Pending', 'In Progress')) AS reviews_pending,
              (SELECT COUNT(DISTINCT employee_id) FROM performance_reviews WHERE overall_rating >= 4.5 AND review_status = 'Completed') AS top_performers_count
        `;
        const [rows]: any = await pool.query(sql);
        const kpi = rows[0];

        // Monthly trends
        const [trends]: any = await pool.query(`
          SELECT 
              DATE_FORMAT(r.review_period_end, '%b %Y') AS month_label,
              COUNT(r.review_id) AS reviews_evaluated,
              ROUND(AVG(r.overall_rating), 2) AS avg_overall_rating,
              ROUND(AVG(r.technical_skills_rating), 2) AS avg_technical,
              ROUND(AVG(r.productivity_rating), 2) AS avg_productivity
          FROM performance_reviews r
          WHERE r.review_status = 'Completed'
          GROUP BY DATE_FORMAT(r.review_period_end, '%Y-%m'), month_label
          ORDER BY DATE_FORMAT(r.review_period_end, '%Y-%m') ASC
        `);

        // Department-wise
        const [deptSummary]: any = await pool.query(`
          SELECT 
              d.department_id,
              d.department_name,
              COUNT(DISTINCT e.employee_id) AS total_employees,
              ROUND(COALESCE(AVG(r.overall_rating), 0), 2) AS avg_rating
          FROM departments d
          LEFT JOIN employees e ON d.department_id = e.department_id
          LEFT JOIN performance_reviews r ON e.employee_id = r.employee_id AND r.review_status = 'Completed'
          GROUP BY d.department_id, d.department_name
          ORDER BY avg_rating DESC
        `);

        // Top 5 performers
        const [topPerformers]: any = await pool.query(`
          SELECT 
              e.employee_id,
              e.full_name,
              e.designation,
              d.department_name,
              COUNT(r.review_id) AS total_completed_reviews,
              ROUND(AVG(r.overall_rating), 2) AS average_rating
          FROM employees e
          INNER JOIN departments d ON e.department_id = d.department_id
          INNER JOIN performance_reviews r ON e.employee_id = r.employee_id
          WHERE r.review_status = 'Completed' AND e.employment_status = 'Active'
          GROUP BY e.employee_id, e.full_name, e.designation, d.department_name
          ORDER BY average_rating DESC
          LIMIT 5
        `);

        // Recent reviews
        const [recentReviews]: any = await pool.query(`
          SELECT 
              r.*,
              e.full_name AS employee_name,
              d.department_name,
              e.designation
          FROM performance_reviews r
          JOIN employees e ON r.employee_id = e.employee_id
          JOIN departments d ON e.department_id = d.department_id
          ORDER BY r.created_at DESC
          LIMIT 6
        `);

        return {
          kpi: {
            total_employees: Number(kpi.total_employees) || 0,
            active_employees: Number(kpi.active_employees) || 0,
            inactive_employees: Number(kpi.inactive_employees) || 0,
            avg_rating: Number(kpi.avg_rating) || 0,
            reviews_completed: Number(kpi.reviews_completed) || 0,
            reviews_pending: Number(kpi.reviews_pending) || 0,
            top_performers_count: Number(kpi.top_performers_count) || 0,
          },
          trends,
          deptSummary,
          topPerformers,
          recentReviews,
        };
      } catch (err) {
        console.error('MySQL query error, using simulator', err);
      }
    }

    // In-Memory Simulation
    const total_employees = employeesStore.length;
    const active_employees = employeesStore.filter(e => e.employment_status === 'Active').length;
    const inactive_employees = employeesStore.filter(e => e.employment_status === 'Inactive').length;
    
    const completedReviews = reviewsStore.filter(r => r.review_status === 'Completed');
    const pendingReviews = reviewsStore.filter(r => r.review_status === 'Pending' || r.review_status === 'In Progress');
    
    const avg_rating = completedReviews.length > 0
      ? Number((completedReviews.reduce((sum, r) => sum + r.overall_rating, 0) / completedReviews.length).toFixed(2))
      : 0;

    // Top performers count
    const empRatings: { [id: number]: number[] } = {};
    completedReviews.forEach(r => {
      if (!empRatings[r.employee_id]) empRatings[r.employee_id] = [];
      empRatings[r.employee_id].push(r.overall_rating);
    });

    let top_performers_count = 0;
    Object.keys(empRatings).forEach(idStr => {
      const id = Number(idStr);
      const emp = employeesStore.find(e => e.employee_id === id);
      if (emp && emp.employment_status === 'Active') {
        const scores = empRatings[id];
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
        if (avg >= 4.5) top_performers_count++;
      }
    });

    // Monthly trends
    const monthMap: { [key: string]: { label: string; count: number; sumOverall: number; sumTech: number; sumProd: number } } = {};
    completedReviews.forEach(r => {
      const d = new Date(r.review_period_end);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
      if (!monthMap[key]) {
        monthMap[key] = { label, count: 0, sumOverall: 0, sumTech: 0, sumProd: 0 };
      }
      monthMap[key].count++;
      monthMap[key].sumOverall += r.overall_rating;
      monthMap[key].sumTech += r.technical_skills_rating;
      monthMap[key].sumProd += r.productivity_rating;
    });

    const trends = Object.keys(monthMap).sort().map(key => ({
      month_label: monthMap[key].label,
      reviews_evaluated: monthMap[key].count,
      avg_overall_rating: Number((monthMap[key].sumOverall / monthMap[key].count).toFixed(2)),
      avg_technical: Number((monthMap[key].sumTech / monthMap[key].count).toFixed(2)),
      avg_productivity: Number((monthMap[key].sumProd / monthMap[key].count).toFixed(2)),
    }));

    // Department summary
    const deptSummary = departmentsStore.map(dept => {
      const deptEmps = employeesStore.filter(e => e.department_id === dept.department_id);
      const deptEmpIds = deptEmps.map(e => e.employee_id);
      const deptReviews = completedReviews.filter(r => deptEmpIds.includes(r.employee_id));
      const avg = deptReviews.length > 0
        ? Number((deptReviews.reduce((sum, r) => sum + r.overall_rating, 0) / deptReviews.length).toFixed(2))
        : 0;

      return {
        department_id: dept.department_id,
        department_name: dept.department_name,
        total_employees: deptEmps.length,
        avg_rating: avg,
      };
    }).sort((a, b) => b.avg_rating - a.avg_rating);

    // Top 5 performers
    const performerList = Object.keys(empRatings).map(idStr => {
      const id = Number(idStr);
      const emp = employeesStore.find(e => e.employee_id === id);
      if (!emp || emp.employment_status !== 'Active') return null;
      const dept = departmentsStore.find(d => d.department_id === emp.department_id);
      const scores = empRatings[id];
      const avg = Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2));
      return {
        employee_id: emp.employee_id,
        full_name: emp.full_name,
        designation: emp.designation,
        department_name: dept?.department_name || 'General',
        total_completed_reviews: scores.length,
        average_rating: avg,
      };
    }).filter(Boolean) as any[];

    performerList.sort((a, b) => b.average_rating - a.average_rating);
    const topPerformers = performerList.slice(0, 5);

    // Recent 6 reviews
    const recentReviews = [...reviewsStore]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 6)
      .map(enrichReview);

    return {
      kpi: {
        total_employees,
        active_employees,
        inactive_employees,
        avg_rating,
        reviews_completed: completedReviews.length,
        reviews_pending: pendingReviews.length,
        top_performers_count,
      },
      trends,
      deptSummary,
      topPerformers,
      recentReviews,
    };
  },

  // ------------------------------------------
  // EMPLOYEES CRUD
  // ------------------------------------------
  getEmployees: async (filters: {
    search?: string;
    department_id?: string;
    employment_status?: string;
    sort_by?: string;
    sort_order?: 'ASC' | 'DESC';
    page?: number;
    limit?: number;
  }) => {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.max(1, filters.limit || 10);
    const offset = (page - 1) * limit;

    if (isConnectedToLiveMySQL()) {
      try {
        const pool = getMySQLPool()!;
        let whereClauses: string[] = ['1=1'];
        const params: any[] = [];

        if (filters.search) {
          whereClauses.push('(e.full_name LIKE ? OR e.email LIKE ? OR e.designation LIKE ? OR CAST(e.employee_id AS CHAR) LIKE ?)');
          const q = `%${filters.search}%`;
          params.push(q, q, q, q);
        }

        if (filters.department_id && filters.department_id !== 'all') {
          whereClauses.push('e.department_id = ?');
          params.push(filters.department_id);
        }

        if (filters.employment_status && filters.employment_status !== 'all') {
          whereClauses.push('e.employment_status = ?');
          params.push(filters.employment_status);
        }

        const whereSql = whereClauses.join(' AND ');

        // Count total
        const [countRows]: any = await pool.query(
          `SELECT COUNT(*) AS total FROM employees e WHERE ${whereSql}`,
          params
        );
        const total = countRows[0].total;

        // Sort order
        let orderSql = 'e.employee_id ASC';
        if (filters.sort_by === 'name') {
          orderSql = `e.full_name ${filters.sort_order || 'ASC'}`;
        } else if (filters.sort_by === 'joining_date') {
          orderSql = `e.joining_date ${filters.sort_order || 'DESC'}`;
        } else if (filters.sort_by === 'rating') {
          orderSql = `avg_rating ${filters.sort_order || 'DESC'}`;
        }

        const dataSql = `
          SELECT 
              e.*,
              d.department_name,
              COUNT(r.review_id) AS total_reviews,
              ROUND(AVG(CASE WHEN r.review_status = 'Completed' THEN r.overall_rating END), 2) AS avg_rating
          FROM employees e
          JOIN departments d ON e.department_id = d.department_id
          LEFT JOIN performance_reviews r ON e.employee_id = r.employee_id
          WHERE ${whereSql}
          GROUP BY e.employee_id, d.department_name
          ORDER BY ${orderSql}
          LIMIT ? OFFSET ?
        `;

        const [rows]: any = await pool.query(dataSql, [...params, limit, offset]);

        return {
          data: rows,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        };
      } catch (err) {
        console.error('MySQL getEmployees error, using fallback', err);
      }
    }

    // In-memory implementation
    let list = employeesStore.map(enrichEmployee);

    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(e =>
        e.full_name.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        e.designation.toLowerCase().includes(q) ||
        String(e.employee_id).includes(q)
      );
    }

    if (filters.department_id && filters.department_id !== 'all') {
      const deptId = Number(filters.department_id);
      list = list.filter(e => e.department_id === deptId);
    }

    if (filters.employment_status && filters.employment_status !== 'all') {
      list = list.filter(e => e.employment_status === filters.employment_status);
    }

    // Sorting
    const sortOrder = filters.sort_order === 'DESC' ? -1 : 1;
    if (filters.sort_by === 'name') {
      list.sort((a, b) => a.full_name.localeCompare(b.full_name) * sortOrder);
    } else if (filters.sort_by === 'joining_date') {
      list.sort((a, b) => (new Date(a.joining_date).getTime() - new Date(b.joining_date).getTime()) * sortOrder);
    } else if (filters.sort_by === 'rating') {
      list.sort((a, b) => ((a.avg_rating || 0) - (b.avg_rating || 0)) * sortOrder);
    } else {
      list.sort((a, b) => (a.employee_id - b.employee_id) * sortOrder);
    }

    const total = list.length;
    const paginated = list.slice(offset, offset + limit);

    return {
      data: paginated,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  getEmployeeById: async (id: number) => {
    if (isConnectedToLiveMySQL()) {
      try {
        const pool = getMySQLPool()!;
        const [rows]: any = await pool.query(
          `SELECT e.*, d.department_name
           FROM employees e
           JOIN departments d ON e.department_id = d.department_id
           WHERE e.employee_id = ?`,
          [id]
        );
        if (rows.length === 0) return null;
        
        const [reviews]: any = await pool.query(
          `SELECT r.* FROM performance_reviews r WHERE r.employee_id = ? ORDER BY r.review_period_end DESC`,
          [id]
        );

        const emp = rows[0];
        const completed = reviews.filter((r: any) => r.review_status === 'Completed');
        emp.avg_rating = completed.length > 0
          ? Number((completed.reduce((s: number, r: any) => s + Number(r.overall_rating), 0) / completed.length).toFixed(2))
          : null;
        emp.reviews = reviews;
        return emp;
      } catch (err) {
        console.error('MySQL getEmployeeById error', err);
      }
    }

    const emp = employeesStore.find(e => e.employee_id === id);
    if (!emp) return null;

    const enriched = enrichEmployee(emp);
    const empReviews = reviewsStore
      .filter(r => r.employee_id === id)
      .sort((a, b) => new Date(b.review_period_end).getTime() - new Date(a.review_period_end).getTime())
      .map(enrichReview);

    return {
      ...enriched,
      reviews: empReviews,
    };
  },

  createEmployee: async (data: {
    full_name: string;
    email: string;
    phone?: string;
    department_id: number;
    designation: string;
    joining_date: string;
    employment_status?: 'Active' | 'Inactive';
  }) => {
    // Validation
    if (!data.full_name || !data.email || !data.department_id || !data.designation || !data.joining_date) {
      throw new Error('All required employee fields (Name, Email, Department, Designation, Joining Date) must be provided.');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new Error('Invalid email address format.');
    }

    if (isConnectedToLiveMySQL()) {
      try {
        const pool = getMySQLPool()!;
        // Verify unique email
        const [existing]: any = await pool.query('SELECT employee_id FROM employees WHERE email = ?', [data.email]);
        if (existing.length > 0) {
          throw new Error(`Email address '${data.email}' is already registered.`);
        }

        // Verify department exists
        const [dept]: any = await pool.query('SELECT department_id FROM departments WHERE department_id = ?', [data.department_id]);
        if (dept.length === 0) {
          throw new Error('Selected department does not exist.');
        }

        const [result]: any = await pool.query(
          `INSERT INTO employees (full_name, email, phone, department_id, designation, joining_date, employment_status)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            data.full_name.trim(),
            data.email.trim().toLowerCase(),
            data.phone || null,
            data.department_id,
            data.designation.trim(),
            data.joining_date,
            data.employment_status || 'Active',
          ]
        );

        return {
          employee_id: result.insertId,
          ...data,
          employment_status: data.employment_status || 'Active',
        };
      } catch (err: any) {
        throw new Error(err.message || 'Database error while inserting employee.');
      }
    }

    // In-Memory Simulation
    const emailLower = data.email.trim().toLowerCase();
    const exists = employeesStore.some(e => e.email.toLowerCase() === emailLower);
    if (exists) {
      throw new Error(`Email address '${data.email}' is already registered.`);
    }

    const dept = departmentsStore.find(d => d.department_id === Number(data.department_id));
    if (!dept) {
      throw new Error('Selected department does not exist.');
    }

    const newEmp: Employee = {
      employee_id: nextEmpId++,
      full_name: data.full_name.trim(),
      email: emailLower,
      phone: data.phone?.trim() || null,
      department_id: Number(data.department_id),
      designation: data.designation.trim(),
      joining_date: data.joining_date,
      employment_status: data.employment_status || 'Active',
      created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
    };

    employeesStore.push(newEmp);
    return enrichEmployee(newEmp);
  },

  updateEmployee: async (id: number, data: Partial<Employee>) => {
    if (isConnectedToLiveMySQL()) {
      try {
        const pool = getMySQLPool()!;
        // Check uniqueness of email if email changed
        if (data.email) {
          const [existing]: any = await pool.query(
            'SELECT employee_id FROM employees WHERE email = ? AND employee_id != ?',
            [data.email.trim().toLowerCase(), id]
          );
          if (existing.length > 0) {
            throw new Error(`Email address '${data.email}' is already in use by another employee.`);
          }
        }

        const updates: string[] = [];
        const params: any[] = [];

        if (data.full_name !== undefined) { updates.push('full_name = ?'); params.push(data.full_name.trim()); }
        if (data.email !== undefined) { updates.push('email = ?'); params.push(data.email.trim().toLowerCase()); }
        if (data.phone !== undefined) { updates.push('phone = ?'); params.push(data.phone); }
        if (data.department_id !== undefined) { updates.push('department_id = ?'); params.push(data.department_id); }
        if (data.designation !== undefined) { updates.push('designation = ?'); params.push(data.designation.trim()); }
        if (data.joining_date !== undefined) { updates.push('joining_date = ?'); params.push(data.joining_date); }
        if (data.employment_status !== undefined) { updates.push('employment_status = ?'); params.push(data.employment_status); }

        if (updates.length > 0) {
          params.push(id);
          await pool.query(`UPDATE employees SET ${updates.join(', ')} WHERE employee_id = ?`, params);
        }

        return dbService.getEmployeeById(id);
      } catch (err: any) {
        throw new Error(err.message || 'Database error while updating employee.');
      }
    }

    const index = employeesStore.findIndex(e => e.employee_id === id);
    if (index === -1) {
      throw new Error(`Employee with ID ${id} not found.`);
    }

    if (data.email) {
      const emailLower = data.email.trim().toLowerCase();
      const duplicate = employeesStore.some(e => e.employee_id !== id && e.email.toLowerCase() === emailLower);
      if (duplicate) {
        throw new Error(`Email address '${data.email}' is already in use by another employee.`);
      }
      employeesStore[index].email = emailLower;
    }

    if (data.full_name !== undefined) employeesStore[index].full_name = data.full_name.trim();
    if (data.phone !== undefined) employeesStore[index].phone = data.phone;
    if (data.department_id !== undefined) {
      const dept = departmentsStore.find(d => d.department_id === Number(data.department_id));
      if (!dept) throw new Error('Selected department does not exist.');
      employeesStore[index].department_id = Number(data.department_id);
    }
    if (data.designation !== undefined) employeesStore[index].designation = data.designation.trim();
    if (data.joining_date !== undefined) employeesStore[index].joining_date = data.joining_date;
    if (data.employment_status !== undefined) employeesStore[index].employment_status = data.employment_status;

    return enrichEmployee(employeesStore[index]);
  },

  deleteEmployee: async (id: number) => {
    if (isConnectedToLiveMySQL()) {
      try {
        const pool = getMySQLPool()!;
        // The foreign key constraint has ON DELETE CASCADE for performance_reviews
        const [result]: any = await pool.query('DELETE FROM employees WHERE employee_id = ?', [id]);
        if (result.affectedRows === 0) {
          throw new Error(`Employee with ID ${id} not found.`);
        }
        return { success: true, message: `Employee #${id} and associated reviews removed successfully.` };
      } catch (err: any) {
        throw new Error(err.message || 'Database error while deleting employee.');
      }
    }

    const index = employeesStore.findIndex(e => e.employee_id === id);
    if (index === -1) {
      throw new Error(`Employee with ID ${id} not found.`);
    }

    // Cascade delete associated reviews
    reviewsStore = reviewsStore.filter(r => r.employee_id !== id);
    employeesStore.splice(index, 1);
    return { success: true, message: `Employee #${id} and associated reviews removed successfully.` };
  },

  // ------------------------------------------
  // DEPARTMENTS CRUD
  // ------------------------------------------
  getDepartments: async () => {
    if (isConnectedToLiveMySQL()) {
      try {
        const pool = getMySQLPool()!;
        const sql = `
          SELECT 
              d.*,
              COUNT(DISTINCT e.employee_id) AS employee_count,
              COUNT(DISTINCT CASE WHEN e.employment_status = 'Active' THEN e.employee_id END) AS active_employee_count,
              ROUND(COALESCE(AVG(CASE WHEN r.review_status = 'Completed' THEN r.overall_rating END), 0), 2) AS avg_rating
          FROM departments d
          LEFT JOIN employees e ON d.department_id = e.department_id
          LEFT JOIN performance_reviews r ON e.employee_id = r.employee_id
          GROUP BY d.department_id
          ORDER BY d.department_name ASC
        `;
        const [rows]: any = await pool.query(sql);
        return rows;
      } catch (err) {
        console.error('MySQL getDepartments error', err);
      }
    }

    return departmentsStore.map(dept => {
      const deptEmps = employeesStore.filter(e => e.department_id === dept.department_id);
      const activeEmps = deptEmps.filter(e => e.employment_status === 'Active');
      const deptEmpIds = deptEmps.map(e => e.employee_id);
      const deptReviews = reviewsStore.filter(r => deptEmpIds.includes(r.employee_id) && r.review_status === 'Completed');
      const avg = deptReviews.length > 0
        ? Number((deptReviews.reduce((sum, r) => sum + r.overall_rating, 0) / deptReviews.length).toFixed(2))
        : 0;

      return {
        ...dept,
        employee_count: deptEmps.length,
        active_employee_count: activeEmps.length,
        avg_rating: avg,
      };
    });
  },

  createDepartment: async (data: { department_name: string; description?: string }) => {
    if (!data.department_name || !data.department_name.trim()) {
      throw new Error('Department name is required.');
    }

    const name = data.department_name.trim();

    if (isConnectedToLiveMySQL()) {
      try {
        const pool = getMySQLPool()!;
        const [existing]: any = await pool.query('SELECT department_id FROM departments WHERE department_name = ?', [name]);
        if (existing.length > 0) {
          throw new Error(`Department '${name}' already exists.`);
        }

        const [result]: any = await pool.query(
          'INSERT INTO departments (department_name, description) VALUES (?, ?)',
          [name, data.description || null]
        );

        return {
          department_id: result.insertId,
          department_name: name,
          description: data.description || null,
          created_at: new Date().toISOString(),
          employee_count: 0,
          avg_rating: 0,
        };
      } catch (err: any) {
        throw new Error(err.message || 'Database error while creating department.');
      }
    }

    const exists = departmentsStore.some(d => d.department_name.toLowerCase() === name.toLowerCase());
    if (exists) {
      throw new Error(`Department '${name}' already exists.`);
    }

    const newDept: Department = {
      department_id: nextDeptId++,
      department_name: name,
      description: data.description?.trim() || null,
      created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
    };

    departmentsStore.push(newDept);
    return {
      ...newDept,
      employee_count: 0,
      active_employee_count: 0,
      avg_rating: 0,
    };
  },

  updateDepartment: async (id: number, data: { department_name?: string; description?: string }) => {
    if (isConnectedToLiveMySQL()) {
      try {
        const pool = getMySQLPool()!;
        if (data.department_name) {
          const [existing]: any = await pool.query(
            'SELECT department_id FROM departments WHERE department_name = ? AND department_id != ?',
            [data.department_name.trim(), id]
          );
          if (existing.length > 0) {
            throw new Error(`Department name '${data.department_name}' is already in use.`);
          }
        }

        const updates: string[] = [];
        const params: any[] = [];
        if (data.department_name !== undefined) { updates.push('department_name = ?'); params.push(data.department_name.trim()); }
        if (data.description !== undefined) { updates.push('description = ?'); params.push(data.description.trim()); }

        if (updates.length > 0) {
          params.push(id);
          await pool.query(`UPDATE departments SET ${updates.join(', ')} WHERE department_id = ?`, params);
        }

        const [rows]: any = await pool.query('SELECT * FROM departments WHERE department_id = ?', [id]);
        return rows[0];
      } catch (err: any) {
        throw new Error(err.message || 'Database error while updating department.');
      }
    }

    const dept = departmentsStore.find(d => d.department_id === id);
    if (!dept) throw new Error(`Department with ID ${id} not found.`);

    if (data.department_name) {
      const name = data.department_name.trim();
      const duplicate = departmentsStore.some(d => d.department_id !== id && d.department_name.toLowerCase() === name.toLowerCase());
      if (duplicate) throw new Error(`Department name '${name}' is already in use.`);
      dept.department_name = name;
    }

    if (data.description !== undefined) {
      dept.description = data.description?.trim() || null;
    }

    return dept;
  },

  deleteDepartment: async (id: number) => {
    if (isConnectedToLiveMySQL()) {
      try {
        const pool = getMySQLPool()!;
        // Check referential integrity: ON DELETE RESTRICT
        const [assigned]: any = await pool.query('SELECT COUNT(*) AS count FROM employees WHERE department_id = ?', [id]);
        if (assigned[0].count > 0) {
          throw new Error(`Referential Integrity Violation (ON DELETE RESTRICT): Cannot delete department #${id} because it still has ${assigned[0].count} assigned employee(s). Please reassign or delete employees first.`);
        }

        const [result]: any = await pool.query('DELETE FROM departments WHERE department_id = ?', [id]);
        if (result.affectedRows === 0) throw new Error(`Department #${id} not found.`);
        return { success: true, message: `Department #${id} deleted successfully.` };
      } catch (err: any) {
        throw new Error(err.message || 'Database constraint violation');
      }
    }

    // In-Memory Simulation
    const assignedCount = employeesStore.filter(e => e.department_id === id).length;
    if (assignedCount > 0) {
      throw new Error(`Referential Integrity Violation (ON DELETE RESTRICT): Cannot delete department #${id} because it still has ${assignedCount} assigned employee(s). Please reassign or delete employees first.`);
    }

    const index = departmentsStore.findIndex(d => d.department_id === id);
    if (index === -1) throw new Error(`Department #${id} not found.`);

    departmentsStore.splice(index, 1);
    return { success: true, message: `Department #${id} deleted successfully.` };
  },

  // ------------------------------------------
  // PERFORMANCE REVIEWS CRUD
  // ------------------------------------------
  getReviews: async (filters: {
    employee_id?: string;
    department_id?: string;
    review_status?: string;
    min_rating?: number;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.max(1, filters.limit || 15);
    const offset = (page - 1) * limit;

    if (isConnectedToLiveMySQL()) {
      try {
        const pool = getMySQLPool()!;
        const whereClauses: string[] = ['1=1'];
        const params: any[] = [];

        if (filters.employee_id && filters.employee_id !== 'all') {
          whereClauses.push('r.employee_id = ?');
          params.push(filters.employee_id);
        }

        if (filters.department_id && filters.department_id !== 'all') {
          whereClauses.push('e.department_id = ?');
          params.push(filters.department_id);
        }

        if (filters.review_status && filters.review_status !== 'all') {
          whereClauses.push('r.review_status = ?');
          params.push(filters.review_status);
        }

        if (filters.min_rating) {
          whereClauses.push('r.overall_rating >= ?');
          params.push(filters.min_rating);
        }

        if (filters.search) {
          whereClauses.push('(e.full_name LIKE ? OR r.reviewer_name LIKE ? OR r.reviewer_comments LIKE ? OR r.next_period_goals LIKE ?)');
          const q = `%${filters.search}%`;
          params.push(q, q, q, q);
        }

        const whereSql = whereClauses.join(' AND ');

        const [countRows]: any = await pool.query(
          `SELECT COUNT(*) AS total
           FROM performance_reviews r
           JOIN employees e ON r.employee_id = e.employee_id
           WHERE ${whereSql}`,
          params
        );
        const total = countRows[0].total;

        const dataSql = `
          SELECT 
              r.*,
              e.full_name AS employee_name,
              e.designation,
              d.department_name
          FROM performance_reviews r
          JOIN employees e ON r.employee_id = e.employee_id
          JOIN departments d ON e.department_id = d.department_id
          WHERE ${whereSql}
          ORDER BY r.review_period_end DESC, r.created_at DESC
          LIMIT ? OFFSET ?
        `;

        const [rows]: any = await pool.query(dataSql, [...params, limit, offset]);

        return {
          data: rows,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        };
      } catch (err) {
        console.error('MySQL getReviews error', err);
      }
    }

    // In-Memory Simulation
    let list = reviewsStore.map(enrichReview);

    if (filters.employee_id && filters.employee_id !== 'all') {
      const empId = Number(filters.employee_id);
      list = list.filter(r => r.employee_id === empId);
    }

    if (filters.department_id && filters.department_id !== 'all') {
      const deptId = Number(filters.department_id);
      list = list.filter(r => {
        const emp = employeesStore.find(e => e.employee_id === r.employee_id);
        return emp?.department_id === deptId;
      });
    }

    if (filters.review_status && filters.review_status !== 'all') {
      list = list.filter(r => r.review_status === filters.review_status);
    }

    if (filters.min_rating) {
      list = list.filter(r => r.overall_rating >= Number(filters.min_rating));
    }

    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(r =>
        (r.employee_name && r.employee_name.toLowerCase().includes(q)) ||
        r.reviewer_name.toLowerCase().includes(q) ||
        (r.reviewer_comments && r.reviewer_comments.toLowerCase().includes(q)) ||
        (r.next_period_goals && r.next_period_goals.toLowerCase().includes(q))
      );
    }

    list.sort((a, b) => new Date(b.review_period_end).getTime() - new Date(a.review_period_end).getTime());

    const total = list.length;
    const paginated = list.slice(offset, offset + limit);

    return {
      data: paginated,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  getReviewById: async (id: number) => {
    if (isConnectedToLiveMySQL()) {
      try {
        const pool = getMySQLPool()!;
        const sql = `
          SELECT 
              r.*,
              e.full_name AS employee_name,
              e.designation,
              d.department_name
          FROM performance_reviews r
          JOIN employees e ON r.employee_id = e.employee_id
          JOIN departments d ON e.department_id = d.department_id
          WHERE r.review_id = ?
        `;
        const [rows]: any = await pool.query(sql, [id]);
        return rows[0] || null;
      } catch (err) {
        console.error('MySQL getReviewById error', err);
      }
    }

    const review = reviewsStore.find(r => r.review_id === id);
    return review ? enrichReview(review) : null;
  },

  createReview: async (data: {
    employee_id: number;
    review_period_start: string;
    review_period_end: string;
    technical_skills_rating: number;
    communication_rating: number;
    teamwork_rating: number;
    productivity_rating: number;
    reviewer_name: string;
    reviewer_comments?: string;
    next_period_goals?: string;
    review_status?: 'Pending' | 'In Progress' | 'Completed';
  }) => {
    // 1. Validation: Rating ranges (1.00 to 5.00)
    const ratings = [
      data.technical_skills_rating,
      data.communication_rating,
      data.teamwork_rating,
      data.productivity_rating,
    ];

    for (const r of ratings) {
      if (typeof r !== 'number' || isNaN(r) || r < 1.0 || r > 5.0) {
        throw new Error('All rating dimensions (Technical, Communication, Teamwork, Productivity) must be between 1.00 and 5.00.');
      }
    }

    // 2. Validation: Dates
    if (!data.review_period_start || !data.review_period_end) {
      throw new Error('Review period start date and end date are required.');
    }

    if (new Date(data.review_period_start) > new Date(data.review_period_end)) {
      throw new Error('Chronological Error: Review period start date cannot be after the end date.');
    }

    if (!data.reviewer_name || !data.reviewer_name.trim()) {
      throw new Error('Reviewer name is required.');
    }

    // Calculate Overall Rating = (tech + comm + team + prod) / 4
    const overall_rating = Number(
      ((data.technical_skills_rating + data.communication_rating + data.teamwork_rating + data.productivity_rating) / 4).toFixed(2)
    );

    if (isConnectedToLiveMySQL()) {
      try {
        const pool = getMySQLPool()!;
        // Verify employee exists
        const [empRows]: any = await pool.query('SELECT employee_id FROM employees WHERE employee_id = ?', [data.employee_id]);
        if (empRows.length === 0) {
          throw new Error(`Referential Integrity Error: Employee #${data.employee_id} does not exist.`);
        }

        // Check unique constraint on (employee_id, review_period_start, review_period_end)
        const [duplicate]: any = await pool.query(
          `SELECT review_id FROM performance_reviews 
           WHERE employee_id = ? AND review_period_start = ? AND review_period_end = ?`,
          [data.employee_id, data.review_period_start, data.review_period_end]
        );
        if (duplicate.length > 0) {
          throw new Error(`Duplicate Review Cycle: A performance review already exists for this employee in the cycle ${data.review_period_start} to ${data.review_period_end}.`);
        }

        const [result]: any = await pool.query(
          `INSERT INTO performance_reviews (
              employee_id, review_period_start, review_period_end,
              technical_skills_rating, communication_rating, teamwork_rating, productivity_rating,
              overall_rating, reviewer_name, reviewer_comments, next_period_goals, review_status
           ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            data.employee_id,
            data.review_period_start,
            data.review_period_end,
            data.technical_skills_rating,
            data.communication_rating,
            data.teamwork_rating,
            data.productivity_rating,
            overall_rating,
            data.reviewer_name.trim(),
            data.reviewer_comments || null,
            data.next_period_goals || null,
            data.review_status || 'Pending',
          ]
        );

        return dbService.getReviewById(result.insertId);
      } catch (err: any) {
        throw new Error(err.message || 'Database error while saving review.');
      }
    }

    // In-Memory Simulation
    const emp = employeesStore.find(e => e.employee_id === Number(data.employee_id));
    if (!emp) {
      throw new Error(`Referential Integrity Error: Employee #${data.employee_id} does not exist.`);
    }

    const duplicate = reviewsStore.some(
      r => r.employee_id === Number(data.employee_id) &&
           r.review_period_start === data.review_period_start &&
           r.review_period_end === data.review_period_end
    );
    if (duplicate) {
      throw new Error(`Duplicate Review Cycle: A performance review already exists for this employee in the cycle ${data.review_period_start} to ${data.review_period_end}.`);
    }

    const newReview: PerformanceReview = {
      review_id: nextReviewId++,
      employee_id: Number(data.employee_id),
      review_period_start: data.review_period_start,
      review_period_end: data.review_period_end,
      technical_skills_rating: Number(data.technical_skills_rating.toFixed(2)),
      communication_rating: Number(data.communication_rating.toFixed(2)),
      teamwork_rating: Number(data.teamwork_rating.toFixed(2)),
      productivity_rating: Number(data.productivity_rating.toFixed(2)),
      overall_rating,
      reviewer_name: data.reviewer_name.trim(),
      reviewer_comments: data.reviewer_comments?.trim() || null,
      next_period_goals: data.next_period_goals?.trim() || null,
      review_status: data.review_status || 'Pending',
      created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
    };

    reviewsStore.push(newReview);
    return enrichReview(newReview);
  },

  updateReview: async (id: number, data: Partial<PerformanceReview>) => {
    const existing = reviewsStore.find(r => r.review_id === id);
    if (!existing && !isConnectedToLiveMySQL()) {
      throw new Error(`Review #${id} not found.`);
    }

    // Validate ratings if updated
    const tech = data.technical_skills_rating ?? existing?.technical_skills_rating;
    const comm = data.communication_rating ?? existing?.communication_rating;
    const team = data.teamwork_rating ?? existing?.teamwork_rating;
    const prod = data.productivity_rating ?? existing?.productivity_rating;

    if (tech !== undefined && comm !== undefined && team !== undefined && prod !== undefined) {
      for (const r of [tech, comm, team, prod]) {
        if (typeof r !== 'number' || isNaN(r) || r < 1.0 || r > 5.0) {
          throw new Error('All rating dimensions must be between 1.00 and 5.00.');
        }
      }
    }

    const overall_rating = (tech && comm && team && prod)
      ? Number(((tech + comm + team + prod) / 4).toFixed(2))
      : undefined;

    if (isConnectedToLiveMySQL()) {
      try {
        const pool = getMySQLPool()!;
        const updates: string[] = [];
        const params: any[] = [];

        if (data.technical_skills_rating !== undefined) { updates.push('technical_skills_rating = ?'); params.push(data.technical_skills_rating); }
        if (data.communication_rating !== undefined) { updates.push('communication_rating = ?'); params.push(data.communication_rating); }
        if (data.teamwork_rating !== undefined) { updates.push('teamwork_rating = ?'); params.push(data.teamwork_rating); }
        if (data.productivity_rating !== undefined) { updates.push('productivity_rating = ?'); params.push(data.productivity_rating); }
        if (overall_rating !== undefined) { updates.push('overall_rating = ?'); params.push(overall_rating); }
        if (data.reviewer_name !== undefined) { updates.push('reviewer_name = ?'); params.push(data.reviewer_name.trim()); }
        if (data.reviewer_comments !== undefined) { updates.push('reviewer_comments = ?'); params.push(data.reviewer_comments); }
        if (data.next_period_goals !== undefined) { updates.push('next_period_goals = ?'); params.push(data.next_period_goals); }
        if (data.review_status !== undefined) { updates.push('review_status = ?'); params.push(data.review_status); }

        if (updates.length > 0) {
          params.push(id);
          await pool.query(`UPDATE performance_reviews SET ${updates.join(', ')} WHERE review_id = ?`, params);
        }

        return dbService.getReviewById(id);
      } catch (err: any) {
        throw new Error(err.message || 'Database error updating review');
      }
    }

    const index = reviewsStore.findIndex(r => r.review_id === id);
    if (index === -1) throw new Error(`Review #${id} not found.`);

    if (data.technical_skills_rating !== undefined) reviewsStore[index].technical_skills_rating = data.technical_skills_rating;
    if (data.communication_rating !== undefined) reviewsStore[index].communication_rating = data.communication_rating;
    if (data.teamwork_rating !== undefined) reviewsStore[index].teamwork_rating = data.teamwork_rating;
    if (data.productivity_rating !== undefined) reviewsStore[index].productivity_rating = data.productivity_rating;
    if (overall_rating !== undefined) reviewsStore[index].overall_rating = overall_rating;
    if (data.reviewer_name !== undefined) reviewsStore[index].reviewer_name = data.reviewer_name;
    if (data.reviewer_comments !== undefined) reviewsStore[index].reviewer_comments = data.reviewer_comments;
    if (data.next_period_goals !== undefined) reviewsStore[index].next_period_goals = data.next_period_goals;
    if (data.review_status !== undefined) reviewsStore[index].review_status = data.review_status;

    return enrichReview(reviewsStore[index]);
  },

  deleteReview: async (id: number) => {
    if (isConnectedToLiveMySQL()) {
      try {
        const pool = getMySQLPool()!;
        const [result]: any = await pool.query('DELETE FROM performance_reviews WHERE review_id = ?', [id]);
        if (result.affectedRows === 0) throw new Error(`Review #${id} not found.`);
        return { success: true, message: `Review #${id} deleted successfully.` };
      } catch (err: any) {
        throw new Error(err.message || 'Database error while deleting review.');
      }
    }

    const index = reviewsStore.findIndex(r => r.review_id === id);
    if (index === -1) throw new Error(`Review #${id} not found.`);

    reviewsStore.splice(index, 1);
    return { success: true, message: `Review #${id} deleted successfully.` };
  },

  // ------------------------------------------
  // REPORTS & ANALYTICS
  // ------------------------------------------
  getDepartmentPerformanceReport: async () => {
    return dbService.getDepartments();
  },

  getPerformanceTrendsReport: async () => {
    const dashboard = await dbService.getDashboardMetrics();
    return dashboard.trends;
  },

  getEmployeeRankingsReport: async () => {
    if (isConnectedToLiveMySQL()) {
      try {
        const pool = getMySQLPool()!;
        const sql = `
          SELECT 
              e.employee_id,
              e.full_name,
              e.designation,
              d.department_name,
              COUNT(r.review_id) AS total_reviews,
              ROUND(AVG(r.overall_rating), 2) AS average_rating,
              ROUND(AVG(r.technical_skills_rating), 2) AS avg_tech,
              ROUND(AVG(r.communication_rating), 2) AS avg_comm,
              ROUND(AVG(r.teamwork_rating), 2) AS avg_team,
              ROUND(AVG(r.productivity_rating), 2) AS avg_prod,
              DENSE_RANK() OVER (ORDER BY AVG(r.overall_rating) DESC) AS rank_position
          FROM employees e
          INNER JOIN departments d ON e.department_id = d.department_id
          INNER JOIN performance_reviews r ON e.employee_id = r.employee_id
          WHERE r.review_status = 'Completed'
          GROUP BY e.employee_id, e.full_name, e.designation, d.department_name
          ORDER BY average_rating DESC
        `;
        const [rows]: any = await pool.query(sql);
        return rows;
      } catch (err) {
        console.error('MySQL ranking query error', err);
      }
    }

    // In-memory ranking
    const completed = reviewsStore.filter(r => r.review_status === 'Completed');
    const map: { [id: number]: PerformanceReview[] } = {};
    completed.forEach(r => {
      if (!map[r.employee_id]) map[r.employee_id] = [];
      map[r.employee_id].push(r);
    });

    const rankings = Object.keys(map).map(idStr => {
      const id = Number(idStr);
      const emp = employeesStore.find(e => e.employee_id === id);
      if (!emp) return null;
      const dept = departmentsStore.find(d => d.department_id === emp.department_id);
      const revs = map[id];
      const count = revs.length;

      const avg_rating = Number((revs.reduce((s, r) => s + r.overall_rating, 0) / count).toFixed(2));
      const avg_tech = Number((revs.reduce((s, r) => s + r.technical_skills_rating, 0) / count).toFixed(2));
      const avg_comm = Number((revs.reduce((s, r) => s + r.communication_rating, 0) / count).toFixed(2));
      const avg_team = Number((revs.reduce((s, r) => s + r.teamwork_rating, 0) / count).toFixed(2));
      const avg_prod = Number((revs.reduce((s, r) => s + r.productivity_rating, 0) / count).toFixed(2));

      return {
        employee_id: emp.employee_id,
        full_name: emp.full_name,
        designation: emp.designation,
        department_name: dept?.department_name || 'General',
        total_reviews: count,
        average_rating: avg_rating,
        avg_tech,
        avg_comm,
        avg_team,
        avg_prod,
      };
    }).filter(Boolean) as any[];

    rankings.sort((a, b) => b.average_rating - a.average_rating);
    return rankings.map((item, idx) => ({
      ...item,
      rank_position: idx + 1,
    }));
  },

  // ------------------------------------------
  // LIVE SQL QUERY RUNNER FOR DBMS VIVA
  // ------------------------------------------
  executeCustomQuery: async (sqlQuery: string) => {
    const trimmed = sqlQuery.trim();
    if (!trimmed) {
      throw new Error('Query string cannot be empty.');
    }

    // Prevent destructive system queries
    const forbidden = [/DROP DATABASE/i, /ALTER USER/i, /GRANT/i, /REVOKE/i];
    for (const pattern of forbidden) {
      if (pattern.test(trimmed)) {
        throw new Error('Dangerous or administrative SQL command blocked.');
      }
    }

    if (isConnectedToLiveMySQL()) {
      try {
        const pool = getMySQLPool()!;
        const [results, fields]: any = await pool.query(trimmed);
        return {
          source: 'Live MySQL 8.0 Server',
          results: Array.isArray(results) ? results : [results],
          rowCount: Array.isArray(results) ? results.length : 1,
          fields: fields ? fields.map((f: any) => f.name) : [],
        };
      } catch (err: any) {
        throw new Error(`MySQL Execution Error (${err.code || 'SQL_ERROR'}): ${err.message}`);
      }
    }

    // Demo Mode SQL Runner (interprets standard SELECT / SHOW queries)
    const upper = trimmed.toUpperCase();
    if (upper.startsWith('SELECT') || upper.startsWith('SHOW') || upper.startsWith('DESCRIBE')) {
      if (upper.includes('DEPARTMENTS')) {
        const depts = await dbService.getDepartments();
        return {
          source: 'Demo Mode Engine (Simulated MySQL)',
          results: depts,
          rowCount: depts.length,
          fields: Object.keys(depts[0] || {}),
        };
      } else if (upper.includes('PERFORMANCE_REVIEWS')) {
        const revs = reviewsStore.map(enrichReview);
        return {
          source: 'Demo Mode Engine (Simulated MySQL)',
          results: revs,
          rowCount: revs.length,
          fields: Object.keys(revs[0] || {}),
        };
      } else {
        const emps = employeesStore.map(enrichEmployee);
        return {
          source: 'Demo Mode Engine (Simulated MySQL)',
          results: emps,
          rowCount: emps.length,
          fields: Object.keys(emps[0] || {}),
        };
      }
    }

    throw new Error('In Demo Mode without live MySQL, only SELECT, SHOW, and DESCRIBE queries are supported in the SQL Runner.');
  },

  // User Authentication
  authenticateUser: async (username: string, password: string) => {
    const u = usersStore.find(user => user.username === username.trim());
    if (!u) {
      // Allow demo logins
      if (username === 'admin' && password === 'admin123') {
        return usersStore[0];
      }
      if (username === 'hrmanager' && password === 'hr123') {
        return usersStore[1];
      }
      if (username === 'reviewer' && password === 'rev123') {
        return usersStore[2];
      }
      return null;
    }

    // Demo password check
    if (
      (u.username === 'admin' && password === 'admin123') ||
      (u.username === 'hrmanager' && password === 'hr123') ||
      (u.username === 'reviewer' && password === 'rev123')
    ) {
      return u;
    }

    return null;
  },
};
