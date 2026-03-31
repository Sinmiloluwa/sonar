import express from 'express';
import { joinWaitlist } from '../controllers/waitlist.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();
router.post('/join', joinWaitlist);

export default router;