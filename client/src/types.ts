export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type Status = 'Solved' | 'Review' | 'Attempted';
export type SolutionLanguage = 'TypeScript' | 'Go' | 'Rust' | 'C++' | 'SQL';

export const SOLUTION_LANGUAGES: SolutionLanguage[] = [
  'TypeScript',
  'Go',
  'Rust',
  'C++',
  'SQL',
];

export interface Solution {
  language: SolutionLanguage;
  code: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  shareSlug: string;
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
  notes?: string;
  languages?: SolutionLanguage[];
  solutions?: Solution[];
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
  solutions: Solution[];
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
  language: '' | SolutionLanguage;
  q: string;
}

export interface PaginatedEntries {
  items: Entry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PublicProfile {
  name: string;
  shareSlug: string;
}

export interface PublicSharePayload {
  profile: PublicProfile;
  stats: Stats;
  entries: PaginatedEntries;
}
