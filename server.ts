/**
 * @file server.ts
 * @description Main Express application server with Vite middleware integration.
 * Built for KIT CSE DBMS AAT Project - Jeslin J (711525BCS052).
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { initDatabaseConnection } from './config/database.ts';

import dashboardRoutes from './routes/dashboard.ts';
import employeesRoutes from './routes/employees.ts';
import departmentsRoutes from './routes/departments.ts';
import reviewsRoutes from './routes/reviews.ts';
import reportsRoutes from './routes/reports.ts';
import sqlViewerRoutes from './routes/sqlViewer.ts';
import authRoutes from './routes/auth.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);
  const isProduction = process.env.NODE_ENV === 'production';

  // Body Parsing Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Initialize Database Connection Probe
  await initDatabaseConnection();

  // Mount REST API Endpoints
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/employees', employeesRoutes);
  app.use('/api/departments', departmentsRoutes);
  app.use('/api/reviews', reviewsRoutes);
  app.use('/api/reports', reportsRoutes);
  app.use('/api/sql', sqlViewerRoutes);
  app.use('/api/db', sqlViewerRoutes);
  app.use('/api/auth', authRoutes);

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'UP',
      timestamp: new Date().toISOString(),
      student: 'Jeslin J (711525BCS052)',
      institution: 'KIT - Kalaignarkarunanidhi Institute of Technology',
      project: 'EMPLOYEE PERFORMANCE TRACKING SYSTEM',
    });
  });

  // Serve static assets or mount Vite dev server
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[PerformanceTrack] Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[PerformanceTrack] Failed to start server:', err);
  process.exit(1);
});
