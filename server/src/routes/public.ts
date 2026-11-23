import { Router, type Request, type Response } from 'express';
import { Entry } from '../models/Entry.js';
import { User } from '../models/User.js';
import { aggregateStats } from '../utils/stats.js';

const router = Router();

function paramSlug(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const slug = paramSlug(req.params.slug).trim().toLowerCase();
    if (!slug) {
      res.status(400).json({ error: 'Invalid share link' });
      return;
    }

    const user = await User.findOne({ shareSlug: slug }).select('name shareSlug').lean();
    if (!user) {
      res.status(404).json({ error: 'Shared profile not found' });
      return;
    }

    const page = Math.max(1, Number.parseInt(String(req.query.page ?? '1'), 10) || 1);
    const limit = Math.min(
      50,
      Math.max(1, Number.parseInt(String(req.query.limit ?? '10'), 10) || 10)
    );
    const skip = (page - 1) * limit;

    const [allEntries, total, pageEntries] = await Promise.all([
      Entry.find({ userId: user._id }).lean(),
      Entry.countDocuments({ userId: user._id }),
      Entry.find({ userId: user._id })
        .sort({ solvedAt: -1 })
        .skip(skip)
        .limit(limit)
        .select(
          'title slug difficulty topics status solvedAt timeSpentMinutes notes languages solutions createdAt updatedAt'
        )
        .lean(),
    ]);

    res.json({
      profile: {
        name: user.name,
        shareSlug: user.shareSlug,
      },
      stats: aggregateStats(allEntries),
      entries: {
        items: pageEntries,
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load shared profile' });
  }
});

export default router;
