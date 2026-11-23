import { randomBytes } from 'crypto';
import { User } from '../models/User.js';

function randomSuffix(size = 6): string {
  return randomBytes(size)
    .toString('base64url')
    .replace(/[^a-z0-9]/gi, '')
    .toLowerCase()
    .slice(0, size);
}

export function slugifyName(name: string): string {
  const base = name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 24);
  return base || 'leetlog';
}

export async function createUniqueShareSlug(name: string): Promise<string> {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const candidate = `${slugifyName(name)}-${randomSuffix()}`;
    const exists = await User.exists({ shareSlug: candidate });
    if (!exists) return candidate;
  }
  return `${slugifyName(name)}-${Date.now().toString(36)}`;
}

export async function ensureShareSlug(user: {
  _id: unknown;
  name: string;
  shareSlug?: string | null;
}): Promise<string> {
  if (user.shareSlug) return user.shareSlug;
  const shareSlug = await createUniqueShareSlug(user.name);
  await User.findByIdAndUpdate(user._id, { shareSlug });
  user.shareSlug = shareSlug;
  return shareSlug;
}

export async function regenerateShareSlug(user: {
  _id: unknown;
  name: string;
  shareSlug?: string | null;
}): Promise<string> {
  let shareSlug = await createUniqueShareSlug(user.name);
  // Avoid reusing the current slug if RNG collides with the old one.
  while (shareSlug === user.shareSlug) {
    shareSlug = await createUniqueShareSlug(user.name);
  }
  await User.findByIdAndUpdate(user._id, { shareSlug });
  user.shareSlug = shareSlug;
  return shareSlug;
}
