import { Router, type Request, type Response } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { Entry } from '../models/Entry.js';
import { aggregateStats } from '../utils/stats.js';

const router = Router();

router.use(requireAuth);

router.get('/', async (req: Request, res: Response) => {
  try {
    const entries = await Entry.find({ userId: req.user!.userId }).lean();
    res.json(aggregateStats(entries));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to compute stats' });
  }
});

export default router;
