# PerformanceTrack — Employee Performance Tracking System

### Academic Information
- **Project Title:** Employee Performance Tracking System
- **Student Name:** Jeslin J
- **Register Number:** 711525BCS052
- **Institution:** KIT – Kalaignarkarunanidhi Institute of Technology, Coimbatore
- **Department:** Computer Science and Engineering
- **Course & Purpose:** Database Management Systems (DBMS AAT Project)
- **Target Database:** MySQL 8.0+ (InnoDB Engine, utf8mb4)

---

## 1. Executive Summary & Purpose
**PerformanceTrack** is an enterprise-grade HR performance tracking and analytics web application developed for college DBMS curriculum evaluation. The system enables organizations to manage employee rosters, departments, multi-pillar 360-degree performance appraisals, automated composite ratings, career development goals, and executive-level HR analytics.

All performance indicators, departmental headcounts, quarterly trends, and leaderboards are calculated using real SQL queries (joins, subqueries, aggregate functions like `AVG()`, `COUNT()`, and window functions like `DENSE_RANK()`).

---

## 2. Technology Stack & Architecture

| Tier | Technologies Used |
|---|---|
| **Frontend** | React 19 SPA, TypeScript, Tailwind CSS, Lucide Icons, Motion |
| **Backend** | Node.js, Express REST API, Parameterized SQL Execution |
| **Database Driver** | `mysql2/promise` (Connection Pooling, Prepared Statements) |
| **Database Server** | MySQL 8.0+ (InnoDB, UTF-8 MB4, Referential Integrity, Constraints) |
| **Fallback Engine** | High-fidelity In-Memory Relational Engine simulating MySQL 8.0 for sandbox preview environments |

---

## 3. Database Schema Overview (`employee_performance_db`)

The database architecture is designed in **Third Normal Form (3NF)** with strict referential integrity:

1. **`departments` table**
   - `department_id` (INT, Primary Key, Auto-Increment)
   - `department_name` (VARCHAR(100), UNIQUE, NOT NULL)
   - `description` (TEXT)
   - `created_at` (TIMESTAMP)

2. **`employees` table**
   - `employee_id` (INT, Primary Key, Auto-Increment)
   - `full_name` (VARCHAR(120), NOT NULL)
   - `email` (VARCHAR(150), UNIQUE, NOT NULL)
   - `phone` (VARCHAR(20))
   - `department_id` (INT, Foreign Key referencing `departments.department_id`, `ON UPDATE CASCADE, ON DELETE RESTRICT`)
   - `designation` (VARCHAR(100), NOT NULL)
   - `joining_date` (DATE, NOT NULL)
   - `employment_status` (ENUM('Active', 'Inactive'), DEFAULT 'Active')
   - `created_at` (TIMESTAMP)

3. **`performance_reviews` table**
   - `review_id` (INT, Primary Key, Auto-Increment)
   - `employee_id` (INT, Foreign Key referencing `employees.employee_id`, `ON UPDATE CASCADE, ON DELETE CASCADE`)
   - `review_period_start` (DATE, NOT NULL)
   - `review_period_end` (DATE, NOT NULL)
   - `technical_skills_rating` (DECIMAL(3,2), CHECK BETWEEN 1.00 AND 5.00)
   - `communication_rating` (DECIMAL(3,2), CHECK BETWEEN 1.00 AND 5.00)
   - `teamwork_rating` (DECIMAL(3,2), CHECK BETWEEN 1.00 AND 5.00)
   - `productivity_rating` (DECIMAL(3,2), CHECK BETWEEN 1.00 AND 5.00)
   - `overall_rating` (DECIMAL(3,2), CHECK BETWEEN 1.00 AND 5.00)
   - `reviewer_name` (VARCHAR(120), NOT NULL)
   - `reviewer_comments` (TEXT)
   - `next_period_goals` (TEXT)
   - `review_status` (ENUM('Pending', 'In Progress', 'Completed'))
   - `created_at` (TIMESTAMP)
   - **Unique Constraint:** `(employee_id, review_period_start, review_period_end)` prevents duplicate reviews for the same cycle.

4. **`users` table** (Role-Based Access Control)
   - `user_id` (INT, Primary Key, Auto-Increment)
   - `username` (VARCHAR(50), UNIQUE)
   - `password_hash` (VARCHAR(255))
   - `role` (ENUM('Administrator', 'HR Manager', 'Reviewer'))

---

## 4. Key Application Features

1. **Executive Dashboard:**
   - 6 SQL-computed summary cards (Total Staff, Active Count, Avg Rating, Completed Reviews, Pending Appraisals, Top Performers Count).
   - Monthly performance growth trend chart.
   - Department-wise average rating comparison bars.
   - Top 5 Performers Leaderboard with medals.
   - Recent 6 performance appraisals feed.

2. **Employee Management:**
   - Paginated employee table with real-time text search.
   - Department and Employment Status filters.
   - Sorting by Name, Joining Date, Performance Rating, and ID.
   - Add/Edit employee modal with email uniqueness check and field validation.
   - Quick Active/Inactive toggle button.
   - Delete employee with cascade delete warning.

3. **Department Management:**
   - Department cards with dynamic employee headcounts and average ratings.
   - Add/Edit department modals.
   - Referential Integrity Lock: Prevents deleting departments that still contain assigned employees (`ON DELETE RESTRICT`).

4. **Performance Review Management:**
   - 4-tier evaluation matrix: Technical, Communication, Teamwork, and Productivity (1.00 - 5.00).
   - Real-time automated calculation of Overall Rating: $\frac{\text{Tech} + \text{Comm} + \text{Team} + \text{Prod}}{4}$.
   - Chronological validation (`review_period_start <= review_period_end`).
   - Duplicate evaluation cycle prevention.

5. **Individual Employee 360° Profile:**
   - Detailed staff card with department, designation, and tenure.
   - Visual category breakdown bar chart.
   - Historical appraisal cycles timeline with reviewer comments and future milestones.
   - Empirical strengths and improvement areas summary (based purely on recorded database scores).

6. **Reports & CSV Data Export:**
   - Full rankings table with MySQL window function `DENSE_RANK()`.
   - Department rollup analytics.
   - One-click CSV download for:
     - `GET /api/reports/export/employees`
     - `GET /api/reports/export/reviews`
     - `GET /api/reports/export/departments`

7. **DBMS Viva & SQL Examiner Hub:**
   - **Interactive SQL Runner:** Allows the examiner or student to enter and execute custom SQL queries live.
   - **Preset Viva Queries:** One-click execution of complex joins, aggregates, and ranking queries.
   - **DDL & DML Script Inspector:** Browse and copy `01_schema.sql`, `02_sample_data.sql`, and `03_reports.sql`.
   - **Database Normalization Guide:** Full breakdown of 1NF, 2NF, and 3NF.
   - **Test Case Matrix:** 13 verified test cases covering entity integrity, referential integrity, check constraints, and API status codes.

---

## 5. Local Setup & MySQL Execution Guide

### Prerequisites
- Node.js (version 18 or higher)
- MySQL Server 8.0 or higher
- Git

### Step 1: Clone the Repository
```bash
git clone https://github.com/your-username/employee-performance-tracking-system.git
cd employee-performance-tracking-system
```

### Step 2: Install Node Dependencies
```bash
npm install
```

### Step 3: Set Up MySQL 8.0 Database
Open your terminal or MySQL Workbench and run:
```bash
# Log in to MySQL
mysql -u root -p

# Execute the Schema DDL
mysql -u root -p < sql/01_schema.sql

# Execute the Sample Seed Data
mysql -u root -p < sql/02_sample_data.sql
```

### Step 4: Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Update your credentials in `.env`:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=employee_performance_db
PORT=3000
```

### Step 5: Start the Full-Stack Application
```bash
npm run dev
```
Open your browser and navigate to:
```
http://localhost:3000
```

> **Note on Demo Mode:** If MySQL is not installed or running, the application gracefully activates its **Demo Mode** with realistic seed data and an in-memory SQL execution engine, accompanied by a status chip in the top navigation bar.

---

## 6. REST API Documentation

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/dashboard` | Returns summary KPIs, monthly trends, department rollups, and top performers |
| `GET` | `/api/employees` | Retrieves paginated employees with query filters (`search`, `department_id`, `employment_status`, `sort_by`, `sort_order`, `page`, `limit`) |
| `GET` | `/api/employees/:id` | Returns complete employee profile with historical reviews |
| `POST` | `/api/employees` | Creates a new employee record with unique email validation |
| `PUT` | `/api/employees/:id` | Updates an employee record |
| `PATCH` | `/api/employees/:id/toggle-status` | Toggles status between `Active` and `Inactive` |
| `DELETE` | `/api/employees/:id` | Deletes an employee and cascades associated reviews |
| `GET` | `/api/departments` | Lists all departments with employee counts and average ratings |
| `POST` | `/api/departments` | Creates a new department |
| `PUT` | `/api/departments/:id` | Updates a department |
| `DELETE` | `/api/departments/:id` | Safely deletes department (enforces `ON DELETE RESTRICT`) |
| `GET` | `/api/reviews` | Retrieves performance reviews with filtering and pagination |
| `POST` | `/api/reviews` | Records a performance review with auto-computed average and cycle validation |
| `PUT` | `/api/reviews/:id` | Modifies an existing review |
| `DELETE` | `/api/reviews/:id` | Deletes a review record |
| `GET` | `/api/reports/employee-rankings` | Returns dense rankings ordered by overall score |
| `GET` | `/api/reports/export/employees` | Streams CSV export of all employees |
| `GET` | `/api/reports/export/reviews` | Streams CSV export of all reviews |
| `GET` | `/api/reports/export/departments`| Streams CSV export of department summaries |
| `POST` | `/api/sql/execute` | Executes arbitrary SQL query for viva testing |
| `GET` | `/api/sql/scripts` | Returns raw SQL file contents for UI inspector |

---

## 7. Viva Q&A & Key DBMS Concepts Explained

1. **How is the composite Overall Rating computed?**
   $$\text{overall\_rating} = \frac{\text{technical\_skills\_rating} + \text{communication\_rating} + \text{teamwork\_rating} + \text{productivity\_rating}}{4}$$
   This calculation is verified on both the frontend and backend, and validated in MySQL with check constraints:
   ```sql
   CONSTRAINT chk_overall_rating CHECK (overall_rating >= 1.00 AND overall_rating <= 5.00)
   ```

2. **How does Referential Integrity protect against orphaned reviews?**
   The `performance_reviews` table defines:
   ```sql
   CONSTRAINT fk_review_employee FOREIGN KEY (employee_id) 
       REFERENCES employees(employee_id) 
       ON UPDATE CASCADE 
       ON DELETE CASCADE
   ```
   When an employee is deleted, their corresponding evaluations are cascaded cleanly.

3. **How is accidental deletion of departments prevented?**
   The `employees` table defines:
   ```sql
   CONSTRAINT fk_employee_department FOREIGN KEY (department_id) 
       REFERENCES departments(department_id) 
       ON UPDATE CASCADE 
       ON DELETE RESTRICT
   ```
   MySQL raises error code `1451` if an administrator attempts to delete a department with active staff.

4. **How are duplicate reviews prevented?**
   ```sql
   CONSTRAINT uq_employee_review_period UNIQUE (employee_id, review_period_start, review_period_end)
   ```

---

## 8. GitHub Upload Instructions

```bash
git init
git add .
git commit -m "feat: complete Employee Performance Tracking System for KIT CSE DBMS AAT"
git branch -M main
git remote add origin https://github.com/your-username/employee-performance-tracking-system.git
git push -u origin main
```

---

### Project Credits
- **Developer:** Jeslin J
- **Register Number:** 711525BCS052
- **Institution:** KIT – Kalaignarkarunanidhi Institute of Technology
- **Department:** Computer Science and Engineering
