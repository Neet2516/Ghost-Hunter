export const GHOST_HUNTER_TASK_QUEUE = 'ghost-hunter';

export const MIN_FOLLOWUPS = 1;
export const MAX_FOLLOWUPS = 3;

// Default delay is 3 days in ms (259,200,000 ms)
export const DEFAULT_FOLLOWUP_DELAY_MS = 3 * 24 * 60 * 60 * 1000;

// Demo delay default in seconds/ms (e.g. 20s)
export const DEMO_FOLLOWUP_DELAY_MS = 20 * 1000;

// Review timeout default: 48 hours in ms
export const DEFAULT_REVIEW_TIMEOUT_MS = 48 * 60 * 60 * 1000;

// Maximum word count for generated follow-up draft body
export const MAX_DRAFT_WORDS = 120;
