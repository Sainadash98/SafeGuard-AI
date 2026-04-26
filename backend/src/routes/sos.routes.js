import express from 'express';
import { createSos } from '../controllers/sos.controller.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.post('/trigger', authMiddleware, createSos);

export default router;