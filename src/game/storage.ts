import type { BestTimes, Difficulty, SavedProgress } from "./types.ts";

export const STORAGE_KEY = "playadda-zip-v1";
export const SAVE_VERSION = 1;

type Store = {
  version: number;
  easy: number | null;
  medium: number | null;
  lastEasy: string | null;
  lastMedium: string | null;
  progress: SavedProgress | null;
};

const emptyStore = (): Store => ({
  version: SAVE_VERSION,
  easy: null,
  medium: null,
  lastEasy: null,
  lastMedium: null,
  progress: null,
});

function asBest(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? Math.floor(value) : null;
}

function parseProgress(value: unknown): SavedProgress | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Partial<SavedProgress>;
  if (raw.difficulty !== "easy" && raw.difficulty !== "medium") return null;
  if (typeof raw.puzzleId !== "string" || raw.puzzleId.length === 0) return null;
  if (!Array.isArray(raw.path) || !raw.path.every((n) => Number.isInteger(n) && n >= 0)) return null;
  if (typeof raw.elapsed !== "number" || !Number.isFinite(raw.elapsed) || raw.elapsed < 0) return null;
  return {
    puzzleId: raw.puzzleId,
    difficulty: raw.difficulty,
    path: raw.path.map((n) => Math.floor(n)),
    elapsed: Math.floor(raw.elapsed),
  };
}

function loadStore(): Store {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as Partial<Store>;
    if (!parsed || typeof parsed !== "object") return emptyStore();
    return {
      version: SAVE_VERSION,
      easy: asBest(parsed.easy),
      medium: asBest(parsed.medium),
      lastEasy: typeof parsed.lastEasy === "string" ? parsed.lastEasy : null,
      lastMedium: typeof parsed.lastMedium === "string" ? parsed.lastMedium : null,
      progress: parseProgress(parsed.progress),
    };
  } catch {
    return emptyStore();
  }
}

function writeStore(store: Store): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    /* quota / private mode */
  }
}

export function loadBestTimes(): BestTimes {
  const store = loadStore();
  return { easy: store.easy, medium: store.medium };
}

export function recordBestTime(difficulty: Difficulty, seconds: number): BestTimes {
  const store = loadStore();
  const prev = store[difficulty];
  if (prev === null || seconds < prev) {
    store[difficulty] = seconds;
    writeStore(store);
  }
  return { easy: store.easy, medium: store.medium };
}

export function loadProgress(): SavedProgress | null {
  return loadStore().progress;
}

export function saveProgress(progress: SavedProgress): void {
  const parsed = parseProgress(progress);
  if (!parsed) return;
  const store = loadStore();
  store.progress = parsed;
  writeStore(store);
}

export function clearProgress(): void {
  const store = loadStore();
  if (!store.progress) return;
  store.progress = null;
  writeStore(store);
}

export function lastPuzzleId(difficulty: Difficulty): string | null {
  const store = loadStore();
  return difficulty === "easy" ? store.lastEasy : store.lastMedium;
}

export function rememberPuzzle(difficulty: Difficulty, id: string): void {
  const store = loadStore();
  if (difficulty === "easy") store.lastEasy = id;
  else store.lastMedium = id;
  writeStore(store);
}
