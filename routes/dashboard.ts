/**
 * @file dashboard.ts
 * @description API routes for Dashboard KPIs, trends, and charts.
 */

import { Router } from 'express';
import { dbService } from '../services/dbService.ts';

const router = Router();

// GET /api/dashboard
router.get('/', async (req, res) => {
  try {
    const data = await dbService.getDashboardMetrics();
    res.json({
      success: true,
      data,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to fetch dashboard metrics',
    });
  }
});

export default router;
