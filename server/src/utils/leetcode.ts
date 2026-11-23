/** Extract a LeetCode problem slug from a full URL or plain slug. */
export function normalizeLeetCodeSlug(raw: string): string {
  const value = raw.trim();
  if (!value) return '';

  const fromUrl = value.match(
    /(?:https?:\/\/)?(?:www\.)?leetcode\.(?:com|cn)\/problems\/([a-zA-Z0-9_-]+)/i
  );
  if (fromUrl?.[1]) {
    return fromUrl[1].toLowerCase();
  }

  const plain = value.replace(/^\/+|\/+$/g, '');
  if (/^[a-zA-Z0-9_-]+$/.test(plain) && !plain.includes('.')) {
    return plain.toLowerCase();
  }

  return value;
}
