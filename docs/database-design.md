# Database Design Documentation

## Project Information
- **Project Title:** Employee Performance Tracking System
- **Student Name:** Jeslin J
- **Register Number:** 711525BCS052
- **Institution:** KIT – Kalaignarkarunanidhi Institute of Technology
- **Department:** Computer Science and Engineering
- **Subject:** Database Management Systems (DBMS AAT)
- **Target DBMS:** MySQL 8.0+ (InnoDB Engine, utf8mb4 charset)

---

## 1. Entity-Relationship (ER) Diagram Description

### Entities
1. **DEPARTMENTS** (`departments`): Represents organizational branches or functional units.
   - Primary Key: `department_id` (INT Auto-Increment)
   - Attributes: `department_name` (Unique, Not Null), `description` (Text), `created_at` (Timestamp)

2. **EMPLOYEES** (`employees`): Represents all active and inactive staff personnel.
   - Primary Key: `employee_id` (INT Auto-Increment)
   - Foreign Key: `department_id` references `departments(department_id)`
   - Attributes: `full_name` (Not Null), `email` (Unique, Not Null), `phone`, `designation` (Not Null), `joining_date` (Date, Not Null), `employment_status` (Enum 'Active'/'Inactive'), `created_at` (Timestamp)

3. **PERFORMANCE_REVIEWS** (`performance_reviews`): Captures periodic 360-degree performance evaluations.
   - Primary Key: `review_id` (INT Auto-Increment)
   - Foreign Key: `employee_id` references `employees(employee_id)`
   - Attributes: `review_period_start`, `review_period_end`, `technical_skills_rating` (1.00 - 5.00), `communication_rating` (1.00 - 5.00), `teamwork_rating` (1.00 - 5.00), `productivity_rating` (1.00 - 5.00), `overall_rating` (Decimal 3,2), `reviewer_name`, `reviewer_comments`, `next_period_goals`, `review_status` (Enum 'Pending'/'In Progress'/'Completed'), `created_at`

4. **USERS** (`users`): Represents authenticated users for Role-Based Access Control (RBAC).
   - Primary Key: `user_id` (INT Auto-Increment)
   - Attributes: `username` (Unique), `email` (Unique), `password_hash`, `role` (Administrator, HR Manager, Reviewer), `full_name`, `created_at`

---

## 2. Cardinality & Relational Constraints

1. **DEPARTMENTS to EMPLOYEES (1 : N)**
   - One Department can have **many** Employees.
   - An Employee belongs to **exactly one** Department.
   - Constraint: `ON UPDATE CASCADE, ON DELETE RESTRICT`. A department with active employees cannot be deleted, protecting referential integrity.

2. **EMPLOYEES to PERFORMANCE_REVIEWS (1 : N)**
   - One Employee can have **multiple** Performance Reviews over different quarters.
   - A Performance Review belongs to **exactly one** Employee.
   - Constraint: `ON UPDATE CASCADE, ON DELETE CASCADE`. If an employee record is permanently purged, historical review logs cascade cleanly.
   - Unique Constraint: `(employee_id, review_period_start, review_period_end)` prevents duplicate reviews for the same employee in the same evaluation window.

---

## 3. Database Normalization Analysis

### First Normal Form (1NF)
- Every table has a primary key.
- All column values are atomic (e.g., individual rating dimensions are separate fields, not comma-separated lists).
- No repeating groups exist.

### Second Normal Form (2NF)
- All non-key attributes are fully functionally dependent on the entire primary key.
- Since primary keys (`department_id`, `employee_id`, `review_id`) are single-column surrogate keys, no partial dependencies exist.

### Third Normal Form (3NF)
- No transitive dependencies exist.
- Non-key attributes depend only on the primary key. Department information is not duplicated inside the `employees` table (only `department_id` is referenced as a foreign key).

---

## 4. Integrity Constraints & Business Logic
1. **Domain Integrity:**
   - Ratings are strictly constrained via MySQL CHECK constraints: `CHECK (rating >= 1.00 AND rating <= 5.00)`.
   - Date validation: `CHECK (review_period_start <= review_period_end)`.
2. **Entity Integrity:**
   - Unique constraints on `employees.email`, `departments.department_name`, and `(employee_id, review_period_start, review_period_end)`.
3. **Automated Calculation Consistency:**
   - Formula: $\text{Overall Rating} = \frac{\text{Technical} + \text{Communication} + \text{Teamwork} + \text{Productivity}}{4}$, rounded to 2 decimal places.
