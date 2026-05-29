/**
 * Game configuration constants shared by client and server.
 * Changing these values affects scoring, timing, and difficulty logic —
 * update docs/spec.md accordingly and bump the version comment.
 *
 * @version 1.0
 */

// ─── Session ──────────────────────────────────────────────────────────────────

export const QUESTIONS_PER_SESSION = 10;
export const SESSION_EXPIRY_MINUTES = 30;
export const HINTS_PER_SESSION = 2;

// ─── Scoring ──────────────────────────────────────────────────────────────────

export const BASE_POINTS = 100;
export const STREAK_BONUS_PER_CORRECT = 10; // added after 2nd consecutive correct answer
export const STREAK_BONUS_THRESHOLD = 2;    // streak must exceed this to earn bonus

/** Speed multipliers indexed by time bucket (0=fast, 3=timeout) */
export const SPEED_MULTIPLIERS = [2.0, 1.5, 1.0, 0.75, 0.0] as const;

/** Thresholds in ms: answered within this time gets the corresponding multiplier */
export const SPEED_THRESHOLDS_MS = [3000, 6000, 9000, 10000] as const;

/** Difficulty multipliers — index = difficulty - 1 (1-based difficulty, 0-based index) */
export const DIFFICULTY_MULTIPLIERS: Record<number, number> = {
  1: 0.5,
  2: 0.75,
  3: 1.0,
  4: 1.5,
  5: 2.0,
};

// ─── Difficulty Adaptation ────────────────────────────────────────────────────

export const DIFFICULTY_WINDOW = 5;         // evaluate last N answers
export const DIFFICULTY_UP_THRESHOLD = 4;   // correct answers out of window to increase
export const DIFFICULTY_DOWN_THRESHOLD = 1; // correct answers out of window to decrease
export const MIN_DIFFICULTY = 1;
export const MAX_DIFFICULTY = 5;
export const DEFAULT_DIFFICULTY = 2;

// ─── Timer ────────────────────────────────────────────────────────────────────

export const QUESTION_TIMER_MS = 10_000;

// ─── Daily Challenge ──────────────────────────────────────────────────────────

export const DAILY_CHALLENGE_QUESTIONS = 12; // 10 seeded + 2 AI-generated
export const DAILY_CHALLENGE_RESET_HOUR_UTC = 0;

// ─── TMDB ─────────────────────────────────────────────────────────────────────

export const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
export const TMDB_RATE_LIMIT_REQUESTS = 40;
export const TMDB_RATE_LIMIT_WINDOW_MS = 10_000;

// ─── Leaderboard ─────────────────────────────────────────────────────────────

export const LEADERBOARD_PAGE_SIZE = 20;
export const LEADERBOARD_MAX_RANK = 100;
