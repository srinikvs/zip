import type { Puzzle } from "./types.ts";

const DIRS: [number, number][] = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];

export function idx(r: number, c: number, size: number): number {
  return r * size + c;
}

export function rc(i: number, size: number): { r: number; c: number } {
  return { r: Math.floor(i / size), c: i % size };
}

export function maxClue(puzzle: Puzzle): number {
  let max = 0;
  for (const n of puzzle.clues) if (n > max) max = n;
  return max;
}

export function startIndex(puzzle: Puzzle): number {
  return puzzle.clues.indexOf(1);
}

export function hasWall(puzzle: Puzzle, a: number, b: number): boolean {
  const { size } = puzzle;
  const A = rc(a, size);
  const B = rc(b, size);
  if (A.r === B.r && Math.abs(A.c - B.c) === 1) {
    const left = A.c < B.c ? a : b;
    const cell = rc(left, size);
    return puzzle.wallsRight[idx(cell.r, cell.c, size)];
  }
  if (A.c === B.c && Math.abs(A.r - B.r) === 1) {
    const top = A.r < B.r ? a : b;
    const cell = rc(top, size);
    return puzzle.wallsDown[idx(cell.r, cell.c, size)];
  }
  return true;
}

export function neighbors(puzzle: Puzzle, i: number): number[] {
  const { size } = puzzle;
  const { r, c } = rc(i, size);
  const out: number[] = [];
  for (const [dr, dc] of DIRS) {
    const nr = r + dr;
    const nc = c + dc;
    if (nr < 0 || nc < 0 || nr >= size || nc >= size) continue;
    const j = idx(nr, nc, size);
    if (!hasWall(puzzle, i, j)) out.push(j);
  }
  return out;
}

export function lastRequiredNumber(puzzle: Puzzle, path: number[]): number {
  let last = 0;
  for (const i of path) {
    const n = puzzle.clues[i];
    if (n > last) last = n;
  }
  return last;
}

export function canStep(puzzle: Puzzle, path: number[], next: number): boolean {
  if (path.length === 0) return puzzle.clues[next] === 1;
  if (path.includes(next)) return false;
  const head = path[path.length - 1];
  if (!neighbors(puzzle, head).includes(next)) return false;
  const clue = puzzle.clues[next];
  if (clue === 0) return true;
  return clue === lastRequiredNumber(puzzle, path) + 1;
}

export function isSolved(puzzle: Puzzle, path: number[]): boolean {
  if (path.length !== puzzle.size * puzzle.size) return false;
  return lastRequiredNumber(puzzle, path) === maxClue(puzzle);
}

/** Count Hamiltonian paths honoring clues + walls. Caps at `limit`. */
export function countSolutions(puzzle: Puzzle, limit = 2): number {
  const start = startIndex(puzzle);
  if (start < 0) return 0;
  const total = puzzle.size * puzzle.size;
  const target = maxClue(puzzle);
  const visited = new Uint8Array(total);
  let found = 0;

  const walk = (cell: number, len: number, last: number): void => {
    if (found >= limit) return;
    if (len === total) {
      if (last === target) found += 1;
      return;
    }
    for (const n of neighbors(puzzle, cell)) {
      if (visited[n]) continue;
      const clue = puzzle.clues[n];
      if (clue !== 0 && clue !== last + 1) continue;
      visited[n] = 1;
      walk(n, len + 1, clue === 0 ? last : clue);
      visited[n] = 0;
      if (found >= limit) return;
    }
  };

  visited[start] = 1;
  walk(start, 1, 1);
  return found;
}

export function formatTime(totalSeconds: number | null): string {
  if (totalSeconds === null || !Number.isFinite(totalSeconds)) return "—";
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
