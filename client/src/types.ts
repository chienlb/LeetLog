export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type Status = 'Solved' | 'Review' | 'Attempted';

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Entry {
  _id: string;
  userId?: string;
  title: string;
  slug: string;
  difficulty: Difficulty;
  topics: string[];
  status: Status;
  solvedAt: string;
  timeSpentMinutes: number | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface EntryInput {
  title: string;
  slug?: string;
  difficulty: Difficulty;
  topics: string[];
  status: Status;
  solvedAt: string;
  timeSpentMinutes: number | null;
  notes: string;
}

export interface Stats {
  total: number;
  byDifficulty: Record<Difficulty, number>;
  byStatus: Record<Status, number>;
  topicBreakdown: { topic: string; count: number }[];
  streak: number;
  activity: { date: string; count: number }[];
}

export interface EntryFilters {
  difficulty: '' | Difficulty;
  status: '' | Status;
  topic: string;
  q: string;
}
