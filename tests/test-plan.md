# Database & Application Test Plan

## Project: Employee Performance Tracking System
- **Student:** Jeslin J (711525BCS052)
- **Institution:** KIT – Kalaignarkarunanidhi Institute of Technology, CSE Dept
- **DBMS:** MySQL 8.0+

---

## Test Execution Matrix

| Test Case ID | Test Category | Test Description | Input Data | Expected Result | Actual Result / Verification |
|---|---|---|---|---|---|
| **TC-DB-01** | Entity Integrity | Insert employee with duplicate email | `aarav.patel@kitcorp.com` | MySQL Error 1062: Duplicate entry for key 'employees.email' | **PASS** - Duplicate rejected |
| **TC-DB-02** | Referential Integrity | Delete department with assigned employees | Department ID 1 (Computer Science) | MySQL Error 1451: Cannot delete or update a parent row: a foreign key constraint fails (`ON DELETE RESTRICT`) | **PASS** - Safety lock triggered |
| **TC-DB-03** | Domain Check | Insert review with rating > 5.00 | Technical rating: `5.50` | MySQL Error 3819: Check constraint 'chk_tech_rating' is violated | **PASS** - Invalid rating blocked |
| **TC-DB-04** | Domain Check | Insert review with rating < 1.00 | Teamwork rating: `0.50` | MySQL Error 3819: Check constraint 'chk_team_rating' is violated | **PASS** - Out-of-bounds rating blocked |
| **TC-DB-05** | Date Validation | Insert review where start date > end date | Start: `2026-06-30`, End: `2026-01-01` | MySQL Error 3819: Check constraint 'chk_period_dates' is violated | **PASS** - Inverted date rejected |
| **TC-DB-06** | Unique Review Cycle | Insert duplicate review for same employee and period | Employee 1, Start: `2026-01-01`, End: `2026-03-31` | MySQL Error 1062: Duplicate entry for key 'uq_employee_review_period' | **PASS** - Duplicate review prevented |
| **TC-DB-07** | Cascade Integrity | Delete employee who has reviews | Employee ID 15 | Employee is deleted and corresponding records in `performance_reviews` are automatically removed (`ON DELETE CASCADE`) | **PASS** - Cascade deletion confirmed |
| **TC-DB-08** | Business Logic | Compute Overall Rating | Tech: 4.8, Comm: 4.6, Team: 4.7, Prod: 4.9 | Overall = (4.8+4.6+4.7+4.9)/4 = `4.75` | **PASS** - Verified match |
| **TC-API-01** | REST API | Fetch all dashboard metrics | `GET /api/dashboard` | HTTP 200 with JSON summary metrics matching database | **PASS** - Metrics match SQL |
| **TC-API-02** | REST API | Create new employee with missing fields | `POST /api/employees` with `{ "full_name": "" }` | HTTP 400 Bad Request with field validation errors | **PASS** - Input validation works |
| **TC-API-03** | REST API | Export employee records as CSV | `GET /api/reports/export/employees` | HTTP 200 with `Content-Type: text/csv` and valid CSV headers | **PASS** - CSV download initiated |
| **TC-API-04** | Security | Parameterized SQL Injection attempt | Input: `' OR '1'='1` in employee search | System sanitizes and searches for literal string, no injection | **PASS** - Parameterized queries protect DB |
| **TC-UI-01** | User Interface | Live Demo / Fallback Mode Toggle | MySQL unavailable or unconfigured | UI cleanly displays Demo Mode notification with sample data, live indicator, and connection tester | **PASS** - Seamless fallback |
