/**
 * @file reviews.ts
 * @description API routes for Performance Reviews with automated overall rating calculation and period validation.
 */

import { Router } from 'express';
import { dbService } from '../services/dbService.ts';

const router = Router();

// GET /api/reviews
router.get('/', async (req, res) => {
  try {
    const {
      employee_id,
      department_id,
      review_status,
      min_rating,
      search,
      page,
      limit,
    } = req.query;

    const result = await dbService.getReviews({
      employee_id: employee_id ? String(employee_id) : undefined,
      department_id: department_id ? String(department_id) : undefined,
      review_status: review_status ? String(review_status) : undefined,
      min_rating: min_rating ? parseFloat(String(min_rating)) : undefined,
      search: search ? String(search) : undefined,
      page: page ? parseInt(String(page), 10) : 1,
      limit: limit ? parseInt(String(limit), 10) : 15,
    });

    res.json({
      success: true,
      ...result,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to fetch reviews',
    });
  }
});

// GET /api/reviews/:id
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid review ID.' });
    }

    const review = await dbService.getReviewById(id);
    if (!review) {
      return res.status(404).json({ success: false, error: `Review #${id} not found.` });
    }

    res.json({
      success: true,
      data: review,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to fetch review.',
    });
  }
});

// POST /api/reviews
router.post('/', async (req, res) => {
  try {
    const {
      employee_id,
      review_period_start,
      review_period_end,
      technical_skills_rating,
      communication_rating,
      teamwork_rating,
      productivity_rating,
      reviewer_name,
      reviewer_comments,
      next_period_goals,
      review_status,
    } = req.body;

    // Type coercion
    const empId = parseInt(employee_id, 10);
    const tech = parseFloat(technical_skills_rating);
    const comm = parseFloat(communication_rating);
    const team = parseFloat(teamwork_rating);
    const prod = parseFloat(productivity_rating);

    if (isNaN(empId) || isNaN(tech) || isNaN(comm) || isNaN(team) || isNaN(prod)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid numbers provided for employee ID or rating scores.',
      });
    }

    const created = await dbService.createReview({
      employee_id: empId,
      review_period_start,
      review_period_end,
      technical_skills_rating: tech,
      communication_rating: comm,
      teamwork_rating: team,
      productivity_rating: prod,
      reviewer_name,
      reviewer_comments,
      next_period_goals,
      review_status,
    });

    res.status(201).json({
      success: true,
      message: 'Performance review recorded successfully.',
      data: created,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: err.message || 'Failed to submit review.',
    });
  }
});

// PUT /api/reviews/:id
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid review ID.' });
    }

    const payload: any = { ...req.body };
    if (payload.technical_skills_rating !== undefined) payload.technical_skills_rating = parseFloat(payload.technical_skills_rating);
    if (payload.communication_rating !== undefined) payload.communication_rating = parseFloat(payload.communication_rating);
    if (payload.teamwork_rating !== undefined) payload.teamwork_rating = parseFloat(payload.teamwork_rating);
    if (payload.productivity_rating !== undefined) payload.productivity_rating = parseFloat(payload.productivity_rating);

    const updated = await dbService.updateReview(id, payload);
    res.json({
      success: true,
      message: `Performance review #${id} updated successfully.`,
      data: updated,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: err.message || 'Failed to update review.',
    });
  }
});

// DELETE /api/reviews/:id
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid review ID.' });
    }

    const result = await dbService.deleteReview(id);
    res.json({
      success: true,
      message: result.message,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: err.message || 'Failed to delete review.',
    });
  }
});

export default router;
