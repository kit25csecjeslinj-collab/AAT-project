/**
 * @file departments.ts
 * @description API routes for Department Management with Referential Integrity Protection.
 */

import { Router } from 'express';
import { dbService } from '../services/dbService.ts';

const router = Router();

// GET /api/departments
router.get('/', async (req, res) => {
  try {
    const departments = await dbService.getDepartments();
    res.json({
      success: true,
      data: departments,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to fetch departments',
    });
  }
});

// POST /api/departments
router.post('/', async (req, res) => {
  try {
    const { department_name, description } = req.body;
    if (!department_name || !department_name.trim()) {
      return res.status(400).json({ success: false, error: 'Department name is required.' });
    }

    const created = await dbService.createDepartment({ department_name, description });
    res.status(201).json({
      success: true,
      message: 'Department created successfully.',
      data: created,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: err.message || 'Failed to create department.',
    });
  }
});

// PUT /api/departments/:id
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid department ID.' });
    }

    const updated = await dbService.updateDepartment(id, req.body);
    res.json({
      success: true,
      message: 'Department updated successfully.',
      data: updated,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: err.message || 'Failed to update department.',
    });
  }
});

// DELETE /api/departments/:id
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid department ID.' });
    }

    const result = await dbService.deleteDepartment(id);
    res.json({
      success: true,
      message: result.message,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: err.message || 'Cannot delete department due to database integrity constraints.',
    });
  }
});

export default router;
