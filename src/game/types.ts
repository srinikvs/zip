export type Difficulty = "easy" | "medium";

export type Cell = { r: number; c: number };

export type Puzzle = {
  id: string;
  difficulty: Difficulty;
  size: number;
  /** number at cell, 0 = empty */
  clues: number[];
  /** wall between (r,c) and (r,c+1) keyed as r * size + c */
  wallsRight: boolean[];
  /** wall between (r,c) and (r+1,c) keyed as r * size + c */
  wallsDown: boolean[];
};

export type SavedProgress = {
  puzzleId: string;
  difficulty: Difficulty;
  path: number[];
  elapsed: number;
};

export type BestTimes = {
  easy: number | null;
  medium: number | null;
};
