import type { EntryDocument } from '../models/Entry.js';

function toDayKey(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export function computeStreak(solvedDates: Date[]): number {
  if (solvedDates.length === 0) return 0;

  const daySet = new Set(solvedDates.map(toDayKey));
  const today = startOfUtcDay(new Date());
  const yesterday = new Date(today);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);

  let cursor = today;
  const todayKey = toDayKey(today);
  const yesterdayKey = toDayKey(yesterday);

  if (!daySet.has(todayKey) && !daySet.has(yesterdayKey)) {
    return 0;
  }

  if (!daySet.has(todayKey)) {
    cursor = yesterday;
  }

  let streak = 0;
  while (daySet.has(toDayKey(cursor))) {
    streak += 1;
    cursor = new Date(cursor);
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  return streak;
}

export function buildActivityHeatmap(
  solvedDates: Date[],
  weeks = 53
): { date: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const d of solvedDates) {
    const key = toDayKey(d);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const today = startOfUtcDay(new Date());
  // Align to week start (Sunday) so columns are clean calendar weeks
  const start = new Date(today);
  start.setUTCDate(start.getUTCDate() - (weeks * 7 - 1));
  start.setUTCDate(start.getUTCDate() - start.getUTCDay());

  const totalDays = weeks * 7;
  const activity: { date: string; count: number }[] = [];
  for (let i = 0; i < totalDays; i += 1) {
    const day = new Date(start);
    day.setUTCDate(start.getUTCDate() + i);
    const key = toDayKey(day);
    activity.push({
      date: key,
      count: day > today ? 0 : (counts.get(key) ?? 0),
    });
  }

  return activity;
}

export function aggregateStats(entries: EntryDocument[]) {
  const byDifficulty = { Easy: 0, Medium: 0, Hard: 0 };
  const byStatus = { Solved: 0, Review: 0, Attempted: 0 };
  const topicMap = new Map<string, number>();
  const solvedDates: Date[] = [];

  for (const entry of entries) {
    byDifficulty[entry.difficulty] += 1;
    byStatus[entry.status] += 1;
    solvedDates.push(new Date(entry.solvedAt));

    for (const topic of entry.topics) {
      const trimmed = topic.trim();
      if (!trimmed) continue;
      topicMap.set(trimmed, (topicMap.get(trimmed) ?? 0) + 1);
    }
  }

  const topicBreakdown = [...topicMap.entries()]
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count);

  return {
    total: entries.length,
    byDifficulty,
    byStatus,
    topicBreakdown,
    streak: computeStreak(solvedDates),
    activity: buildActivityHeatmap(solvedDates, 53),
  };
}
