/**
 * @file auth.ts
 * @description Authentication and Role-based sessions for Administrator and HR/Reviewers.
 */

import { Router } from 'express';
import { dbService } from '../services/dbService.ts';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Username and password are required.' });
    }

    const user = await dbService.authenticateUser(username, password);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid username or password credentials.' });
    }

    res.json({
      success: true,
      message: 'Login successful.',
      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        role: user.role,
        full_name: user.full_name,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Login failed.' });
  }
});

export default router;
