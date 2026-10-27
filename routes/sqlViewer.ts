/**
 * @file sqlViewer.ts
 * @description API routes for DBMS viva evaluation: inspect schema scripts, run interactive SQL queries.
 */

import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { dbService } from '../services/dbService.ts';

const router = Router();

// GET /api/db/status
router.get('/status', async (req, res) => {
  try {
    const status = await dbService.getStatus();
    res.json({ success: true, data: status });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/sql/scripts
router.get('/scripts', async (req, res) => {
  try {
    const readFileSafe = (relPath: string) => {
      try {
        return fs.readFileSync(path.resolve(process.cwd(), relPath), 'utf-8');
      } catch (err) {
        return `-- Could not read ${relPath}`;
      }
    };

    const schemaSql = readFileSafe('sql/01_schema.sql');
    const sampleDataSql = readFileSafe('sql/02_sample_data.sql');
    const reportsSql = readFileSafe('sql/03_reports.sql');
    const dbDesignMd = readFileSafe('docs/database-design.md');
    const testPlanMd = readFileSafe('tests/test-plan.md');

    res.json({
      success: true,
      data: {
        schemaSql,
        sampleDataSql,
        reportsSql,
        dbDesignMd,
        testPlanMd,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/sql/execute
router.post('/execute', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ success: false, error: 'Query parameter is required.' });
    }

    const result = await dbService.executeCustomQuery(query);
    res.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: err.message || 'SQL Execution Error',
    });
  }
});

export default router;
