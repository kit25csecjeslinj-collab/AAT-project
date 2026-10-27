/**
 * @file reports.ts
 * @description API routes for HR Performance Reports, Analytics, and CSV Export.
 */

import { Router } from 'express';
import { dbService } from '../services/dbService.ts';

const router = Router();

// GET /api/reports/department-performance
router.get('/department-performance', async (req, res) => {
  try {
    const data = await dbService.getDepartmentPerformanceReport();
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/reports/performance-trends
router.get('/performance-trends', async (req, res) => {
  try {
    const data = await dbService.getPerformanceTrendsReport();
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/reports/employee-rankings
router.get('/employee-rankings', async (req, res) => {
  try {
    const data = await dbService.getEmployeeRankingsReport();
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/reports/review-status
router.get('/review-status', async (req, res) => {
  try {
    const result = await dbService.getReviews({ limit: 1000 });
    const reviews = result.data;
    
    const statusCounts = {
      Completed: reviews.filter((r: any) => r.review_status === 'Completed').length,
      'In Progress': reviews.filter((r: any) => r.review_status === 'In Progress').length,
      Pending: reviews.filter((r: any) => r.review_status === 'Pending').length,
      Total: reviews.length,
    };

    res.json({ success: true, data: statusCounts });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// CSV Export: Employees
router.get('/export/employees', async (req, res) => {
  try {
    const result = await dbService.getEmployees({ limit: 10000 });
    const employees = result.data;

    const headers = ['Employee ID', 'Full Name', 'Email', 'Phone', 'Department', 'Designation', 'Joining Date', 'Status', 'Average Rating', 'Completed Reviews'];
    const rows = employees.map((e: any) => [
      e.employee_id,
      `"${e.full_name.replace(/"/g, '""')}"`,
      `"${e.email}"`,
      `"${e.phone || ''}"`,
      `"${e.department_name || ''}"`,
      `"${e.designation.replace(/"/g, '""')}"`,
      e.joining_date,
      e.employment_status,
      e.avg_rating ?? 'N/A',
      e.total_reviews ?? 0,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="employees_performance_report.csv"');
    res.send(csvContent);
  } catch (err: any) {
    res.status(500).send(`Failed to export employees CSV: ${err.message}`);
  }
});

// CSV Export: Reviews
router.get('/export/reviews', async (req, res) => {
  try {
    const result = await dbService.getReviews({ limit: 10000 });
    const reviews = result.data;

    const headers = ['Review ID', 'Employee ID', 'Employee Name', 'Department', 'Designation', 'Period Start', 'Period End', 'Technical Skills', 'Communication', 'Teamwork', 'Productivity', 'Overall Rating', 'Reviewer Name', 'Status', 'Reviewer Comments', 'Next Goals'];
    const rows = reviews.map((r: any) => [
      r.review_id,
      r.employee_id,
      `"${(r.employee_name || '').replace(/"/g, '""')}"`,
      `"${(r.department_name || '').replace(/"/g, '""')}"`,
      `"${(r.designation || '').replace(/"/g, '""')}"`,
      r.review_period_start,
      r.review_period_end,
      r.technical_skills_rating,
      r.communication_rating,
      r.teamwork_rating,
      r.productivity_rating,
      r.overall_rating,
      `"${(r.reviewer_name || '').replace(/"/g, '""')}"`,
      r.review_status,
      `"${(r.reviewer_comments || '').replace(/"/g, '""')}"`,
      `"${(r.next_period_goals || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="performance_reviews_export.csv"');
    res.send(csvContent);
  } catch (err: any) {
    res.status(500).send(`Failed to export reviews CSV: ${err.message}`);
  }
});

// CSV Export: Department Summary
router.get('/export/departments', async (req, res) => {
  try {
    const depts = await dbService.getDepartments();

    const headers = ['Department ID', 'Department Name', 'Description', 'Total Employees', 'Active Employees', 'Average Performance Rating'];
    const rows = depts.map((d: any) => [
      d.department_id,
      `"${d.department_name.replace(/"/g, '""')}"`,
      `"${(d.description || '').replace(/"/g, '""')}"`,
      d.employee_count,
      d.active_employee_count,
      d.avg_rating,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="department_performance_summary.csv"');
    res.send(csvContent);
  } catch (err: any) {
    res.status(500).send(`Failed to export departments CSV: ${err.message}`);
  }
});

export default router;
