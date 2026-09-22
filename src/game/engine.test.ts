import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { countSolutions, hasWall, idx, startIndex } from "./engine.ts";
import { pickPuzzle, PUZZLES, puzzlesFor } from "./puzzles.ts";
import type { Puzzle } from "./types.ts";

function rowSnake(size: number, reverse = false): number[] {
  const path: number[] = [];
  for (let r = 0; r < size; r++) {
    if (r % 2 === 0) for (let c = 0; c < size; c++) path.push(idx(r, c, size));
    else for (let c = size - 1; c >= 0; c--) path.push(idx(r, c, size));
  }
  return reverse ? path.reverse() : path;
}

function colSnake(size: number, reverse = false): number[] {
  const path: number[] = [];
  for (let c = 0; c < size; c++) {
    if (c % 2 === 0) for (let r = 0; r < size; r++) path.push(idx(r, c, size));
    else for (let r = size - 1; r >= 0; r--) path.push(idx(r, c, size));
  }
  return reverse ? path.reverse() : path;
}

function snakeClears(puzzle: Puzzle, cells: number[]): boolean {
  if (puzzle.clues[cells[0]] !== 1) return false;
  let last = 1;
  for (let i = 1; i < cells.length; i++) {
    if (hasWall(puzzle, cells[i - 1], cells[i])) return false;
    const clue = puzzle.clues[cells[i]];
    if (clue !== 0 && clue !== last + 1) return false;
    if (clue) last = clue;
  }
  return last === Math.max(...puzzle.clues);
}

function wallCount(puzzle: Puzzle): number {
  return puzzle.wallsRight.filter(Boolean).length + puzzle.wallsDown.filter(Boolean).length;
}

describe("zip puzzles", () => {
  it("bundles a unique pool per difficulty", () => {
    assert.ok(puzzlesFor("easy").length >= 8);
    assert.ok(puzzlesFor("medium").length >= 8);
    assert.ok(puzzlesFor("hard").length >= 8);
    const ids = PUZZLES.map((p) => p.id);
    assert.equal(new Set(ids).size, ids.length);
  });

  it("every puzzle starts at 1 and is solvable", () => {
    for (const puzzle of PUZZLES) {
      assert.notEqual(startIndex(puzzle), -1, puzzle.id);
      assert.equal(puzzle.clues.length, puzzle.size * puzzle.size, puzzle.id);
      const n = countSolutions(puzzle, 1);
      assert.equal(n, 1, `${puzzle.id} should have a solution`);
    }
  });

  it("Hard walls block free S-curve snakes", () => {
    for (const puzzle of puzzlesFor("hard")) {
      assert.ok(wallCount(puzzle) >= 20, `${puzzle.id} too few walls`);
      const snakes = [
        rowSnake(puzzle.size),
        rowSnake(puzzle.size, true),
        colSnake(puzzle.size),
        colSnake(puzzle.size, true),
      ];
      assert.equal(
        snakes.some((path) => snakeClears(puzzle, path)),
        false,
        `${puzzle.id} still allows a snake`,
      );
    }
  });

  it("Easy stays lighter than Medium, Medium lighter than Hard", () => {
    const avg = (diff: "easy" | "medium" | "hard") => {
      const pool = puzzlesFor(diff);
      return pool.reduce((sum, p) => sum + wallCount(p), 0) / pool.length;
    };
    assert.ok(avg("easy") < avg("medium"));
    assert.ok(avg("medium") < avg("hard"));
  });

  it("pickPuzzle skips recent ids until the pool wraps", () => {
    const first = pickPuzzle("easy");
    const second = pickPuzzle("easy", [first.id]);
    assert.notEqual(second.id, first.id);
  });
});
