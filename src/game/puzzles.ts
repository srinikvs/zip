import type { Difficulty, Puzzle } from "./types.ts";

function cell(size: number, r: number, c: number): number {
  return r * size + c;
}

function emptyFlags(n: number): boolean[] {
  return new Array<boolean>(n).fill(false);
}

function fromPath(
  id: string,
  difficulty: Difficulty,
  size: number,
  path: [number, number][],
  clueSteps: number[],
  extraRight: [number, number][],
  extraDown: [number, number][],
): Puzzle {
  const n = size * size;
  const clues = new Array<number>(n).fill(0);
  const wallsRight = emptyFlags(n);
  const wallsDown = emptyFlags(n);
  const used = new Set<string>();
  for (let i = 0; i < path.length - 1; i++) {
    const [r1, c1] = path[i];
    const [r2, c2] = path[i + 1];
    used.add(`${Math.min(r1, r2)},${Math.min(c1, c2)},${r1 === r2 ? "h" : "v"}`);
  }
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (c + 1 < size && !used.has(`${r},${c},h`) && extraRight.some(([er, ec]) => er === r && ec === c)) {
        wallsRight[cell(size, r, c)] = true;
      }
      if (r + 1 < size && !used.has(`${r},${c},v`) && extraDown.some(([er, ec]) => er === r && ec === c)) {
        wallsDown[cell(size, r, c)] = true;
      }
    }
  }
  clueSteps.forEach((step, i) => {
    const [r, c] = path[step];
    clues[cell(size, r, c)] = i + 1;
  });
  return { id, difficulty, size, clues, wallsRight, wallsDown };
}

function rowSnake(size: number, reverse = false): [number, number][] {
  const path: [number, number][] = [];
  for (let r = 0; r < size; r++) {
    if (r % 2 === 0) for (let c = 0; c < size; c++) path.push([r, c]);
    else for (let c = size - 1; c >= 0; c--) path.push([r, c]);
  }
  return reverse ? path.reverse() : path;
}

function colSnake(size: number, reverse = false): [number, number][] {
  const path: [number, number][] = [];
  for (let c = 0; c < size; c++) {
    if (c % 2 === 0) for (let r = 0; r < size; r++) path.push([r, c]);
    else for (let r = size - 1; r >= 0; r--) path.push([r, c]);
  }
  return reverse ? path.reverse() : path;
}

function corridor(
  id: string,
  difficulty: Difficulty,
  size: number,
  path: [number, number][],
  clueSteps: number[],
): Puzzle {
  const n = size * size;
  const clues = new Array<number>(n).fill(0);
  const wallsRight = emptyFlags(n);
  const wallsDown = emptyFlags(n);
  const onPath = new Set<string>();
  for (let i = 0; i < path.length - 1; i++) {
    const [r1, c1] = path[i];
    const [r2, c2] = path[i + 1];
    if (r1 === r2) onPath.add(`h:${r1},${Math.min(c1, c2)}`);
    else onPath.add(`v:${Math.min(r1, r2)},${c1}`);
  }
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (c + 1 < size && !onPath.has(`h:${r},${c}`)) wallsRight[cell(size, r, c)] = true;
      if (r + 1 < size && !onPath.has(`v:${r},${c}`)) wallsDown[cell(size, r, c)] = true;
    }
  }
  clueSteps.forEach((step, i) => {
    const [r, c] = path[step];
    clues[cell(size, r, c)] = i + 1;
  });
  return { id, difficulty, size, clues, wallsRight, wallsDown };
}

const last5 = 5 * 5 - 1;
const last6 = 6 * 6 - 1;

export const PUZZLES: Puzzle[] = [
  corridor("e1", "easy", 5, rowSnake(5), [0, 4, 20, last5]),
  fromPath("e2", "easy", 5, colSnake(5), [0, 8, 16, last5], [[0, 1], [1, 2], [2, 1], [3, 2], [4, 1]], [[1, 1], [1, 3], [2, 2], [2, 4]]),
  fromPath("e3", "easy", 5, rowSnake(5, true), [0, 6, 12, 18, last5], [[0, 2], [1, 1], [2, 2], [3, 1]], [[0, 1], [1, 3], [2, 0], [3, 2]]),
  corridor("e4", "easy", 6, rowSnake(6), [0, 5, 17, 29, last6]),
  fromPath("e5", "easy", 6, colSnake(6), [0, 7, 18, 27, last6], [[0, 2], [1, 3], [2, 1], [3, 4], [4, 2]], [[1, 1], [2, 3], [3, 0], [3, 5], [4, 2]]),
  fromPath("m1", "medium", 6, rowSnake(6, true), [0, 6, 14, 22, 30, last6], [[0, 1], [1, 3], [2, 0], [2, 4], [3, 2], [4, 1], [4, 4]], [[0, 3], [1, 1], [1, 5], [2, 2], [3, 4], [4, 0], [4, 3]]),
  fromPath("m2", "medium", 6, colSnake(6, true), [0, 5, 12, 19, 26, last6], [[0, 2], [1, 0], [1, 4], [2, 3], [3, 1], [4, 4], [5, 2]], [[0, 1], [1, 3], [2, 0], [2, 5], [3, 2], [4, 1], [4, 4]]),
  fromPath("m3", "medium", 6, rowSnake(6), [0, 4, 11, 18, 25, 31, last6], [[0, 3], [1, 1], [1, 4], [2, 2], [3, 0], [3, 5], [4, 3], [5, 1]], [[0, 2], [1, 0], [1, 5], [2, 3], [3, 1], [4, 4], [4, 2]]),
  fromPath("m4", "medium", 6, colSnake(6), [0, 3, 9, 16, 22, 28, last6], [[0, 1], [1, 3], [2, 0], [2, 4], [3, 2], [4, 1], [4, 5], [5, 3]], [[0, 4], [1, 2], [2, 1], [2, 5], [3, 3], [4, 0], [4, 4]]),
  fromPath("m5", "medium", 6, rowSnake(6, true), [0, 5, 10, 16, 21, 27, 32, last6], [[0, 2], [1, 0], [1, 4], [2, 3], [3, 1], [3, 5], [4, 2], [5, 4]], [[0, 1], [0, 5], [1, 3], [2, 0], [2, 4], [3, 2], [4, 1], [4, 5]]),
];

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
