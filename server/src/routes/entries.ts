import { Router, type Request, type Response } from 'express';
import mongoose from 'mongoose';
import { requireAuth } from '../middleware/auth.js';
import { Entry } from '../models/Entry.js';

const router = Router();

const DIFFICULTIES = new Set(['Easy', 'Medium', 'Hard']);
const STATUSES = new Set(['Solved', 'Review', 'Attempted']);

router.use(requireAuth);

function paramId(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

function parseTopics(input: unknown): string[] {
  if (Array.isArray(input)) {
    return input
      .map((t) => String(t).trim())
      .filter(Boolean);
  }
  if (typeof input === 'string') {
    return input
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
  }
  return [];
}

router.get('/', async (req: Request, res: Response) => {
  try {
    const filter: Record<string, unknown> = { userId: req.user!.userId };
    const { difficulty, status, topic, q } = req.query;

    if (typeof difficulty === 'string' && DIFFICULTIES.has(difficulty)) {
      filter.difficulty = difficulty;
    }
    if (typeof status === 'string' && STATUSES.has(status)) {
      filter.status = status;
    }
    if (typeof topic === 'string' && topic.trim()) {
      filter.topics = topic.trim();
    }
    if (typeof q === 'string' && q.trim()) {
      filter.title = { $regex: q.trim(), $options: 'i' };
    }

    const entries = await Entry.find(filter).sort({ solvedAt: -1 }).lean();
    res.json(entries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch entries' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = paramId(req.params.id);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: 'Invalid id' });
      return;
    }

    const entry = await Entry.findOne({
      _id: id,
      userId: req.user!.userId,
    }).lean();
    if (!entry) {
      res.status(404).json({ error: 'Entry not found' });
      return;
    }

    res.json(entry);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch entry' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { title, slug, difficulty, status, solvedAt, timeSpentMinutes, notes } = req.body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      res.status(400).json({ error: 'title is required' });
      return;
    }
    if (!DIFFICULTIES.has(difficulty)) {
      res.status(400).json({ error: 'difficulty must be Easy, Medium, or Hard' });
      return;
    }
    if (status && !STATUSES.has(status)) {
      res.status(400).json({ error: 'status must be Solved, Review, or Attempted' });
      return;
    }

    const entry = await Entry.create({
      userId: req.user!.userId,
      title: title.trim(),
      slug: typeof slug === 'string' ? slug.trim() : '',
      difficulty,
      topics: parseTopics(req.body.topics),
      status: status || 'Solved',
      solvedAt: solvedAt ? new Date(solvedAt) : new Date(),
      timeSpentMinutes:
        timeSpentMinutes === null || timeSpentMinutes === undefined || timeSpentMinutes === ''
          ? null
          : Number(timeSpentMinutes),
      notes: typeof notes === 'string' ? notes : '',
    });

    res.status(201).json(entry);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create entry' });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = paramId(req.params.id);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: 'Invalid id' });
      return;
    }

    const { title, slug, difficulty, status, solvedAt, timeSpentMinutes, notes } = req.body;
    const updates: Record<string, unknown> = {};

    if (title !== undefined) {
      if (typeof title !== 'string' || !title.trim()) {
        res.status(400).json({ error: 'title cannot be empty' });
        return;
      }
      updates.title = title.trim();
    }
    if (slug !== undefined) updates.slug = String(slug).trim();
    if (difficulty !== undefined) {
      if (!DIFFICULTIES.has(difficulty)) {
        res.status(400).json({ error: 'difficulty must be Easy, Medium, or Hard' });
        return;
      }
      updates.difficulty = difficulty;
    }
    if (status !== undefined) {
      if (!STATUSES.has(status)) {
        res.status(400).json({ error: 'status must be Solved, Review, or Attempted' });
        return;
      }
      updates.status = status;
    }
    if (req.body.topics !== undefined) updates.topics = parseTopics(req.body.topics);
    if (solvedAt !== undefined) updates.solvedAt = new Date(solvedAt);
    if (timeSpentMinutes !== undefined) {
      updates.timeSpentMinutes =
        timeSpentMinutes === null || timeSpentMinutes === ''
          ? null
          : Number(timeSpentMinutes);
    }
    if (notes !== undefined) updates.notes = String(notes);

    const entry = await Entry.findOneAndUpdate(
      { _id: id, userId: req.user!.userId },
      updates,
      { new: true, runValidators: true }
    ).lean();

    if (!entry) {
      res.status(404).json({ error: 'Entry not found' });
      return;
    }

    res.json(entry);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update entry' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = paramId(req.params.id);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: 'Invalid id' });
      return;
    }

    const entry = await Entry.findOneAndDelete({
      _id: id,
      userId: req.user!.userId,
    }).lean();

    if (!entry) {
      res.status(404).json({ error: 'Entry not found' });
      return;
    }

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete entry' });
  }
});

export default router;
