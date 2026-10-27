-- =====================================================================
-- KIT – Kalaignarkarunanidhi Institute of Technology
-- Department of Computer Science and Engineering
-- DBMS AAT Project: EMPLOYEE PERFORMANCE TRACKING SYSTEM
-- Student: Jeslin J (Register No: 711525BCS052)
-- Database: MySQL 8.0+
-- File: 03_reports.sql - Core Analytical & Aggregation SQL Queries
-- =====================================================================

USE employee_performance_db;

-- ---------------------------------------------------------------------
-- QUERY 1: Main Dashboard KPI Summary
-- Calculates Total Employees, Active Employees, Average Overall Rating,
-- Completed Reviews, Pending Reviews, and Top Performer Counts.
-- ---------------------------------------------------------------------
SELECT 
    (SELECT COUNT(*) FROM employees) AS total_employees,
    (SELECT COUNT(*) FROM employees WHERE employment_status = 'Active') AS active_employees,
    (SELECT COUNT(*) FROM employees WHERE employment_status = 'Inactive') AS inactive_employees,
    (SELECT ROUND(AVG(overall_rating), 2) FROM performance_reviews WHERE review_status = 'Completed') AS avg_rating,
    (SELECT COUNT(*) FROM performance_reviews WHERE review_status = 'Completed') AS reviews_completed,
    (SELECT COUNT(*) FROM performance_reviews WHERE review_status IN ('Pending', 'In Progress')) AS reviews_pending,
    (SELECT COUNT(DISTINCT employee_id) FROM performance_reviews WHERE overall_rating >= 4.5 AND review_status = 'Completed') AS top_performers_count;

-- ---------------------------------------------------------------------
-- QUERY 2: Department-Wise Performance Summary & Employee Count
-- Demonstrates LEFT JOIN, GROUP BY, COUNT, and AVG functions.
-- ---------------------------------------------------------------------
SELECT 
    d.department_id,
    d.department_name,
    COUNT(DISTINCT e.employee_id) AS total_employees,
    COUNT(DISTINCT CASE WHEN e.employment_status = 'Active' THEN e.employee_id END) AS active_employees,
    COUNT(r.review_id) AS total_reviews,
    ROUND(COALESCE(AVG(r.overall_rating), 0), 2) AS avg_department_rating,
    ROUND(COALESCE(AVG(r.technical_skills_rating), 0), 2) AS avg_tech_rating,
    ROUND(COALESCE(AVG(r.communication_rating), 0), 2) AS avg_comm_rating,
    ROUND(COALESCE(AVG(r.teamwork_rating), 0), 2) AS avg_team_rating,
    ROUND(COALESCE(AVG(r.productivity_rating), 0), 2) AS avg_prod_rating
FROM departments d
LEFT JOIN employees e ON d.department_id = e.department_id
LEFT JOIN performance_reviews r ON e.employee_id = r.employee_id AND r.review_status = 'Completed'
GROUP BY d.department_id, d.department_name
ORDER BY avg_department_rating DESC;

-- ---------------------------------------------------------------------
-- QUERY 3: Top 5 Highest Performing Employees (Rankings)
-- Uses INNER JOIN, aggregate AVG, and MySQL 8.0 Window Function DENSE_RANK()
-- ---------------------------------------------------------------------
SELECT 
    e.employee_id,
    e.full_name,
    e.designation,
    d.department_name,
    COUNT(r.review_id) AS total_completed_reviews,
    ROUND(AVG(r.overall_rating), 2) AS average_rating,
    ROUND(AVG(r.technical_skills_rating), 2) AS avg_tech,
    ROUND(AVG(r.communication_rating), 2) AS avg_comm,
    ROUND(AVG(r.teamwork_rating), 2) AS avg_team,
    ROUND(AVG(r.productivity_rating), 2) AS avg_prod,
    DENSE_RANK() OVER (ORDER BY AVG(r.overall_rating) DESC) AS performance_rank
FROM employees e
INNER JOIN departments d ON e.department_id = d.department_id
INNER JOIN performance_reviews r ON e.employee_id = r.employee_id
WHERE r.review_status = 'Completed' AND e.employment_status = 'Active'
GROUP BY e.employee_id, e.full_name, e.designation, d.department_name
HAVING COUNT(r.review_id) >= 1
ORDER BY average_rating DESC, total_completed_reviews DESC
LIMIT 5;

-- ---------------------------------------------------------------------
-- QUERY 4: Monthly Performance Trend
-- Aggregates monthly evaluations to observe company-wide growth
-- ---------------------------------------------------------------------
SELECT 
    DATE_FORMAT(r.review_period_end, '%Y-%m') AS review_month,
    DATE_FORMAT(r.review_period_end, '%b %Y') AS month_label,
    COUNT(r.review_id) AS reviews_evaluated,
    ROUND(AVG(r.overall_rating), 2) AS avg_overall_rating,
    ROUND(AVG(r.technical_skills_rating), 2) AS avg_technical,
    ROUND(AVG(r.productivity_rating), 2) AS avg_productivity
FROM performance_reviews r
WHERE r.review_status = 'Completed'
GROUP BY review_month, month_label
ORDER BY review_month ASC;

-- ---------------------------------------------------------------------
-- QUERY 5: Employee Performance Distribution (Rating Bands)
-- Categorizes performance into 5 distinct bands for distribution charting
-- ---------------------------------------------------------------------
SELECT 
    rating_bracket,
    COUNT(*) AS employee_count
FROM (
    SELECT 
        e.employee_id,
        CASE 
            WHEN AVG(r.overall_rating) >= 4.5 THEN 'Exceptional (4.5 - 5.0)'
            WHEN AVG(r.overall_rating) >= 4.0 THEN 'Exceeds Expectations (4.0 - 4.49)'
            WHEN AVG(r.overall_rating) >= 3.0 THEN 'Meets Expectations (3.0 - 3.99)'
            WHEN AVG(r.overall_rating) >= 2.0 THEN 'Needs Improvement (2.0 - 2.99)'
            WHEN AVG(r.overall_rating) IS NOT NULL THEN 'Unsatisfactory (1.0 - 1.99)'
            ELSE 'No Reviews Yet'
        END AS rating_bracket
    FROM employees e
    LEFT JOIN performance_reviews r ON e.employee_id = r.employee_id AND r.review_status = 'Completed'
    WHERE e.employment_status = 'Active'
    GROUP BY e.employee_id
) AS performance_brackets
GROUP BY rating_bracket
ORDER BY FIELD(rating_bracket, 
    'Exceptional (4.5 - 5.0)',
    'Exceeds Expectations (4.0 - 4.49)',
    'Meets Expectations (3.0 - 3.99)',
    'Needs Improvement (2.0 - 2.99)',
    'Unsatisfactory (1.0 - 1.99)',
    'No Reviews Yet');

-- ---------------------------------------------------------------------
-- QUERY 6: Comprehensive Review History for a Single Employee
-- Parameterized query used on the Employee Profile view
-- (Replace :employee_id with specific ID e.g. 1)
-- ---------------------------------------------------------------------
SELECT 
    r.review_id,
    r.employee_id,
    e.full_name,
    d.department_name,
    r.review_period_start,
    r.review_period_end,
    r.technical_skills_rating,
    r.communication_rating,
    r.teamwork_rating,
    r.productivity_rating,
    r.overall_rating,
    r.reviewer_name,
    r.reviewer_comments,
    r.next_period_goals,
    r.review_status,
    r.created_at
FROM performance_reviews r
JOIN employees e ON r.employee_id = e.employee_id
JOIN departments d ON e.department_id = d.department_id
WHERE r.employee_id = 1
ORDER BY r.review_period_end DESC;
