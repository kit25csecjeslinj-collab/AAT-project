-- =====================================================================
-- KIT – Kalaignarkarunanidhi Institute of Technology
-- Department of Computer Science and Engineering
-- DBMS AAT Project: EMPLOYEE PERFORMANCE TRACKING SYSTEM
-- Student: Jeslin J (Register No: 711525BCS052)
-- Database: MySQL 8.0+
-- File: 02_sample_data.sql - Seed Data Script
-- =====================================================================

USE employee_performance_db;

-- Clear previous data
DELETE FROM performance_reviews;
DELETE FROM employees;
DELETE FROM departments;
DELETE FROM users;

-- Reset Auto-Increment
ALTER TABLE performance_reviews AUTO_INCREMENT = 1;
ALTER TABLE employees AUTO_INCREMENT = 1;
ALTER TABLE departments AUTO_INCREMENT = 1;
ALTER TABLE users AUTO_INCREMENT = 1;

-- =====================================================================
-- 1. Insert Departments (6 Departments)
-- =====================================================================
INSERT INTO departments (department_id, department_name, description) VALUES
(1, 'Computer Science', 'Core software engineering, cloud systems, and platform development'),
(2, 'Human Resources', 'Talent acquisition, employee engagement, workplace culture, and compliance'),
(3, 'Finance', 'Financial planning, accounting, budgeting, auditing, and corporate governance'),
(4, 'Sales & Marketing', 'Enterprise client acquisitions, brand growth, customer outreach, and sales operations'),
(5, 'Quality Assurance', 'Test automation, release verification, performance benchmarking, and QA'),
(6, 'Product Design', 'UI/UX design, user research, wireframing, and product innovation');

-- =====================================================================
-- 2. Insert Employees (15 Realistic Fictional Employees)
-- =====================================================================
INSERT INTO employees (employee_id, full_name, email, phone, department_id, designation, joining_date, employment_status) VALUES
(1, 'Aarav Patel', 'aarav.patel@kitcorp.com', '+91 98765 43210', 1, 'Senior Full-Stack Engineer', '2023-01-15', 'Active'),
(2, 'Diya Sundaram', 'diya.sundaram@kitcorp.com', '+91 98451 23456', 1, 'Cloud DevOps Architect', '2022-06-10', 'Active'),
(3, 'Karthik Raja', 'karthik.raja@kitcorp.com', '+91 97890 12345', 1, 'Software Engineer I', '2024-03-01', 'Active'),
(4, 'Ananya Sharma', 'ananya.sharma@kitcorp.com', '+91 99401 56789', 2, 'HR Business Partner', '2021-11-20', 'Active'),
(5, 'Vikram Chandran', 'vikram.chandran@kitcorp.com', '+91 98840 87654', 2, 'Talent Acquisition Lead', '2023-05-18', 'Active'),
(6, 'Meera Nambiar', 'meera.nambiar@kitcorp.com', '+91 94440 23456', 3, 'Senior Financial Analyst', '2022-02-14', 'Active'),
(7, 'Sanjay Kulkarni', 'sanjay.kulkarni@kitcorp.com', '+91 96001 98765', 3, 'Accounting Associate', '2024-01-08', 'Active'),
(8, 'Pooja Iyer', 'pooja.iyer@kitcorp.com', '+91 97100 45678', 4, 'Sales Account Director', '2021-08-12', 'Active'),
(9, 'Rahul Verma', 'rahul.verma@kitcorp.com', '+91 98402 11223', 4, 'Enterprise Marketing Strategist', '2023-09-01', 'Active'),
(10, 'Sneha Krishnan', 'sneha.krishnan@kitcorp.com', '+91 99620 33445', 5, 'Lead QA Automation Engineer', '2022-09-15', 'Active'),
(11, 'Harish Balaji', 'harish.balaji@kitcorp.com', '+91 98415 66778', 5, 'QA Test Associate', '2024-02-10', 'Active'),
(12, 'Tanvi Menon', 'tanvi.menon@kitcorp.com', '+91 97910 88990', 6, 'Senior UI/UX Designer', '2022-04-05', 'Active'),
(13, 'Rohan Gupta', 'rohan.gupta@kitcorp.com', '+91 99402 99001', 1, 'Backend Database Developer', '2023-10-12', 'Active'),
(14, 'Naveen Kumar', 'naveen.kumar@kitcorp.com', '+91 98403 44556', 4, 'Junior Sales Executive', '2024-04-15', 'Inactive'),
(15, 'Divya Nair', 'divya.nair@kitcorp.com', '+91 97891 22334', 6, 'Product Researcher', '2023-08-20', 'Active');

-- =====================================================================
-- 3. Insert Performance Reviews (25 Reviews Across Multiple Cycles)
-- Overall rating = (technical + communication + teamwork + productivity) / 4
-- =====================================================================
INSERT INTO performance_reviews (
    review_id, employee_id, review_period_start, review_period_end,
    technical_skills_rating, communication_rating, teamwork_rating, productivity_rating,
    overall_rating, reviewer_name, reviewer_comments, next_period_goals, review_status, created_at
) VALUES
-- Aarav Patel (Employee 1) - High Performer in CS
(1, 1, '2026-01-01', '2026-03-31', 4.80, 4.60, 4.70, 4.90, 4.75, 'Dr. Rajesh Murugan (VP Eng)', 
 'Exceptional technical depth. Led the database migration to MySQL 8.0 cluster with zero downtime and mentored junior backend engineers.', 
 'Spearhead GraphQL API modernization and containerize distributed services.', 'Completed', '2026-04-02 10:15:00'),
(2, 1, '2025-10-01', '2025-12-31', 4.70, 4.50, 4.60, 4.80, 4.65, 'Dr. Rajesh Murugan (VP Eng)', 
 'Delivered high-throughput payment reconciliation service ahead of deadline with 99.99% unit test coverage.', 
 'Complete MySQL enterprise optimization certification and organize team tech talks.', 'Completed', '2026-01-05 11:30:00'),

-- Diya Sundaram (Employee 2) - Top Performer in DevOps
(3, 2, '2026-01-01', '2026-03-31', 4.90, 4.70, 4.80, 4.80, 4.80, 'Dr. Rajesh Murugan (VP Eng)', 
 'Superb execution on automated CI/CD pipelines and infrastructure as code. Reduced cloud infrastructure spend by 28%.', 
 'Automate disaster recovery failover drills and deploy multi-region monitoring dashboards.', 'Completed', '2026-04-03 14:20:00'),
(4, 2, '2025-10-01', '2025-12-31', 4.80, 4.60, 4.70, 4.70, 4.70, 'Dr. Rajesh Murugan (VP Eng)', 
 'Stabilized Kubernetes clusters during Black Friday enterprise traffic spikes.', 
 'Streamline secret management workflows and enhance security scanning.', 'Completed', '2026-01-08 09:45:00'),

-- Karthik Raja (Employee 3) - Junior Developer
(5, 3, '2026-01-01', '2026-03-31', 3.80, 3.60, 4.00, 3.60, 3.75, 'Aarav Patel (Tech Lead)', 
 'Shows eager learning curve and solid grasp of React and TypeScript. Needs to improve SQL indexing understanding and code reviews thoroughness.', 
 'Master complex SQL JOINs, transactions, and contribute to 3 core sprint epics.', 'Completed', '2026-04-04 16:10:00'),
(6, 3, '2026-04-01', '2026-06-30', 4.00, 3.80, 4.20, 3.90, 3.98, 'Aarav Patel (Tech Lead)', 
 'In-progress review for mid-year evaluation. Significant progress in database query debugging.', 
 'Deliver the employee export report module independently.', 'In Progress', '2026-05-10 11:00:00'),

-- Ananya Sharma (Employee 4) - HR Leader
(7, 4, '2026-01-01', '2026-03-31', 4.50, 4.90, 4.80, 4.60, 4.70, 'Ganesh Raman (Chief People Officer)', 
 'Outstanding communication and interpersonal empathy. Successfully resolved inter-departmental workflows and enhanced onboarding NPS to 94%.', 
 'Implement automated performance appraisal cadence and annual talent retention drive.', 'Completed', '2026-04-05 10:00:00'),
(8, 4, '2025-10-01', '2025-12-31', 4.40, 4.80, 4.70, 4.50, 4.60, 'Ganesh Raman (Chief People Officer)', 
 'Led company-wide annual townhall and implemented employee health benefits revamp.', 
 'Conduct quarterly 360-degree feedback workshops.', 'Completed', '2026-01-04 15:30:00'),

-- Vikram Chandran (Employee 5) - Talent Acquisition
(9, 5, '2026-01-01', '2026-03-31', 4.10, 4.50, 4.20, 4.20, 4.25, 'Ananya Sharma (HRBP)', 
 'Achieved hiring targets for campus recruitment drive across top engineering colleges in Tamil Nadu.', 
 'Reduce time-to-hire by 15% and build pipeline for specialized AI/ML roles.', 'Completed', '2026-04-06 13:45:00'),

-- Meera Nambiar (Employee 6) - Finance Analyst
(10, 6, '2026-01-01', '2026-03-31', 4.70, 4.40, 4.50, 4.60, 4.55, 'Subramanian S (Finance Director)', 
 'Meticulous financial forecasting. Discovered an invoicing anomaly that saved the company $42,000.', 
 'Implement automated ERP financial reconciliations and lead Q2 audit prep.', 'Completed', '2026-04-07 14:15:00'),
(11, 6, '2025-10-01', '2025-12-31', 4.60, 4.30, 4.40, 4.50, 4.45, 'Subramanian S (Finance Director)', 
 'Delivered year-end tax compliance reports with zero audit discrepancies.', 
 'Refine cost-center budgeting models.', 'Completed', '2026-01-07 16:00:00'),

-- Sanjay Kulkarni (Employee 7) - Accounting Associate
(12, 7, '2026-01-01', '2026-03-31', 3.40, 3.20, 3.60, 3.40, 3.40, 'Meera Nambiar (Lead Analyst)', 
 'Punctual with accounts payable processing but requires supervision on vendor tax withholding reconciliation.', 
 'Attend corporate taxation training and increase journal entry accuracy to 99%.', 'Completed', '2026-04-08 11:20:00'),

-- Pooja Iyer (Employee 8) - Sales Director
(13, 8, '2026-01-01', '2026-03-31', 4.50, 4.90, 4.70, 4.90, 4.75, 'Vivek Singhania (Chief Revenue Officer)', 
 'Exceeded quarterly revenue quota by 142%. Closed two multi-million dollar annual enterprise agreements.', 
 'Expand enterprise accounts in APAC region and train account executives.', 'Completed', '2026-04-09 10:45:00'),
(14, 8, '2025-10-01', '2025-12-31', 4.40, 4.80, 4.60, 4.80, 4.65, 'Vivek Singhania (Chief Revenue Officer)', 
 'Drove Q4 enterprise renewal rate to 98.4%.', 
 'Build key client advisory council.', 'Completed', '2026-01-09 12:00:00'),

-- Rahul Verma (Employee 9) - Marketing
(15, 9, '2026-01-01', '2026-03-31', 4.20, 4.40, 4.30, 4.10, 4.25, 'Pooja Iyer (Sales Director)', 
 'Generated 650+ qualified enterprise inbound leads through coordinated technical webinars and whitepapers.', 
 'Boost organic search traffic by 30% and launch brand customer showcase video.', 'Completed', '2026-04-10 15:30:00'),

-- Sneha Krishnan (Employee 10) - QA Lead
(16, 10, '2026-01-01', '2026-03-31', 4.70, 4.40, 4.60, 4.70, 4.60, 'Dr. Rajesh Murugan (VP Eng)', 
 'Engineered end-to-end Cypress and Playwright automated test suite, cutting regression test duration from 4 days to 45 minutes.', 
 'Integrate automated performance stress testing in pre-release pipelines.', 'Completed', '2026-04-11 11:15:00'),
(17, 10, '2025-10-01', '2025-12-31', 4.60, 4.30, 4.50, 4.60, 4.50, 'Dr. Rajesh Murugan (VP Eng)', 
 'Maintained 0 critical release bugs across 4 production deployments.', 
 'Expand cross-browser automated matrix.', 'Completed', '2026-01-10 14:00:00'),

-- Harish Balaji (Employee 11) - QA Associate
(18, 11, '2026-01-01', '2026-03-31', 3.50, 3.40, 3.80, 3.50, 3.55, 'Sneha Krishnan (QA Lead)', 
 'Good manual exploratory testing. Needs more hands-on practice writing API automation tests.', 
 'Complete Postman API test automation certification and write 50 new test scripts.', 'Completed', '2026-04-12 16:40:00'),

-- Tanvi Menon (Employee 12) - Product Designer
(19, 12, '2026-01-01', '2026-03-31', 4.80, 4.60, 4.70, 4.70, 4.70, 'Aditi Rao (Head of Product)', 
 'Created the unified design system for enterprise products with high accessibility WCAG 2.1 compliance.', 
 'Conduct user usability studies for the upcoming mobile responsive dashboard.', 'Completed', '2026-04-13 14:00:00'),
(20, 12, '2025-10-01', '2025-12-31', 4.70, 4.50, 4.60, 4.60, 4.60, 'Aditi Rao (Head of Product)', 
 'Redesigned core navigation structure resulting in 22% drop in user task completion time.', 
 'Publish Figma component token library.', 'Completed', '2026-01-12 11:30:00'),

-- Rohan Gupta (Employee 13) - Backend Database Developer
(21, 13, '2026-01-01', '2026-03-31', 4.60, 4.10, 4.30, 4.40, 4.35, 'Aarav Patel (Tech Lead)', 
 'Optimized complex SQL queries and index strategies. Reduced database CPU load by 35% during peak hours.', 
 'Implement database partitioning and write stored procedures for analytical reports.', 'Completed', '2026-04-14 17:15:00'),

-- Divya Nair (Employee 15) - Product Researcher
(22, 15, '2026-01-01', '2026-03-31', 4.30, 4.70, 4.50, 4.20, 4.43, 'Aditi Rao (Head of Product)', 
 'Synthesized 40+ user interview transcripts into comprehensive product journey maps.', 
 'Establish recurring customer feedback panels and prototype test cohorts.', 'Completed', '2026-04-15 10:20:00'),

-- Pending & In-Progress Reviews for Current Evaluation Cycle (Q2 2026)
(23, 1, '2026-04-01', '2026-06-30', 4.80, 4.70, 4.70, 4.80, 4.75, 'Dr. Rajesh Murugan (VP Eng)', 
 'Draft evaluation for Q2. Strong leadership in architecture review boards.', 
 'Finalize microservice boundaries and publish team design documents.', 'Pending', '2026-05-12 09:30:00'),
(24, 6, '2026-04-01', '2026-06-30', 4.70, 4.50, 4.60, 4.60, 4.60, 'Subramanian S (Finance Director)', 
 'Mid-cycle review in progress for financial automation project.', 
 'Complete vendor invoice reconciliations.', 'Pending', '2026-05-14 15:00:00'),
(25, 12, '2026-04-01', '2026-06-30', 4.80, 4.60, 4.80, 4.60, 4.70, 'Aditi Rao (Head of Product)', 
 'In-progress review for design system version 3.0 release.', 
 'Deliver mobile-first navigation prototypes.', 'In Progress', '2026-05-15 16:30:00');

-- =====================================================================
-- 4. Insert Default System Users
-- Passwords:
-- admin -> admin123 (SHA-256 / bcrypt equivalent hash)
-- hr -> hr123
-- reviewer -> rev123
-- =====================================================================
INSERT INTO users (user_id, username, email, password_hash, role, full_name) VALUES
(1, 'admin', 'admin@kitcorp.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQmG6W6dpE.v6vV3fL1.C', 'Administrator', 'Jeslin J (Admin)'),
(2, 'hrmanager', 'ananya.hr@kitcorp.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQmG6W6dpE.v6vV3fL1.C', 'HR Manager', 'Ananya Sharma (HR)'),
(3, 'reviewer', 'rajesh.lead@kitcorp.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQmG6W6dpE.v6vV3fL1.C', 'Reviewer', 'Dr. Rajesh Murugan (Reviewer)');
