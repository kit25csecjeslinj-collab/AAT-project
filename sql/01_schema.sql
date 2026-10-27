-- =====================================================================
-- KIT – Kalaignarkarunanidhi Institute of Technology
-- Department of Computer Science and Engineering
-- DBMS AAT Project: EMPLOYEE PERFORMANCE TRACKING SYSTEM
-- Student: Jeslin J (Register No: 711525BCS052)
-- Database: MySQL 8.0+
-- File: 01_schema.sql - Database Schema Definition DDL
-- =====================================================================

-- Step 1: Create Database
CREATE DATABASE IF NOT EXISTS employee_performance_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE employee_performance_db;

-- Disable foreign key checks during schema re-creation if needed
SET FOREIGN_KEY_CHECKS = 0;

-- Step 2: Drop existing tables if re-running
DROP TABLE IF EXISTS performance_reviews;
DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS departments;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================================
-- TABLE 1: departments
-- Stores department details and prevents accidental orphan records
-- =====================================================================
CREATE TABLE departments (
    department_id INT AUTO_INCREMENT PRIMARY KEY,
    department_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_department_name (department_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- TABLE 2: employees
-- Master table for all staff members with foreign key to departments
-- =====================================================================
CREATE TABLE employees (
    employee_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(20) NULL,
    department_id INT NOT NULL,
    designation VARCHAR(100) NOT NULL,
    joining_date DATE NOT NULL,
    employment_status ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_employee_department
        FOREIGN KEY (department_id) REFERENCES departments(department_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    INDEX idx_emp_dept (department_id),
    INDEX idx_emp_status (employment_status),
    INDEX idx_emp_name (full_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- TABLE 3: performance_reviews
-- Stores 360-degree performance evaluations with 4 rating dimensions,
-- automated overall score, review comments, and future goals.
-- =====================================================================
CREATE TABLE performance_reviews (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    review_period_start DATE NOT NULL,
    review_period_end DATE NOT NULL,
    technical_skills_rating DECIMAL(3,2) NOT NULL,
    communication_rating DECIMAL(3,2) NOT NULL,
    teamwork_rating DECIMAL(3,2) NOT NULL,
    productivity_rating DECIMAL(3,2) NOT NULL,
    overall_rating DECIMAL(3,2) NOT NULL,
    reviewer_name VARCHAR(120) NOT NULL,
    reviewer_comments TEXT NULL,
    next_period_goals TEXT NULL,
    review_status ENUM('Pending', 'In Progress', 'Completed') NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Referential Integrity: Cascade delete reviews when employee is deleted
    CONSTRAINT fk_review_employee
        FOREIGN KEY (employee_id) REFERENCES employees(employee_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    -- Prevent duplicate reviews for the same employee across the same evaluation cycle
    CONSTRAINT uq_employee_review_period
        UNIQUE (employee_id, review_period_start, review_period_end),
    -- Validation Check Constraints for rating scale (1.00 to 5.00)
    CONSTRAINT chk_tech_rating
        CHECK (technical_skills_rating >= 1.00 AND technical_skills_rating <= 5.00),
    CONSTRAINT chk_comm_rating
        CHECK (communication_rating >= 1.00 AND communication_rating <= 5.00),
    CONSTRAINT chk_team_rating
        CHECK (teamwork_rating >= 1.00 AND teamwork_rating <= 5.00),
    CONSTRAINT chk_prod_rating
        CHECK (productivity_rating >= 1.00 AND productivity_rating <= 5.00),
    CONSTRAINT chk_overall_rating
        CHECK (overall_rating >= 1.00 AND overall_rating <= 5.00),
    -- Chronological Period Constraint
    CONSTRAINT chk_period_dates
        CHECK (review_period_start <= review_period_end),
    INDEX idx_review_employee (employee_id),
    INDEX idx_review_status (review_status),
    INDEX idx_review_overall (overall_rating),
    INDEX idx_review_dates (review_period_start, review_period_end)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- TABLE 4: users
-- Application users for Authentication and Role-Based Access Control
-- =====================================================================
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('Administrator', 'HR Manager', 'Reviewer') NOT NULL DEFAULT 'Reviewer',
    full_name VARCHAR(120) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
