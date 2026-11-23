import bcrypt from 'bcryptjs';
import { Router, type Request, type Response } from 'express';
import { requireAuth, signToken } from '../middleware/auth.js';
import { User } from '../models/User.js';
import { createUniqueShareSlug, ensureShareSlug } from '../utils/shareSlug.js';

const router = Router();

function publicUser(user: {
  _id: { toString(): string };
  name: string;
  email: string;
  shareSlug?: string | null;
}) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    shareSlug: user.shareSlug ?? '',
  };
}

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body as {
      name?: string;
      email?: string;
      password?: string;
    };

    if (!name?.trim() || !email?.trim() || !password) {
      res.status(400).json({ error: 'name, email, and password are required' });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters' });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      res.status(409).json({ error: 'Email already registered' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const shareSlug = await createUniqueShareSlug(name.trim());
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      shareSlug,
    });

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
    });

    res.status(201).json({ token, user: publicUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to register' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email?.trim() || !password) {
      res.status(400).json({ error: 'email and password are required' });
      return;
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    await ensureShareSlug(user);

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
    });

    res.json({ token, user: publicUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to login' });
  }
});

router.get('/me', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user!.userId).select('name email shareSlug');
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    await ensureShareSlug(user);
    res.json({ user: publicUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load profile' });
  }
});

router.post('/share-link', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user!.userId).select('name email shareSlug');
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    await ensureShareSlug(user);
    res.json({ user: publicUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create share link' });
  }
});

router.put('/password', requireAuth, async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body as {
      currentPassword?: string;
      newPassword?: string;
    };

    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: 'currentPassword and newPassword are required' });
      return;
    }
    if (newPassword.length < 6) {
      res.status(400).json({ error: 'New password must be at least 6 characters' });
      return;
    }

    const user = await User.findById(req.user!.userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const ok = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!ok) {
      res.status(401).json({ error: 'Current password is incorrect' });
      return;
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

export default router;
