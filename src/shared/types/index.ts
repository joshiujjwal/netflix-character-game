/**
 * Shared TypeScript types used by both client and server.
 * Import via path alias: import type { GameSession } from '@shared/types'
 */

// ─── Question ─────────────────────────────────────────────────────────────────

export type QuestionType = 'character' | 'movie' | 'quote' | 'scene';

export type Difficulty = 1 | 2 | 3 | 4 | 5;

export type Question = {
  id: string;
  type: QuestionType;
  difficulty: Difficulty;
  prompt: string;
  choices: [string, string, string, string]; // always exactly 4
  hint?: string;
  mediaId: string;
  mediaTitle: string;
  mediaPosterPath?: string;
};

// ─── Game Session ──────────────────────────────────────────────────────────────

export type GameStatus = 'active' | 'completed' | 'expired';

export type GameSession = {
  id: string;
  status: GameStatus;
  score: number;
  streak: number;
  difficulty: Difficulty;
  hintsRemaining: number;
  questionIndex: number; // 0-based, 0–9
  totalQuestions: number;
};

// ─── Answer Result ─────────────────────────────────────────────────────────────

export type AnswerResult = {
  correct: boolean;
  correctAnswer: string;
  pointsAwarded: number;
  score: number;
  streak: number;
  nextQuestion: Question | null; // null = game over
  gameOver: boolean;
};

// ─── Leaderboard ──────────────────────────────────────────────────────────────

export type LeaderboardEntry = {
  rank: number;
  userId: string;
  username: string;
  score: number;
  gamesPlayed: number;
};

export type LeaderboardResponse = {
  entries: LeaderboardEntry[];
  total: number;
  userRank: number | null;
};

// ─── User / Auth ──────────────────────────────────────────────────────────────

export type UserPublic = {
  id: string;
  username: string;
  createdAt: string;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

// ─── API Envelope ─────────────────────────────────────────────────────────────

export type ApiResponse<T> = {
  data: T | null;
  error: string | null;
  meta?: Record<string, unknown>;
};
