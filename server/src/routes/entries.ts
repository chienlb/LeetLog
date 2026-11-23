import { Router, type Request, type Response } from 'express';
import mongoose from 'mongoose';
import { requireAuth } from '../middleware/auth.js';
import { Entry, SOLUTION_LANGUAGES } from '../models/Entry.js';

const router = Router();

const DIFFICULTIES = new Set(['Easy', 'Medium', 'Hard']);
const STATUSES = new Set(['Solved', 'Review', 'Attempted']);
const LANGUAGES = new Set<string>(SOLUTION_LANGUAGES);

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

function parseSolutions(input: unknown): { language: string; code: string }[] | null {
  if (input === undefined) return null;
  if (!Array.isArray(input)) return null;

  const seen = new Set<string>();
  const solutions: { language: string; code: string }[] = [];

  for (const item of input) {
    if (!item || typeof item !== 'object') continue;
    const language = String((item as { language?: unknown }).language ?? '').trim();
    const code = String((item as { code?: unknown }).code ?? '');
    if (!LANGUAGES.has(language)) continue;
    if (!code.trim()) continue;
    if (seen.has(language)) continue;
    seen.add(language);
    solutions.push({ language, code });
  }

  return solutions;
}

router.get('/', async (req: Request, res: Response) => {
  try {
    const filter: Record<string, unknown> = { userId: req.user!.userId };
    const { difficulty, status, topic, q, page: pageRaw, limit: limitRaw } = req.query;

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

    const page = Math.max(1, Number.parseInt(String(pageRaw ?? '1'), 10) || 1);
    const limit = Math.min(
      50,
      Math.max(1, Number.parseInt(String(limitRaw ?? '10'), 10) || 10)
    );
    const skip = (page - 1) * limit;

    const [total, items] = await Promise.all([
      Entry.countDocuments(filter),
      Entry.find(filter).sort({ solvedAt: -1 }).skip(skip).limit(limit).lean(),
    ]);

    res.json({
      items,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
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

    const solutions =
      req.body.solutions === undefined ? [] : parseSolutions(req.body.solutions);
    if (req.body.solutions !== undefined && solutions === null) {
      res.status(400).json({ error: 'solutions must be an array of { language, code }' });
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
      solutions: solutions ?? [],
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
    if (req.body.solutions !== undefined) {
      const solutions = parseSolutions(req.body.solutions);
      if (solutions === null) {
        res.status(400).json({ error: 'solutions must be an array of { language, code }' });
        return;
      }
      updates.solutions = solutions;
    }

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
