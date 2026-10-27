/**
 * @file employees.ts
 * @description API routes for Employee Management CRUD operations.
 */

import { Router } from 'express';
import { dbService } from '../services/dbService.ts';

const router = Router();

// GET /api/employees
router.get('/', async (req, res) => {
  try {
    const {
      search,
      department_id,
      employment_status,
      sort_by,
      sort_order,
      page,
      limit,
    } = req.query;

    const result = await dbService.getEmployees({
      search: search ? String(search) : undefined,
      department_id: department_id ? String(department_id) : undefined,
      employment_status: employment_status ? String(employment_status) : undefined,
      sort_by: sort_by ? String(sort_by) : undefined,
      sort_order: sort_order === 'DESC' ? 'DESC' : 'ASC',
      page: page ? parseInt(String(page), 10) : 1,
      limit: limit ? parseInt(String(limit), 10) : 10,
    });

    res.json({
      success: true,
      ...result,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to fetch employees',
    });
  }
});

// GET /api/employees/:id
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid employee ID format.' });
    }

    const employee = await dbService.getEmployeeById(id);
    if (!employee) {
      return res.status(404).json({ success: false, error: `Employee #${id} not found.` });
    }

    res.json({
      success: true,
      data: employee,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to retrieve employee profile',
    });
  }
});

// POST /api/employees
router.post('/', async (req, res) => {
  try {
    const { full_name, email, phone, department_id, designation, joining_date, employment_status } = req.body;

    if (!full_name || !email || !department_id || !designation || !joining_date) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: full_name, email, department_id, designation, and joining_date are mandatory.',
      });
    }

    const newEmp = await dbService.createEmployee({
      full_name,
      email,
      phone,
      department_id: parseInt(department_id, 10),
      designation,
      joining_date,
      employment_status,
    });

    res.status(201).json({
      success: true,
      message: 'Employee record created successfully.',
      data: newEmp,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: err.message || 'Failed to create employee.',
    });
  }
});

// PUT /api/employees/:id
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid employee ID format.' });
    }

    const updated = await dbService.updateEmployee(id, req.body);
    res.json({
      success: true,
      message: `Employee #${id} updated successfully.`,
      data: updated,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: err.message || 'Failed to update employee.',
    });
  }
});

// PATCH /api/employees/:id/toggle-status
router.patch('/:id/toggle-status', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid employee ID format.' });
    }

    const emp = await dbService.getEmployeeById(id);
    if (!emp) {
      return res.status(404).json({ success: false, error: `Employee #${id} not found.` });
    }

    const nextStatus = emp.employment_status === 'Active' ? 'Inactive' : 'Active';
    const updated = await dbService.updateEmployee(id, { employment_status: nextStatus });

    res.json({
      success: true,
      message: `Employee status changed to ${nextStatus}.`,
      data: updated,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: err.message || 'Failed to change employee status.',
    });
  }
});

// DELETE /api/employees/:id
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid employee ID format.' });
    }

    const result = await dbService.deleteEmployee(id);
    res.json({
      success: true,
      message: result.message,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: err.message || 'Failed to delete employee.',
    });
  }
});

export default router;
