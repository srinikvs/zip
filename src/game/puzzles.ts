import type { Difficulty, Puzzle } from "./types.ts";
import { EASY } from "./puzzles-easy.ts";
import { HARD } from "./puzzles-hard.ts";
import { MEDIUM } from "./puzzles-medium.ts";

export const PUZZLES: Puzzle[] = [...EASY, ...MEDIUM, ...HARD];

export function puzzlesFor(difficulty: Difficulty): Puzzle[] {
  return PUZZLES.filter((p) => p.difficulty === difficulty);
}

export function puzzleById(id: string): Puzzle | undefined {
  return PUZZLES.find((p) => p.id === id);
}

export function nextPuzzle(current: Puzzle): Puzzle {
  const pool = puzzlesFor(current.difficulty);
  const i = pool.findIndex((p) => p.id === current.id);
  return pool[(i + 1) % pool.length] ?? pool[0];
}

export function pickPuzzle(difficulty: Difficulty, exclude: readonly string[] = []): Puzzle {
  const pool = puzzlesFor(difficulty);
  const unused = pool.filter((p) => !exclude.includes(p.id));
  const bag = unused.length ? unused : pool;
  return bag[Math.floor(Math.random() * bag.length)] ?? pool[0];
}
